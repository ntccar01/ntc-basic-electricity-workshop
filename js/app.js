import { ArchipelagoScene } from "./scene.js";
import { GuidedStudyController } from "./week01-module.js";

const STORAGE_KEY = "ntc_elec_workshop_state_v1";

class ElectricityWorkshopApp {
  constructor() {
    this.content = null;
    this.scene3D = null;
    this.currentIslandId = null;
    this.currentTab = "textbook";
    this.selectedGroupFilter = "all";

    // 測驗作答暫存（確保選項打亂後仍以 option.id 判分）
    this.quizSession = {};
    this.finalExamQuestions = [];
    this.finalExamSession = { answers: {}, submitted: false };

    // Web Audio 背景音樂狀態
    this.audioCtx = null;
    this.musicPlaying = false;
    this.musicTimer = null;

    this.state = this.loadState();
    this.drawerFullscreen = true;
    this.guidedStudy = new GuidedStudyController(this);
  }

  getDefaultState() {
    const today = new Date().toISOString().slice(0, 10);
    const prefersReduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return {
      theme: "sunset",
      lighting: "day",
      reducedMotion: Boolean(prefersReduced),
      visitedIslands: {},
      readCompleted: {},
      worksheets: {},
      quizScores: {},
      finalExamScore: null,
      dailyKeys: { date: today, remaining: 3 },
      collectedCards: ["card-01"],
      studentName: ""
    };
  }

