"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPersonImageEntries, type PersonImageEntry } from "@/lib/person-images";

const MAX_SHOWCASE_COUNT = 12;
const DEBUG_STAR_MODEL = process.env.NODE_ENV !== "production";
const MODEL_BASE_SIZE = 9.2;
const MODEL_GLOBAL_SCALE = 1.5;
const CAMERA_DISTANCE_FACTOR = 0.9 / MODEL_GLOBAL_SCALE;
const PORTRAIT_SIZE_MULTIPLIER = 2.53;

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
    edgeKeys: [string, string, string];
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
    const vertexKey = (vertex: THREE.Vector3) =>
      [vertex.x, vertex.y, vertex.z].map((value) => Math.round(value * 10000) / 10000).join(",");
    const vertexKeys = [vertexKey(firstVertex), vertexKey(secondVertex), vertexKey(thirdVertex)];
    const edgeKeys = [
      [vertexKeys[0], vertexKeys[1]].toSorted().join("|") ,
      [vertexKeys[1], vertexKeys[2]].toSorted().join("|") ,
      [vertexKeys[2], vertexKeys[0]].toSorted().join("|") ,
    ] as [string, string, string];
    triangles.push({
      area,
      center: center.clone(),
      edgeKeys,
      normal: normal.clone(),
      vertices: [firstVertex.clone(), secondVertex.clone(), thirdVertex.clone()],
    });
  }

  return triangles;
}

function detectExteriorPanels(meshes: THREE.Mesh[], modelCenter: THREE.Vector3) {
  let triangleCount = 0;
  let verticalTriangleCount = 0;
  let componentCount = 0;
  const allPanels: RawPanel[] = [];

  const addPanel = (mesh: THREE.Mesh, triangles: ReturnType<typeof getMeshTriangles>) => {
    if (triangles.length === 0) {
      return;
    }

    const edgeMap = new Map<string, number[]>();
    triangles.forEach((triangle, triangleIndex) => {
      triangle.edgeKeys.forEach((edgeKey) => {
        const connected = edgeMap.get(edgeKey) ?? [];
        connected.push(triangleIndex);
        edgeMap.set(edgeKey, connected);
      });
    });

    const parent = triangles.map((_, index) => index);
    const find = (index: number): number => {
      if (parent[index] !== index) {
        parent[index] = find(parent[index]);
      }
      return parent[index];
    };
    const union = (first: number, second: number) => {
      const firstRoot = find(first);
      const secondRoot = find(second);
      if (firstRoot !== secondRoot) {
        parent[secondRoot] = firstRoot;
      }
    };

    edgeMap.forEach((connected) => {
      for (let firstIndex = 0; firstIndex < connected.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < connected.length; secondIndex += 1) {
          const first = triangles[connected[firstIndex]];
          const second = triangles[connected[secondIndex]];
          const coplanar =
            first.normal.dot(second.normal) > 0.995 &&
            Math.abs(first.normal.dot(first.center) - second.normal.dot(second.center)) < 0.01;
          if (coplanar) {
            union(connected[firstIndex], connected[secondIndex]);
          }
        }
      }
    });

    const components = new Map<number, typeof triangles>();
    triangles.forEach((triangle, triangleIndex) => {
      const root = find(triangleIndex);
      const component = components.get(root) ?? [];
      component.push(triangle);
      components.set(root, component);
    });
    componentCount += components.size;

    components.forEach((component, componentIndex) => {
      const area = component.reduce((sum, triangle) => sum + triangle.area, 0);
      const normal = component
        .reduce(
          (sum, triangle) => sum.addScaledVector(triangle.normal, triangle.area),
          new THREE.Vector3(),
        )
        .normalize()
        .setY(0)
        .normalize();
      const uAxis = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
      const vertices = component.flatMap((triangle) => triangle.vertices);
      const uValues = vertices.map((vertex) => uAxis.dot(vertex));
      const vValues = vertices.map((vertex) => vertex.y);
      const planeDistance = normal.dot(component[0].center);
      const uMin = Math.min(...uValues);
      const uMax = Math.max(...uValues);
      const vMin = Math.min(...vValues);
      const vMax = Math.max(...vValues);
      const center = normal
        .clone()
        .multiplyScalar(planeDistance)
        .add(uAxis.clone().multiplyScalar((uMin + uMax) / 2))
        .add(new THREE.Vector3(0, (vMin + vMax) / 2, 0));
      const radial = center.clone().sub(modelCenter).setY(0);
      const radialDistance = radial.length();
      const exteriorScore =
        radialDistance > 0.0001 ? normal.dot(radial.normalize()) : 0;
      allPanels.push({
        area,
        center,
        exteriorScore,
        key: `${mesh.name}-component-${componentIndex}`,
        max: new THREE.Vector3(Math.max(...vertices.map((vertex) => vertex.x)), vMax, Math.max(...vertices.map((vertex) => vertex.z))),
        mesh,
        min: new THREE.Vector3(Math.min(...vertices.map((vertex) => vertex.x)), vMin, Math.min(...vertices.map((vertex) => vertex.z))),
        normal,
        planeDistance,
        radialDistance,
        triangleCount: component.length,
        uAxis,
        uMax,
        uMin,
        vMax,
        vMin,
        width: uMax - uMin,
      });
    });
  };

  meshes.forEach((mesh) => {
    const triangles = getMeshTriangles(mesh);
    triangleCount += triangles.length;
    const verticalTriangles = triangles.filter((triangle) => {
      const isVertical = Math.abs(triangle.normal.y) <= 0.32;
      if (isVertical) {
        verticalTriangleCount += 1;
      }
      return isVertical;
    });
    addPanel(mesh, verticalTriangles);
  });

  const rejectedPanels = allPanels
    .filter((panel) => panel.area <= 0.05 || panel.exteriorScore <= 0.45 || panel.radialDistance <= 2.9 || panel.width <= 0.5 || panel.vMax - panel.vMin <= 0.8)
    .map((panel) => ({
      panel,
      reason:
        panel.area <= 0.05
          ? "area-too-small"
          : panel.exteriorScore <= 0.45
            ? "interior-or-inward-normal"
            : panel.radialDistance <= 2.9
              ? "near-model-center"
              : panel.width <= 0.5
                ? "width-too-small"
                : "height-too-small",
    }));
  const panels = allPanels
    .filter((panel) => !rejectedPanels.some((rejected) => rejected.panel.key === panel.key))
    .toSorted((first, second) => second.area - first.area);

  return {
    componentCount,
    exteriorTriangleCount: panels.reduce((count, panel) => count + panel.triangleCount, 0),
    panels,
    rejectedPanels,
    triangleCount,
    verticalTriangleCount,
  };
}

