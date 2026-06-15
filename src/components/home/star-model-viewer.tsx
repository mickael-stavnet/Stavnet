"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function StarModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
    camera.position.set(0, 0.2, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "h-full w-full";
    container.appendChild(renderer.domElement);
    console.log("[DEBUG LOG]: star viewer initialized " + JSON.stringify({
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
      devicePixelRatio: window.devicePixelRatio,
      rendererPixelRatio: renderer.getPixelRatio(),
    }));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(3, 5, 4);
    const fillLight = new THREE.DirectionalLight(0xffe5b0, 1.2);
    fillLight.position.set(-4, 2, 3);
    scene.add(ambientLight, keyLight, fillLight);

    const modelGroup = new THREE.Group();
    const pivotGroup = new THREE.Group();
    modelGroup.rotation.y = Math.PI;
    pivotGroup.position.set(0, 0.35, 0);
    pivotGroup.add(modelGroup);
    scene.add(pivotGroup);

    let loadedModel: THREE.Object3D | null = null;
    let frameId = 0;
    let frameCount = 0;

    const loader = new GLTFLoader();
    loader.load("/models/star.glb", (gltf) => {
      loadedModel = gltf.scene;
      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const largestAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = 9.2 / largestAxis;
      loadedModel.scale.setScalar(scale);
      loadedModel.position.copy(center).multiplyScalar(-scale);
      modelGroup.add(loadedModel);
      const scaledBox = new THREE.Box3().setFromObject(modelGroup);
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const maxDimension = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) || 1;
      const distance = maxDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.position.set(0, maxDimension * 0.02, distance * 0.78);
      camera.lookAt(0, 0, 0);
      console.log("[DEBUG LOG]: star model loaded " + JSON.stringify({
        originalCenter: center.toArray(),
        originalSize: size.toArray(),
        largestAxis,
        scale: loadedModel.scale.x,
        pivotPosition: pivotGroup.position.toArray(),
        modelRotationYDegrees: THREE.MathUtils.radToDeg(modelGroup.rotation.y),
        scaledCenter: scaledCenter.toArray(),
        scaledSize: scaledSize.toArray(),
        maxDimension,
        cameraPosition: camera.position.toArray(),
        cameraFov: camera.fov,
      }));
    }, (event) => {
      console.log("[DEBUG LOG]: star model loading progress " + JSON.stringify({
        loaded: event.loaded,
        total: event.total,
        percent: event.total ? Math.round((event.loaded / event.total) * 100) : null,
      }));
    }, (error) => {
      console.error("[DEBUG LOG]: star model loading error", error);
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
      console.log("[DEBUG LOG]: star viewer resized " + JSON.stringify({
        width,
        height,
        aspect: camera.aspect,
        cameraPosition: camera.position.toArray(),
      }));
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      frameCount += 1;
      modelGroup.rotation.y += 0.001;
      if (frameCount % 240 === 0) {
        console.log("[DEBUG LOG]: star model rotation " + JSON.stringify({
          frameCount,
          rotationYDegrees: THREE.MathUtils.radToDeg(modelGroup.rotation.y),
          pivotPosition: pivotGroup.position.toArray(),
        }));
      }
      renderer.render(scene, camera);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
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
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      aria-label="Modèle 3D étoile"
    />
  );
}
