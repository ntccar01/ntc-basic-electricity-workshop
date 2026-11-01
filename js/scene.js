import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class ArchipelagoScene {
  constructor({ canvas, labelsLayer, content, onSelectIsland, getIslandStatus }) {
    this.canvas = canvas;
    this.labelsLayer = labelsLayer;
    this.content = content;
    this.onSelectIsland = onSelectIsland;
    this.getIslandStatus = getIslandStatus;

    this.webglSupported = false;
    this.reducedMotion = false;
    this.currentTheme = "sunset";
    this.lightingMode = "day"; // "day" | "dusk" | "night"

    this.islandsMeta = [];
    this.islandMeshes = [];
    this.windowMaterials = [];
    this.animatedObjects = [];
    this.walkers = [];
    this.cloudPuffs = [];

    this.cameraTargetGoal = new THREE.Vector3(0, 2, 0);
    this.cameraPosGoal = new THREE.Vector3(0, 38, 62);
    this.isFlying = false;

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointerDownPos = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.setupIslandsMeta();
    this.createHtmlLabels();

    const params = new URLSearchParams(window.location.search);
    if (params.get("nowebgl") === "1" || window.__FORCE_NO_WEBGL__) {
      this.webglSupported = false;
      return;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: "high-performance"
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.webglSupported = true;
    } catch (err) {
      this.webglSupported = false;
      return;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfbefe3);
    this.scene.fog = new THREE.FogExp2(0xfbefe3, 0.0065);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 400);
    this.setDefaultPanoramaGoal();
    this.camera.position.copy(this.cameraPosGoal);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    this.controls.minDistance = 12;
    this.controls.maxDistance = 135;
    this.controls.target.copy(this.cameraTargetGoal);

    this.setupLights();
    this.buildCloudSea();
    this.buildArchipelago();
    this.buildWalkers();
    this.bindEvents();

    this.animate();
  }

  setupIslandsMeta() {
    // 五座島呈五角星環繞中央島，半徑與角度錯開確保各視角標籤清晰不重疊
    const radius = 31;
    const angles = [
      -Math.PI * 0.78, // 1: 左上
      -Math.PI * 0.22, // 2: 右上
      Math.PI * 0.16,  // 3: 右下
      Math.PI * 0.5,   // 4: 正下偏左
      Math.PI * 0.84   // 5: 左下
    ];

    this.islandsMeta = [
      {
        id: this.content.centerIsland.id,
        order: 0,
        name: this.content.centerIsland.name,
        routeBadge: this.content.centerIsland.routeBadge || "🧭 W17–18",
        isCenter: true,
        pos: new THREE.Vector3(0, 0, 0),
        labelOffset: new THREE.Vector3(0, 13.5, 0),
        baseRadius: 10.5
      }
    ];

    this.content.islands.forEach((isl, idx) => {
      const ang = angles[idx] ?? (idx * Math.PI * 2) / 5;
      const x = Math.cos(ang) * radius;
      const z = Math.sin(ang) * radius;
      const y = (idx % 2 === 0 ? 1.0 : -0.4);
      this.islandsMeta.push({
        id: isl.id,
        order: isl.order,
        name: isl.name,
        routeBadge: isl.routeBadge || "",
        isCenter: false,
        pos: new THREE.Vector3(x, y, z),
        labelOffset: new THREE.Vector3(0, 10.2, 0),
        baseRadius: 7.2
      });
    });
  }

  createHtmlLabels() {
    this.labelsLayer.innerHTML = "";
    this.labelElements = new Map();

    this.islandsMeta.forEach((meta) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `island-label ${meta.isCenter ? "center-label" : ""}`;
      btn.dataset.islandId = meta.id;
      btn.setAttribute("aria-label", meta.isCenter ? `中央島：${meta.name}（總複習與電學知識圖書館）` : `第 ${meta.order} 島：${meta.name}（${meta.routeBadge}）`);

      const badgeText = meta.isCenter ? "🏛️ 總複習" : `第${meta.order}課`;
      const statusText = this.getIslandStatus ? this.getIslandStatus(meta.id) : "";
      const routeHtml = meta.routeBadge
        ? `<span class="route-pill" style="font-size:0.72rem; font-weight:800; padding:2px 6px; border-radius:999px; background:${
            meta.id === "island-03" ? "#ffedd5" : "#e0f2fe"
          }; color:${meta.id === "island-03" ? "#c2410c" : "#0369a1"}; border:1px solid ${
            meta.id === "island-03" ? "#ea580c" : "#0284c7"
          };">${meta.routeBadge}</span>`
        : "";

      btn.innerHTML = `
        <span class="num-badge">${badgeText}</span>
        <span class="label-name">${meta.name}</span>
        ${routeHtml}
        <span class="status-dot" data-status-for="${meta.id}">${statusText}</span>
      `;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.flyToIsland(meta.id);
        if (this.onSelectIsland) this.onSelectIsland(meta.id);
      });

      this.labelsLayer.appendChild(btn);
      this.labelElements.set(meta.id, btn);
    });
  }

  refreshLabelStatuses() {
    if (!this.labelElements) return;
    this.islandsMeta.forEach((meta) => {
      const btn = this.labelElements.get(meta.id);
      if (!btn) return;
      const dot = btn.querySelector(".status-dot");
      if (dot && this.getIslandStatus) {
        dot.textContent = this.getIslandStatus(meta.id);
      }
    });
  }

  setDefaultPanoramaGoal() {
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth <= 900 && !isMobile;
    this.cameraTargetGoal.set(0, 1.5, 2);
    if (isMobile) {
      this.cameraPosGoal.set(0, 58, 86);
    } else if (isTablet) {
      this.cameraPosGoal.set(0, 48, 74);
    } else {
      this.cameraPosGoal.set(0, 40, 62);
    }
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0xfff4e6, 1.15);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffe6cc, 1.65);
    this.dirLight.position.set(35, 55, 30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);

    this.hemiLight = new THREE.HemisphereLight(0xfff6eb, 0xc48b68, 0.65);
    this.scene.add(this.hemiLight);
  }

  buildCloudSea() {
    // 雲海仙境底層雲海面
    const seaGeo = new THREE.PlaneGeometry(360, 360, 32, 32);
    this.seaMat = new THREE.MeshStandardMaterial({
      color: 0xf4dec8,
      roughness: 0.75,
      metalness: 0.08
    });
    this.seaMesh = new THREE.Mesh(seaGeo, this.seaMat);
    this.seaMesh.rotation.x = -Math.PI / 2;
    this.seaMesh.position.y = -4.5;
    this.scene.add(this.seaMesh);

    // 漂浮雲朵群
    const puffGeo = new THREE.DodecahedronGeometry(2.4, 1);
    this.cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.88
    });

    for (let i = 0; i < 24; i++) {
      const group = new THREE.Group();
      const count = 3 + (i % 3);
      for (let j = 0; j < count; j++) {
        const m = new THREE.Mesh(puffGeo, this.cloudMat);
        m.position.set((j - 1) * 1.9, (j % 2) * 0.6, (j % 3 - 1) * 0.8);
        m.scale.setScalar(0.7 + (j % 2) * 0.35);
        group.add(m);
      }
      const angle = (i / 24) * Math.PI * 2;
      const dist = 17 + (i % 4) * 11;
      group.position.set(Math.cos(angle) * dist, -2.2 + (i % 3) * 0.9, Math.sin(angle) * dist);
      this.scene.add(group);
      this.cloudPuffs.push({ mesh: group, baseAngle: angle, dist, speed: 0.04 + (i % 5) * 0.01, baseY: group.position.y });
    }
  }

  createWindowMaterial() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffefc2,
      emissive: 0xffaa33,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    this.windowMaterials.push(mat);
    return mat;
  }

  buildArchipelago() {
    this.islandsMeta.forEach((meta) => {
      const group = new THREE.Group();
      group.position.copy(meta.pos);
      group.userData = { islandId: meta.id };

      // 仙境浮島岩座＋草地平台
      const r = meta.baseRadius;
      const rockGeo = new THREE.ConeGeometry(r * 0.98, 6.5, 9);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9, flatShading: true });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.rotation.x = Math.PI;
      rock.position.y = -3.2;
      rock.userData = { islandId: meta.id };
      group.add(rock);

      const topGeo = new THREE.CylinderGeometry(r, r * 0.92, 1.4, 12);
      const topColor = meta.isCenter ? 0x3b8f83 : 0x5ca37d;
      const topMat = new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.8, flatShading: true });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = 0.7;
      top.receiveShadow = true;
      top.userData = { islandId: meta.id };
      group.add(top);

      // 金色／暖陶色環邊
      const rimGeo = new THREE.TorusGeometry(r * 0.97, 0.25, 8, 24);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xc45a2c, roughness: 0.5 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 1.35;
      group.add(rim);

      // 根據島嶼建立獨特地標
      if (meta.isCenter) {
        this.buildCenterLibraryLandmark(group, meta.id);
      } else if (meta.order === 1) {
        this.buildIsland1Landmark(group, meta.id);
      } else if (meta.order === 2) {
        this.buildIsland2Landmark(group, meta.id);
      } else if (meta.order === 3) {
        this.buildIsland3Landmark(group, meta.id);
      } else if (meta.order === 4) {
        this.buildIsland4Landmark(group, meta.id);
      } else if (meta.order === 5) {
        this.buildIsland5Landmark(group, meta.id);
      }

      // 每座島放一個電學寶箱裝飾
      this.addTreasureChest(group, meta.isCenter ? 5.2 : 3.6, 1.4, meta.isCenter ? 4.5 : 2.8, meta.id);

      group.traverse((child) => {
        if (child.isMesh) {
          child.userData.islandId = meta.id;
        }
      });

      this.scene.add(group);
      this.islandMeshes.push(group);
    });

    // 建立中央島通往 5 座課程島的雲橋
    const centerPos = this.islandsMeta[0].pos;
    for (let i = 1; i < this.islandsMeta.length; i++) {
      this.buildBridge(centerPos, this.islandsMeta[i].pos);
    }
  }

  // 中央島：電學知識圖書館（主地標）＋ 3D 吉祥物泓哥
  buildCenterLibraryLandmark(group, islandId) {
    const winMat = this.createWindowMaterial();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff3e2, roughness: 0.6 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc45a2c, roughness: 0.5, flatShading: true });
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd99b52, roughness: 0.4 });

    // 一樓圖書館大廳
    const hall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 4.2, 7.2), wallMat);
    hall.position.set(0, 3.5, -0.5);
    hall.castShadow = true;
    group.add(hall);

    // 一樓飛簷屋頂
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(7.6, 2.2, 4), roofMat);
    roof1.rotation.y = Math.PI / 4;
    roof1.position.set(0, 6.5, -0.5);
    group.add(roof1);

    // 二樓藏書閣
    const hall2 = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 4.8), wallMat);
    hall2.position.set(0, 8.2, -0.5);
    group.add(hall2);

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(5.4, 2.2, 4), roofMat);
    roof2.rotation.y = Math.PI / 4;
    roof2.position.set(0, 10.6, -0.5);
    group.add(roof2);

    // 圖書館發光窗戶與門廊柱
    for (let x of [-3.0, 0, 3.0]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.8, 0.2), winMat);
      win.position.set(x, 3.6, 3.12);
      group.add(win);
    }
    for (let x of [-1.8, 1.8]) {
      const win2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.2), winMat);
      win2.position.set(x, 8.2, 1.92);
      group.add(win2);

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.0, 8), pillarMat);
      pillar.position.set(x * 1.8, 3.4, 3.5);
      group.add(pillar);
    }

    // 屋頂懸浮發光巨型立體書本與閃電知識環
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, 12.2, -0.5);
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe0a3, emissiveIntensity: 0.3 });
    const leftPage = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 2.2), pageMat);
    leftPage.position.x = -0.85;
    leftPage.rotation.z = 0.25;
    const rightPage = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 2.2), pageMat);
    rightPage.position.x = 0.85;
    rightPage.rotation.z = -0.25;
    bookGroup.add(leftPage, rightPage);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.12, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xff9f1c, emissiveIntensity: 0.6 })
    );
    halo.rotation.x = Math.PI / 2;
    bookGroup.add(halo);
    group.add(bookGroup);
    this.animatedObjects.push({ mesh: bookGroup, type: "floatRotate", baseY: 12.2 });

    // 3D 吉祥物「泓哥」（戴方眼鏡、穿藍色工作服及工作褲）站在圖書館前廣場迎接
    const mascot = this.createMascot3D();
    mascot.position.set(-3.8, 1.4, 5.2);
    mascot.scale.setScalar(1.25);
    group.add(mascot);
  }

  createMascot3D() {
    const m = new THREE.Group();
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e5aa8, roughness: 0.6 }); // 藍色工作服
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x15427e, roughness: 0.7 }); // 藍色工作褲
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf7d2b4, roughness: 0.6 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.5), pantsMat);
    legs.position.y = 0.45;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.15, 0.6), suitMat);
    torso.position.y = 1.45;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.9), skinMat);
    head.position.y = 2.55;

    // 招牌方眼鏡
    const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.1), frameMat);
    leftGlass.position.set(-0.22, 2.6, 0.46);
    const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.1), frameMat);
    rightGlass.position.set(0.22, 2.6, 0.46);

    m.add(legs, torso, head, leftGlass, rightGlass);
    return m;
  }

  // 第 1 島：電的基本認識 — 富蘭克林雷電觀測塔＆原子軌道儀
  buildIsland1Landmark(group) {
    const winMat = this.createWindowMaterial();
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x2f8f83, roughness: 0.5, flatShading: true });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97736, metalness: 0.6, roughness: 0.3 });

    // 觀測塔底座與萊頓瓶能量柱
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 4.5, 8), towerMat);
    base.position.set(0, 3.6, 0);
    group.add(base);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.35, 5.2, 8), copperMat);
    rod.position.set(0, 7.6, 0);
    group.add(rod);

    const sparkBall = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), winMat);
    sparkBall.position.set(0, 10.1, 0);
    group.add(sparkBall);

    // K/L/M 原子電子軌道環
    const orbitGroup = new THREE.Group();
    orbitGroup.position.set(0, 6.2, 0);
    const ringGeo = new THREE.TorusGeometry(3.6, 0.1, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xffaa00, emissiveIntensity: 0.4 });

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = (i * Math.PI) / 3;
      ring.rotation.y = (i * Math.PI) / 4;
      orbitGroup.add(ring);
    }
    group.add(orbitGroup);
    this.animatedObjects.push({ mesh: orbitGroup, type: "spin" });
  }

  // 第 2 島：電阻 — 巨型四環色碼電阻拱門＆焦耳熱能熔爐
  buildIsland2Landmark(group) {
    const leadMat = new THREE.MeshStandardMaterial({ color: 0xc0c8d0, metalness: 0.7, roughness: 0.3 });
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe6ccb2, roughness: 0.6 });

    // 電阻器金屬引腳拱柱
    const leftLead = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 5.2, 8), leadMat);
    leftLead.position.set(-3.4, 3.8, 0);
    const rightLead = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 5.2, 8), leadMat);
    rightLead.position.set(3.4, 3.8, 0);
    group.add(leftLead, rightLead);

    // 橫跨島嶼的巨型四環色碼電阻本體（紅、黃、棕、銀 = 240 Ω ±10%）
    const resGroup = new THREE.Group();
    resGroup.position.set(0, 6.2, 0);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 5.6, 16), bodyMat);
    body.rotation.z = Math.PI / 2;
    resGroup.add(body);

    const bandColors = [0xd32f2f, 0xfbc02d, 0x795548, 0xb0bec5];
    const bandOffsets = [-1.8, -0.7, 0.4, 1.8];
    bandColors.forEach((col, i) => {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(1.52, 1.52, 0.42, 16),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 })
      );
      band.rotation.z = Math.PI / 2;
      band.position.x = bandOffsets[i];
      resGroup.add(band);
    });
    group.add(resGroup);

    // 焦耳熱能鍋爐
    const winMat = this.createWindowMaterial();
    const stove = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.8, 2.4, 10),
      new THREE.MeshStandardMaterial({ color: 0xc45a2c, roughness: 0.6 })
    );
    stove.position.set(0, 2.5, -2.2);
    const glowCore = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), winMat);
    glowCore.position.set(0, 3.8, -2.2);
    group.add(stove, glowCore);
  }

  // 第 3 島：串聯電路 — 單軌環島聖誕燈串迴路塔
  buildIsland3Landmark(group) {
    const winMat = this.createWindowMaterial();
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xc45a2c, roughness: 0.4 });

    // 單一閉合串聯圓環軌道
    const loopRing = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.28, 8, 28), trackMat);
    loopRing.rotation.x = Math.PI / 2;
    loopRing.position.y = 3.2;
    group.add(loopRing);

    // 三座串接在單一迴路上的分壓電阻燈塔（R1, R2, R3）
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const px = Math.cos(ang) * 4.2;
      const pz = Math.sin(ang) * 4.2;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.0, 4.2 + i * 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x2f8f83, roughness: 0.6 })
      );
      pillar.position.set(px, 3.2 + i * 0.45, pz);
      group.add(pillar);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 12), winMat);
      bulb.position.set(px, 5.6 + i * 0.9, pz);
      group.add(bulb);
    }

    // 中央 KVL 迴路核心碑
    const centerObelisk = new THREE.Mesh(
      new THREE.ConeGeometry(1.4, 6.2, 6),
      new THREE.MeshStandardMaterial({ color: 0xd99b52, roughness: 0.5, flatShading: true })
    );
    centerObelisk.position.set(0, 4.5, 0);
    group.add(centerObelisk);
  }

  // 第 4 島：並聯電路 — 多支路水閘電網＆惠斯登菱形電橋閣
  buildIsland4Landmark(group) {
    const winMat = this.createWindowMaterial();
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0xc45a2c, roughness: 0.5 });
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x2f8f83, roughness: 0.5 });

    // 左右兩個共同節點塔（Node A & Node B）
    for (let x of [-3.8, 3.8]) {
      const nodeTower = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 5.0, 8), nodeMat);
      nodeTower.position.set(x, 3.8, 0);
      group.add(nodeTower);
    }

    // 三條並排平行連接的支路橫樑（R1 // R2 // R3）
    for (let z of [-2.0, 0, 2.0]) {
      const branch = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.45, 0.65), branchMat);
      branch.position.set(0, 3.6, z);
      group.add(branch);
    }

    // 惠斯登菱形電橋閣懸浮於上方
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, 7.2, 0);
    const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(2.1, 0), winMat);
    bridgeGroup.add(diamond);
    group.add(bridgeGroup);
    this.animatedObjects.push({ mesh: bridgeGroup, type: "floatRotate", baseY: 7.2 });
  }

  // 第 5 島：電容與電感 — 雙極板電容聖殿＆螺旋電磁感應巨塔
  buildIsland5Landmark(group) {
    const winMat = this.createWindowMaterial();
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x3b8f83, metalness: 0.5, roughness: 0.3 });
    const coilMat = new THREE.MeshStandardMaterial({ color: 0xd97736, metalness: 0.6, roughness: 0.3 });

    // 左側：平行板電容器雙極板（夾電場光束）
    const plate1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 3.2), plateMat);
    plate1.position.set(-2.8, 4.0, 0);
    const plate2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 3.2), plateMat);
    plate2.position.set(-0.8, 4.0, 0);
    const dielectric = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.2, 2.4), winMat);
    dielectric.position.set(-1.8, 4.0, 0);
    group.add(plate1, plate2, dielectric);

    // 右側：螺旋電感線圈與鐵心磁柱
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 6.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.5, roughness: 0.4 })
    );
    core.position.set(2.2, 4.5, 0);
    group.add(core);

    for (let i = 0; i < 5; i++) {
      const turn = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.2, 8, 20), coilMat);
      turn.rotation.x = Math.PI / 2;
      turn.position.set(2.2, 2.3 + i * 1.0, 0);
      group.add(turn);
    }
  }

  addTreasureChest(group, x, y, z, islandId) {
    const chest = new THREE.Group();
    chest.position.set(x, y, z);
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.75, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x9c4221, roughness: 0.6 })
    );
    box.position.y = 0.38;
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.35, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xd99b26, metalness: 0.4, roughness: 0.4 })
    );
    lid.position.y = 0.85;
    chest.add(box, lid);
    chest.userData = { islandId, isChest: true };
    group.add(chest);
  }

  buildBridge(startVec, endVec) {
    const dir = new THREE.Vector3().subVectors(endVec, startVec);
    const len = dir.length() - 15.5;
    const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    mid.y = (startVec.y + endVec.y) * 0.5 + 1.1;

    const bridgeGeo = new THREE.BoxGeometry(1.6, 0.35, Math.max(4, len));
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.7 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.copy(mid);
    bridge.lookAt(endVec.x, mid.y, endVec.z);
    this.scene.add(bridge);
  }

  // 小人物散步（沿著中央島與各島間雲橋來回散步，手機減半，減少動態時暫停）
  buildWalkers() {
    const isMobile = window.innerWidth <= 640;
    const walkerCount = isMobile ? 5 : 10;
    const colors = [0xc45a2c, 0x2f8f83, 0x1e5aa8, 0xd97724, 0x6b46c1];

    for (let i = 0; i < walkerCount; i++) {
      const targetIslandIdx = (i % 5) + 1;
      const start = this.islandsMeta[0].pos.clone().setY(1.4);
      const end = this.islandsMeta[targetIslandIdx].pos.clone().setY(this.islandsMeta[targetIslandIdx].pos.y + 1.4);

      const person = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 0.85, 6),
        new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.6 })
      );
      body.position.y = 0.42;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xf7d2b4, roughness: 0.6 })
      );
      head.position.y = 1.02;
      person.add(body, head);

      this.scene.add(person);
      this.walkers.push({
        mesh: person,
        start,
        end,
        t: (i * 0.19) % 1,
        dir: i % 2 === 0 ? 1 : -1,
        speed: 0.08 + (i % 3) * 0.025
      });
    }
  }

  setTheme(themeId, autoAdjustLighting = true) {
    this.currentTheme = themeId;
    if (!this.webglSupported) return;

    const palette = {
      sunset: { bg: 0xfbefe3, sea: 0xf2d9c2, fog: 0xfbefe3 },
      beach: { bg: 0xf6ead2, sea: 0xe6d2ab, fog: 0xf6ead2 },
      dusk: { bg: 0x2b1e1a, sea: 0x1d1412, fog: 0x2b1e1a }
    }[themeId] || { bg: 0xfbefe3, sea: 0xf2d9c2, fog: 0xfbefe3 };

    this.scene.background.setHex(palette.bg);
    this.scene.fog.color.setHex(palette.fog);
    this.seaMat.color.setHex(palette.sea);

    // 依 references/theme.md 第 6 條：切到深色底色時，預設把光線調成夜晚，但使用者仍可再切回白天光線
    if (autoAdjustLighting) {
      if (themeId === "dusk") {
        this.setLightingMode("night");
      } else if (this.lightingMode === "night") {
        this.setLightingMode("day");
      }
    }
  }

  setLightingMode(mode) {
    this.lightingMode = mode;
    if (!this.webglSupported) return;

    if (mode === "day") {
      this.ambientLight.intensity = 1.15;
      this.ambientLight.color.setHex(0xfff4e6);
      this.dirLight.intensity = 1.65;
      this.dirLight.color.setHex(0xffe6cc);
      this.dirLight.position.set(35, 55, 30);
      this.windowMaterials.forEach((m) => (m.emissiveIntensity = 0.3));
    } else if (mode === "dusk") {
      this.ambientLight.intensity = 0.85;
      this.ambientLight.color.setHex(0xffcca8);
      this.dirLight.intensity = 1.35;
      this.dirLight.color.setHex(0xff7b3d);
      this.dirLight.position.set(-45, 22, 25);
      this.windowMaterials.forEach((m) => (m.emissiveIntensity = 0.85));
    } else {
      // night
      this.ambientLight.intensity = 0.48;
      this.ambientLight.color.setHex(0x90a8d4);
      this.dirLight.intensity = 0.62;
      this.dirLight.color.setHex(0xa3c4f3);
      this.dirLight.position.set(-20, 45, -30);
      this.windowMaterials.forEach((m) => (m.emissiveIntensity = 1.6));
    }
  }

  setReducedMotion(enabled) {
    this.reducedMotion = Boolean(enabled);
  }

  flyToIsland(islandId) {
    const meta = this.islandsMeta.find((m) => m.id === islandId);
    if (!meta || !this.webglSupported) return;

    const p = meta.pos;
    this.cameraTargetGoal.set(p.x, p.y + 3.0, p.z);
    const dist = meta.isCenter ? 24 : 19;
    this.cameraPosGoal.set(p.x * 1.15, p.y + 15, p.z + dist);

    if (this.reducedMotion) {
      this.camera.position.copy(this.cameraPosGoal);
      this.controls.target.copy(this.cameraTargetGoal);
      this.controls.update();
      this.isFlying = false;
    } else {
      this.isFlying = true;
    }
  }

  resetView() {
    this.setDefaultPanoramaGoal();
    if (!this.webglSupported) return;
    if (this.reducedMotion) {
      this.camera.position.copy(this.cameraPosGoal);
      this.controls.target.copy(this.cameraTargetGoal);
      this.controls.update();
      this.isFlying = false;
    } else {
      this.isFlying = true;
    }
  }

  bindEvents() {
    window.addEventListener("resize", () => this.onResize());

    this.controls.addEventListener("start", () => {
      this.isFlying = false;
    });

    this.canvas.addEventListener("pointerdown", (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    this.canvas.addEventListener("pointerup", (e) => {
      const dx = e.clientX - this.pointerDownPos.x;
      const dy = e.clientY - this.pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;

      const rect = this.canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.islandMeshes, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const islandId = hit.userData?.islandId;
        if (islandId) {
          this.flyToIsland(islandId);
          if (this.onSelectIsland) this.onSelectIsland(islandId);
        }
      }
    });
  }

  onResize() {
    if (!this.webglSupported) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.setDefaultPanoramaGoal();
    this.camera.position.copy(this.cameraPosGoal);
    this.controls.target.copy(this.cameraTargetGoal);
    this.controls.update();
    this.updateLabels();
  }

  updateLabels() {
    if (!this.webglSupported || !this.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const topBar = document.getElementById("top-bar");
    const bottomBar = document.getElementById("bottom-bar");
    const minTopY = Math.min(h * 0.42, (topBar ? topBar.getBoundingClientRect().bottom : 90) + 48);
    const maxBottomY = Math.max(minTopY + 80, (bottomBar ? bottomBar.getBoundingClientRect().top : h - 75) - 12);
    const projected = [];

    this.islandsMeta.forEach((meta) => {
      const btn = this.labelElements.get(meta.id);
      if (!btn) return;

      const worldPos = meta.pos.clone().add(meta.labelOffset);
      worldPos.project(this.camera);

      if (worldPos.z > 1) {
        btn.style.display = "none";
        return;
      }

      btn.style.display = "inline-flex";
      let x = (worldPos.x * 0.5 + 0.5) * w;
      let y = (-(worldPos.y * 0.5) + 0.5) * h;

      // 保持標籤在安全可視範圍內（避開頂部與底部工具列）
      const padX = w <= 600 ? 64 : 80;
      x = Math.max(padX, Math.min(w - padX, x));
      y = Math.max(minTopY, Math.min(maxBottomY, y));

      projected.push({ id: meta.id, btn, x, y });
    });

    // 防重疊推開演算法：確保任何角度或手機尺寸下標籤都不會互相重疊
    const minDx = w <= 600 ? 112 : 148;
    const minDy = 44;
    for (let iter = 0; iter < 5; iter++) {
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          if (Math.abs(dx) < minDx && Math.abs(dy) < minDy) {
            const pushY = (minDy - Math.abs(dy)) * 0.55 + 2;
            if (a.y <= b.y) {
              a.y -= pushY;
              b.y += pushY;
            } else {
              a.y += pushY;
              b.y -= pushY;
            }
          }
        }
      }
      projected.forEach((item) => {
        item.y = Math.max(minTopY, Math.min(maxBottomY, item.y));
      });
    }

    projected.forEach((item) => {
      item.btn.style.left = `${Math.round(item.x)}px`;
      item.btn.style.top = `${Math.round(item.y)}px`;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.webglSupported) return;

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    if (this.isFlying && !this.reducedMotion) {
      this.camera.position.lerp(this.cameraPosGoal, 0.08);
      this.controls.target.lerp(this.cameraTargetGoal, 0.08);
      if (this.camera.position.distanceTo(this.cameraPosGoal) < 0.25) {
        this.isFlying = false;
      }
    }

    if (!this.reducedMotion) {
      // 動畫物件（圖書館懸浮書本、原子軌道環、惠斯登電橋）
      this.animatedObjects.forEach((obj) => {
        if (obj.type === "spin") {
          obj.mesh.rotation.y += dt * 0.7;
          obj.mesh.rotation.z += dt * 0.35;
        } else if (obj.type === "floatRotate") {
          obj.mesh.rotation.y += dt * 0.8;
          obj.mesh.position.y = obj.baseY + Math.sin(elapsed * 2.0) * 0.35;
        }
      });

      // 雲朵緩緩漂浮
      this.cloudPuffs.forEach((c, idx) => {
        c.mesh.position.y = c.baseY + Math.sin(elapsed * 0.8 + idx) * 0.25;
      });

      // 小人物沿雲橋散步
      this.walkers.forEach((w) => {
        w.t += dt * w.speed * w.dir;
        if (w.t >= 0.86) {
          w.t = 0.86;
          w.dir = -1;
        } else if (w.t <= 0.14) {
          w.t = 0.14;
          w.dir = 1;
        }
        w.mesh.position.lerpVectors(w.start, w.end, w.t);
        w.mesh.position.y += Math.abs(Math.sin(elapsed * 6 + w.t * 10)) * 0.12;
      });
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
  }
}
