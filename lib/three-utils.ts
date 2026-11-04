import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let cachedIsSoftwareGl: boolean | null = null;

/**
 * Detects software WebGL (SwiftShader, llvmpipe, softpipe, Basic Render)
 * once per session and frees the temporary probe context immediately.
 */
export function detectSoftwareGl(): boolean {
  if (typeof window === 'undefined') return true;
  if (cachedIsSoftwareGl !== null) return cachedIsSoftwareGl;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      cachedIsSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedIsSoftwareGl =
      /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return cachedIsSoftwareGl;
  } catch {
    cachedIsSoftwareGl = true;
    return true;
  }
}

/**
 * Configures a studio-calibrated WebGLRenderer with ACES Filmic tone mapping
 * and sRGB output color space.
 */
export function createStudioRenderer(isSoftwareGl: boolean): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setPixelRatio(
    isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
  );
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x0b0b0f, 1);

  renderer.domElement.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
    },
    false
  );

  return renderer;
}

/**
 * Populates RoomEnvironment PBR reflections, balanced 3-point warm/cool lighting,
 * and horizon-matched exponential fog.
 */
export function setupStudioLightingAndEnv(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  isSoftwareGl: boolean
): THREE.Texture {
  scene.background = new THREE.Color(0x0b0b0f);
  scene.fog = new THREE.FogExp2(0x0b0b0f, 0.045);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;
  scene.environment = envTexture;
  pmremGenerator.dispose();

  // Cool sky / warm ground hemisphere fill
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x18181b, 0.65);
  hemiLight.position.set(0, 6, 0);
  scene.add(hemiLight);

  // Warm key directional light
  const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.85);
  keyLight.position.set(3.8, 5.2, 4.6);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    const d = 4.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  // Electric Cobalt Rim / Backlight to separate silhouette from obsidian canvas
  const rimLight = new THREE.DirectionalLight(0x3b82f6, 1.55);
  rimLight.position.set(-4.2, 2.8, -3.6);
  scene.add(rimLight);

  // Soft neutral side fill
  const fillLight = new THREE.DirectionalLight(0xe4e4e7, 0.6);
  fillLight.position.set(-3.2, -1.2, 3.5);
  scene.add(fillLight);

  return envTexture;
}

/**
 * Generates a soft procedural radial contact shadow plane to ground 3D sculptures.
 */
export function createContactShadowMesh(
  width = 3.6,
  depth = 2.4,
  opacity = 0.55
): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }

  const shadowTex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(width, depth);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/**
 * Creates a rounded-rectangle THREE.Shape for beveled ExtrudeGeometry hardware slabs.
 */
export function createRoundedRectShape(
  width: number,
  height: number,
  radius: number
): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

/**
 * Paces software WebGL render loops using WebGL2 fenceSync so headless/software
 * renderers finish drawing cleanly before scheduling the next tick.
 */
export function createLoopScheduler(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean
) {
  let frameId = 0;
  let timerId = 0;
  let cancelled = false;

  const afterDraw = (cb: () => void) => {
    if (cancelled) return;
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      timerId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (cancelled) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        timerId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        timerId = window.setTimeout(cb, 80);
      }
    };
    timerId = window.setTimeout(poll, 5);
  };

  const scheduleNext = (tick: () => void) => {
    if (cancelled) return;
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = window.requestAnimationFrame(tick);
    }
  };

  const cancel = () => {
    cancelled = true;
    if (frameId) window.cancelAnimationFrame(frameId);
    if (timerId) window.clearTimeout(timerId);
  };

  return { scheduleNext, cancel };
}

/**
 * Disposes all geometries, materials, and textures in a scene hierarchy.
 */
export function disposeSceneResources(
  scene: THREE.Scene,
  envTexture?: THREE.Texture | null
) {
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      materials.forEach((mat) => {
        if (!mat) return;
        const record = mat as unknown as Record<string, unknown>;
        Object.values(record).forEach((val) => {
          if (val && (val as THREE.Texture).isTexture) {
            (val as THREE.Texture).dispose();
          }
        });
        mat.dispose();
      });
    }
  });
  if (envTexture) {
    envTexture.dispose();
  }
}
