"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore

export function ThreeSphere({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    // Create a central subtle sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.4,
    });
    const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(centralSphere);

    // Create orbiting "dev" tags / floating elements
    const tagsData = [
      { size: 0.3, color: 0xff6b35, speed: 0.01, label: "dev" },
      { size: 0.25, color: 0x38bdf8, speed: 0.015, label: "story" },
      { size: 0.35, color: 0x8b5cf6, speed: 0.008, label: "build" },
      { size: 0.28, color: 0xec4899, speed: 0.02, label: "code" },
      { size: 0.32, color: 0x10b981, speed: 0.012, label: "test" },
      { size: 0.22, color: 0xf59e0b, speed: 0.018, label: "deploy" },
    ];

    const tags: any[] = [];

    // Mouse interaction state
    let mouse = { x: 0, y: 0 };
    let targetRotation = 0;
    let targetElevation = 0;
    let isMouseDown = false;

    // Mouse event listeners
    container.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    container.addEventListener("mouseup", () => (isMouseDown = false));
    container.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - mouse.x;
      const deltaY = e.clientY - mouse.y;
      targetRotation += deltaX * 0.01;
      targetElevation = Math.max(-0.8, Math.min(0.8, targetElevation + deltaY * 0.01));
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    container.addEventListener("wheel", (e) => {
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(5, Math.min(20, camera.position.z));
    });

    // Create orbiting "dev" tags / floating elements
    tagsData.forEach((data, i) => {
      const geometry = new THREE.IcosahedronGeometry(data.size, 0);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.3,
      });

      const tag = new THREE.Mesh(geometry, material);

      // Position on a larger orbit
      const orbitRadius = 3.5 + Math.random() * 0.5;
      const theta = (i / tagsData.length) * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      tag.position.set(
        orbitRadius * Math.sin(phi) * Math.cos(theta),
        orbitRadius * Math.cos(phi),
        orbitRadius * Math.sin(phi) * Math.sin(theta)
      );

      // Add a label plane
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

      ;(tag as any)._label = label;
      ;(tag as any)._speed = data.speed;
      ;(tag as any)._orbitRadius = orbitRadius;
      ;(tag as any)._index = i;
      tags.push(tag);

      scene.add(tag);
    });

    // Animation loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Rotate central sphere slowly
      centralSphere.rotation.y = elapsed * 0.1;

      // Apply mouse-driven orbit changes
      camera.position.x = targetRotation;
      camera.position.y = targetElevation * 2;

      // Animate each tag orbiting with individual speeds
      tags.forEach((tag: any) => {
        const angle = elapsed * tag._speed * (tag._index + 1);
        tag.position.x = tag._orbitRadius * Math.sin(angle);
        tag.position.z = tag._orbitRadius * Math.cos(angle);
        tag.rotation.y = angle * 0.5;

        if (tag._label) {
          tag._label.position.copy(tag.position);
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Mouse enter/leave to enable/disable interaction
    container.addEventListener("mouseenter", () => (isMouseDown = true));
    container.addEventListener("mouseleave", () => (isMouseDown = false));

    // Cleanup
    return () => {
      container.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", (e) => {});
      container.removeEventListener("mouseup", () => {});
      container.removeEventListener("mousemove", (e) => {});
      container.removeEventListener("wheel", (e) => {});
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [containerRef]);

  return <div className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden" ref={containerRef} />;
}