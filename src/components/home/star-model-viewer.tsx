"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getPersonImageEntries } from "@/lib/person-images";

const MAX_SHOWCASE_COUNT = 24;
const DEBUG_STAR_MODEL = process.env.NODE_ENV !== "production";
const MODEL_BASE_SIZE = 9.2;
const MODEL_GLOBAL_SCALE = 1.5;
const CAMERA_DISTANCE_FACTOR = 0.78 / MODEL_GLOBAL_SCALE;
const PORTRAIT_SIZE_MULTIPLIER = 2;

type ExteriorPanel = {
  area: number;
  center: THREE.Vector3;
  exteriorScore: number;
  key: string;
  max: THREE.Vector3;
  mesh: THREE.Mesh;
  min: THREE.Vector3;
  normal: THREE.Vector3;
  planeDistance: number;
  radialDistance: number;
  triangleCount: number;
  uAxis: THREE.Vector3;
  uMax: number;
  uMin: number;
  vMax: number;
  vMin: number;
  width: number;
};

type RawPanel = ExteriorPanel;

function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function logStarModelDebug(message: string, payload?: unknown) {
  if (!DEBUG_STAR_MODEL) {
    return;
  }

  const debugWindow = window as typeof window & {
    __starModelLogs?: Array<{ message: string; payload?: unknown; time: string }>;
  };
  debugWindow.__starModelLogs ??= [];
  debugWindow.__starModelLogs.push({
    message,
    payload,
    time: new Date().toISOString(),
  });
  console.info(`[StarModelViewer] ${message}`, payload ?? "");
}

function createShowcaseTexture(texture: THREE.Texture): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 560;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f8f2e4";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#111111";
  context.fillRect(8, 8, canvas.width - 16, canvas.height - 16);

  const image = texture.image as CanvasImageSource & {
    naturalWidth?: number;
    naturalHeight?: number;
    width?: number;
    height?: number;
  };
  const imageWidth = image.naturalWidth ?? image.width ?? 1;
  const imageHeight = image.naturalHeight ?? image.height ?? 1;
  const targetX = 16;
  const targetY = 16;
  const targetWidth = canvas.width - 32;
  const targetHeight = canvas.height - 32;
  const imageRatio = imageWidth / imageHeight;
  const targetRatio = targetWidth / targetHeight;
  const sourceWidth = imageRatio > targetRatio ? imageHeight * targetRatio : imageWidth;
  const sourceHeight = imageRatio > targetRatio ? imageHeight : imageWidth / targetRatio;
  const sourceX = (imageWidth - sourceWidth) / 2;
  const sourceY = (imageHeight - sourceHeight) / 2;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
  );

  const gradient = context.createLinearGradient(24, 24, 250, 240);
  gradient.addColorStop(0, "rgba(255,255,255,0.28)");
  gradient.addColorStop(0.42, "rgba(255,255,255,0.04)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(targetX, targetY, targetWidth, targetHeight);

  const showcaseTexture = new THREE.CanvasTexture(canvas);
  showcaseTexture.colorSpace = THREE.SRGBColorSpace;
  showcaseTexture.needsUpdate = true;
  return showcaseTexture;
}

function buildPersonDetailUrl(personName: string): string {
  const locale = window.location.pathname.split("/").filter(Boolean)[0] || "en";
  const params = new URLSearchParams({
    fallbackFacet: "authorName",
    fallbackValue: personName,
    name: personName,
  });
  return `/${locale}/persons/details?${params.toString()}`;
}

