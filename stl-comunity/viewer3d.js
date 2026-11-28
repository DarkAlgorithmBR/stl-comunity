import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const modal = document.getElementById("studio-modal");
const backdrop = document.getElementById("studio-backdrop");
const closeBtn = document.getElementById("studio-close");
const canvasWrap = document.getElementById("studio-canvas-wrap");
const loadingEl = document.getElementById("studio-loading");
const gizmoCanvas = document.getElementById("studio-gizmo");
const gizmoCtx = gizmoCanvas.getContext("2d");

const statFaces = document.getElementById("stat-faces");
const statVertices = document.getElementById("stat-vertices");
const studioTitle = document.getElementById("studio-title");
const studioDesc = document.getElementById("studio-desc");
const studioTags = document.getElementById("studio-tags");
const studioFilename = document.getElementById("studio-filename");
const studioDownloadBtn = document.getElementById("studio-download-btn");

const lightBtn = document.getElementById("studio-light-btn");
const gridBtn = document.getElementById("studio-grid-btn");
const wireframeBtn = document.getElementById("studio-wireframe-btn");
const resetCamBtn = document.getElementById("studio-reset-cam");
const autoRotateBtn = document.getElementById("studio-autorotate-btn");
const filamentQuickBtn = document.getElementById("studio-filament-quick");

let renderer = null;
let scene = null;
let camera = null;
let controls = null;
let gridHelper = null;
let keyLight = null;
let rimLight = null;
let ambientLight = null;
let currentModel = null;
let animId = null;

let currentMode = "original";
let currentFilamentColor = "#d4d4d8";
let wireframeEnabled = false;
let brightStudio = true;
let showGrid = true;

const originalMaterials = new WeakMap();

function initThree() {
  if (renderer) return;

  const width = canvasWrap.clientWidth || 800;
  const height = canvasWrap.clientHeight || 560;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  canvasWrap.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 100);
  camera.position.set(0, 0.9, 2.6);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 0.6;
  controls.maxDistance = 8;
  controls.target.set(0, 0, 0);

  ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  keyLight = new THREE.DirectionalLight(0xfff4e0, 2.1);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);

  rimLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);

  gridHelper = new THREE.GridHelper(6, 24, 0x52525b, 0x27272a);
  gridHelper.position.y = -0.85;
  scene.add(gridHelper);

  window.addEventListener("resize", handleResize);
}

function handleResize() {
  if (!renderer || modal.classList.contains("hidden")) return;
  const width = canvasWrap.clientWidth;
  const height = canvasWrap.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function drawGizmo() {
  if (!camera || !gizmoCtx) return;
  const w = gizmoCanvas.width;
  const h = gizmoCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const len = 22;

  gizmoCtx.clearRect(0, 0, w, h);

  const invQuat = camera.quaternion.clone().invert();
  const axes = [
    { vec: new THREE.Vector3(1, 0, 0), color: "#ef4444", label: "X" },
    { vec: new THREE.Vector3(0, 1, 0), color: "#22c55e", label: "Y" },
    { vec: new THREE.Vector3(0, 0, 1), color: "#3b82f6", label: "Z" },
  ];

  axes.forEach((a) => a.vec.applyQuaternion(invQuat));
  axes.sort((a, b) => a.vec.z - b.vec.z);

  axes.forEach((a) => {
    const x2 = cx + a.vec.x * len;
    const y2 = cy - a.vec.y * len;

    gizmoCtx.beginPath();
    gizmoCtx.moveTo(cx, cy);
    gizmoCtx.lineTo(x2, y2);
    gizmoCtx.strokeStyle = a.color;
    gizmoCtx.lineWidth = 2;
    gizmoCtx.stroke();

    gizmoCtx.beginPath();
    gizmoCtx.arc(x2, y2, 4.5, 0, Math.PI * 2);
    gizmoCtx.fillStyle = a.color;
    gizmoCtx.fill();
  });
}

function animate() {
  animId = requestAnimationFrame(animate);
  if (controls) controls.update();
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
    drawGizmo();
  }
}

function computeStats(object) {
  let faces = 0;
  let vertices = 0;
  object.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const geo = child.geometry;
      const pos = geo.attributes.position;
      if (pos) vertices += pos.count;
      if (geo.index) {
        faces += Math.floor(geo.index.count / 3);
      } else if (pos) {
        faces += Math.floor(pos.count / 3);
      }
    }
  });
  statFaces.textContent = faces.toLocaleString("pt-BR");
  statVertices.textContent = vertices.toLocaleString("pt-BR");
}

function centerAndScale(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 1.65 / maxDim;

  object.scale.setScalar(scale);
  object.position.sub(center.multiplyScalar(scale));

  const scaledBox = new THREE.Box3().setFromObject(object);
  if (gridHelper) {
    gridHelper.position.y = scaledBox.min.y - 0.02;
  }
}

