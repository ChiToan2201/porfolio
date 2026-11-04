'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ChevronDown, ChevronUp, Layers, RotateCcw, Sparkles } from 'lucide-react';
import {
  createContactShadowMesh,
  createLoopScheduler,
  createRoundedRectShape,
  createStudioRenderer,
  detectSoftwareGl,
  disposeSceneResources,
  setupStudioLightingAndEnv,
} from '@/lib/three-utils';

export type PortraitFinishMode = 'studio' | 'relief' | 'original';

interface ThreePortraitStageProps {
  portraitSrc: string;
  developerName: string;
  developerRole: string;
}

// Pre-allocated math objects outside render loop (zero GC)
const _pointerNdc = new THREE.Vector2(0, 0);
const _targetUv = new THREE.Vector2(0.5, 0.5);

interface ProcessedPortraitTextures {
  studioMap: THREE.CanvasTexture;
  reliefMonoMap: THREE.CanvasTexture;
  originalMap: THREE.CanvasTexture;
  depthDataMap: THREE.CanvasTexture;
}

/**
 * Processes the uploaded portrait on an offscreen HTML5 2D Canvas to:
 * 1) Harmonize the bright passport-blue backdrop into a refined studio dark vignette ("studio" mode)
 * 2) Create a sculptural silver-cobalt monochrome edition ("relief" mode)
 * 3) Preserve the crisp original studio portrait ("original" mode)
 * 4) Generate a smooth subject luminance/mask elevation map for real 3D relief displacement!
 */
