"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type AnimatedTag = {
  position: {
    x: number;
    y: number;
    z: number;
    copy: (v: { x: number; y: number; z: number }) => void;
    set: (x: number, y: number, z: number) => void;
  };
  rotation: { y: number };
  _label: { position: { copy: (v: { x: number; y: number; z: number }) => void } };
  _speed: number;
  _orbitRadius: number;
  _index: number;
};

export function ThreeSphere({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.4,
    });
    const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(centralSphere);

    const tagsData = [
      { size: 0.3, color: 0xff6b35, speed: 0.01 },
      { size: 0.25, color: 0x38bdf8, speed: 0.015 },
      { size: 0.35, color: 0x8b5cf6, speed: 0.008 },
      { size: 0.28, color: 0xec4899, speed: 0.02 },
      { size: 0.32, color: 0x10b981, speed: 0.012 },
      { size: 0.22, color: 0xf59e0b, speed: 0.018 },
    ];

    const tags: AnimatedTag[] = [];
    const mouse = { x: 0, y: 0 };
    let targetRotation = 0;
    let targetElevation = 0;
    let isMouseDown = false;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onMouseUp = () => {
      isMouseDown = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - mouse.x;
      const deltaY = e.clientY - mouse.y;
      targetRotation += deltaX * 0.01;
      targetElevation = Math.max(
        -0.8,
        Math.min(0.8, targetElevation + deltaY * 0.01),
      );
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(5, Math.min(20, camera.position.z));
    };
    const onMouseEnter = () => {
      isMouseDown = true;
    };
    const onMouseLeave = () => {
      isMouseDown = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("wheel", onWheel);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    tagsData.forEach((data, i) => {
      const geometry = new THREE.IcosahedronGeometry(data.size, 0);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.3,
      });

      const tag = new THREE.Mesh(geometry, material) as unknown as AnimatedTag;
      const orbitRadius = 3.5 + Math.random() * 0.5;
      const theta = (i / tagsData.length) * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      tag.position.set(
        orbitRadius * Math.sin(phi) * Math.cos(theta),
        orbitRadius * Math.cos(phi),
        orbitRadius * Math.sin(phi) * Math.sin(theta),
      );

      const labelGeo = new THREE.PlaneGeometry(data.size * 0.8, data.size * 0.8);
      const labelMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.copy(tag.position);
      label.updateMatrixWorld();
      scene.add(label);

      tag._label = label;
      tag._speed = data.speed;
      tag._orbitRadius = orbitRadius;
      tag._index = i;
      tags.push(tag);
      scene.add(tag);
    });

    const clock = new THREE.Clock();
    let animationFrameId = 0;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      centralSphere.rotation.y = elapsed * 0.1;
      camera.position.x = targetRotation;
      camera.position.y = targetElevation * 2;

      tags.forEach((tag) => {
        const angle = elapsed * tag._speed * (tag._index + 1);
        tag.position.x = tag._orbitRadius * Math.sin(angle);
        tag.position.z = tag._orbitRadius * Math.cos(angle);
        tag.rotation.y = angle * 0.5;
        tag._label.position.copy(tag.position);
      });

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[300px] w-full overflow-hidden rounded-xl sm:h-[400px]",
        className,
      )}
    />
  );
}