function applyMaterialMode() {
  if (!currentModel) return;

  currentModel.traverse((child) => {
    if (!child.isMesh) return;

    if (!originalMaterials.has(child)) {
      originalMaterials.set(child, child.material);
    }

    if (currentMode === "original") {
      const orig = originalMaterials.get(child);
      child.material = orig;
      if (child.material) {
        child.material.wireframe = wireframeEnabled;
      }
    } else if (currentMode === "clay") {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentFilamentColor),
        roughness: 0.62,
        metalness: 0.06,
        wireframe: wireframeEnabled,
      });
    } else if (currentMode === "metallic") {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentFilamentColor),
        roughness: 0.24,
        metalness: 0.78,
        wireframe: wireframeEnabled,
      });
    }
  });
}

function updateDockUI() {
  document.querySelectorAll(".dock-sphere").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === currentMode);
  });
  document.querySelectorAll(".dock-color").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.color === currentFilamentColor && currentMode !== "original");
  });
  wireframeBtn.classList.toggle("active", wireframeEnabled);
  filamentQuickBtn.classList.toggle("active", currentMode === "clay");
}

function clearCurrentModel() {
  if (!currentModel || !scene) return;
  scene.remove(currentModel);
  currentModel = null;
}

async function loadModel(url) {
  loadingEl.classList.remove("hidden");
  clearCurrentModel();

  const lower = url.toLowerCase();
  try {
    if (lower.endsWith(".stl")) {
      const loader = new STLLoader();
      const geometry = await loader.loadAsync(url);
      geometry.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        color: 0xd4d4d8,
        roughness: 0.58,
        metalness: 0.08,
      });
      currentModel = new THREE.Mesh(geometry, mat);
      currentMode = "clay";
    } else {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(url);
      currentModel = gltf.scene;
      currentMode = "original";
    }

    centerAndScale(currentModel);
    computeStats(currentModel);
    scene.add(currentModel);
    wireframeEnabled = false;
    applyMaterialMode();
    updateDockUI();
    resetCamera();
  } catch (err) {
    console.error("Erro ao carregar modelo 3D:", err);
    statFaces.textContent = "Erro";
    statVertices.textContent = "Erro";
  } finally {
    loadingEl.classList.add("hidden");
  }
}

function resetCamera() {
  if (!camera || !controls) return;
  camera.position.set(0.5, 0.75, 2.4);
  controls.target.set(0, 0, 0);
  controls.update();
}

function openStudio3D(mod) {
  initThree();
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  studioTitle.textContent = mod.title;
  studioDesc.textContent = mod.description || "";
  studioFilename.textContent = mod.fileName || "Modelo 3D";
  studioDownloadBtn.href = mod.downloadUrl || mod.modelUrl || "#";

  studioTags.innerHTML = (mod.tags || [])
    .map((t) => `<span class="studio-tag">${t}</span>`)
    .join("");

  setTimeout(() => {
    handleResize();
    if (!animId) animate();
    loadModel(mod.modelUrl);
  }, 20);
}

function closeStudio3D() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  if (animId) {
    cancelAnimationFrame(animId);
    animId = null;
  }
  if (controls) controls.autoRotate = false;
  autoRotateBtn.classList.remove("active");
}

// Eventos
closeBtn.addEventListener("click", closeStudio3D);
backdrop.addEventListener("click", closeStudio3D);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeStudio3D();
});

document.querySelectorAll(".dock-sphere").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    applyMaterialMode();
    updateDockUI();
  });
});

document.querySelectorAll(".dock-color").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilamentColor = btn.dataset.color;
    if (currentMode === "original") currentMode = "clay";
    applyMaterialMode();
    updateDockUI();
  });
});

wireframeBtn.addEventListener("click", () => {
  wireframeEnabled = !wireframeEnabled;
  applyMaterialMode();
  updateDockUI();
});

filamentQuickBtn.addEventListener("click", () => {
  currentMode = currentMode === "clay" ? "original" : "clay";
  applyMaterialMode();
  updateDockUI();
});

resetCamBtn.addEventListener("click", resetCamera);

autoRotateBtn.addEventListener("click", () => {
  if (!controls) return;
  controls.autoRotate = !controls.autoRotate;
  controls.autoRotateSpeed = 2.0;
  autoRotateBtn.classList.toggle("active", controls.autoRotate);
});

lightBtn.addEventListener("click", () => {
  brightStudio = !brightStudio;
  if (keyLight && ambientLight) {
    keyLight.intensity = brightStudio ? 2.1 : 1.0;
    ambientLight.intensity = brightStudio ? 0.65 : 0.25;
  }
  lightBtn.classList.toggle("active", brightStudio);
});

gridBtn.addEventListener("click", () => {
  showGrid = !showGrid;
  if (gridHelper) gridHelper.visible = showGrid;
  gridBtn.classList.toggle("active", showGrid);
});

window.openStudio3D = openStudio3D;