function getMeshTriangles(mesh: THREE.Mesh) {
  const geometry = mesh.geometry;
  const positionAttribute = geometry.attributes.position;
  if (!positionAttribute) {
    return [];
  }

  const indexAttribute = geometry.index;
  const triangles: Array<{
    area: number;
    center: THREE.Vector3;
    normal: THREE.Vector3;
    vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  }> = [];
  const firstVertex = new THREE.Vector3();
  const secondVertex = new THREE.Vector3();
  const thirdVertex = new THREE.Vector3();
  const firstEdge = new THREE.Vector3();
  const secondEdge = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const center = new THREE.Vector3();
  const triangleCount = indexAttribute
    ? Math.floor(indexAttribute.count / 3)
    : Math.floor(positionAttribute.count / 3);

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex += 1) {
    const firstIndex = indexAttribute
      ? indexAttribute.getX(triangleIndex * 3)
      : triangleIndex * 3;
    const secondIndex = indexAttribute
      ? indexAttribute.getX(triangleIndex * 3 + 1)
      : triangleIndex * 3 + 1;
    const thirdIndex = indexAttribute
      ? indexAttribute.getX(triangleIndex * 3 + 2)
      : triangleIndex * 3 + 2;

    firstVertex.fromBufferAttribute(positionAttribute, firstIndex).applyMatrix4(mesh.matrixWorld);
    secondVertex.fromBufferAttribute(positionAttribute, secondIndex).applyMatrix4(mesh.matrixWorld);
    thirdVertex.fromBufferAttribute(positionAttribute, thirdIndex).applyMatrix4(mesh.matrixWorld);
    firstEdge.subVectors(secondVertex, firstVertex);
    secondEdge.subVectors(thirdVertex, firstVertex);
    normal.crossVectors(firstEdge, secondEdge);
    const area = normal.length() * 0.5;
    if (area <= 0.00001) {
      continue;
    }

    normal.normalize();
    center.copy(firstVertex).add(secondVertex).add(thirdVertex).multiplyScalar(1 / 3);
    triangles.push({
      area,
      center: center.clone(),
      normal: normal.clone(),
      vertices: [firstVertex.clone(), secondVertex.clone(), thirdVertex.clone()],
    });
  }

  return triangles;
}

function detectExteriorPanels(meshes: THREE.Mesh[], modelCenter: THREE.Vector3) {
  const panelMap = new Map<string, RawPanel>();
  let triangleCount = 0;
  let verticalTriangleCount = 0;

  meshes.forEach((mesh) => {
    getMeshTriangles(mesh).forEach((triangle) => {
      triangleCount += 1;
      if (Math.abs(triangle.normal.y) > 0.32) {
        return;
      }

      verticalTriangleCount += 1;
      const horizontalNormal = triangle.normal.clone().setY(0).normalize();
      const normalAngle = Math.round(Math.atan2(horizontalNormal.z, horizontalNormal.x) * 8);
      const planeDistance = horizontalNormal.dot(triangle.center);
      const planeBucket = Math.round(planeDistance * 4);
      const key = `${mesh.name}-${normalAngle}-${planeBucket}`;
      const uAxis = new THREE.Vector3(0, 1, 0).cross(horizontalNormal).normalize();
      const uValues = triangle.vertices.map((vertex) => uAxis.dot(vertex));
      const vValues = triangle.vertices.map((vertex) => vertex.y);
      const triangleUMin = Math.min(...uValues);
      const triangleUMax = Math.max(...uValues);
      const triangleVMin = Math.min(...vValues);
      const triangleVMax = Math.max(...vValues);
      const existingPanel = panelMap.get(key);
      if (existingPanel) {
        const totalArea = existingPanel.area + triangle.area;
        existingPanel.center
          .multiplyScalar(existingPanel.area)
          .add(triangle.center.clone().multiplyScalar(triangle.area))
          .multiplyScalar(1 / totalArea);
        existingPanel.min.min(triangle.center);
        existingPanel.max.max(triangle.center);
        existingPanel.uMin = Math.min(existingPanel.uMin, triangleUMin);
        existingPanel.uMax = Math.max(existingPanel.uMax, triangleUMax);
        existingPanel.vMin = Math.min(existingPanel.vMin, triangleVMin);
        existingPanel.vMax = Math.max(existingPanel.vMax, triangleVMax);
        existingPanel.normal
          .multiplyScalar(existingPanel.area)
          .add(horizontalNormal.clone().multiplyScalar(triangle.area))
          .normalize();
        existingPanel.planeDistance =
          (existingPanel.planeDistance * existingPanel.area + planeDistance * triangle.area) /
          totalArea;
        existingPanel.area = totalArea;
        existingPanel.triangleCount += 1;
        return;
      }

      panelMap.set(key, {
        area: triangle.area,
        center: triangle.center.clone(),
        key,
        max: triangle.center.clone(),
        mesh,
        min: triangle.center.clone(),
        normal: horizontalNormal,
        exteriorScore: 0,
        planeDistance,
        radialDistance: 0,
        triangleCount: 1,
        uAxis,
        uMax: triangleUMax,
        uMin: triangleUMin,
        vMax: triangleVMax,
        vMin: triangleVMin,
        width: 0,
      });
    });
  });

  const panels = Array.from(panelMap.values())
    .filter((panel) => panel.area > 0.05)
    .map((panel) => {
      panel.width = panel.uMax - panel.uMin;
      const uCenter = (panel.uMin + panel.uMax) / 2;
      const vCenter = (panel.vMin + panel.vMax) / 2;
      panel.center = panel.normal
        .clone()
        .multiplyScalar(panel.planeDistance)
        .add(panel.uAxis.clone().multiplyScalar(uCenter))
        .add(new THREE.Vector3(0, vCenter, 0));
      const radial = panel.center.clone().sub(modelCenter).setY(0);
      panel.radialDistance = radial.length();
      panel.exteriorScore =
        panel.radialDistance > 0.0001 ? panel.normal.dot(radial.normalize()) : 0;
      return panel;
    })
    .filter(
      (panel) =>
        panel.exteriorScore > 0.45 &&
        panel.radialDistance > 2.9 &&
        panel.width > 0.5 &&
        panel.vMax - panel.vMin > 0.8,
    )
    .toSorted((first, second) => second.area - first.area);

  return {
    exteriorTriangleCount: panels.reduce((count, panel) => count + panel.triangleCount, 0),
    panels,
    triangleCount,
    verticalTriangleCount,
  };
}

