'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  ChevronDown,
  ChevronUp,
  Expand,
  Layers,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ProjectBlueprintVariant } from '@/data/portfolio-data';
import {
  createContactShadowMesh,
  createLoopScheduler,
  createRoundedRectShape,
  createStudioRenderer,
  detectSoftwareGl,
  disposeSceneResources,
  setupStudioLightingAndEnv,
} from '@/lib/three-utils';

interface ThreeProjectShowcaseProps {
  variant: ProjectBlueprintVariant;
  projectIndex: string;
  techStack: string[];
  onExpandModal?: () => void;
}

// Pre-allocated math helpers outside render loop (zero GC)
const _ndc = new THREE.Vector2();
const _curvePos = new THREE.Vector3();

/**
 * Generates high-DPI crisp procedural CanvasTexture UI screens for 3D monitors/cards.
 */
function createProceduralScreenTexture(
  variant: ProjectBlueprintVariant,
  projectIndex: string,
  techStack: string[],
  maxAnisotropy: number,
  pulseCount: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Crisp studio dark canvas
  ctx.fillStyle = '#0D0E14';
  ctx.fillRect(0, 0, 1024, 640);

  // Subtle architectural grid
  ctx.strokeStyle = 'rgba(63, 63, 70, 0.28)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= 1024; gx += 48) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, 640);
    ctx.stroke();
  }
  for (let gy = 0; gy <= 640; gy += 48) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(1024, gy);
    ctx.stroke();
  }

  // Top window bar
  ctx.fillStyle = '#141620';
  ctx.fillRect(0, 0, 1024, 54);
  ctx.strokeStyle = '#27272A';
  ctx.beginPath();
  ctx.moveTo(0, 54);
  ctx.lineTo(1024, 54);
  ctx.stroke();

  // Window dots
  [28, 48, 68].forEach((cx) => {
    ctx.fillStyle = '#3F3F46';
    ctx.beginPath();
    ctx.arc(cx, 27, 5.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 18px monospace';
  ctx.fillText(`CASE_${projectIndex} · ${techStack.slice(0, 3).join(' / ')}`, 96, 33);

  if (variant === 'reactive-workspace') {
    // Sidebar
    ctx.fillStyle = '#12141E';
    ctx.fillRect(32, 82, 240, 520);
    ctx.strokeStyle = '#27272A';
    ctx.strokeRect(32, 82, 240, 520);

    ctx.fillStyle = '#3B82F6';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('RxJS / NgRx Store', 54, 122);

    ['Action Stream$', 'Memoized Selector', 'Effects Pipeline', 'State Snapshot'].forEach(
      (item, idx) => {
        ctx.fillStyle = idx === pulseCount % 4 ? '#1E3A8A' : '#181A26';
        ctx.fillRect(50, 150 + idx * 62, 204, 46);
        ctx.fillStyle = idx === pulseCount % 4 ? '#FFFFFF' : '#A1A1AA';
        ctx.font = '500 16px monospace';
        ctx.fillText(item, 64, 179 + idx * 62);
      }
    );

    // Main reactive telemetry area
    ctx.fillStyle = '#12141E';
    ctx.fillRect(296, 82, 696, 310);
    ctx.strokeStyle = '#2563EB';
    ctx.strokeRect(296, 82, 696, 310);

    ctx.fillStyle = '#F4F4F5';
    ctx.font = '600 22px sans-serif';
    ctx.fillText('Reactive Observable Stream Topology', 324, 126);

    // Crisp bar waveform
    for (let b = 0; b < 18; b++) {
      const h = 50 + ((Math.sin(b * 0.7 + pulseCount * 1.1) + 1) * 0.5) * 145;
      const bx = 328 + b * 36;
      const by = 356 - h;
      ctx.fillStyle = b % 3 === 0 ? '#3B82F6' : '#27272A';
      ctx.fillRect(bx, by, 22, h);
    }

    // Bottom KPI cards
    [0, 1, 2].forEach((col) => {
      const kx = 296 + col * 240;
      ctx.fillStyle = '#12141E';
      ctx.fillRect(kx, 414, 216, 188);
      ctx.strokeStyle = '#27272A';
      ctx.strokeRect(kx, 414, 216, 188);

      ctx.fillStyle = '#71717A';
      ctx.font = '500 15px monospace';
      ctx.fillText(`SLICE_0${col + 1}`, kx + 22, 452);

      ctx.fillStyle = '#F4F4F5';
      ctx.font = '700 34px monospace';
      ctx.fillText(`0${pulseCount + col}`, kx + 22, 512);

      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(kx + 22, 544, 130, 6);
    });
  } else if (variant === 'modular-commerce') {
    // Component Grid Showcase Canvas
    ctx.fillStyle = '#F4F4F5';
    ctx.font = '700 26px sans-serif';
    ctx.fillText('Modular Design System & Typed UI Grid', 44, 108);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const cx = 44 + c * 318;
        const cy = 138 + r * 232;
        const highlighted = (r * 3 + c + pulseCount) % 3 === 0;
        ctx.fillStyle = highlighted ? '#151C2E' : '#12141C';
        ctx.fillRect(cx, cy, 296, 208);
        ctx.strokeStyle = highlighted ? '#3B82F6' : '#27272A';
        ctx.lineWidth = highlighted ? 2 : 1;
        ctx.strokeRect(cx, cy, 296, 208);

        ctx.fillStyle = highlighted ? '#60A5FA' : '#71717A';
        ctx.font = '500 15px monospace';
        ctx.fillText(`<ComponentCard 0${r * 3 + c + 1} />`, cx + 20, cy + 38);

        ctx.fillStyle = '#27272A';
        ctx.fillRect(cx + 20, cy + 62, 256, 86);

        ctx.fillStyle = '#E4E4E7';
        ctx.fillRect(cx + 20, cy + 168, 150, 12);
      }
    }
  } else {
    // Full-Stack Architecture Screen
    ctx.fillStyle = '#F4F4F5';
    ctx.font = '700 24px sans-serif';
    ctx.fillText('End-to-End Client · Express REST · MongoDB · Docker', 44, 108);

    const tiers = [
      { title: 'CLIENT UI', sub: 'React + TypeScript', x: 48 },
      { title: 'REST GATEWAY', sub: 'Node.js + Express', x: 374 },
      { title: 'DOCUMENT DB', sub: 'MongoDB + Docker', x: 700 },
    ];

    tiers.forEach((t, idx) => {
      const active = pulseCount % 3 === idx;
      ctx.fillStyle = active ? '#151E34' : '#12141E';
      ctx.fillRect(t.x, 148, 276, 430);
      ctx.strokeStyle = active ? '#3B82F6' : '#27272A';
      ctx.lineWidth = active ? 2.5 : 1;
      ctx.strokeRect(t.x, 148, 276, 430);

      ctx.fillStyle = '#60A5FA';
      ctx.font = '600 16px monospace';
      ctx.fillText(`TIER 0${idx + 1}`, t.x + 24, 192);

      ctx.fillStyle = '#F4F4F5';
      ctx.font = '700 24px sans-serif';
      ctx.fillText(t.title, t.x + 24, 232);

      ctx.fillStyle = '#A1A1AA';
      ctx.font = '400 17px monospace';
      ctx.fillText(t.sub, t.x + 24, 266);

      for (let line = 0; line < 4; line++) {
        ctx.fillStyle = line === 0 && active ? '#2563EB' : '#27272A';
        ctx.fillRect(t.x + 24, 320 + line * 48, 228, 24);
      }
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export default function ThreeProjectShowcase({
  variant,
  projectIndex,
  techStack,
  onExpandModal,
}: ThreeProjectShowcaseProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const [exploded, setExploded] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'front'>('iso');
  const [pulseCounter, setPulseCounter] = useState(1);
  const [hudHidden, setHudHidden] = useState(false);
  const [hoveredPartName, setHoveredPartName] = useState<string>('');

  const explodedRef = useRef(false);
  const cameraPresetRef = useRef<'iso' | 'front'>('iso');
  const presetTransitionActiveRef = useRef(false);
  const pulseEventRef = useRef(0);
  const screenRefreshQueueRef = useRef<number | null>(null);

  const triggerInteractivePulse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPulseCounter((c) => {
      const next = c + 1;
      screenRefreshQueueRef.current = next;
      return next;
    });
    pulseEventRef.current = 1.0;
  };

  const toggleExplode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExploded((prev) => {
      const next = !prev;
      explodedRef.current = next;
      return next;
    });
  };

  const toggleCameraPreset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCameraPreset((prev) => {
      const next = prev === 'iso' ? 'front' : 'iso';
      cameraPresetRef.current = next;
      presetTransitionActiveRef.current = true;
      return next;
    });
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let cleanupScene: (() => void) | null = null;
    let initialized = false;

    const initWhenSized = () => {
      if (initialized) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      // Do not allocate WebGL context for hidden responsive containers (width/height === 0)
      if (w < 20 || h < 20) return;

      initialized = true;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const isSoftwareGl = detectSoftwareGl();

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = createStudioRenderer(isSoftwareGl);
      } catch {
        return;
      }

      renderer.setSize(w, h);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const envTexture = setupStudioLightingAndEnv(
        renderer,
        scene,
        isSoftwareGl
      );

      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 60);
      camera.position.set(1.65, 1.05, 5.15);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.06;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.minPolarAngle = Math.PI * 0.24;
      controls.maxPolarAngle = Math.PI * 0.62;
      controls.minAzimuthAngle = -Math.PI * 0.42;
      controls.maxAzimuthAngle = Math.PI * 0.42;
      controls.target.set(0, 0.05, 0);

      controls.addEventListener('start', () => {
        presetTransitionActiveRef.current = false;
      });

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Grounding Contact Shadow
      const contactShadow = createContactShadowMesh(5.2, 3.0, 0.6);
      contactShadow.position.set(0, -1.35, 0);
      scene.add(contactShadow);

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      let screenTex = createProceduralScreenTexture(
        variant,
        projectIndex,
        techStack,
        maxAniso,
        1
      );

      const screenMat = new THREE.MeshStandardMaterial({
        map: screenTex,
        roughness: 0.28,
        metalness: 0.08,
        emissive: 0xffffff,
        emissiveMap: screenTex,
        emissiveIntensity: 0.22,
      });

      const metalDarkMat = new THREE.MeshStandardMaterial({
        color: 0x181a22,
        metalness: 0.88,
        roughness: 0.24,
      });

      const matteSlateMat = new THREE.MeshStandardMaterial({
        color: 0x101218,
        metalness: 0.22,
        roughness: 0.72,
      });

      const cobaltAccentMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.3,
      });

      const glassCoverMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.06,
        transmission: isSoftwareGl ? 0 : 0.88,
        transparent: true,
        opacity: isSoftwareGl ? 0.18 : 1,
        ior: 1.5,
        thickness: 0.25,
        clearcoat: 1,
        depthWrite: false,
      });

      // Track animated sub-parts for Exploded View & Raycast Hover
      interface ExplodablePart {
        obj: THREE.Object3D;
        basePos: THREE.Vector3;
        explodeOffset: THREE.Vector3;
        label: string;
        hoverLift?: number;
      }
      const explodableParts: ExplodablePart[] = [];
      const raycastTargets: THREE.Object3D[] = [];
      let packetCurve: THREE.CatmullRomCurve3 | null = null;
      let packetSphere: THREE.Mesh | null = null;

      // =======================================================================
      // VARIANT 1: REACTIVE WORKSPACE (9-Part 3D Workstation + State Satellites)
      // =======================================================================
      if (variant === 'reactive-workspace') {
        // 1. Sculpted Lathe Pedestal Base
        const lathePoints = [
          new THREE.Vector2(0.01, 0),
          new THREE.Vector2(0.75, 0),
          new THREE.Vector2(0.68, 0.08),
          new THREE.Vector2(0.18, 0.14),
          new THREE.Vector2(0.14, 0.75),
        ];
        const baseGeo = new THREE.LatheGeometry(lathePoints, 32);
        const baseMesh = new THREE.Mesh(baseGeo, matteSlateMat);
        baseMesh.position.set(0, -1.32, -0.35);
        rootGroup.add(baseMesh);

        // 2. Display Chassis Slab
        const chassisShape = createRoundedRectShape(3.35, 2.1, 0.12);
        const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
          depth: 0.1,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.03,
          bevelThickness: 0.03,
        });
        chassisGeo.center();
        const chassisMesh = new THREE.Mesh(chassisGeo, metalDarkMat);
        chassisMesh.position.set(0, 0.08, -0.08);
        chassisMesh.castShadow = !isSoftwareGl;
        rootGroup.add(chassisMesh);
        explodableParts.push({
          obj: chassisMesh,
          basePos: chassisMesh.position.clone(),
          explodeOffset: new THREE.Vector3(0, 0, -0.45),
          label: 'Anodized Display Chassis',
        });

        // 3. High-DPI Reactive Screen Plane
        const screenGeo = new THREE.PlaneGeometry(3.12, 1.92);
        const screenMesh = new THREE.Mesh(screenGeo, screenMat);
        screenMesh.position.set(0, 0.08, 0.01);
        screenMesh.userData.partLabel = 'RxJS / NgRx Live Viewport';
        screenMesh.layers.enable(1);
        rootGroup.add(screenMesh);
        raycastTargets.push(screenMesh);
        explodableParts.push({
          obj: screenMesh,
          basePos: screenMesh.position.clone(),
          explodeOffset: new THREE.Vector3(0, 0, 0.12),
          label: 'RxJS / NgRx Live Viewport',
        });

        // 4. Optical Front Glass Shield
        const glassShape = createRoundedRectShape(3.26, 2.02, 0.1);
        const glassGeo = new THREE.ExtrudeGeometry(glassShape, {
          depth: 0.02,
          bevelEnabled: false,
        });
        glassGeo.center();
        const glassMesh = new THREE.Mesh(glassGeo, glassCoverMat);
        glassMesh.renderOrder = 4;
        glassMesh.position.set(0, 0.08, 0.09);
        rootGroup.add(glassMesh);
        explodableParts.push({
          obj: glassMesh,
          basePos: glassMesh.position.clone(),
          explodeOffset: new THREE.Vector3(0, 0, 0.58),
          label: 'Optical Clearcoat Layer',
        });

        // 5–7. Three Floating State Nodes (Action -> Reducer -> Selector) + Conduit
        const nodeSpecs = [
          { pos: new THREE.Vector3(-1.95, 0.68, 0.45), name: 'Action Dispatch Node' },
          { pos: new THREE.Vector3(1.98, 0.52, 0.5), name: 'Pure Reducer Node' },
          { pos: new THREE.Vector3(1.88, -0.58, 0.55), name: 'Memoized Selector Node' },
        ];
        nodeSpecs.forEach((spec, nIdx) => {
          const octGeo = new THREE.OctahedronGeometry(0.19, 0);
          const nodeMesh = new THREE.Mesh(octGeo, cobaltAccentMat);
          nodeMesh.position.copy(spec.pos);
          nodeMesh.userData.partLabel = spec.name;
          nodeMesh.layers.enable(1);
          rootGroup.add(nodeMesh);
          raycastTargets.push(nodeMesh);

          const ringGeo = new THREE.TorusGeometry(0.28, 0.012, 10, 36);
          const ringMesh = new THREE.Mesh(ringGeo, metalDarkMat);
          nodeMesh.add(ringMesh);

          explodableParts.push({
            obj: nodeMesh,
            basePos: spec.pos.clone(),
            explodeOffset: new THREE.Vector3(
              nIdx === 0 ? -0.45 : 0.45,
              0.15,
              0.35
            ),
            label: spec.name,
            hoverLift: 0.12,
          });
        });

        packetCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.95, 0.68, 0.45),
          new THREE.Vector3(0, 0.25, 0.35),
          new THREE.Vector3(1.98, 0.52, 0.5),
          new THREE.Vector3(1.88, -0.58, 0.55),
        ]);
        const tubeGeo = new THREE.TubeGeometry(packetCurve, 48, 0.012, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, cobaltAccentMat);
        rootGroup.add(tubeMesh);

        packetSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x93c5fd })
        );
        rootGroup.add(packetSphere);
      }

      // =======================================================================
      // VARIANT 2: MODULAR UI SYSTEM (8-Part Multi-Layer Floating Bento Stage)
      // =======================================================================
      else if (variant === 'modular-commerce') {
        // 1. Matte Architectural Plinth
        const plinthShape = createRoundedRectShape(3.8, 2.35, 0.16);
        const plinthGeo = new THREE.ExtrudeGeometry(plinthShape, {
          depth: 0.12,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.03,
          bevelThickness: 0.03,
        });
        plinthGeo.center();
        const plinthMesh = new THREE.Mesh(plinthGeo, metalDarkMat);
        plinthMesh.position.set(0, 0, -0.25);
        plinthMesh.rotation.x = -0.18;
        rootGroup.add(plinthMesh);
        explodableParts.push({
          obj: plinthMesh,
          basePos: plinthMesh.position.clone(),
          explodeOffset: new THREE.Vector3(0, -0.2, -0.5),
          label: 'Design System Base Frame',
        });

        // 2. Primary Canvas Screen
        const mainScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(3.5, 2.12),
          screenMat
        );
        mainScreen.position.set(0, 0.02, -0.14);
        mainScreen.rotation.x = -0.18;
        mainScreen.userData.partLabel = 'Typed Component Grid';
        mainScreen.layers.enable(1);
        rootGroup.add(mainScreen);
        raycastTargets.push(mainScreen);

        // 3–6. Four Elevated 3D UI Component Cards Hovering in Z-Layers
        const cardConfigs = [
          { x: -0.92, y: 0.44, z: 0.18, w: 1.38, h: 0.78, name: '<HeroCard /> Primitive' },
          { x: 0.86, y: 0.44, z: 0.28, w: 1.38, h: 0.78, name: '<FilterBar /> Control' },
          { x: -0.92, y: -0.46, z: 0.24, w: 1.38, h: 0.78, name: '<DataTile /> Module' },
          { x: 0.86, y: -0.46, z: 0.36, w: 1.38, h: 0.78, name: '<StateModal /> Layer' },
        ];

        cardConfigs.forEach((cfg, idx) => {
          const cShape = createRoundedRectShape(cfg.w, cfg.h, 0.07);
          const cGeo = new THREE.ExtrudeGeometry(cShape, {
            depth: 0.035,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.012,
            bevelThickness: 0.012,
          });
          cGeo.center();
          const mat = idx % 2 === 1 ? cobaltAccentMat : matteSlateMat;
          const cardMesh = new THREE.Mesh(cGeo, mat);
          cardMesh.position.set(cfg.x, cfg.y, cfg.z);
          cardMesh.rotation.x = -0.18;
          cardMesh.userData.partLabel = cfg.name;
          cardMesh.layers.enable(1);
          rootGroup.add(cardMesh);
          raycastTargets.push(cardMesh);

          // Glass cap on each floating UI card
          const capMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(cfg.w * 0.92, cfg.h * 0.86),
            glassCoverMat
          );
          capMesh.renderOrder = 4;
          capMesh.position.z = 0.032;
          cardMesh.add(capMesh);

          explodableParts.push({
            obj: cardMesh,
            basePos: cardMesh.position.clone(),
            explodeOffset: new THREE.Vector3(
              cfg.x * 0.28,
              cfg.y * 0.28,
              0.35 + idx * 0.18
            ),
            label: cfg.name,
            hoverLift: 0.18,
          });
        });
      }

      // =======================================================================
      // VARIANT 3: FULL-STACK PORTAL (10-Part Client + Express + MongoDB Rig)
      // =======================================================================
      else {
        // Tier 1 (Left): Client 3D Display Panel
        const clientShape = createRoundedRectShape(1.55, 1.95, 0.09);
        const clientGeo = new THREE.ExtrudeGeometry(clientShape, {
          depth: 0.08,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.02,
          bevelThickness: 0.02,
        });
        clientGeo.center();
        const clientGroup = new THREE.Group();
        clientGroup.position.set(-1.65, 0.05, 0.15);
        clientGroup.rotation.y = 0.28;

        const clientChassis = new THREE.Mesh(clientGeo, metalDarkMat);
        clientGroup.add(clientChassis);

        const clientScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(1.4, 1.78),
          screenMat
        );
        clientScreen.position.z = 0.065;
        clientScreen.userData.partLabel = 'React + TypeScript Client';
        clientScreen.layers.enable(1);
        clientGroup.add(clientScreen);
        raycastTargets.push(clientScreen);

        rootGroup.add(clientGroup);
        explodableParts.push({
          obj: clientGroup,
          basePos: clientGroup.position.clone(),
          explodeOffset: new THREE.Vector3(-0.55, 0, 0.25),
          label: 'React + TypeScript Client',
        });

        // Tier 2 (Center): Express REST Gateway Blade Tower + Instanced Fins
        const apiGroup = new THREE.Group();
        apiGroup.position.set(0, 0.02, -0.05);

        const coreGeo = new THREE.BoxGeometry(0.92, 1.72, 0.92);
        const coreMesh = new THREE.Mesh(coreGeo, matteSlateMat);
        coreMesh.userData.partLabel = 'Node.js + Express API Gateway';
        coreMesh.layers.enable(1);
        apiGroup.add(coreMesh);
        raycastTargets.push(coreMesh);

        // 8 Instanced Anodized Server Heatsink Fins
        const finGeo = new THREE.BoxGeometry(1.04, 0.045, 1.04);
        const finsInstanced = new THREE.InstancedMesh(
          finGeo,
          cobaltAccentMat,
          8
        );
        const dummy = new THREE.Object3D();
        for (let f = 0; f < 8; f++) {
          dummy.position.set(0, -0.62 + f * 0.18, 0);
          dummy.updateMatrix();
          finsInstanced.setMatrixAt(f, dummy.matrix);
        }
        finsInstanced.instanceMatrix.needsUpdate = true;
        finsInstanced.computeBoundingSphere();
        apiGroup.add(finsInstanced);

        rootGroup.add(apiGroup);
        explodableParts.push({
          obj: apiGroup,
          basePos: apiGroup.position.clone(),
          explodeOffset: new THREE.Vector3(0, 0.32, 0),
          label: 'Node.js + Express API Gateway',
        });

        // Tier 3 (Right): MongoDB 3-Platter Persistence Vault + Docker Cage
        const dbGroup = new THREE.Group();
        dbGroup.position.set(1.65, 0.02, 0.15);
        dbGroup.rotation.y = -0.25;

        const platterGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.34, 36);
        [-0.48, 0, 0.48].forEach((py, pIdx) => {
          const platter = new THREE.Mesh(
            platterGeo,
            pIdx === 1 ? cobaltAccentMat : metalDarkMat
          );
          platter.position.y = py;
          platter.userData.partLabel = 'MongoDB Document Vault';
          platter.layers.enable(1);
          dbGroup.add(platter);
          raycastTargets.push(platter);
        });

        // Outer Docker Container Structural Frame
        const cageGeo = new THREE.BoxGeometry(1.34, 1.68, 1.34);
        const cageEdges = new THREE.EdgesGeometry(cageGeo);
        const cageLines = new THREE.LineSegments(
          cageEdges,
          new THREE.LineBasicMaterial({ color: 0x3b82f6 })
        );
        dbGroup.add(cageLines);

        rootGroup.add(dbGroup);
        explodableParts.push({
          obj: dbGroup,
          basePos: dbGroup.position.clone(),
          explodeOffset: new THREE.Vector3(0.55, 0, 0.25),
          label: 'MongoDB · Docker Container',
        });

        // Optical Data Conduit & Traveling Packet Sphere
        packetCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.55, 0.05, 0.2),
          new THREE.Vector3(-0.75, 0.35, 0.25),
          new THREE.Vector3(0, 0.05, 0.15),
          new THREE.Vector3(0.85, -0.28, 0.25),
          new THREE.Vector3(1.55, 0.05, 0.2),
        ]);
        const bridgeGeo = new THREE.TubeGeometry(
          packetCurve,
          56,
          0.016,
          8,
          false
        );
        rootGroup.add(new THREE.Mesh(bridgeGeo, cobaltAccentMat));

        packetSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x93c5fd })
        );
        rootGroup.add(packetSphere);
      }

      // Raycasting Hover Inspection
      const raycaster = new THREE.Raycaster();
      raycaster.layers.set(1);
      let hoveredObj: THREE.Object3D | null = null;
      let lastRayTime = 0;

      const onPointerMove = (e: PointerEvent) => {
        const now = performance.now();
        if (now - lastRayTime < 40) return;
        lastRayTime = now;

        const rect = renderer.domElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        _ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(_ndc, camera);
        const hits = raycaster.intersectObjects(raycastTargets, false);
        if (hits.length > 0) {
          hoveredObj = hits[0].object;
          const name = String(hoveredObj.userData.partLabel || '');
          setHoveredPartName(name);
        } else {
          hoveredObj = null;
          setHoveredPartName('');
        }
      };

      renderer.domElement.addEventListener('pointermove', onPointerMove);

      const resizeObserverScene = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const nw = entry.contentRect.width;
          const nh = entry.contentRect.height;
          if (nw > 20 && nh > 20) {
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
          }
        }
      });
      resizeObserverScene.observe(container);

      let isVisible = true;
      const io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { rootMargin: '250px' }
      );
      io.observe(container);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      const clock = new THREE.Clock();
      const scheduler = createLoopScheduler(renderer, isSoftwareGl);
      let explodeBlend = 0;

      const tick = () => {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.getElapsedTime();

        if (isVisible) {
          // Update dynamic procedural screen texture if user clicked Pulse
          if (screenRefreshQueueRef.current !== null) {
            const nextCount = screenRefreshQueueRef.current;
            screenRefreshQueueRef.current = null;
            const oldTex = screenTex;
            screenTex = createProceduralScreenTexture(
              variant,
              projectIndex,
              techStack,
              maxAniso,
              nextCount
            );
            screenMat.map = screenTex;
            screenMat.emissiveMap = screenTex;
            screenMat.needsUpdate = true;
            oldTex.dispose();
          }

          // Smooth exponential damping for Exploded 3D Architecture
          const targetExplode = explodedRef.current ? 1 : 0;
          explodeBlend = THREE.MathUtils.damp(
            explodeBlend,
            targetExplode,
            6.5,
            dt
          );

          explodableParts.forEach((part) => {
            const isHovered = hoveredObj === part.obj;
            const liftZ = isHovered && part.hoverLift ? part.hoverLift : 0;

            const tx = part.basePos.x + part.explodeOffset.x * explodeBlend;
            const ty = part.basePos.y + part.explodeOffset.y * explodeBlend;
            const tz =
              part.basePos.z + part.explodeOffset.z * explodeBlend + liftZ;

            part.obj.position.x = THREE.MathUtils.damp(
              part.obj.position.x,
              tx,
              8,
              dt
            );
            part.obj.position.y = THREE.MathUtils.damp(
              part.obj.position.y,
              ty,
              8,
              dt
            );
            part.obj.position.z = THREE.MathUtils.damp(
              part.obj.position.z,
              tz,
              8,
              dt
            );
          });

          // Camera preset smooth transition
          if (presetTransitionActiveRef.current) {
            const goalX = cameraPresetRef.current === 'iso' ? 1.65 : 0;
            const goalY = cameraPresetRef.current === 'iso' ? 1.05 : 0.15;
            const goalZ = cameraPresetRef.current === 'iso' ? 5.15 : 4.85;

            camera.position.x = THREE.MathUtils.damp(
              camera.position.x,
              goalX,
              5.5,
              dt
            );
            camera.position.y = THREE.MathUtils.damp(
              camera.position.y,
              goalY,
              5.5,
              dt
            );
            camera.position.z = THREE.MathUtils.damp(
              camera.position.z,
              goalZ,
              5.5,
              dt
            );

            if (
              Math.abs(camera.position.x - goalX) < 0.02 &&
              Math.abs(camera.position.z - goalZ) < 0.02
            ) {
              presetTransitionActiveRef.current = false;
            }
          }

          // Subtle physical float & data packet animation
          if (!prefersReducedMotion) {
            rootGroup.position.y = Math.sin(elapsed * 1.3) * 0.04;

            if (packetCurve && packetSphere) {
              const speedBoost = 1 + pulseEventRef.current * 2.5;
              const t = (elapsed * 0.28 * speedBoost) % 1;
              packetCurve.getPointAt(t, _curvePos);
              packetSphere.position.copy(_curvePos);
            }
          }

          pulseEventRef.current = THREE.MathUtils.damp(
            pulseEventRef.current,
            0,
            2.5,
            dt
          );

          controls.update();
          renderer.render(scene, camera);
        }

        scheduler.scheduleNext(tick);
      };

      scheduler.scheduleNext(tick);

      cleanupScene = () => {
        scheduler.cancel();
        io.disconnect();
        resizeObserverScene.disconnect();
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        controls.dispose();
        disposeSceneResources(scene, envTexture);
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    initWhenSized();

    const sizeWatcher = new ResizeObserver(() => {
      if (!initialized) initWhenSized();
    });
    sizeWatcher.observe(container);

    return () => {
      sizeWatcher.disconnect();
      if (cleanupScene) cleanupScene();
    };
  }, [variant, projectIndex, techStack]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative h-full w-full bg-[#0B0B0F] overflow-hidden select-none"
    >
      {/* Dedicated Empty WebGL Mount Container */}
      <div
        ref={mountRef}
        data-cursor="3D Orbit"
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Minimal Top-Left Spec & Raycast Hover Readout */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 z-10 flex items-center gap-2 rounded-md border border-zinc-800 bg-[#0B0B0F]/92 px-3 py-1.5">
        <span className="font-[family-name:var(--font-mono)] tabular-nums text-[11px] font-medium text-[#60A5FA]">
          3D CASE {projectIndex}
        </span>
        <span className="text-zinc-600" aria-hidden="true">
          ·
        </span>
        <span className="text-[11px] text-zinc-300 truncate max-w-[220px]">
          {hoveredPartName || 'Drag to rotate · Hover parts'}
        </span>
      </div>

      {/* Optional Top-Right Expand Case Modal Trigger */}
      {onExpandModal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpandModal();
          }}
          aria-label="Open full project details modal"
          className="absolute top-3.5 right-3.5 z-10 h-7 px-2.5 rounded-md border border-zinc-800 bg-[#0E0E14]/94 hover:border-[#3B82F6] text-[11px] font-medium text-zinc-300 hover:text-white inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Expand className="h-3 w-3 text-[#3B82F6]" />
          <span>Case Details</span>
        </button>
      )}

      {/* Unified Collapsible Bottom Control Dock (Zero Side-Panel Occlusion) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center max-w-[94%]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setHudHidden((h) => !h);
          }}
          className="h-5 px-2.5 rounded-t border border-b-0 border-zinc-800 bg-[#0E0E14] text-[10px] text-zinc-400 hover:text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          {hudHidden ? (
            <>
              <ChevronUp className="h-3 w-3 text-[#3B82F6]" />
              <span>Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 text-[#3B82F6]" />
              <span>Hide</span>
            </>
          )}
        </button>

        {!hudHidden && (
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#0E0E14]/96 p-1.5 shadow-xl">
            <button
              type="button"
              onClick={toggleExplode}
              className={`h-7 px-2.5 rounded text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                exploded
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#15151E] text-zinc-300 hover:text-white'
              }`}
            >
              <Layers className="h-3 w-3 shrink-0" />
              <span>{exploded ? 'Assemble' : 'Explode 3D'}</span>
            </button>

            <button
              type="button"
              onClick={triggerInteractivePulse}
              className="h-7 px-2.5 rounded bg-[#15151E] hover:bg-zinc-800 text-[11px] font-medium text-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Zap className="h-3 w-3 text-[#3B82F6] shrink-0" />
              <span>Pulse State (#{pulseCounter})</span>
            </button>

            <button
              type="button"
              onClick={toggleCameraPreset}
              className="h-7 px-2.5 rounded bg-[#15151E] hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3 text-[#3B82F6] shrink-0" />
              <span>{cameraPreset === 'iso' ? 'Front Cam' : 'Iso Cam'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