function buildPortraitTextures(
  img: HTMLImageElement,
  maxAnisotropy: number
): ProcessedPortraitTextures {
  const targetW = 768;
  const targetH = 1024;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = targetW;
  srcCanvas.height = targetH;
  const srcCtx = srcCanvas.getContext('2d')!;

  // Cover-fit crop onto 3:4 aspect ratio
  const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  const canvasAspect = targetW / targetH;
  let drawW = targetW;
  let drawH = targetH;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > canvasAspect) {
    drawH = targetH;
    drawW = targetH * imgAspect;
    offsetX = (targetW - drawW) / 2;
  } else {
    drawW = targetW;
    drawH = targetW / imgAspect;
    offsetY = (targetH - drawH) * 0.2;
  }

  srcCtx.drawImage(img, offsetX, offsetY, drawW, drawH);
  const srcData = srcCtx.getImageData(0, 0, targetW, targetH);
  const px = srcData.data;

  const studioCanvas = document.createElement('canvas');
  studioCanvas.width = targetW;
  studioCanvas.height = targetH;
  const studioCtx = studioCanvas.getContext('2d')!;
  const studioImg = studioCtx.createImageData(targetW, targetH);

  const monoCanvas = document.createElement('canvas');
  monoCanvas.width = targetW;
  monoCanvas.height = targetH;
  const monoCtx = monoCanvas.getContext('2d')!;
  const monoImg = monoCtx.createImageData(targetW, targetH);

  const depthCanvas = document.createElement('canvas');
  depthCanvas.width = targetW;
  depthCanvas.height = targetH;
  const depthCtx = depthCanvas.getContext('2d')!;
  const depthImg = depthCtx.createImageData(targetW, targetH);

  const sOut = studioImg.data;
  const mOut = monoImg.data;
  const dOut = depthImg.data;

  for (let y = 0; y < targetH; y++) {
    const ny = y / targetH;
    for (let x = 0; x < targetW; x++) {
      const nx = x / targetW;
      const i = (y * targetW + x) * 4;

      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];

      // Smooth chroma detection for studio blue backdrop (#0084c9 region)
      const blueDominance = (b - Math.max(r, g * 0.72)) / 255;
      const bgWeight = THREE.MathUtils.clamp((blueDominance - 0.12) * 4.5, 0, 1);
      const subjectMask = 1 - bgWeight;

      // Subtle radial studio light behind head/shoulders on dark obsidian backdrop
      const dx = nx - 0.5;
      const dy = ny - 0.42;
      const radialGlow = Math.max(0, 1 - Math.hypot(dx * 1.35, dy * 1.15) * 1.45);
      const bgR = 13 + radialGlow * 16;
      const bgG = 15 + radialGlow * 24;
      const bgB = 22 + radialGlow * 48;

      // Slight studio contrast polish on subject
      const subjR = THREE.MathUtils.clamp((r - 128) * 1.06 + 128, 0, 255);
      const subjG = THREE.MathUtils.clamp((g - 128) * 1.05 + 128, 0, 255);
      const subjB = THREE.MathUtils.clamp((b - 128) * 1.04 + 126, 0, 255);

      sOut[i] = subjR * subjectMask + bgR * bgWeight;
      sOut[i + 1] = subjG * subjectMask + bgG * bgWeight;
      sOut[i + 2] = subjB * subjectMask + bgB * bgWeight;
      sOut[i + 3] = 255;

      // Sculptural Monochrome Edition
      const luma = 0.299 * subjR + 0.587 * subjG + 0.114 * subjB;
      const contrastedLuma = THREE.MathUtils.clamp(
        (luma - 120) * 1.18 + 124,
        0,
        255
      );
      mOut[i] = contrastedLuma * 0.96 * subjectMask + 12 * bgWeight;
      mOut[i + 1] = contrastedLuma * 0.98 * subjectMask + 14 * bgWeight;
      mOut[i + 2] =
        THREE.MathUtils.clamp(contrastedLuma * 1.05, 0, 255) * subjectMask +
        20 * bgWeight;
      mOut[i + 3] = 255;

      // Smooth 3D Relief Height Value: foreground subject sits forward in Z, shaped by facial tonal luminance
      const centerFaceBoost = Math.max(
        0,
        1 - Math.hypot((nx - 0.5) * 1.8, (ny - 0.4) * 1.5)
      );
      const heightVal = THREE.MathUtils.clamp(
        subjectMask * (135 + (luma / 255) * 85 + centerFaceBoost * 35),
        0,
        255
      );
      dOut[i] = heightVal;
      dOut[i + 1] = heightVal;
      dOut[i + 2] = heightVal;
      dOut[i + 3] = 255;
    }
  }

  studioCtx.putImageData(studioImg, 0, 0);
  monoCtx.putImageData(monoImg, 0, 0);

  // Blur depth map on a secondary canvas so 3D vertex relief is silky smooth without jagged pixel spikes
  const rawDepthCanvas = document.createElement('canvas');
  rawDepthCanvas.width = targetW;
  rawDepthCanvas.height = targetH;
  rawDepthCanvas.getContext('2d')!.putImageData(depthImg, 0, 0);

  depthCtx.filter = 'blur(10px)';
  depthCtx.drawImage(rawDepthCanvas, 0, 0);
  depthCtx.filter = 'none';

  const makeColorTex = (c: HTMLCanvasElement) => {
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    tex.needsUpdate = true;
    return tex;
  };

  const studioMap = makeColorTex(studioCanvas);
  const reliefMonoMap = makeColorTex(monoCanvas);
  const originalMap = makeColorTex(srcCanvas);

  // Depth map stays in linear NoColorSpace per Three.js texture standards
  const depthDataMap = new THREE.CanvasTexture(depthCanvas);
  depthDataMap.anisotropy = maxAnisotropy;
  depthDataMap.needsUpdate = true;

  return { studioMap, reliefMonoMap, originalMap, depthDataMap };
}