export function StarModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    logStarModelDebug("effect start", {
      hasContainer: Boolean(container),
      userAgent: navigator.userAgent,
      viewport: [window.innerWidth, window.innerHeight],
    });
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
    camera.position.set(0, 0.2, 4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      logStarModelDebug("renderer created", {
        glRenderer: renderer.getContext().getParameter(renderer.getContext().RENDERER),
        glVendor: renderer.getContext().getParameter(renderer.getContext().VENDOR),
      });
    } catch (error) {
      logStarModelDebug("renderer creation failed", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      });
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "pointer-events-auto absolute inset-0 z-10 h-full w-full cursor-default";
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(3, 5, 4);
    const fillLight = new THREE.DirectionalLight(0xffe5b0, 1.2);
    fillLight.position.set(-4, 2, 3);
    scene.add(ambientLight, keyLight, fillLight);

    const modelGroup = new THREE.Group();
    const pivotGroup = new THREE.Group();
    modelGroup.rotation.y = Math.PI - 0.46;
    pivotGroup.position.set(0, 0.35, 0);
    pivotGroup.add(modelGroup);
    scene.add(pivotGroup);

    const textureLoader = new THREE.TextureLoader();
    const portraitTextures: THREE.Texture[] = [];
    const showcaseTextures: THREE.Texture[] = [];
    const showcasePanels: THREE.Mesh[] = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let loadedModel: THREE.Object3D | null = null;
    let frameId = 0;
    let cancelled = false;

    const addPortraitStacks = async (boxSize: THREE.Vector3) => {
      const selectedEntries = shuffle(getPersonImageEntries()).slice(
        0,
        MAX_SHOWCASE_COUNT,
      );
      if (selectedEntries.length === 0 || cancelled) {
        return;
      }

      logStarModelDebug("selected portrait entries", selectedEntries);

      const textureResults = await Promise.allSettled(
        selectedEntries.map(async (entry) => {
          const texture = await textureLoader.loadAsync(encodeURI(entry.src));
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          return { entry, texture };
        }),
      );

      const loadedTextures = textureResults.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const failedTextures = textureResults.flatMap((result, index) =>
        result.status === "rejected"
          ? [{ entry: selectedEntries[index], reason: String(result.reason) }]
          : [],
      );
      if (failedTextures.length > 0) {
        logStarModelDebug("failed portrait texture loads", failedTextures);
      }

      if (cancelled) {
        loadedTextures.forEach(({ texture }) => texture.dispose());
        return;
      }

      const textures = loadedTextures.map(({ texture }) => texture);
      const textureEntries = loadedTextures.map(({ entry }) => entry);
      portraitTextures.push(...textures);
      logStarModelDebug("loaded portrait texture count", textures.length);

      if (!loadedModel) {
        return;
      }

      const candidateMeshes: THREE.Mesh[] = [];
      loadedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          candidateMeshes.push(child);
        }
      });
      const targetMesh =
        candidateMeshes.find((mesh) => mesh.name === "Cube009_1") ??
        candidateMeshes.toSorted((first, second) => {
          const firstSize = new THREE.Box3().setFromObject(first).getSize(new THREE.Vector3());
          const secondSize = new THREE.Box3().setFromObject(second).getSize(new THREE.Vector3());
          return (
            secondSize.x * secondSize.y * secondSize.z -
            firstSize.x * firstSize.y * firstSize.z
          );
        })[0];
      if (!targetMesh) {
        logStarModelDebug("no target mesh found for showcases");
        return;
      }

      const originalRotationY = modelGroup.rotation.y;
      const originalPivotPosition = pivotGroup.position.clone();
      modelGroup.rotation.y = 0;
      pivotGroup.position.set(0, 0, 0);
      scene.updateMatrixWorld(true);

      const localBox = new THREE.Box3().setFromObject(loadedModel);
      const localSize = localBox.getSize(new THREE.Vector3());
      const localCenter = localBox.getCenter(new THREE.Vector3());
      const targetPortraitHeight = Math.min(localSize.y * 0.25 * PORTRAIT_SIZE_MULTIPLIER, 2);
      const surfaceOffset = THREE.MathUtils.clamp(localSize.z * 0.0025, 0.012, 0.025);
      const exteriorFaceAnalysis = detectExteriorPanels(candidateMeshes, localCenter);
      logStarModelDebug("model geometry analysis", {
        candidateMeshCount: candidateMeshes.length,
        localBoxMax: localBox.max.toArray(),
        localBoxMin: localBox.min.toArray(),
        localCenter: localCenter.toArray(),
        localSize: localSize.toArray(),
        meshSummaries: candidateMeshes.map((mesh) => {
          const meshBox = new THREE.Box3().setFromObject(mesh);
          const meshSize = meshBox.getSize(new THREE.Vector3());
          const positionAttribute = mesh.geometry.attributes.position;
          const indexAttribute = mesh.geometry.index;
          return {
            boxMax: meshBox.max.toArray(),
            boxMin: meshBox.min.toArray(),
            center: meshBox.getCenter(new THREE.Vector3()).toArray(),
            indexCount: indexAttribute?.count ?? 0,
            name: mesh.name,
            size: meshSize.toArray(),
            triangleCount: indexAttribute
              ? Math.floor(indexAttribute.count / 3)
              : Math.floor((positionAttribute?.count ?? 0) / 3),
            vertexCount: positionAttribute?.count ?? 0,
          };
        }),
      });
      const evaluatedPanels = exteriorFaceAnalysis.panels
        .filter((panel) => {
          const panelHeight = panel.vMax - panel.vMin;
          return panel.mesh.name === "Cube009_1" && panelHeight > 0.8 && panel.width > 0.5;
        })
        .map((panel) => {
          const panelHeight = panel.vMax - panel.vMin;
          const panelWidth = panel.width;
          const horizontalMargin = Math.max(panelWidth * 0.14, 0.04);
          const verticalMargin = Math.max(panelHeight * 0.09, 0.04);
          const safeWidth = Math.max(panelWidth - horizontalMargin * 2, 0);
          const safeHeight = Math.max(panelHeight - verticalMargin * 2, 0);
          const portraitHeight = Math.min(targetPortraitHeight, safeHeight, safeWidth / 0.69);
          const portraitWidth = Math.min(portraitHeight * 0.69, safeWidth);
          const position = panel.center.clone().addScaledVector(panel.normal, surfaceOffset);
          const basis = new THREE.Matrix4().makeBasis(
            panel.uAxis.clone().normalize(),
            new THREE.Vector3(0, 1, 0),
            panel.normal.clone().normalize(),
          );
          return {
            area: panel.area,
            horizontalMargin,
            isUsable: portraitWidth > 0.08 && portraitHeight > 0.12,
            orientation: new THREE.Quaternion().setFromRotationMatrix(basis),
            panelId: panel.key,
            panelHeight,
            panelWidth,
            portraitHeight,
            portraitWidth,
            safeHeight,
            safeWidth,
            verticalMargin,
            meshName: panel.mesh.name,
            normal: panel.normal.clone(),
            position,
            triangleCount: panel.triangleCount,
          };
        });
      const projectionPoints = evaluatedPanels
        .filter((point) => point.isUsable)
        .slice(0, Math.min(textures.length, MAX_SHOWCASE_COUNT));
      logStarModelDebug("portrait placement metrics", {
        boxSize: boxSize.toArray(),
        localBoxMin: localBox.min.toArray(),
        localBoxMax: localBox.max.toArray(),
        localSize: localSize.toArray(),
        targetMesh: targetMesh.name,
        surfaceOffset,
        targetPortraitHeight,
        exteriorFaceAnalysis: {
          exteriorTriangleCount: exteriorFaceAnalysis.exteriorTriangleCount,
          panelCount: exteriorFaceAnalysis.panels.length,
          panels: exteriorFaceAnalysis.panels.map((panel) => ({
            area: panel.area,
            center: panel.center.toArray(),
            exteriorScore: panel.exteriorScore,
            height: panel.vMax - panel.vMin,
            max: panel.max.toArray(),
            meshName: panel.mesh.name,
            min: panel.min.toArray(),
            normal: panel.normal.toArray(),
            panelId: panel.key,
            planeDistance: panel.planeDistance,
            radialDistance: panel.radialDistance,
            triangleCount: panel.triangleCount,
            uAxis: panel.uAxis.toArray(),
            uMax: panel.uMax,
            uMin: panel.uMin,
            vMax: panel.vMax,
            vMin: panel.vMin,
            width: panel.width,
          })),
          rejectedPanels: evaluatedPanels
            .filter((point) => !point.isUsable)
            .map((point) => ({
              area: point.area,
              exteriorScore: exteriorFaceAnalysis.panels.find(
                (panel) => panel.key === point.panelId,
              )?.exteriorScore,
              meshName: point.meshName,
              normal: point.normal.toArray(),
              panelId: point.panelId,
              panelHeight: point.panelHeight,
              panelWidth: point.panelWidth,
              portraitHeight: point.portraitHeight,
              portraitWidth: point.portraitWidth,
              position: point.position.toArray(),
              safeHeight: point.safeHeight,
              safeWidth: point.safeWidth,
            })),
          triangleCount: exteriorFaceAnalysis.triangleCount,
          verticalTriangleCount: exteriorFaceAnalysis.verticalTriangleCount,
        },
        projectionPointCount: projectionPoints.length,
        projectionPoints: projectionPoints.map((point) => ({
          area: point.area,
          exteriorScore: exteriorFaceAnalysis.panels.find(
            (panel) => panel.key === point.panelId,
          )?.exteriorScore,
          horizontalMargin: point.horizontalMargin,
          isUsable: point.isUsable,
          panelId: point.panelId,
          panelHeight: point.panelHeight,
          panelWidth: point.panelWidth,
          portraitHeight: point.portraitHeight,
          portraitWidth: point.portraitWidth,
          safeHeight: point.safeHeight,
          safeWidth: point.safeWidth,
          meshName: point.meshName,
          position: point.position.toArray(),
          normal: point.normal.toArray(),
          orientation: [
            point.orientation.x,
            point.orientation.y,
            point.orientation.z,
            point.orientation.w,
          ],
          verticalMargin: point.verticalMargin,
        })),
        visibilityFromInitialCamera: projectionPoints.map((point, index) => {
          const worldNormal = point.normal
            .clone()
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), originalRotationY)
            .normalize();
          const worldPosition = point.position
            .clone()
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), originalRotationY)
            .add(originalPivotPosition);
          const cameraDirection = camera.position.clone().sub(worldPosition).normalize();
          return {
            facingScore: worldNormal.dot(cameraDirection),
            index,
            isFacingCamera: worldNormal.dot(cameraDirection) > 0,
            normal: worldNormal.toArray(),
            position: worldPosition.toArray(),
          };
        }),
      });

      const panelGeometryByPanelId = new Map<string, number>();
      projectionPoints.forEach((point, pointIndex) => {
          const texture = textures[pointIndex];
          if (!texture) {
            return;
          }
          const showcaseTexture = createShowcaseTexture(texture);
          showcaseTextures.push(showcaseTexture);
          const geometry = new THREE.PlaneGeometry(point.portraitWidth, point.portraitHeight);
          panelGeometryByPanelId.set(
            point.panelId,
            geometry.attributes.position?.count ?? 0,
          );
          const material = new THREE.MeshBasicMaterial({
            map: showcaseTexture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -18,
            polygonOffsetUnits: -18,
            side: THREE.FrontSide,
          });
          material.toneMapped = false;
          const panelMesh = new THREE.Mesh(geometry, material);
          panelMesh.position.copy(point.position);
          panelMesh.quaternion.copy(point.orientation);
          panelMesh.renderOrder = 30 + pointIndex;
          panelMesh.userData.personName = textureEntries[pointIndex]?.name;
          panelMesh.userData.personHref = textureEntries[pointIndex]
            ? buildPersonDetailUrl(textureEntries[pointIndex].name)
            : "";
          modelGroup.add(panelMesh);
          showcasePanels.push(panelMesh);
      });

      logStarModelDebug("face coverage summary", {
        assignedPanelCount: projectionPoints.length,
        detectedExteriorPanelCount: exteriorFaceAnalysis.panels.length,
        detectedDisplayableExteriorWallCount: evaluatedPanels.length,
        generatedPanelCount: showcasePanels.length,
        maxShowcaseCount: MAX_SHOWCASE_COUNT,
        textureCount: textures.length,
        unassignedFaces: evaluatedPanels
          .filter((point) => !projectionPoints.some((projection) => projection.panelId === point.panelId))
          .map((point) => ({
            isUsable: point.isUsable,
            panelHeight: point.panelHeight,
            panelId: point.panelId,
            panelWidth: point.panelWidth,
            portraitHeight: point.portraitHeight,
            portraitWidth: point.portraitWidth,
            reason: point.isUsable ? "no texture or max showcase limit" : "too small for margins",
            safeHeight: point.safeHeight,
            safeWidth: point.safeWidth,
          })),
        faces: evaluatedPanels.map((point) => {
          const wasAssigned = projectionPoints.some(
            (projection) => projection.panelId === point.panelId,
          );
          const vertexCount = panelGeometryByPanelId.get(point.panelId) ?? 0;
          return {
            area: point.area,
            exteriorScore: exteriorFaceAnalysis.panels.find(
              (panel) => panel.key === point.panelId,
            )?.exteriorScore,
            hasImageAssigned: wasAssigned,
            hasPanelGeometry: vertexCount > 0,
            isUsable: point.isUsable,
            meshName: point.meshName,
            normal: point.normal.toArray(),
            panelHeight: point.panelHeight,
            panelId: point.panelId,
            panelWidth: point.panelWidth,
            position: point.position.toArray(),
            portraitHeight: point.portraitHeight,
            portraitWidth: point.portraitWidth,
            safeHeight: point.safeHeight,
            safeWidth: point.safeWidth,
            vertexCount,
          };
        }),
      });

      logStarModelDebug(
        "showcase panel geometry",
        showcasePanels.map((panel, index) => ({
          index,
          meshName: projectionPoints[index]?.meshName,
          normal: projectionPoints[index]?.normal.toArray(),
          position: projectionPoints[index]?.position.toArray(),
          size: [
            projectionPoints[index]?.portraitWidth,
            projectionPoints[index]?.portraitHeight,
            surfaceOffset,
          ],
          vertexCount: panel.geometry.attributes.position?.count ?? 0,
        })),
      );

      modelGroup.updateWorldMatrix(true, true);
      modelGroup.rotation.y = originalRotationY;
      pivotGroup.position.copy(originalPivotPosition);
      scene.updateMatrixWorld(true);
      logStarModelDebug(
        "showcase panel world positions",
        showcasePanels.map((mesh) => {
          const position = new THREE.Vector3();
          mesh.getWorldPosition(position);
          return position.toArray();
        }),
      );
    };

    const loader = new GLTFLoader();
    loader.load("/models/star.glb", (gltf) => {
      if (cancelled) {
        return;
      }

      loadedModel = gltf.scene;
      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const largestAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = (MODEL_BASE_SIZE * MODEL_GLOBAL_SCALE) / largestAxis;
      loadedModel.scale.setScalar(scale);
      loadedModel.position.copy(center).multiplyScalar(-scale);
      modelGroup.add(loadedModel);
      const scaledBox = new THREE.Box3().setFromObject(modelGroup);
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      const maxDimension = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) || 1;
      logStarModelDebug("model loaded", {
        originalCenter: center.toArray(),
        originalSize: size.toArray(),
        scale,
        scaledSize: scaledSize.toArray(),
        modelGroupRotationY: modelGroup.rotation.y,
      });
      void addPortraitStacks(scaledSize).then(() => {
        const refreshedBox = new THREE.Box3().setFromObject(modelGroup);
        const refreshedSize = refreshedBox.getSize(new THREE.Vector3());
        const refreshedMaxDimension = Math.max(
          refreshedSize.x,
          refreshedSize.y,
          refreshedSize.z,
        ) || 1;
        const refreshedDistance =
          refreshedMaxDimension /
          (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
        camera.position.set(
          0,
          refreshedMaxDimension * 0.02,
          refreshedDistance * CAMERA_DISTANCE_FACTOR,
        );
        camera.lookAt(0, 0, 0);
      });
      const distance = maxDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.position.set(0, maxDimension * 0.02, distance * CAMERA_DISTANCE_FACTOR);
      camera.lookAt(0, 0, 0);
    });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) {
        return;
      }
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const findClickedShowcase = (event: PointerEvent | MouseEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster
        .intersectObjects(showcasePanels, false)
        .find((intersection) => typeof intersection.object.userData.personHref === "string");
    };

    const handlePointerMove = (event: PointerEvent) => {
      renderer.domElement.style.cursor = findClickedShowcase(event) ? "pointer" : "default";
    };

    const handleClick = (event: MouseEvent) => {
      const clickedShowcase = findClickedShowcase(event);
      const href = clickedShowcase?.object.userData.personHref;
      if (!clickedShowcase || typeof href !== "string" || href.length === 0) {
        logStarModelDebug("showcase click miss", {
          clientX: event.clientX,
          clientY: event.clientY,
        });
        return;
      }
      logStarModelDebug("showcase click hit", {
        href,
        personName: clickedShowcase.object.userData.personName,
      });
      window.location.assign(href);
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("click", handleClick);

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      modelGroup.rotation.y += 0.00085;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handleClick);
      resizeObserver.disconnect();
      if (loadedModel) {
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
            materials.forEach((material) => material.dispose());
          }
        });
      }
      showcasePanels.forEach((mesh) => {
        mesh.geometry.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose());
        } else {
          material.dispose();
        }
      });
      showcaseTextures.forEach((texture) => texture.dispose());
      portraitTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      aria-label="Modèle 3D étoile"
    />
  );
}