  loadState() {
    const def = this.getDefaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return def;
      const parsed = JSON.parse(raw);
      const merged = {
        ...def,
        ...parsed,
        visitedIslands: { ...(parsed.visitedIslands || {}) },
        readCompleted: { ...(parsed.readCompleted || {}) },
        worksheets: { ...(parsed.worksheets || {}) },
        quizScores: { ...(parsed.quizScores || {}) },
        collectedCards: Array.isArray(parsed.collectedCards) ? parsed.collectedCards : def.collectedCards
      };
      const today = new Date().toISOString().slice(0, 10);
      if (!merged.dailyKeys || merged.dailyKeys.date !== today) {
        merged.dailyKeys = { date: today, remaining: 3 };
      }
      return merged;
    } catch {
      return def;
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore storage quota errors
    }
    this.updateTopAndBottomBadges();
    if (this.scene3D) {
      this.scene3D.refreshLabelStatuses();
    }
    this.renderFallbackList();
  }

  async init() {
    const res = await fetch("./data/content.json");
    this.content = await res.json();

    // 套用網站標題與標語
    document.getElementById("site-title").textContent = this.content.site.title;
    document.getElementById("site-tagline").innerHTML = `${this.escapeHtml(
      this.content.site.tagline
    )} · <strong id="site-author">${this.escapeHtml(this.content.site.author)}</strong>`;

    // 初始化 3D 群島場景
    const canvas = document.getElementById("webgl-canvas");
    const labelsLayer = document.getElementById("labels-layer");

    this.scene3D = new ArchipelagoScene({
      canvas,
      labelsLayer,
      content: this.content,
      onSelectIsland: (id) => this.openIslandDrawer(id),
      getIslandStatus: (id) => this.getShortIslandStatus(id)
    });

    // 若 WebGL 無法使用或被停用，自動切換顯示文字清單備援區
    const fallbackEl = document.getElementById("webgl-fallback");
    if (!this.scene3D.webglSupported) {
      fallbackEl.hidden = false;
      document.getElementById("stage-wrap").style.display = "none";
    } else {
      fallbackEl.hidden = true;
    }

    // 套用儲存的主題、光線與減少動態
    this.applyTheme(this.state.theme, false);
    this.applyLighting(this.state.lighting);
    this.applyReducedMotion(this.state.reducedMotion);

    this.bindUIEvents();
    this.startClock();
    this.updateTopAndBottomBadges();
    this.renderFallbackList();
  }

  getShortIslandStatus(islandId) {
    if (islandId === this.content.centerIsland.id) {
      return this.state.finalExamScore ? `★${this.state.finalExamScore.score}分` : "圖書館";
    }
    const qs = this.state.quizScores[islandId];
    if (qs && typeof qs.score === "number") {
      return `✓${qs.score}分`;
    }
    if (this.state.readCompleted[islandId]) {
      return "已讀";
    }
    if (this.state.visitedIslands[islandId]) {
      return "探索中";
    }
    return "";
  }

  calculateOverallProgress() {
    // 每座課程島佔 20%（已讀 7% + 學習單已存 6% + 隨堂測驗完成 7%）= 100%
    let points = 0;
    this.content.islands.forEach((isl) => {
      if (this.state.readCompleted[isl.id]) points += 7;
      const ws = this.state.worksheets[isl.id];
      if (ws && Object.values(ws).some((v) => String(v).trim().length > 0)) points += 6;
      if (this.state.quizScores[isl.id]) points += 7;
    });
    return Math.min(100, Math.round(points));
  }

  updateTopAndBottomBadges() {
    const keyEl = document.getElementById("daily-key-count");
    if (keyEl) {
      keyEl.textContent = `${this.state.dailyKeys.remaining}/3`;
    }
    const colEl = document.getElementById("collection-badge");
    if (colEl && this.content) {
      colEl.textContent = `${this.state.collectedCards.length}/${this.content.collectionCards.length}`;
    }
    const progEl = document.getElementById("progress-badge");
    if (progEl && this.content) {
      progEl.textContent = `${this.calculateOverallProgress()}%`;
    }
  }

  applyTheme(themeId, autoAdjustLighting = true) {
    const valid = ["sunset", "beach", "dusk"].includes(themeId) ? themeId : "sunset";
    this.state.theme = valid;
    document.documentElement.setAttribute("data-theme", valid);

    document.querySelectorAll(".theme-btn").forEach((btn) => {
      const isMatch = btn.dataset.themeOpt === valid;
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-pressed", isMatch ? "true" : "false");
    });

    if (this.scene3D) {
      this.scene3D.setTheme(valid, autoAdjustLighting);
      if (autoAdjustLighting) {
        this.state.lighting = this.scene3D.lightingMode;
        this.updateLightingButtonUI();
      }
    }
    this.saveState();
  }

  applyLighting(mode) {
    const valid = ["day", "dusk", "night"].includes(mode) ? mode : "day";
    this.state.lighting = valid;
    if (this.scene3D) {
      this.scene3D.setLightingMode(valid);
    }
    this.updateLightingButtonUI();
    this.saveState();
  }

  updateLightingButtonUI() {
    const iconEl = document.getElementById("daynight-icon");
    const labelEl = document.getElementById("daynight-label");
    if (!iconEl || !labelEl) return;
    if (this.state.lighting === "day") {
      iconEl.textContent = "☀️";
      labelEl.textContent = "白天光線";
    } else if (this.state.lighting === "dusk") {
      iconEl.textContent = "🌇";
      labelEl.textContent = "黃昏光線";
    } else {
      iconEl.textContent = "🌙";
      labelEl.textContent = "夜晚光線";
    }
  }

  applyReducedMotion(enabled) {
    this.state.reducedMotion = Boolean(enabled);
    document.documentElement.setAttribute("data-reduced-motion", this.state.reducedMotion ? "true" : "false");
    if (this.scene3D) {
      this.scene3D.setReducedMotion(this.state.reducedMotion);
    }
    const btn = document.getElementById("btn-motion");
    if (btn) {
      btn.setAttribute("aria-pressed", this.state.reducedMotion ? "true" : "false");
      btn.classList.toggle("btn-active", this.state.reducedMotion);
      btn.textContent = `🐢 減少動態：${this.state.reducedMotion ? "開" : "關"}`;
    }
    this.saveState();
  }

  bindUIEvents() {
    // 主題切換
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.applyTheme(btn.dataset.themeOpt, true);
        this.showToast(`已切換至「${btn.textContent.trim()}」底色主題`);
      });
    });

    // 晝夜光線切換
    document.getElementById("btn-daynight").addEventListener("click", () => {
      const order = ["day", "dusk", "night"];
      const next = order[(order.indexOf(this.state.lighting) + 1) % order.length];
      this.applyLighting(next);
      const names = { day: "白天光線", dusk: "黃昏光線", night: "夜晚光線" };
      this.showToast(`3D 光線已切換為：${names[next]}`);
    });

    // 每日鑰匙開寶箱
    document.getElementById("btn-daily-key").addEventListener("click", () => {
      this.useDailyKeyToOpenChest();
    });

    // 吉祥物泓哥問候
    document.getElementById("btn-mascot-greet").addEventListener("click", () => {
      this.openHelpModal();
    });

    // 關閉抽屜與 Modal、切換全螢幕／側邊模式
    document.getElementById("btn-close-drawer").addEventListener("click", () => {
      this.closeIslandDrawer();
    });

    const toggleSizeBtn = document.getElementById("btn-toggle-drawer-size");
    if (toggleSizeBtn) {
      toggleSizeBtn.addEventListener("click", () => {
        this.drawerFullscreen = !this.drawerFullscreen;
        this.syncDrawerSizeUI();
        this.showToast(this.drawerFullscreen ? "已切換為「全螢幕沉浸學習模式」" : "已切換為「側邊視窗對照模式」");
      });
    }

    const moreToolsBtn = document.getElementById("btn-more-tools");
    const moreToolsMenu = document.getElementById("more-tools-menu");
    if (moreToolsBtn && moreToolsMenu) {
      moreToolsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = moreToolsMenu.hidden;
        moreToolsMenu.hidden = !isHidden;
        moreToolsBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
        moreToolsBtn.textContent = isHidden ? "🧰 更多工具 ▴" : "🧰 更多工具 ▾";
      });
      moreToolsMenu.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => {
          if (b.id !== "btn-music" && b.id !== "btn-motion") {
            moreToolsMenu.hidden = true;
            moreToolsBtn.setAttribute("aria-expanded", "false");
            moreToolsBtn.textContent = "🧰 更多工具 ▾";
          }
        });
      });
    }

    document.getElementById("btn-close-modal").addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("app-modal").addEventListener("click", (e) => {
      if (e.target.id === "app-modal") {
        this.closeModal();
      }
    });

    // Esc 鍵關閉對話框或內容面板
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("app-modal");
        const drawer = document.getElementById("island-drawer");
        if (!modal.hidden) {
          this.closeModal();
        } else if (!drawer.hidden) {
          this.closeIslandDrawer();
        }
      }
    });

    // 底部工具列按鈕
    document.getElementById("btn-search").addEventListener("click", () => {
      const q = document.getElementById("search-input").value.trim();
      this.openSearchModal(q);
    });

    document.getElementById("search-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.openSearchModal(e.target.value.trim());
      }
    });

    document.getElementById("btn-list").addEventListener("click", () => this.openListModal());
    document.getElementById("btn-reset-cam").addEventListener("click", () => {
      this.closeIslandDrawer();
      if (this.scene3D) this.scene3D.resetView();
      this.showToast("已回到 3D 群島全景視角");
    });
    const btnWeek01 = document.getElementById("btn-week01");
    if (btnWeek01) {
      btnWeek01.addEventListener("click", () => {
        if (this.scene3D) this.scene3D.flyToIsland("island-03");
        this.openIslandDrawer("island-03", "guidedStudy");
      });
    }
    const btnSemesterMap = document.getElementById("btn-semester-map");
    if (btnSemesterMap) {
      btnSemesterMap.addEventListener("click", () => {
        if (this.scene3D) this.scene3D.flyToIsland(this.content.centerIsland.id);
        this.openIslandDrawer(this.content.centerIsland.id, "semesterMap");
      });
    }
    document.getElementById("btn-center-island").addEventListener("click", () => {
      if (this.scene3D) this.scene3D.flyToIsland(this.content.centerIsland.id);
      this.openIslandDrawer(this.content.centerIsland.id);
    });
    document.getElementById("btn-collection").addEventListener("click", () => this.openCollectionModal());
    document.getElementById("btn-guide").addEventListener("click", () => this.openGuideModal());
    document.getElementById("btn-certificate").addEventListener("click", () => this.openCertificateModal());
    document.getElementById("btn-savecode").addEventListener("click", () => this.openSaveCodeModal());
    document.getElementById("btn-share").addEventListener("click", () => this.openShareModal());
    document.getElementById("btn-music").addEventListener("click", () => this.toggleBackgroundMusic());
    document.getElementById("btn-motion").addEventListener("click", () => {
      this.applyReducedMotion(!this.state.reducedMotion);
      this.showToast(this.state.reducedMotion ? "已開啟「減少動態」模式（動畫已暫停）" : "已關閉「減少動態」模式");
    });
    document.getElementById("btn-help").addEventListener("click", () => this.openHelpModal());
  }

  startClock() {
    const update = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const h = now.getHours();
      let period = "白天";
      if (h >= 5 && h < 11) period = "晨光";
      else if (h >= 11 && h < 16) period = "日正";
      else if (h >= 16 && h < 19) period = "夕陽";
      else period = "星夜";

      const el = document.getElementById("clock-text");
      if (el) el.textContent = `${hh}:${mm} (${period})`;
    };
    update();
    setInterval(update, 15000);
  }

  // ==================== 島嶼面板（課程群島五分頁 & 中央島 18 週地圖／總複習／圖書館） ====================
  openIslandDrawer(islandId, initialTab = null) {
    this.closeModal();
    this.currentIslandId = islandId;
    this.state.visitedIslands[islandId] = true;
    this.saveState();

    const drawer = document.getElementById("island-drawer");
    const badgesEl = document.getElementById("drawer-badges");
    const titleEl = document.getElementById("drawer-title");
    const tabsEl = document.getElementById("drawer-tabs");

    if (islandId === this.content.centerIsland.id) {
      const c = this.content.centerIsland;
      badgesEl.innerHTML = `
        <span class="badge">🏛️ ${this.escapeHtml(c.role)}</span>
        <span class="badge">地標：${this.escapeHtml(c.landmark)}</span>
      `;
      titleEl.textContent = c.name;
      this.currentTab = initialTab || "library";
      tabsEl.innerHTML = `
        <button type="button" class="tab-btn ${this.currentTab === "semesterMap" ? "active" : ""}" data-tab="semesterMap">🗓️ 18 週學期地圖</button>
        <button type="button" class="tab-btn ${this.currentTab === "library" ? "active" : ""}" data-tab="library">🏛️ 電學知識圖書館</button>
        <button type="button" class="tab-btn ${this.currentTab === "finalQuiz" ? "active" : ""}" data-tab="finalQuiz">🏆 跨課總複習測驗</button>
        <button type="button" class="tab-btn ${this.currentTab === "overview" ? "active" : ""}" data-tab="overview">📊 全部課程進度</button>
      `;
    } else {
      const isl = this.content.islands.find((x) => x.id === islandId);
      if (!isl) return;
      badgesEl.innerHTML = `
        <span class="badge">第 ${isl.order} 課</span>
        <span class="badge badge-sample">${this.escapeHtml(isl.group)}（示意）</span>
        <span class="badge">地標：${this.escapeHtml(isl.landmark)}</span>
      `;
      titleEl.textContent = `${isl.order}. ${isl.name}`;
      this.currentTab = initialTab || "textbook";
      tabsEl.innerHTML = `
        <button type="button" class="tab-btn ${this.currentTab === "textbook" ? "active" : ""}" data-tab="textbook">📖 教材重點</button>
        <button type="button" class="tab-btn ${this.currentTab === "guidedStudy" ? "active" : ""}" data-tab="guidedStudy">🎯 課本導讀闖關</button>
        <button type="button" class="tab-btn ${this.currentTab === "worksheet" ? "active" : ""}" data-tab="worksheet">📝 學習單</button>
        <button type="button" class="tab-btn ${this.currentTab === "quiz" ? "active" : ""}" data-tab="quiz">✍️ 隨堂測驗</button>
        <button type="button" class="tab-btn ${this.currentTab === "teacherMode" ? "active" : ""}" data-tab="teacherMode">👨‍🏫 教師引導</button>
      `;
    }

    tabsEl.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentTab = btn.dataset.tab;
        tabsEl.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
        this.renderDrawerBody();
      });
    });

    drawer.hidden = false;
    this.syncDrawerSizeUI();
    this.renderDrawerBody();
  }

  syncDrawerSizeUI() {
    const drawer = document.getElementById("island-drawer");
    const toggleBtn = document.getElementById("btn-toggle-drawer-size");
    if (!drawer) return;
    drawer.classList.toggle("is-fullscreen", this.drawerFullscreen);
    document.body.classList.toggle("drawer-fullscreen-active", !drawer.hidden && this.drawerFullscreen);
    if (toggleBtn) {
      toggleBtn.textContent = this.drawerFullscreen ? "🗗 側邊看島" : "⛶ 全螢幕學習";
    }
  }

  closeIslandDrawer() {
    const drawer = document.getElementById("island-drawer");
    drawer.hidden = true;
    this.currentIslandId = null;
    document.body.classList.remove("drawer-fullscreen-active");
  }

  renderDrawerBody() {
    const bodyEl = document.getElementById("drawer-body");
    bodyEl.scrollTop = 0;

    if (this.currentIslandId === this.content.centerIsland.id) {
      if (this.currentTab === "semesterMap") {
        this.guidedStudy.renderSemesterMap(bodyEl);
      } else if (this.currentTab === "library") {
        this.renderCenterLibraryTab(bodyEl);
      } else if (this.currentTab === "finalQuiz") {
        this.renderCenterFinalQuizTab(bodyEl);
      } else {
        this.renderCenterOverviewTab(bodyEl);
      }
      return;
    }

    const isl = this.content.islands.find((x) => x.id === this.currentIslandId);
    if (!isl) return;

    if (this.currentTab === "textbook") {
      this.renderIslandTextbookTab(bodyEl, isl);
    } else if (this.currentTab === "guidedStudy") {
      this.guidedStudy.renderStudentGuidedTab(bodyEl, isl.id);
    } else if (this.currentTab === "teacherMode") {
      this.guidedStudy.renderTeacherGuidedTab(bodyEl, isl.id);
    } else if (this.currentTab === "worksheet") {
      this.renderIslandWorksheetTab(bodyEl, isl);
    } else {
      this.renderIslandQuizTab(bodyEl, isl);
    }
  }

  renderIslandTextbookTab(bodyEl, isl) {
    const isRead = Boolean(this.state.readCompleted[isl.id]);
    const extraLines = isl.extra
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let colorCodeHtml = "";
    if (isl.id === "island-02") {
      colorCodeHtml = `
        <div class="section-card">
          <h3>🎨 色碼電阻快速對照表（黑0 棕1 紅2 橙3 黃4 綠5 藍6 紫7 灰8 白9）</h3>
          <div style="overflow-x:auto;">
            <table class="color-table">
              <thead>
                <tr><th>顏色</th><th>色塊</th><th>有效數字</th><th>乘冪（10ⁿ）</th><th>誤差</th></tr>
              </thead>
              <tbody>
                ${this.content.library.colorCodes
                  .map(
                    (c) => `
                  <tr>
                    <td><strong>${this.escapeHtml(c.color)}</strong></td>
                    <td><span class="swatch" style="background:${c.hex};"></span></td>
                    <td>${this.escapeHtml(c.digit)}</td>
                    <td>${this.escapeHtml(c.multiplier)}</td>
                    <td>${this.escapeHtml(c.tolerance)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    const linkHtml = isl.link
      ? `<p><a href="${this.escapeHtml(isl.link)}" target="_blank" rel="noopener noreferrer" class="btn">🔗 開啟課程外部連結</a></p>`
      : "";

    bodyEl.innerHTML = `
      <div class="mascot-tip-box">
        <div style="font-size:1.8rem;">👓</div>
        <div class="tip-content">
          <strong>${this.escapeHtml(this.content.site.mascot.shortName)}導覽：</strong>
          ${this.escapeHtml(isl.intro)}
        </div>
      </div>

      <div class="section-card">
        <h3>🎯 ${this.escapeHtml(this.content.extraLabel)}</h3>
        <ul style="margin:0; padding-left:1.25rem;">
          ${extraLines.map((line) => `<li style="margin-bottom:6px;">${this.escapeHtml(line)}</li>`).join("")}
        </ul>
      </div>

      <div class="section-card">
        <h3>📚 教材內容重點（依課本 CH${isl.order} 改寫）</h3>
        ${isl.points.map((pt) => `<div class="point-item">${this.escapeHtml(pt)}</div>`).join("")}
        ${linkHtml}
      </div>

      ${colorCodeHtml}

      <div class="section-card" style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between;">
        <div>
          <strong>本課閱讀狀態：</strong>
          <span style="color:var(--accent); font-weight:800;">${isRead ? "✅ 已完成閱讀" : "⏳ 閱讀中"}</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" class="btn ${isRead ? "" : "btn-primary"}" id="btn-mark-read">
            ${isRead ? "✓ 已標記讀完" : "✅ 標記本課教材已讀"}
          </button>
          <button type="button" class="btn btn-primary" id="btn-go-guided">🎯 進入課本導讀＆SVG闖關 →</button>
          <button type="button" class="btn btn-accent" id="btn-go-worksheet">前往填寫學習單 →</button>
        </div>
      </div>
    `;

    bodyEl.querySelector("#btn-mark-read").addEventListener("click", () => {
      this.state.readCompleted[isl.id] = true;
      this.saveState();
      this.renderDrawerBody();
      this.showToast(`已完成「${isl.name}」教材閱讀！`);
    });

    bodyEl.querySelector("#btn-go-guided").addEventListener("click", () => {
      this.state.readCompleted[isl.id] = true;
      this.saveState();
      this.openIslandDrawer(isl.id, "guidedStudy");
    });

    bodyEl.querySelector("#btn-go-worksheet").addEventListener("click", () => {
      this.state.readCompleted[isl.id] = true;
      this.saveState();
      this.openIslandDrawer(isl.id, "worksheet");
    });
  }

  renderIslandWorksheetTab(bodyEl, isl) {
    const savedMap = this.state.worksheets[isl.id] || {};

    bodyEl.innerHTML = `
      <div class="mascot-tip-box">
        <div style="font-size:1.8rem;">📝</div>
        <div class="tip-content">
          <strong>${this.escapeHtml(isl.name)} — 課堂學習單</strong><br/>
          作答內容會儲存在你的瀏覽器中，重新整理也不會消失；完成後還可以匯出成 Markdown (<code>.md</code>) 檔案交作業或做筆記！
        </div>
      </div>

      <div id="worksheet-form">
        ${isl.worksheet
          .map(
            (w) => `
          <div class="worksheet-item">
            <label for="ws-input-${w.id}">${this.escapeHtml(w.question)}</label>
            <textarea id="ws-input-${w.id}" data-ws-id="${w.id}" placeholder="${this.escapeHtml(
              w.placeholder
            )}">${this.escapeHtml(savedMap[w.id] || "")}</textarea>
          </div>
        `
          )
          .join("")}
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:12px;">
        <button type="button" class="btn btn-primary" id="btn-save-ws">💾 儲存學習單草稿</button>
        <button type="button" class="btn" id="btn-export-ws">⬇️ 匯出 Markdown (.md)</button>
        <button type="button" class="btn btn-accent" id="btn-go-quiz">前往隨堂測驗 →</button>
      </div>
    `;

    const collectCurrentInputs = () => {
      const map = {};
      bodyEl.querySelectorAll("textarea[data-ws-id]").forEach((ta) => {
        map[ta.dataset.wsId] = ta.value;
      });
      this.state.worksheets[isl.id] = map;
      this.saveState();
      return map;
    };

    // 輸入時即時自動存檔
    bodyEl.querySelectorAll("textarea[data-ws-id]").forEach((ta) => {
      ta.addEventListener("input", () => collectCurrentInputs());
    });

    bodyEl.querySelector("#btn-save-ws").addEventListener("click", () => {
      collectCurrentInputs();
      this.showToast(`已儲存「${isl.name}」學習單草稿！`);
    });

    bodyEl.querySelector("#btn-export-ws").addEventListener("click", () => {
      const map = collectCurrentInputs();
      const lines = [
        `# 基本電學練工坊｜第 ${isl.order} 課：${isl.name} 學習單`,
        `- 匯出時間：${new Date().toLocaleString("zh-TW")}`,
        ""
      ];
      isl.worksheet.forEach((w) => {
        lines.push(`## ${w.question}`);
        lines.push(map[w.id]?.trim() ? map[w.id].trim() : "（尚未填寫）");
        lines.push("");
      });
      this.downloadTextFile(`${isl.id}-${isl.name}-學習單.md`, lines.join("\n"), "text/markdown;charset=utf-8");
      this.showToast("已匯出學習單 Markdown 檔案！");
    });

    bodyEl.querySelector("#btn-go-quiz").addEventListener("click", () => {
      collectCurrentInputs();
      this.openIslandDrawer(isl.id, "quiz");
    });
  }

  // 打亂選項但保留原始選項 ID（A/B/C/D），判分以 option.id 為準
  getOrInitQuizSession(isl) {
    if (!this.quizSession[isl.id]) {
      const shuffledQuestions = isl.quiz.map((q) => {
        const opts = [...q.options];
        for (let i = opts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        return { ...q, shuffledOptions: opts };
      });
      this.quizSession[isl.id] = {
        questions: shuffledQuestions,
        answers: {},
        submitted: false,
        missingIds: []
      };
    }
    return this.quizSession[isl.id];
  }

  renderIslandQuizTab(bodyEl, isl) {
    const session = this.getOrInitQuizSession(isl);
    const savedResult = this.state.quizScores[isl.id];

    bodyEl.innerHTML = `
      <div class="mascot-tip-box">
        <div style="font-size:1.8rem;">✍️</div>
        <div class="tip-content">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:4px;">
            <strong>${this.escapeHtml(isl.name)} — 隨堂測驗</strong>
            <span class="badge badge-sample">自編練習題</span>
          </div>
          共 ${session.questions.length} 題選擇題（選項順序已隨機排列，依選項 ID 判分）。過關即可解鎖本課專屬電學圖鑑卡！
          ${
            savedResult
              ? `<div style="margin-top:6px; font-weight:800; color:var(--accent);">🏆 歷史最高紀錄：${savedResult.score} 分（答對 ${savedResult.correct}/${savedResult.total} 題）</div>`
              : ""
          }
        </div>
      </div>

      <div id="quiz-missing-alert" class="section-card" style="border-color:var(--danger); display:${
        session.missingIds.length > 0 ? "block" : "none"
      };">
        <strong style="color:var(--danger);">⚠️ 尚有未作答題目：第 ${session.missingIds.join("、")} 題，請先完成所有題目再交卷！</strong>
      </div>

      <div id="quiz-list">
        ${session.questions
          .map((q, idx) => {
            const picked = session.answers[q.id];
            const isCorrect = picked === q.answer;
            let expHtml = "";
            if (session.submitted) {
              const correctOpt = q.options.find((o) => o.id === q.answer);
              expHtml = `
                <div class="quiz-explanation ${isCorrect ? "correct" : "wrong"}">
                  <strong>${isCorrect ? "✅ 答對了！" : `❌ 答錯了（正確答案：${this.escapeHtml(correctOpt ? correctOpt.text : q.answer)}）`}</strong><br/>
                  💡 解析：${this.escapeHtml(q.explanation)}
                </div>
              `;
            }
            return `
              <div class="quiz-question" id="q-block-${q.id}">
                <h4>第 ${idx + 1} 題：${this.escapeHtml(q.question)}</h4>
                <div class="quiz-options">
                  ${q.shuffledOptions
                    .map(
                      (opt, optIdx) => `
                    <label class="quiz-option-label">
                      <input type="radio" name="radio-${q.id}" value="${opt.id}" ${
                        picked === opt.id ? "checked" : ""
                      } />
                      <span>(${["①", "②", "③", "④"][optIdx] || optIdx + 1}) ${this.escapeHtml(opt.text)}</span>
                    </label>
                  `
                    )
                    .join("")}
                </div>
                ${expHtml}
              </div>
            `;
          })
          .join("")}
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:12px;">
        <button type="button" class="btn btn-primary" id="btn-submit-quiz">🎯 交卷判分並看解析</button>
        <button type="button" class="btn" id="btn-retry-quiz">🔄 重新洗牌再測一次</button>
      </div>
    `;

    bodyEl.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const qId = e.target.name.replace("radio-", "");
        session.answers[qId] = e.target.value;
      });
    });

    bodyEl.querySelector("#btn-submit-quiz").addEventListener("click", () => {
      const missing = [];
      session.questions.forEach((q, idx) => {
        if (!session.answers[q.id]) missing.push(idx + 1);
      });
      session.missingIds = missing;
      if (missing.length > 0) {
        this.renderIslandQuizTab(bodyEl, isl);
        this.showToast(`還有第 ${missing.join("、")} 題尚未作答喔！`);
        return;
      }

      session.submitted = true;
      let correct = 0;
      session.questions.forEach((q) => {
        if (session.answers[q.id] === q.answer) correct++;
      });
      const total = session.questions.length;
      const score = Math.round((correct / total) * 100);

      const prev = this.state.quizScores[isl.id]?.score || 0;
      this.state.quizScores[isl.id] = {
        score: Math.max(prev, score),
        lastScore: score,
        correct,
        total
      };
      this.state.readCompleted[isl.id] = true;

      // 解鎖該島對應的收集圖鑑卡
      let newlyUnlocked = 0;
      this.content.collectionCards.forEach((card) => {
        if (card.islandId === isl.id && !this.state.collectedCards.includes(card.id)) {
          this.state.collectedCards.push(card.id);
          newlyUnlocked++;
        }
      });

      this.saveState();
      this.renderIslandQuizTab(bodyEl, isl);
      this.showToast(
        `測驗得分：${score} 分（${correct}/${total}）${newlyUnlocked > 0 ? `，並解鎖 ${newlyUnlocked} 張電學圖鑑卡！` : "！"}`
      );
    });

    bodyEl.querySelector("#btn-retry-quiz").addEventListener("click", () => {
      delete this.quizSession[isl.id];
      this.renderIslandQuizTab(bodyEl, isl);
      this.showToast("已重新隨機排列題目與選項！");
    });
  }

  // ==================== 中央島：電學知識圖書館、跨課總複習、進度總覽 ====================
  renderCenterLibraryTab(bodyEl) {
    const lib = this.content.library;
    bodyEl.innerHTML = `
      <div class="mascot-tip-box">
        <div style="font-size:1.8rem;">🏛️</div>
        <div class="tip-content">
          <strong>歡迎來到中央島「${this.escapeHtml(lib.name)}」！</strong><br/>
          ${this.escapeHtml(lib.subtitle)}。這裡彙整了第 1 課到第 5 課所有必考公式與 SI 單位字首，隨時可查閱！
        </div>
      </div>

      ${lib.formulas
        .map(
          (ch) => `
        <div class="section-card">
          <h3>📘 ${this.escapeHtml(ch.chapter)}</h3>
          ${ch.items
            .map(
              (item) => `
            <div class="point-item">
              <strong>${this.escapeHtml(item.title)}：</strong>
              <code style="font-weight:800; color:var(--primary);">${this.escapeHtml(item.formula)}</code>
              <div style="font-size:0.86rem; color:var(--muted); margin-top:3px;">💡 ${this.escapeHtml(item.note)}</div>
            </div>
          `
            )
            .join("")}
        </div>
      `
        )
        .join("")}

      <div class="section-card">
        <h3>📐 SI 制電學常用單位字首與乘冪對照表</h3>
        <div style="overflow-x:auto;">
          <table class="color-table">
            <thead>
              <tr><th>字首符號</th><th>中文與英文名稱</th><th>10 的次方（乘冪）</th></tr>
            </thead>
            <tbody>
              ${lib.unitPrefixes
                .map(
                  (u) => `
                <tr>
                  <td><strong>${this.escapeHtml(u.symbol)}</strong></td>
                  <td>${this.escapeHtml(u.name)}</td>
                  <td>${this.escapeHtml(u.power)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  buildCrossCourseExam(countPerIsland = 2) {
    // 從 5 座島輪流抽題（每課抽 countPerIsland 題，總數不超過題庫總數 25 題），並將每題選項隨機打亂
    const pool = [];
    const maxRounds = Math.min(5, Math.max(1, countPerIsland));
    for (let r = 0; r < maxRounds; r++) {
      this.content.islands.forEach((isl) => {
        const qList = isl.quiz || [];
        if (qList[r]) {
          const q = qList[r];
          const opts = [...q.options];
          for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
          }
          pool.push({
            ...q,
            islandId: isl.id,
            islandName: `${isl.order}. ${isl.name}`,
            shuffledOptions: opts
          });
        }
      });
    }
    this.finalExamQuestions = pool;
    this.finalExamSession = { answers: {}, submitted: false, missingIndices: [] };
  }

  renderCenterFinalQuizTab(bodyEl) {
    if (this.finalExamQuestions.length === 0) {
      this.buildCrossCourseExam(2); // 預設每課輪流抽 2 題，共 10 題跨課測驗
    }
    const s = this.finalExamSession;

    bodyEl.innerHTML = `
      <div class="mascot-tip-box">
        <div style="font-size:1.8rem;">🏆</div>
        <div class="tip-content">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:4px;">
            <strong>中央島跨課總複習測驗</strong>
            <span class="badge badge-sample">自編練習題</span>
          </div>
          從第 1～5 課題庫輪流抽題（目前共 ${this.finalExamQuestions.length} 題，題庫上限 25 題），選項隨機打亂並以選項 ID 判分。
          ${
            this.state.finalExamScore
              ? `<div style="margin-top:6px; font-weight:800; color:var(--accent);">🌟 總複習最佳紀錄：${this.state.finalExamScore.score} 分（${this.state.finalExamScore.correct}/${this.state.finalExamScore.total}）</div>`
              : ""
          }
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
        <button type="button" class="btn" id="btn-draw-10">🎲 抽 10 題跨課精華（每課 2 題）</button>
        <button type="button" class="btn" id="btn-draw-25">🔥 挑戰全部 25 題完整題庫</button>
      </div>

      <div id="final-missing-alert" class="section-card" style="border-color:var(--danger); display:${
        s.missingIndices && s.missingIndices.length > 0 ? "block" : "none"
      };">
        <strong style="color:var(--danger);">⚠️ 尚有未作答題目（缺答）：第 ${(s.missingIndices || []).join("、")} 題，請回答完整後再交卷！</strong>
      </div>

      <div>
        ${this.finalExamQuestions
          .map((q, idx) => {
            const picked = s.answers[q.id];
            const isCorrect = picked === q.answer;
            let expHtml = "";
            if (s.submitted) {
              const correctOpt = q.options.find((o) => o.id === q.answer);
              expHtml = `
                <div class="quiz-explanation ${isCorrect ? "correct" : "wrong"}">
                  <strong>${isCorrect ? "✅ 答對！" : `❌ 答錯（正確答案：${this.escapeHtml(correctOpt ? correctOpt.text : q.answer)}）`}</strong><br/>
                  💡 解析：${this.escapeHtml(q.explanation)}
                </div>
              `;
            }
            return `
              <div class="quiz-question">
                <div style="margin-bottom:6px;">
                  <span class="badge">出自：${this.escapeHtml(q.islandName)}</span>
                </div>
                <h4>第 ${idx + 1} 題：${this.escapeHtml(q.question)}</h4>
                <div class="quiz-options">
                  ${q.shuffledOptions
                    .map(
                      (opt, optIdx) => `
                    <label class="quiz-option-label">
                      <input type="radio" name="final-radio-${q.id}" value="${opt.id}" ${
                        picked === opt.id ? "checked" : ""
                      } />
                      <span>(${["①", "②", "③", "④"][optIdx] || optIdx + 1}) ${this.escapeHtml(opt.text)}</span>
                    </label>
                  `
                    )
                    .join("")}
                </div>
                ${expHtml}
              </div>
            `;
          })
          .join("")}
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:12px;">
        <button type="button" class="btn btn-primary" id="btn-submit-final">🎯 交卷判分並顯示解析</button>
      </div>
    `;

    bodyEl.querySelector("#btn-draw-10").addEventListener("click", () => {
      this.buildCrossCourseExam(2);
      this.renderCenterFinalQuizTab(bodyEl);
      this.showToast("已重新從 5 課輪流抽出 10 題！");
    });

    bodyEl.querySelector("#btn-draw-25").addEventListener("click", () => {
      this.buildCrossCourseExam(5);
      this.renderCenterFinalQuizTab(bodyEl);
      this.showToast("已載入全部 25 題跨課總複習題庫！");
    });

    bodyEl.querySelectorAll('input[type="radio"]').forEach((r) => {
      r.addEventListener("change", (e) => {
        const qId = e.target.name.replace("final-radio-", "");
        s.answers[qId] = e.target.value;
      });
    });

    bodyEl.querySelector("#btn-submit-final").addEventListener("click", () => {
      const missing = [];
      this.finalExamQuestions.forEach((q, idx) => {
        if (!s.answers[q.id]) missing.push(idx + 1);
      });
      s.missingIndices = missing;
      if (missing.length > 0) {
        this.renderCenterFinalQuizTab(bodyEl);
        this.showToast(`尚有缺答題目：第 ${missing.join("、")} 題！`);
        return;
      }

      s.submitted = true;
      let correct = 0;
      this.finalExamQuestions.forEach((q) => {
        if (s.answers[q.id] === q.answer) correct++;
      });
      const total = this.finalExamQuestions.length;
      const score = Math.round((correct / total) * 100);
      this.state.finalExamScore = { score, correct, total };
      this.saveState();
      this.renderCenterFinalQuizTab(bodyEl);
      this.showToast(`總複習測驗完成！得分：${score} 分（${correct}/${total}）`);
    });
  }

  renderCenterOverviewTab(bodyEl) {
    const overall = this.calculateOverallProgress();
    bodyEl.innerHTML = `
      <div class="section-card">
        <h3>📊 全部課程學習進度總覽（目前總進度：${overall}%）</h3>
        <div class="island-list-grid">
          ${this.content.islands
            .map((isl) => {
              const read = Boolean(this.state.readCompleted[isl.id]);
              const ws = this.state.worksheets[isl.id];
              const wsSaved = Boolean(ws && Object.values(ws).some((v) => String(v).trim().length > 0));
              const qz = this.state.quizScores[isl.id];
              return `
                <div class="island-list-card">
                  <div>
                    <span class="badge">第 ${isl.order} 課</span>
                    <h3>${this.escapeHtml(isl.name)}</h3>
                    <div style="font-size:0.9rem; color:var(--muted);">
                      📖 教材：${read ? "✅ 已讀" : "未讀"}<br/>
                      📝 學習單：${wsSaved ? "✅ 已存草稿" : "未填寫"}<br/>
                      ✍️ 隨堂測驗：${qz ? `✅ ${qz.score} 分` : "尚未測驗"}
                    </div>
                  </div>
                  <button type="button" class="btn btn-primary" data-jump-island="${isl.id}">前往第 ${isl.order} 課</button>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <div class="section-card" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:space-between; align-items:center;">
        <div>
          <strong>管理本機學習紀錄</strong>
          <div style="font-size:0.88rem; color:var(--muted);">進度自動儲存於瀏覽器 localStorage，可隨時匯出接關碼或一鍵清除重置。</div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" class="btn btn-accent" id="btn-open-cert-from-overview">🎓 查看／下載完成證書</button>
          <button type="button" class="btn" id="btn-reset-all-progress" style="border-color:var(--danger); color:var(--danger);">🗑️ 一鍵重置所有進度</button>
        </div>
      </div>
    `;

    bodyEl.querySelectorAll("[data-jump-island]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.jumpIsland;
        if (this.scene3D) this.scene3D.flyToIsland(id);
        this.openIslandDrawer(id, "textbook");
      });
    });

    bodyEl.querySelector("#btn-open-cert-from-overview").addEventListener("click", () => {
      this.openCertificateModal();
    });

    bodyEl.querySelector("#btn-reset-all-progress").addEventListener("click", () => {
      this.resetAllProgress();
      this.renderCenterOverviewTab(bodyEl);
    });
  }

  resetAllProgress() {
    const keepTheme = this.state.theme;
    const keepLighting = this.state.lighting;
    const keepMotion = this.state.reducedMotion;
    this.state = this.getDefaultState();
    this.state.theme = keepTheme;
    this.state.lighting = keepLighting;
    this.state.reducedMotion = keepMotion;
    this.quizSession = {};
    this.finalExamQuestions = [];
    if (this.guidedStudy) {
      this.guidedStudy.resetAllStore();
    }
    this.saveState();
    this.showToast("已清除並重置所有課程學習進度！");
  }

  // ==================== 無 WebGL 備援清單與地點清單 Modal ====================
  renderFallbackList() {
    const fallbackSection = document.getElementById("webgl-fallback");
    const container = document.getElementById("fallback-list-container");
    if (!container || !this.content || !fallbackSection || fallbackSection.hidden) return;
    container.innerHTML = this.buildIslandCardsHtml("all");
    this.bindIslandCardClicks(container);
  }

  buildIslandCardsHtml(groupFilter = "all") {
    const cards = [];

    if (groupFilter === "all") {
      const c = this.content.centerIsland;
      cards.push(`
        <div class="island-list-card">
          <div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <span class="badge">🏛️ 中央島（${this.escapeHtml(c.role)}）</span>
              <span class="badge">地標：${this.escapeHtml(c.landmark)}</span>
            </div>
            <h3>${this.escapeHtml(c.name)}</h3>
            <p style="margin:4px 0; font-size:0.92rem; color:var(--muted);">${this.escapeHtml(c.description)}</p>
          </div>
          <button type="button" class="btn btn-accent" data-open-island="${c.id}">進入圖書館＆總複習</button>
        </div>
      `);
    }

    this.content.islands.forEach((isl) => {
      if (groupFilter !== "all" && isl.group !== groupFilter) return;
      const status = this.getShortIslandStatus(isl.id) || "尚未開始";
      cards.push(`
        <div class="island-list-card">
          <div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <span class="badge">第 ${isl.order} 課</span>
              <span class="badge badge-sample">${this.escapeHtml(isl.group)}（示意）</span>
              <span class="badge">${this.escapeHtml(status)}</span>
            </div>
            <h3>${isl.order}. ${this.escapeHtml(isl.name)}</h3>
            <p style="margin:4px 0; font-size:0.92rem; color:var(--muted);">${this.escapeHtml(isl.intro)}</p>
          </div>
          <button type="button" class="btn btn-primary" data-open-island="${isl.id}">進入第 ${isl.order} 課內容</button>
        </div>
      `);
    });

    return cards.join("");
  }

  bindIslandCardClicks(rootEl) {
    rootEl.querySelectorAll("[data-open-island]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.openIsland;
        this.closeModal();
        if (this.scene3D) this.scene3D.flyToIsland(id);
        this.openIslandDrawer(id);
      });
    });
  }

  openModal(title, htmlContent) {
    const modal = document.getElementById("app-modal");
    document.getElementById("modal-title").textContent = title;
    const body = document.getElementById("modal-body");
    body.innerHTML = htmlContent;
    modal.hidden = false;
    return body;
  }

  closeModal() {
    document.getElementById("app-modal").hidden = true;
  }

  // 1. 地點清單（含分類海域篩選與重置進度）
  openListModal() {
    const render = () => {
      const body = this.openModal(
        "📋 課程群島地點清單（可依海域篩選）",
        `
        <div class="group-filter-bar" role="tablist" aria-label="分類海域篩選">
          ${this.content.groups
            .map(
              (g) => `
            <button type="button" class="btn ${this.selectedGroupFilter === g.id ? "btn-primary" : ""}" data-group-id="${
                g.id
              }">
              ${this.escapeHtml(g.name)}${g.isSample ? "（示意）" : ""}
            </button>
          `
            )
            .join("")}
        </div>
        <div class="island-list-grid" id="modal-island-grid">
          ${this.buildIslandCardsHtml(this.selectedGroupFilter)}
        </div>
        <div style="margin-top:18px; padding-top:14px; border-top:1px solid var(--line); display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px;">
          <span>總體探索與學習進度：<strong>${this.calculateOverallProgress()}%</strong></span>
          <button type="button" class="btn" id="btn-modal-reset-progress" style="border-color:var(--danger); color:var(--danger);">🗑️ 重置所有學習進度</button>
        </div>
      `
      );

      body.querySelectorAll("[data-group-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.selectedGroupFilter = btn.dataset.groupId;
          render();
        });
      });

      this.bindIslandCardClicks(body);

      body.querySelector("#btn-modal-reset-progress").addEventListener("click", () => {
        this.resetAllProgress();
        render();
      });
    };

    render();
  }

  // 2. 關鍵字搜尋
  openSearchModal(initialQuery = "") {
    const body = this.openModal(
      "🔍 搜尋島嶼、教材重點與公式",
      `
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <input type="search" id="modal-search-input" value="${this.escapeHtml(
          initialQuery
        )}" placeholder="輸入關鍵字，例如：歐姆定律、色碼、克希荷夫、電容、佛萊明…" style="flex:1; padding:10px 14px; border-radius:12px; border:1.5px solid var(--line); background:var(--bg); color:var(--ink);" />
        <button type="button" class="btn btn-primary" id="modal-search-btn">搜尋</button>
      </div>
      <div id="search-results-area"></div>
    `
    );

    const runSearch = (kw) => {
      const q = kw.trim().toLowerCase();
      const resArea = body.querySelector("#search-results-area");
      if (!q) {
        resArea.innerHTML = `<p style="color:var(--muted);">請輸入關鍵字搜尋全站 5 座課程島與電學知識圖書館內容。</p>`;
        return;
      }

      const hits = [];
      this.content.islands.forEach((isl) => {
        const matchedPoints = isl.points.filter((p) => p.toLowerCase().includes(q));
        const nameMatch = isl.name.toLowerCase().includes(q) || isl.intro.toLowerCase().includes(q) || isl.extra.toLowerCase().includes(q);
        if (nameMatch || matchedPoints.length > 0) {
          hits.push({
            id: isl.id,
            title: `第 ${isl.order} 課：${isl.name}`,
            snippet: matchedPoints[0] || isl.intro
          });
        }
      });

      this.content.library.formulas.forEach((ch) => {
        ch.items.forEach((it) => {
          if (it.title.toLowerCase().includes(q) || it.formula.toLowerCase().includes(q) || it.note.toLowerCase().includes(q)) {
            hits.push({
              id: this.content.centerIsland.id,
              title: `🏛️ 電學知識圖書館（${ch.chapter} — ${it.title}）`,
              snippet: `${it.formula} ｜ ${it.note}`
            });
          }
        });
      });

      if (hits.length === 0) {
        resArea.innerHTML = `<div class="section-card">找不到包含「<strong>${this.escapeHtml(kw)}</strong>」的內容，請試試「電壓」「電阻」「串聯」「並聯」「電容」等關鍵字。</div>`;
        return;
      }

      resArea.innerHTML = hits
        .map(
          (h) => `
        <div class="section-card" style="display:flex; flex-direction:column; gap:8px;">
          <strong>${this.escapeHtml(h.title)}</strong>
          <div style="font-size:0.92rem; color:var(--muted);">${this.escapeHtml(h.snippet)}</div>
          <div>
            <button type="button" class="btn btn-primary" data-open-island="${h.id}">前往該島查看</button>
          </div>
        </div>
      `
        )
        .join("");
      this.bindIslandCardClicks(resArea);
    };

    const inputEl = body.querySelector("#modal-search-input");
    body.querySelector("#modal-search-btn").addEventListener("click", () => runSearch(inputEl.value));
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSearch(inputEl.value);
    });
    runSearch(initialQuery);
  }

  // 3. 每日鑰匙與收集圖鑑（12 張電學知識卡，標示「示意」）
  useDailyKeyToOpenChest() {
    if (this.state.dailyKeys.remaining <= 0) {
      this.showToast("今天的 3 把每日鑰匙已經用完囉！也可以透過完成各課隨堂測驗解鎖圖鑑卡！");
      this.openCollectionModal();
      return;
    }

    const uncollected = this.content.collectionCards.filter(
      (c) => !this.state.collectedCards.includes(c.id)
    );

    this.state.dailyKeys.remaining -= 1;
    let rewardCard = null;
    if (uncollected.length > 0) {
      rewardCard = uncollected[Math.floor(Math.random() * uncollected.length)];
      this.state.collectedCards.push(rewardCard.id);
    } else {
      rewardCard = this.content.collectionCards[Math.floor(Math.random() * this.content.collectionCards.length)];
    }

    this.saveState();
    this.showToast(`🔑 已使用 1 把每日鑰匙開啟寶箱！獲得圖鑑卡：「${rewardCard.title}」`);
    this.openCollectionModal(rewardCard.id);
  }

  openCollectionModal(highlightCardId = null) {
    const total = this.content.collectionCards.length;
    const owned = this.state.collectedCards.length;

    const body = this.openModal(
      `🃏 基本電學收集圖鑑（已收集 ${owned}/${total} 張｜示意）`,
      `
      <div class="mascot-tip-box">
        <div style="font-size:1.8rem;">🔑</div>
        <div class="tip-content">
          <strong>如何收集圖鑑卡？</strong><br/>
          每天可使用 <strong>3 把每日鑰匙</strong>開啟寶箱（目前剩餘 <strong>${this.state.dailyKeys.remaining}/3</strong> 把），或完成各島的「隨堂測驗」直接解鎖該課卡片！
          <div style="margin-top:8px;">
            <button type="button" class="btn btn-primary" id="modal-btn-use-key" ${
              this.state.dailyKeys.remaining <= 0 ? "disabled" : ""
            }>🔑 使用每日鑰匙開寶箱（剩餘 ${this.state.dailyKeys.remaining}/3）</button>
          </div>
        </div>
      </div>

      <div class="collection-grid">
        ${this.content.collectionCards
          .map((c) => {
            const isUnlocked = this.state.collectedCards.includes(c.id);
            const isHighlight = c.id === highlightCardId;
            return `
              <div class="collect-card ${isUnlocked ? "" : "locked"}" style="${
              isHighlight ? "border-color:var(--primary); box-shadow:0 0 0 2px var(--primary);" : ""
            }">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="card-icon">${isUnlocked ? c.icon : "🔒"}</span>
                  <span class="badge badge-sample">示意</span>
                </div>
                <h4 style="margin:4px 0;">${isUnlocked ? this.escapeHtml(c.title) : "？？？未解鎖卡片"}</h4>
                <div style="font-size:0.8rem; color:var(--accent); font-weight:700; margin-bottom:6px;">分類：${this.escapeHtml(
                  c.category
                )}</div>
                <p style="margin:0; font-size:0.88rem; color:var(--muted);">
                  ${isUnlocked ? this.escapeHtml(c.summary) : "使用每日鑰匙開寶箱，或完成該課隨堂測驗即可解鎖此電學知識卡！"}
                </p>
              </div>
            `;
          })
          .join("")}
      </div>
    `
    );

    const keyBtn = body.querySelector("#modal-btn-use-key");
    if (keyBtn) {
      keyBtn.addEventListener("click", () => this.useDailyKeyToOpenChest());
    }
  }

  // 4. 小嚮導問答（泓哥問答：純前端檢索網站內容並附出處連結，不洩漏測驗題答案）
  openGuideModal() {
    const quickTopics = ["歐姆定律", "色碼電阻", "克希荷夫", "惠斯登電橋", "電容器", "佛萊明", "一度電"];
    const body = this.openModal(
      "👓 泓哥小嚮導問答（從教材找答案並附出處）",
      `
      <div class="mascot-tip-box">
        <div style="font-size:1.8rem;">👓</div>
        <div class="tip-content">
          <strong>嗨！我是${this.escapeHtml(this.content.site.mascot.shortName)}（${this.escapeHtml(
        this.content.site.mascot.description
      )}）！</strong><br/>
          有任何基本電學的名詞、公式或定律想查嗎？直接輸入問題或點選下方熱門關鍵字，我會從 5 座島的教材與圖書館幫你找出解答並附上出處！（為維護學習成效，我不會直接洩漏測驗選擇題答案喔！）
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        ${quickTopics
          .map((t) => `<button type="button" class="btn" data-quick-ask="${this.escapeHtml(t)}">💡 ${this.escapeHtml(t)}</button>`)
          .join("")}
      </div>

      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <input type="text" id="guide-input" placeholder="請問泓哥：例如「什麼是歐姆定律？」「並聯總電阻怎麼算？」" style="flex:1; padding:10px 14px; border-radius:12px; border:1.5px solid var(--line); background:var(--bg); color:var(--ink);" />
        <button type="button" class="btn btn-primary" id="guide-ask-btn">提問</button>
      </div>

      <div id="guide-answer-box"></div>
    `
    );

    const answerQuestion = (rawQuery) => {
      const q = rawQuery.trim();
      const box = body.querySelector("#guide-answer-box");
      if (!q) {
        box.innerHTML = `<p style="color:var(--muted);">請選擇上方關鍵字或輸入問題，泓哥會立刻幫你檢索教材！</p>`;
        return;
      }

      if (q.includes("答案") || q.includes("第幾題") || q.includes("選項")) {
        box.innerHTML = `
          <div class="section-card">
            <strong>👓 泓哥提醒：</strong><br/>
            小嚮導只會提供教材觀念與公式出處，不會直接給隨堂測驗的選項答案喔！你可以輸入題目裡的專有名詞（例如「電位差」「焦耳定律」「分流」），我帶你去看觀念公式！
          </div>
        `;
        return;
      }

      // 分詞比對教材重點與圖書館公式
      const clean = q.replace(/[？?！!。，、什麼是怎麼如何的嗎呢]/g, " ").trim();
      const tokens = clean.split(/\s+/).filter((t) => t.length >= 1);
      if (tokens.length === 0) tokens.push(q);

      const matches = [];
      this.content.islands.forEach((isl) => {
        isl.points.forEach((pt) => {
          const hitCount = tokens.reduce((acc, tk) => acc + (pt.toLowerCase().includes(tk.toLowerCase()) ? 1 : 0), 0);
          if (hitCount > 0 || isl.name.includes(clean)) {
            matches.push({
              score: hitCount + (isl.name.includes(clean) ? 2 : 0),
              text: pt,
              islandId: isl.id,
              sourceLabel: `第 ${isl.order} 課：${isl.name}`
            });
          }
        });
      });

      this.content.library.formulas.forEach((ch, idx) => {
        ch.items.forEach((it) => {
          const combined = `${it.title} ${it.formula} ${it.note}`;
          const hitCount = tokens.reduce((acc, tk) => acc + (combined.toLowerCase().includes(tk.toLowerCase()) ? 1 : 0), 0);
          if (hitCount > 0) {
            const targetIsl = this.content.islands[idx] || this.content.centerIsland;
            matches.push({
              score: hitCount + 1,
              text: `【公式速查】${it.title}：${it.formula}（${it.note}）`,
              islandId: targetIsl.id,
              sourceLabel: `電學知識圖書館 ＆ ${ch.chapter}`
            });
          }
        });
      });

      matches.sort((a, b) => b.score - a.score);
      const topMatches = matches.slice(0, 4);

      if (topMatches.length === 0) {
        box.innerHTML = `
          <div class="section-card">
            <strong>👓 泓哥回覆：</strong><br/>
            在目前 5 課教材中沒有找到完全符合「${this.escapeHtml(q)}」的段落。建議試試看「電功率」「電阻」「串聯」「並聯」「電容」「電感」「磁場」等課本關鍵字！
          </div>
        `;
        return;
      }

      box.innerHTML = topMatches
        .map(
          (m) => `
        <div class="section-card">
          <div style="margin-bottom:8px;">${this.escapeHtml(m.text)}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <span class="badge">📍 出處：${this.escapeHtml(m.sourceLabel)}</span>
            <button type="button" class="btn btn-primary" data-open-island="${m.islandId}">前往該島閱讀</button>
          </div>
        </div>
      `
        )
        .join("");

      this.bindIslandCardClicks(box);
    };

    const inputEl = body.querySelector("#guide-input");
    body.querySelector("#guide-ask-btn").addEventListener("click", () => answerQuestion(inputEl.value));
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") answerQuestion(inputEl.value);
    });
    body.querySelectorAll("[data-quick-ask]").forEach((btn) => {
      btn.addEventListener("click", () => {
        inputEl.value = btn.dataset.quickAsk;
        answerQuestion(btn.dataset.quickAsk);
      });
    });
    answerQuestion("歐姆定律");
  }

  // 5. 完成證書與進度下載／列印
  openCertificateModal() {
    const overall = this.calculateOverallProgress();
    const completedIslands = this.content.islands.filter(
      (isl) => this.state.readCompleted[isl.id] && this.state.quizScores[isl.id]
    ).length;

    const body = this.openModal(
      "🎓 基本電學練工坊 — 學習進度與完成證書",
      `
      <div class="section-card">
        <h3>📈 目前整體完成度：${overall}%（已完成 ${completedIslands} / 5 座課程島測驗）</h3>
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:12px;">
          <label for="cert-student-name" style="font-weight:700;">證書署名（選填）：</label>
          <input type="text" id="cert-student-name" value="${this.escapeHtml(
            this.state.studentName || ""
          )}" placeholder="輸入你的姓名或暱稱（例如：電學小達人）" style="padding:8px 12px; border-radius:10px; border:1.5px solid var(--line); background:var(--bg); color:var(--ink);" />
          <button type="button" class="btn" id="btn-update-cert-preview">更新預覽</button>
        </div>
        <div style="text-align:center;">
          <canvas id="cert-canvas" width="800" height="540" style="max-width:100%; height:auto; border:2px solid var(--primary); border-radius:14px;"></canvas>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:14px;">
          <button type="button" class="btn btn-primary" id="btn-download-cert">⬇️ 下載證書圖檔 (.png)</button>
          <button type="button" class="btn" id="btn-print-cert">🖨️ 列印證書</button>
        </div>
      </div>
    `
    );

    const canvas = body.querySelector("#cert-canvas");
    const drawCert = () => {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fffaf2";
      ctx.fillRect(0, 0, 800, 540);

      // 外框與內框
      ctx.strokeStyle = "#c45a2c";
      ctx.lineWidth = 10;
      ctx.strokeRect(20, 20, 760, 500);
      ctx.strokeStyle = "#2f8f83";
      ctx.lineWidth = 3;
      ctx.strokeRect(34, 34, 732, 472);

      ctx.fillStyle = "#c45a2c";
      ctx.font = "900 34px 'Noto Sans TC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("基本電學練工坊｜學習結業證書", 400, 105);

      ctx.fillStyle = "#5c4438";
      ctx.font = "600 18px 'Noto Sans TC', sans-serif";
      ctx.fillText(this.content.site.tagline, 400, 145);

      const recipient = (this.state.studentName || "高中職電學學員").trim();
      ctx.fillStyle = "#231712";
      ctx.font = "900 28px 'Noto Sans TC', sans-serif";
      ctx.fillText(`學員：${recipient}`, 400, 210);

      ctx.font = "600 18px 'Noto Sans TC', sans-serif";
      ctx.fillStyle = "#2f8f83";
      ctx.fillText(
        `已完成群島進度：${overall}% ｜ 收集電學圖鑑：${this.state.collectedCards.length}/${this.content.collectionCards.length} 張`,
        400,
        255
      );

      // 各島成績摘要
      ctx.fillStyle = "#231712";
      ctx.font = "600 16px 'Noto Sans TC', sans-serif";
      this.content.islands.forEach((isl, idx) => {
        const sc = this.state.quizScores[isl.id];
        const statusStr = sc ? `測驗 ${sc.score} 分` : this.state.readCompleted[isl.id] ? "已讀教材" : "探索中";
        const y = 305 + idx * 30;
        ctx.fillText(`第 ${isl.order} 課《${isl.name}》：${statusStr}`, 400, y);
      });

      ctx.fillStyle = "#5c4438";
      ctx.font = "600 15px 'Noto Sans TC', sans-serif";
      ctx.fillText(
        `指導吉祥物：泓哥 ｜ 製作者：${this.content.site.author} ｜ 日期：${new Date().toISOString().slice(0, 10)}`,
        400,
        482
      );
    };

    drawCert();

    const nameInput = body.querySelector("#cert-student-name");
    body.querySelector("#btn-update-cert-preview").addEventListener("click", () => {
      this.state.studentName = nameInput.value.trim();
      this.saveState();
      drawCert();
      this.showToast("已更新證書署名！");
    });

    body.querySelector("#btn-download-cert").addEventListener("click", () => {
      this.state.studentName = nameInput.value.trim();
      this.saveState();
      drawCert();
      const link = document.createElement("a");
      link.download = "基本電學練工坊-學習證書.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      this.showToast("已下載完成證書 PNG 圖檔！");
    });

    body.querySelector("#btn-print-cert").addEventListener("click", () => {
      window.print();
    });
  }

  // 6. 接關碼（Base64 匯出與還原，不含個資，貼錯有清楚提示）
  encodeSaveCode() {
    const payload = {
      v: 1,
      r: Object.keys(this.state.readCompleted),
      q: this.state.quizScores,
      f: this.state.finalExamScore,
      c: this.state.collectedCards,
      w: this.state.worksheets,
      g: this.guidedStudy ? this.guidedStudy.store : {}
    };
    const jsonStr = JSON.stringify(payload);
    const b64 = btoa(encodeURIComponent(jsonStr));
    return `ISLE1-${b64}`;
  }

  decodeSaveCode(codeStr) {
    const trimmed = String(codeStr || "").trim();
    if (!trimmed.startsWith("ISLE1-")) {
      throw new Error("接關碼格式不正確（應以 ISLE1- 開頭）");
    }
    const rawB64 = trimmed.slice(6);
    const jsonStr = decodeURIComponent(atob(rawB64));
    const data = JSON.parse(jsonStr);
    if (!data || data.v !== 1 || typeof data.q !== "object") {
      throw new Error("接關碼內容損毀或版本不符");
    }
    return data;
  }

  openSaveCodeModal() {
    const currentCode = this.encodeSaveCode();
    const body = this.openModal(
      "💾 跨裝置接關碼（匯出／還原學習進度）",
      `
      <div class="section-card">
        <h3>📤 複製你的目前接關碼</h3>
        <p style="font-size:0.9rem; color:var(--muted);">換電腦或手機時，複製下方代碼到新裝置貼上即可接著學習（代碼不含姓名等個人資料）：</p>
        <textarea id="savecode-export-box" readonly style="width:100%; min-height:84px; padding:10px; border-radius:10px; border:1.5px solid var(--line); background:var(--surface-alt); color:var(--ink); font-family:monospace;">${this.escapeHtml(
          currentCode
        )}</textarea>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-primary" id="btn-copy-savecode">📋 複製接關碼</button>
        </div>
      </div>

      <div class="section-card">
        <h3>📥 貼上接關碼還原進度</h3>
        <textarea id="savecode-import-box" placeholder="請貼上以 ISLE1- 開頭的接關碼…" style="width:100%; min-height:84px; padding:10px; border-radius:10px; border:1.5px solid var(--line); background:var(--bg); color:var(--ink); font-family:monospace;"></textarea>
        <div id="savecode-feedback" style="margin-top:8px; font-weight:700;"></div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-accent" id="btn-apply-savecode">🔄 驗證並還原進度</button>
        </div>
      </div>
    `
    );

    body.querySelector("#btn-copy-savecode").addEventListener("click", () => {
      const box = body.querySelector("#savecode-export-box");
      box.select();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(box.value).catch(() => {});
      }
      this.showToast("已複製接關碼到剪貼簿！");
    });

    body.querySelector("#btn-apply-savecode").addEventListener("click", () => {
      const inputVal = body.querySelector("#savecode-import-box").value;
      const fb = body.querySelector("#savecode-feedback");
      try {
        const data = this.decodeSaveCode(inputVal);
        this.state.readCompleted = {};
        (data.r || []).forEach((id) => (this.state.readCompleted[id] = true));
        this.state.quizScores = data.q || {};
        this.state.finalExamScore = data.f || null;
        this.state.collectedCards = Array.isArray(data.c) ? data.c : ["card-01"];
        this.state.worksheets = data.w || {};
        if (this.guidedStudy && data.g && typeof data.g === "object") {
          this.guidedStudy.store = data.g;
          this.guidedStudy.saveStore();
        }
        this.saveState();
        fb.style.color = "var(--success)";
        fb.textContent = "✅ 接關碼還原成功！所有課程進度與圖鑑皆已同步更新。";
        this.showToast("接關碼還原成功！");
      } catch (err) {
        fb.style.color = "var(--danger)";
        fb.textContent = `❌ 接關碼無效：${err.message || "請確認是否完整複製 ISLE1- 開頭的字串"}`;
      }
    });
  }

  // 7. 分享卡片（產生進度分享圖與複製連結）
  openShareModal() {
    const overall = this.calculateOverallProgress();
    const body = this.openModal(
      "📤 分享學習成果卡片",
      `
      <div class="section-card" style="text-align:center;">
        <p style="margin-top:0;">將你在「基本電學練工坊」的探索進度產生專屬分享圖卡，或複製網址分享給同學！</p>
        <canvas id="share-canvas" width="680" height="380" style="max-width:100%; height:auto; border-radius:14px; border:2px solid var(--line);"></canvas>
        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:14px;">
          <button type="button" class="btn btn-primary" id="btn-download-share-img">⬇️ 下載分享卡片 (.png)</button>
          <button type="button" class="btn btn-accent" id="btn-copy-share-url">🔗 複製網站分享連結</button>
        </div>
      </div>
    `
    );

    const canvas = body.querySelector("#share-canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fbefe3";
    ctx.fillRect(0, 0, 680, 380);
    ctx.strokeStyle = "#c45a2c";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, 652, 352);

    ctx.fillStyle = "#c45a2c";
    ctx.font = "900 30px 'Noto Sans TC', sans-serif";
    ctx.fillText("⚡ 基本電學練工坊", 40, 72);

    ctx.fillStyle = "#231712";
    ctx.font = "700 18px 'Noto Sans TC', sans-serif";
    ctx.fillText(this.content.site.tagline, 40, 112);

    ctx.fillStyle = "#2f8f83";
    ctx.font = "900 24px 'Noto Sans TC', sans-serif";
    ctx.fillText(`目前學習進度：${overall}% ｜ 圖鑑收集：${this.state.collectedCards.length}/12 張`, 40, 168);

    ctx.fillStyle = "#5c4438";
    ctx.font = "600 16px 'Noto Sans TC', sans-serif";
    ctx.fillText("包含：1.電的基本認識 · 2.電阻 · 3.串聯電路 · 4.並聯電路 · 5.電容與電感", 40, 220);
    ctx.fillText("跟著吉祥物「泓哥」一起在 3D 雲海仙境學會基本電學！", 40, 255);
    ctx.fillText(`作者：${this.content.site.author}`, 40, 325);

    body.querySelector("#btn-download-share-img").addEventListener("click", () => {
      const a = document.createElement("a");
      a.download = "基本電學練工坊-分享卡.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      this.showToast("已下載分享卡片圖檔！");
    });

    body.querySelector("#btn-copy-share-url").addEventListener("click", () => {
      const shareText = `我正在玩「${this.content.site.title}」3D 課程群島（目前進度 ${overall}%）！${window.location.href}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).catch(() => {});
      }
      this.showToast("已複製網站分享連結！");
    });
  }

  // 8. Web Audio 合成輕柔背景音樂（使用者按下才播放，可隨時關閉）
  toggleBackgroundMusic() {
    const btn = document.getElementById("btn-music");
    if (this.musicPlaying) {
      this.stopBackgroundMusic();
      btn.setAttribute("aria-pressed", "false");
      btn.classList.remove("btn-active");
      btn.textContent = "🎵 背景音樂：關";
      this.showToast("已關閉背景音樂");
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      this.musicPlaying = true;
      btn.setAttribute("aria-pressed", "true");
      btn.classList.add("btn-active");
      btn.textContent = "🎵 背景音樂：開";

      // 五聲音階雲海仙境輕柔泛音
      const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 392.0, 329.63];
      let step = 0;
      const playNote = () => {
        if (!this.musicPlaying || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(notes[step % notes.length], now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.6);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.65);
        step++;
      };
      playNote();
      this.musicTimer = setInterval(playNote, 1800);
      this.showToast("🎵 已開始播放雲海仙境合成背景音樂");
    } catch {
      this.showToast("您的瀏覽器目前不支援 Web Audio 音效播放");
    }
  }

  stopBackgroundMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  // 9. 說明與吉祥物歡迎對話框
  openHelpModal() {
    this.openModal(
      "❓ 基本電學練工坊 — 泓哥操作說明",
      `
      <div class="mascot-tip-box">
        <div style="font-size:2.2rem;">👓</div>
        <div class="tip-content">
          <strong>${this.escapeHtml(this.content.site.mascot.name)}：</strong><br/>
          「${this.escapeHtml(this.content.site.mascot.greeting)}」
        </div>
      </div>

      <div class="section-card">
        <h3>🎮 3D 群島與介面操作指南</h3>
        <ul style="margin:0; padding-left:1.25rem;">
          <li><strong>旋轉與縮放</strong>：用滑鼠左鍵拖曳（手機單指滑動）可旋轉 3D 群島；滾輪（手機雙指）可縮放視角；點「🌏 回到全景」可一鍵歸位。</li>
          <li><strong>進入課程島</strong>：直接點擊 3D 島嶼、島嶼上方的名稱標籤，或打開「📋 地點清單」都能開啟同一座島的課程面板。</li>
          <li><strong>每課三分頁</strong>：每座島都有「📖 教材重點」、「📝 學習單（可存草稿與匯出 <code>.md</code>）」與「✍️ 隨堂測驗（自編練習題，含解析）」。</li>
          <li><strong>中央島（電學知識圖書館＆總複習）</strong>：島上設有大型電學知識圖書館，提供全冊公式與色碼表速查，並能從 5 課題庫輪流抽題進行跨課總複習測驗。</li>
          <li><strong>三組底色與晝夜光線</strong>：上方可切換「夕陽、沙灘、暮色」三組底色，並能獨立切換「白天、黃昏、夜晚」3D 光線。</li>
          <li><strong>鍵盤無障礙</strong>：所有按鈕皆支援 <code>Tab</code> 鍵切換，按 <code>Esc</code> 鍵可隨時關閉內容面板或彈出視窗。</li>
        </ul>
      </div>
    `
    );
  }

  downloadTextFile(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  showToast(msg) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const item = document.createElement("div");
    item.className = "toast-msg";
    item.textContent = msg;
    container.appendChild(item);
    setTimeout(() => {
      item.remove();
    }, 2800);
  }

  escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new ElectricityWorkshopApp();
  app.init();
  window.__APP__ = app;
});