export default function ThreePortraitStage({
  portraitSrc,
  developerName,
  developerRole,
}: ThreePortraitStageProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const [finishMode, setFinishMode] = useState<PortraitFinishMode>('studio');
  const [explodeAmount, setExplodeAmount] = useState<number>(0.18);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

  // Mutable refs read inside WebGL animation loop without re-creating renderer
  const finishModeRef = useRef<PortraitFinishMode>('studio');
  const explodeRef = useRef<number>(0.18);
  const resetTriggerRef = useRef<boolean>(false);
  const rippleImpulseRef = useRef<number>(0);

  const handleSelectFinish = (mode: PortraitFinishMode) => {
    setFinishMode(mode);
    finishModeRef.current = mode;
    rippleImpulseRef.current = 1.0;
  };

  const handleExplodeChange = (val: number) => {
    setExplodeAmount(val);
    explodeRef.current = val;
  };

  const handleResetView = () => {
    resetTriggerRef.current = true;
    setExplodeAmount(0.18);
    explodeRef.current = 0.18;
    rippleImpulseRef.current = 0.85;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = createStudioRenderer(isSoftwareGl);
    } catch {
      queueMicrotask(() => setWebglFailed(true));
      return;
    }

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 400);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const envTexture = setupStudioLightingAndEnv(renderer, scene, isSoftwareGl);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0.08, 4.95);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minAzimuthAngle = -Math.PI * 0.24;
    controls.maxAzimuthAngle = Math.PI * 0.24;
    controls.minPolarAngle = Math.PI * 0.34;
    controls.maxPolarAngle = Math.PI * 0.66;
    controls.target.set(0, 0.05, 0);

    // Cancel scripted camera reset if user grabs controls
    controls.addEventListener('start', () => {
      resetTriggerRef.current = false;
    });

    // =========================================================================
    // COMPOSITE 9-PART 3D PORTRAIT MONOLITH SCULPTURE (THREE.Group)
    // =========================================================================
    const monolithGroup = new THREE.Group();
    monolithGroup.position.set(0, 0.06, 0);
    scene.add(monolithGroup);

    // 1. Primary Silhouette: Beveled Dark Anodized Titanium Chassis
    const chassisShape = createRoundedRectShape(2.38, 3.12, 0.14);
    const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
    });
    chassisGeo.center();
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x16181f,
      metalness: 0.86,
      roughness: 0.26,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    chassisMesh.position.z = -0.1;
    chassisMesh.castShadow = !isSoftwareGl;
    chassisMesh.receiveShadow = !isSoftwareGl;
    monolithGroup.add(chassisMesh);

    // 2. Secondary Read: Inner Matte Recessed Matte Bezel (roughness delta >= 0.35)
    const bezelShape = createRoundedRectShape(2.2, 2.94, 0.09);
    const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    bezelGeo.center();
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x0c0d12,
      metalness: 0.25,
      roughness: 0.72,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.z = -0.02;
    monolithGroup.add(bezelMesh);

    // 3. High-Subdivision 3D Portrait Relief Mesh with PBR + Custom GLSL Ripple
    const portraitGeo = new THREE.PlaneGeometry(2.08, 2.82, 88, 116);
    const shaderUniforms = {
      uTime: { value: 0 },
      uHoverUv: { value: new THREE.Vector2(0.5, 0.5) },
      uRippleAmp: { value: 0 },
      uReliefDepth: { value: 0.14 },
    };

    const portraitMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.42,
      metalness: 0.08,
      displacementScale: 0.14,
      displacementBias: -0.04,
    });

    portraitMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = shaderUniforms.uTime;
      shader.uniforms.uHoverUv = shaderUniforms.uHoverUv;
      shader.uniforms.uRippleAmp = shaderUniforms.uRippleAmp;

      shader.vertexShader =
        `
        uniform float uTime;
        uniform vec2 uHoverUv;
        uniform float uRippleAmp;
        ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <displacementmap_vertex>',
        `
        #include <displacementmap_vertex>
        float distToPointer = distance(uv, uHoverUv);
        float rippleWave = sin(distToPointer * 26.0 - uTime * 5.2) * exp(-distToPointer * 4.5) * uRippleAmp * 0.055;
        transformed += normalize(objectNormal) * rippleWave;
        `
      );
    };

    const portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    portraitMesh.position.z = 0.03;
    portraitMesh.layers.enable(1);
    monolithGroup.add(portraitMesh);

    // 4. Optical Front Crystal Cover Plate (MeshPhysicalMaterial)
    const glassShape = createRoundedRectShape(2.22, 2.96, 0.1);
    const glassGeo = new THREE.ExtrudeGeometry(glassShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    glassGeo.center();
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.06,
      transmission: isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: isSoftwareGl ? 0.16 : 1,
      ior: 1.52,
      thickness: 0.35,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      depthWrite: false,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.renderOrder = 4;
    glassMesh.position.z = 0.14;
    monolithGroup.add(glassMesh);

    // 5–8. Four Accent Brushed-Cobalt Corner Mounting Clamps
    const clampGroup = new THREE.Group();
    const clampGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.09, 20);
    clampGeo.rotateX(Math.PI / 2);
    const clampMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.92,
      roughness: 0.18,
    });

    const cornerOffsets: [number, number][] = [
      [-1.02, 1.38],
      [1.02, 1.38],
      [-1.02, -1.38],
      [1.02, -1.38],
    ];
    const clampMeshes: THREE.Mesh[] = [];
    cornerOffsets.forEach(([cx, cy]) => {
      const pin = new THREE.Mesh(clampGeo, clampMat);
      pin.position.set(cx, cy, 0.16);
      clampGroup.add(pin);
      clampMeshes.push(pin);
    });
    monolithGroup.add(clampGroup);

    // 9. Orbital Calibration Halo Ring around Monolith
    const haloGeo = new THREE.TorusGeometry(1.88, 0.012, 12, 96);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.85,
      roughness: 0.22,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.28,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI * 0.38;
    haloMesh.rotation.y = -Math.PI * 0.12;
    monolithGroup.add(haloMesh);

    // Grounded Contact Shadow Plane beneath Monolith
    const contactShadow = createContactShadowMesh(3.4, 2.2, 0.58);
    contactShadow.position.set(0, -1.78, 0);
    scene.add(contactShadow);

    // Load & Process User Portrait Texture
    let texturesBundle: ProcessedPortraitTextures | null = null;
    let activeAppliedMode: PortraitFinishMode | null = null;
    let isDisposed = false;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (isDisposed) return;
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      texturesBundle = buildPortraitTextures(img, maxAniso);

      portraitMat.map = texturesBundle.studioMap;
      portraitMat.displacementMap = texturesBundle.depthDataMap;
      portraitMat.needsUpdate = true;
      activeAppliedMode = 'studio';
      setIsLoaded(true);
    };
    img.onerror = () => {
      if (!isDisposed) setIsLoaded(true);
    };
    img.src = portraitSrc;

    // Raycaster for Interactive Surface Ripples
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    let lastRaycastTime = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastRaycastTime < 32) return;
      lastRaycastTime = now;

      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      _pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObject(portraitMesh, false);
      if (hits.length > 0 && hits[0].uv) {
        _targetUv.copy(hits[0].uv);
        rippleImpulseRef.current = Math.min(1, rippleImpulseRef.current + 0.32);
      }
    };

    const handlePointerDown = () => {
      rippleImpulseRef.current = 1.0;
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Intersection Observer so off-screen chapters pause GPU work cleanly
    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: '200px' }
    );
    io.observe(container);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    const scheduler = createLoopScheduler(renderer, isSoftwareGl);
    let currentExplode = explodeRef.current;

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (isVisible) {
        // Sync selected portrait texture mode
        if (texturesBundle && activeAppliedMode !== finishModeRef.current) {
          activeAppliedMode = finishModeRef.current;
          portraitMat.map =
            activeAppliedMode === 'studio'
              ? texturesBundle.studioMap
              : activeAppliedMode === 'relief'
                ? texturesBundle.reliefMonoMap
                : texturesBundle.originalMap;
          portraitMat.roughness = activeAppliedMode === 'relief' ? 0.3 : 0.42;
          portraitMat.metalness = activeAppliedMode === 'relief' ? 0.25 : 0.08;
          portraitMat.needsUpdate = true;
        }

        // Smooth exponential damping for Exploded 3D Layers
        currentExplode = THREE.MathUtils.damp(
          currentExplode,
          explodeRef.current,
          6.5,
          dt
        );

        chassisMesh.position.z = -0.1 - currentExplode * 0.42;
        bezelMesh.position.z = -0.02 - currentExplode * 0.18;
        portraitMesh.position.z = 0.03 + currentExplode * 0.08;
        portraitMat.displacementScale = 0.11 + currentExplode * 0.18;
        glassMesh.position.z = 0.14 + currentExplode * 0.46;
        clampGroup.position.z = currentExplode * 0.62;
        haloMesh.scale.setScalar(1 + currentExplode * 0.14);

        // Smooth camera reset transition if requested
        if (resetTriggerRef.current) {
          camera.position.x = THREE.MathUtils.damp(
            camera.position.x,
            0,
            6,
            dt
          );
          camera.position.y = THREE.MathUtils.damp(
            camera.position.y,
            0.08,
            6,
            dt
          );
          camera.position.z = THREE.MathUtils.damp(
            camera.position.z,
            4.95,
            6,
            dt
          );
          if (
            Math.abs(camera.position.x) < 0.01 &&
            Math.abs(camera.position.z - 4.95) < 0.02
          ) {
            resetTriggerRef.current = false;
          }
        }

        // Subtle idle levitation & orbital ring motion
        if (!prefersReducedMotion) {
          monolithGroup.position.y = 0.06 + Math.sin(elapsed * 1.35) * 0.035;
          haloMesh.rotation.z = elapsed * 0.22;
        }

        // Smoothly damp shader ripple & UV pointer tracking
        shaderUniforms.uTime.value = elapsed;
        shaderUniforms.uHoverUv.value.lerp(_targetUv, 1 - Math.exp(-8 * dt));
        rippleImpulseRef.current = THREE.MathUtils.damp(
          rippleImpulseRef.current,
          0.12,
          2.6,
          dt
        );
        shaderUniforms.uRippleAmp.value = prefersReducedMotion
          ? 0
          : rippleImpulseRef.current;

        controls.update();
        renderer.render(scene, camera);
      }

      scheduler.scheduleNext(tick);
    };

    scheduler.scheduleNext(tick);

    return () => {
      isDisposed = true;
      scheduler.cancel();
      io.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();

      if (texturesBundle) {
        texturesBundle.studioMap.dispose();
        texturesBundle.reliefMonoMap.dispose();
        texturesBundle.originalMap.dispose();
        texturesBundle.depthDataMap.dispose();
      }
      clampGeo.dispose();
      clampMat.dispose();
      disposeSceneResources(scene, envTexture);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [portraitSrc]);

  return (
    <div className="relative aspect-[3/4] w-full rounded-xl border border-zinc-800/90 bg-[#0B0B0F] overflow-hidden select-none">
      {/* Dedicated Empty WebGL Mount Container (Zero backdrop-filter over canvas) */}
      <div
        ref={mountRef}
        data-cursor="3D Drag"
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Minimal Top-Left Spec Label (Zero side-panel occlusion) */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 z-10 rounded-md border border-zinc-800 bg-[#0B0B0F]/92 px-3 py-1.5">
        <p className="text-xs font-semibold text-[#F4F4F5] leading-tight">
          {developerName}
        </p>
        <p className="font-[family-name:var(--font-mono)] text-[10px] text-zinc-400">
          {developerRole} · Drag to Orbit 3D
        </p>
      </div>

      {/* Loading / WebGL Fallback Overlay */}
      {(!isLoaded || webglFailed) && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0B0F] p-6 text-center">
          <Sparkles className="h-6 w-6 text-[#3B82F6] mb-2" />
          <p className="text-xs font-medium text-zinc-300">
            {webglFailed
              ? '3D Viewport Unavailable on Current Device'
              : 'Calibrating 3D Studio Portrait Relief...'}
          </p>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-md flex flex-col items-center">
        <button
          type="button"
          onClick={() => setHudCollapsed((prev) => !prev)}
          className="h-6 px-2.5 rounded-t-md border border-b-0 border-zinc-800 bg-[#0E0E14] text-[10px] font-medium text-zinc-400 hover:text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          {hudCollapsed ? (
            <>
              <ChevronUp className="h-3 w-3 text-[#3B82F6]" />
              <span>Show 3D Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 text-[#3B82F6]" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!hudCollapsed && (
          <div className="w-full rounded-lg border border-zinc-800 bg-[#0E0E14]/96 p-2.5 space-y-2 shadow-xl">
            {/* Finish Swatches + Camera Reset */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'studio', label: 'Studio Cutout' },
                    { id: 'relief', label: 'Mono Relief' },
                    { id: 'original', label: 'Original' },
                  ] as const
                ).map((item) => {
                  const active = finishMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectFinish(item.id)}
                      className={`h-7 px-2.5 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#15151D] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleResetView}
                aria-label="Reset 3D camera angle"
                className="h-7 px-2 rounded border border-zinc-800 bg-[#15151D] hover:border-zinc-600 text-[11px] text-zinc-300 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3 w-3 text-[#3B82F6]" />
                <span>Reset</span>
              </button>
            </div>

            {/* Exploded 3D Layers Slider */}
            <div className="flex items-center gap-2.5 px-1">
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 whitespace-nowrap shrink-0">
                <Layers className="h-3 w-3 text-[#3B82F6]" />
                <span>3D Depth</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={explodeAmount}
                aria-label="3D Portrait Exploded Depth"
                onChange={(e) => handleExplodeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-[#2563EB] bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="font-[family-name:var(--font-mono)] tabular-nums text-[10px] text-zinc-400 w-8 text-right shrink-0">
                {Math.round(explodeAmount * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