export function StarModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipAnchorRef = useRef<HTMLSpanElement>(null);
  const [hoveredAuthor, setHoveredAuthor] = useState<{ name: string } | null>(null);

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
      const fallbackEntries = shuffle(getPersonImageEntries()).slice(0, MAX_SHOWCASE_COUNT);
      let selectedEntries: PersonImageEntry[] = fallbackEntries;
      let selectionSource = "fallback";

      try {
        const response = await fetch(`/api/showcase?ts=${Date.now()}`, { cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as {
            entries?: PersonImageEntry[];
            source?: string;
          };
          if (Array.isArray(payload.entries) && payload.entries.length > 0) {
            selectedEntries = payload.entries.slice(0, MAX_SHOWCASE_COUNT);
            selectionSource = payload.source ?? "database";
          }
        } else {
          logStarModelDebug("showcase selection request failed", { status: response.status });
        }
      } catch (error) {
        logStarModelDebug("showcase selection request unavailable", {
          message: error instanceof Error ? error.message : "unknown error",
        });
      }

      if (selectedEntries.length === 0 || cancelled) {
        return;
      }

      logStarModelDebug("selected portrait entries", {
        entries: selectedEntries,
        source: selectionSource,
      });

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
      const targetPortraitHeight = Math.min(localSize.y * 0.25 * PORTRAIT_SIZE_MULTIPLIER, 2.3);
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
      const panelMetrics = exteriorFaceAnalysis.panels
        .filter((panel) => {
          const panelHeight = panel.vMax - panel.vMin;
          return panel.mesh.name === "Cube009_1" && panelHeight > 0.8 && panel.width > 0.5;
        })
        .map((panel) => {
          const panelHeight = panel.vMax - panel.vMin;
          const panelWidth = panel.width;
          const horizontalMargin = Math.max(panelWidth * 0.14, 0.04);
          const verticalMargin = Math.max(localSize.y * 0.035, 0.08);
          const safeWidth = Math.max(panelWidth - horizontalMargin * 2, 0);
          const safeHeight = Math.max(panelHeight - verticalMargin - Math.max(panelHeight * 0.09, 0.04), 0);
          return {
            panel,
            area: panel.area,
            horizontalMargin,
            panelHeight,
            panelWidth,
            safeHeight,
            safeWidth,
            verticalMargin,
          };
        });
      const uniformPortraitHeight = panelMetrics.length > 0
        ? Math.min(
            targetPortraitHeight,
            ...panelMetrics.map((metric) => Math.min(metric.safeHeight, metric.safeWidth / 0.69)),
          )
        : 0;
      const uniformPortraitWidth = uniformPortraitHeight * 0.69;
      const evaluatedPanels = panelMetrics.map((metric) => {
        const { panel } = metric;
        const uCenter = (panel.uMin + panel.uMax) / 2;
        const bottomMargin = metric.verticalMargin;
        const position = panel.normal
          .clone()
          .multiplyScalar(panel.planeDistance)
          .add(panel.uAxis.clone().normalize().multiplyScalar(uCenter))
          .add(new THREE.Vector3(0, panel.vMin + bottomMargin + uniformPortraitHeight / 2, 0))
          .addScaledVector(panel.normal, surfaceOffset);
        const basis = new THREE.Matrix4().makeBasis(
          panel.uAxis.clone().normalize(),
          new THREE.Vector3(0, 1, 0),
          panel.normal.clone().normalize(),
        );
        return {
          area: metric.area,
          horizontalMargin: metric.horizontalMargin,
          isUsable: uniformPortraitWidth > 0.08 && uniformPortraitHeight > 0.12,
          orientation: new THREE.Quaternion().setFromRotationMatrix(basis),
          panelId: panel.key,
          panelHeight: metric.panelHeight,
          panelWidth: metric.panelWidth,
          portraitHeight: uniformPortraitHeight,
          portraitWidth: uniformPortraitWidth,
          safeHeight: metric.safeHeight,
          safeWidth: metric.safeWidth,
          verticalMargin: bottomMargin,
          bottomMargin,
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
        uniformPortraitHeight,
        uniformPortraitWidth,
        exteriorFaceAnalysis: {
          componentCount: exteriorFaceAnalysis.componentCount,
          exteriorTriangleCount: exteriorFaceAnalysis.exteriorTriangleCount,
          allPanelCount: exteriorFaceAnalysis.panels.length + exteriorFaceAnalysis.rejectedPanels.length,
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
          rejectedPanels: exteriorFaceAnalysis.rejectedPanels.map(({ panel, reason }) => ({
            area: panel.area,
            center: panel.center.toArray(),
            exteriorScore: panel.exteriorScore,
            height: panel.vMax - panel.vMin,
            meshName: panel.mesh.name,
            normal: panel.normal.toArray(),
            panelId: panel.key,
            radialDistance: panel.radialDistance,
            reason,
            triangleCount: panel.triangleCount,
            width: panel.width,
          })),
          rejectedDisplayablePanels: evaluatedPanels
            .filter((point) => !point.isUsable)
            .map((point) => ({
              area: point.area,
              panelId: point.panelId,
              panelHeight: point.panelHeight,
              panelWidth: point.panelWidth,
              portraitHeight: point.portraitHeight,
              portraitWidth: point.portraitWidth,
              position: point.position.toArray(),
              safeHeight: point.safeHeight,
              safeWidth: point.safeWidth,
              reason: "too-small-after-safe-margins",
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
          bottomMargin: point.bottomMargin,
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
          panelMesh.userData.personHref = textureEntries[pointIndex]?.detailName
            ? buildPersonDetailUrl(textureEntries[pointIndex].detailName)
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
      const hoveredShowcase = findClickedShowcase(event);
      const personName = hoveredShowcase?.object.userData.personName;
      renderer.domElement.style.cursor = hoveredShowcase ? "pointer" : "default";
      if (!hoveredShowcase || typeof personName !== "string" || personName.length === 0) {
        setHoveredAuthor(null);
        return;
      }

      const bounds = container.getBoundingClientRect();
      if (tooltipAnchorRef.current) {
        tooltipAnchorRef.current.style.left = `${event.clientX - bounds.left}px`;
        tooltipAnchorRef.current.style.top = `${event.clientY - bounds.top}px`;
      }
      setHoveredAuthor({ name: personName });
    };

    const handlePointerLeave = () => {
      renderer.domElement.style.cursor = "default";
      if (tooltipAnchorRef.current) {
        tooltipAnchorRef.current.style.left = "-9999px";
        tooltipAnchorRef.current.style.top = "-9999px";
      }
      setHoveredAuthor(null);
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
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      modelGroup.rotation.y += 0.001124125;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
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
    <TooltipProvider>
      <Tooltip open={Boolean(hoveredAuthor)}>
        <div
          ref={containerRef}
          className="relative h-full w-full"
          aria-label="Modèle 3D étoile"
        >
          <TooltipTrigger asChild>
            <span
              ref={tooltipAnchorRef}
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] -top-[9999px] z-20 size-1"
            />
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            <span className="text-[20px]">{hoveredAuthor?.name}</span>
          </TooltipContent>
        </div>
      </Tooltip>
    </TooltipProvider>
  );
}
