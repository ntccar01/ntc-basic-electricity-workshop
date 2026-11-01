// ============================================================================
// 基本電學練工坊｜學生學習歷程雙軌同步（LocalStorage + Firebase Firestore）與教師即時戰情室
// ============================================================================

import {
  DEFAULT_FIREBASE_CONFIG,
  CURRENT_SCHOOL_YEAR,
  DEFAULT_SCHOOL_YEARS,
  DEFAULT_CLASSES,
  CLASS_DISPLAY_LABELS,
  DEFAULT_TEACHER_PIN
} from "./firebase-config.js";
import { WEEK01 } from "./week01-module.js";

const STUDENT_PROFILE_KEY = "ntc_elec_student_profile_v1";
const FIREBASE_OVERRIDE_KEY = "ntc_elec_firebase_config_override_v1";
const LOCAL_CLASSROOM_RECORDS_KEY = "ntc_elec_local_classroom_records_v1";
const TEACHER_UNLOCK_KEY = "ntc_elec_teacher_unlocked_v1";

export class CloudLearningTracker {
  constructor(app) {
    this.app = app;
    this.profile = this.loadProfile();
    this.firebaseConfig = this.loadFirebaseConfig();
    this.db = null;
    this.firestoreModule = null;
    this.isCloudConnected = false;
    this.cloudError = "";
    this.syncStatus = "idle"; // "idle" | "syncing" | "synced" | "local-only" | "error"
    this.lastSyncedAt = null;
    this.unsubscribeSnapshot = null;
    this.selectedYearFilter = this.profile?.schoolYear || CURRENT_SCHOOL_YEAR;
    this.selectedClassFilter = this.profile?.className || DEFAULT_CLASSES[0];
    this.sortBy = "seat"; // "seat" | "status" | "progress"
    this.teacherUnlocked = sessionStorage.getItem(TEACHER_UNLOCK_KEY) === "1";
    this.selectedStudentDetailId = null;
    this.showConfigPanel = false;
    this.liveRecords = this.loadLocalClassroomRecords();
    this.onRecordsUpdateCallbacks = [];

    // 跨分頁即時廣播（讓老師在同一台電腦開兩個分頁測試「學生作答 → 教師戰情室秒級變色」也能立即體驗）
    try {
      this.bc = new BroadcastChannel("ntc_elec_classroom_live_channel");
      this.bc.onmessage = (ev) => {
        if (ev.data && ev.data.type === "STUDENT_RECORD_UPDATED") {
          this.liveRecords[ev.data.record.docId] = ev.data.record;
          this.saveLocalClassroomRecords();
          this.notifyListeners();
        }
      };
    } catch {
      this.bc = null;
    }

    this.initFirebaseIfConfigured();
  }

  loadProfile() {
    try {
      const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (p && p.className && p.seatNo && p.studentName) {
        p.schoolYear = p.schoolYear || CURRENT_SCHOOL_YEAR;
        if (!DEFAULT_CLASSES.includes(p.className)) {
          p.className = "汽車二";
        }
        return p;
      }
      return null;
    } catch {
      return null;
    }
  }

  saveProfile(profile) {
    if (profile && !profile.schoolYear) {
      profile.schoolYear = CURRENT_SCHOOL_YEAR;
    }
    this.profile = profile;
    try {
      if (profile) {
        localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(STUDENT_PROFILE_KEY);
      }
    } catch {
      // ignore
    }
    if (profile && this.app && this.app.state) {
      this.app.state.studentName = `${profile.schoolYear} ${profile.className} ${profile.seatNo}號 ${profile.studentName}`;
    }
    this.updateTopBarLoginButton();
  }

  loadFirebaseConfig() {
    try {
      const raw = localStorage.getItem(FIREBASE_OVERRIDE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_FIREBASE_CONFIG };
  }

  hasValidFirebaseConfig(cfg = this.firebaseConfig) {
    return Boolean(cfg && cfg.apiKey && cfg.projectId && cfg.apiKey.trim().length > 10);
  }

  loadLocalClassroomRecords() {
    try {
      const raw = localStorage.getItem(LOCAL_CLASSROOM_RECORDS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveLocalClassroomRecords() {
    try {
      localStorage.setItem(LOCAL_CLASSROOM_RECORDS_KEY, JSON.stringify(this.liveRecords));
    } catch {
      // ignore
    }
  }

  async initFirebaseIfConfigured() {
    if (!this.hasValidFirebaseConfig()) {
      this.isCloudConnected = false;
      this.syncStatus = "local-only";
      this.updateTopBarLoginButton();
      return false;
    }

    try {
      this.syncStatus = "syncing";
      this.updateTopBarLoginButton();
      const appMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
      const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      this.firestoreModule = fsMod;

      const existingApps = appMod.getApps();
      const fbApp = existingApps.length
        ? existingApps[0]
        : appMod.initializeApp(this.firebaseConfig);

      // 若專案啟用了匿名登入規則 (request.auth != null)，自動嘗試匿名登入（若未啟用則靜默略過）
      try {
        const authMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        const auth = authMod.getAuth(fbApp);
        if (!auth.currentUser) {
          await authMod.signInAnonymously(auth);
        }
      } catch {
        // 專案未啟用 Anonymous Auth 時靜默略過，直接進行 Firestore 連線
      }

      this.db = fsMod.getFirestore(fbApp);
      this.isCloudConnected = true;
      this.cloudError = "";
      this.syncStatus = "synced";
      this.updateTopBarLoginButton();

      // 若已登入學生，立即同步一次
      if (this.profile) {
        await this.syncStudentProgress();
      }
      // 啟動即時監聽
      this.subscribeToClassroom();
      return true;
    } catch (err) {
      console.warn("Firebase 初始化失敗，自動切換為本機備援模式：", err);
      this.isCloudConnected = false;
      this.cloudError = err?.message || String(err);
      this.syncStatus = "error";
      this.updateTopBarLoginButton();
      return false;
    }
  }

  // 建立全班題目 ID 對照字典（供教師迷思分析與學生個人歷程顯示）
  getQuestionCatalog() {
    const map = {};
    [1, 2].forEach((lessonNo) => {
      const lesson = WEEK01[lessonNo];
      if (!lesson) return;
      lesson.study.forEach((seg, sIdx) => {
        map[`mark:${seg.id}`] = {
          id: `mark:${seg.id}`,
          lessonNo,
          book: seg.book,
          title: `[第${lessonNo}節-段落${sIdx + 1}畫重點] ${seg.title}`
        };
        seg.checks.forEach((q, qIdx) => {
          map[q.id] = {
            id: q.id,
            lessonNo,
            book: q.bookRef || seg.book,
            title: `[第${lessonNo}節-段落${sIdx + 1}-問題${qIdx + 1}] ${q.prompt}`
          };
        });
      });
      lesson.tasks.forEach((t, tIdx) => {
        map[`task:L${lessonNo}:${t.id}`] = {
          id: `task:L${lessonNo}:${t.id}`,
          lessonNo,
          book: lesson.source,
          title: `[第${lessonNo}節-整合任務${tIdx + 1}] ${t.prompt}`
        };
      });
    });
    return map;
  }

  // 彙整目前學生的完整學習歷程指標
  buildCurrentStudentRecord() {
    if (!this.profile) return null;
    const gs = this.app?.guidedStudy;
    const store = gs ? gs.store : {};
    const state = this.app?.state || {};
    const catalog = this.getQuestionCatalog();

    const calcLessonMetrics = (lessonNo) => {
      const lesson = WEEK01[lessonNo];
      const p = (store && store[lesson.id]) || {
        completed: false,
        answers: {},
        studyAnswers: {},
        markAnswers: {},
        reflection: ""
      };

      const markTotal = lesson.study.length;
      let markDone = 0;
      let studyTotal = 0;
      let studyDone = 0;
      let firstTryCount = 0;
      let answeredCount = 0;
      let errors = 0;
      let hints = 0;
      const struggling = [];

      lesson.study.forEach((seg) => {
        const m = p.markAnswers && p.markAnswers[seg.id];
        if (m) {
          errors += m.errors || 0;
          hints += m.hints || 0;
          if (m.correct && m.marked) {
            markDone++;
            answeredCount++;
            if (m.firstTry || (m.errors || 0) === 0) firstTryCount++;
          }
          if ((m.errors || 0) >= 2) {
            struggling.push({
              id: `mark:${seg.id}`,
              title: catalog[`mark:${seg.id}`]?.title || seg.title,
              book: seg.book,
              errors: m.errors,
              resolved: Boolean(m.correct && m.marked)
            });
          }
        }

        seg.checks.forEach((q) => {
          studyTotal++;
          const a = p.studyAnswers && p.studyAnswers[q.id];
          if (a) {
            errors += a.errors || 0;
            hints += a.hints || 0;
            if (a.correct) {
              studyDone++;
              answeredCount++;
              if (a.firstTry || (a.errors || 0) === 0) firstTryCount++;
            }
            if ((a.errors || 0) >= 2) {
              struggling.push({
                id: q.id,
                title: catalog[q.id]?.title || q.prompt,
                book: q.bookRef || seg.book,
                errors: a.errors,
                resolved: Boolean(a.correct)
              });
            }
          }
        });
      });

      const taskTotal = lesson.tasks.length;
      let taskDone = 0;
      lesson.tasks.forEach((t) => {
        const ta = p.answers && p.answers[t.id];
        if (ta) {
          errors += ta.errors || 0;
          hints += ta.hints || 0;
          if (ta.correct) {
            taskDone++;
            answeredCount++;
            if (ta.firstTry || (ta.errors || 0) === 0) firstTryCount++;
          }
          if ((ta.errors || 0) >= 2) {
            const key = `task:L${lessonNo}:${t.id}`;
            struggling.push({
              id: key,
              title: catalog[key]?.title || t.prompt,
              book: lesson.source,
              errors: ta.errors,
              resolved: Boolean(ta.correct)
            });
          }
        }
      });

      const totalSteps = markTotal + studyTotal + taskTotal;
      const doneSteps = markDone + studyDone + taskDone;
      const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
      const firstTryRate = answeredCount > 0 ? Math.round((firstTryCount / answeredCount) * 100) : 100;

      return {
        markDone,
        markTotal,
        studyDone,
        studyTotal,
        taskDone,
        taskTotal,
        pct,
        completed: Boolean(p.completed || (doneSteps === totalSteps && totalSteps > 0)),
        firstTryRate,
        errors,
        hints,
        reflection: p.reflection || "",
        struggling
      };
    };

    const l1 = calcLessonMetrics(1);
    const l2 = calcLessonMetrics(2);
    const allStruggling = [...l1.struggling, ...l2.struggling];
    const unresolvedStruggling = allStruggling.filter((x) => !x.resolved);

    // 計算紅綠燈狀態
    // 🔴 紅燈：有題目連續答錯 >= 2 次且尚未答對，或單節累積錯誤 >= 6 次且未完成
    // 🟢 綠燈：第 1 節或第 2 節已完成 >= 1 節且無未解卡關題
    // 🟡 黃燈：進行中
    let statusLight = "yellow";
    if (unresolvedStruggling.length > 0 || (l1.errors + l2.errors >= 6 && !l1.completed && !l2.completed)) {
      statusLight = "red";
    } else if (l1.completed && l2.completed) {
      statusLight = "green";
    } else if (l1.completed && l2.pct === 0) {
      statusLight = "green";
    }

    const quizScores = {};
    if (state.quizScores) {
      Object.keys(state.quizScores).forEach((islId) => {
        quizScores[islId] = state.quizScores[islId]?.score ?? null;
      });
    }

    const schoolYear = this.profile.schoolYear || CURRENT_SCHOOL_YEAR;
    const docId = `${schoolYear}_${this.profile.className}_${String(this.profile.seatNo).padStart(2, "0")}`;
    const overallWeek01Pct = Math.round((l1.pct + l2.pct) / 2);

    return {
      docId,
      schoolYear,
      className: this.profile.className,
      seatNo: String(this.profile.seatNo).padStart(2, "0"),
      studentName: this.profile.studentName,
      pinCode: this.profile.pinCode || "",
      statusLight,
      overallWeek01Pct,
      overallArchipelagoPct: this.app ? this.app.calculateOverallProgress() : 0,
      l1,
      l2,
      totalErrors: l1.errors + l2.errors,
      totalHints: l1.hints + l2.hints,
      strugglingItems: allStruggling,
      quizScores,
      finalExamScore: state.finalExamScore?.score ?? null,
      updatedAt: new Date().toISOString(),
      rawWeek01Store: JSON.stringify(store || {}),
      rawAppState: JSON.stringify({
        visitedIslands: state.visitedIslands || {},
        readCompleted: state.readCompleted || {},
        worksheets: state.worksheets || {},
        quizScores: state.quizScores || {},
        finalExamScore: state.finalExamScore || null,
        collectedCards: state.collectedCards || ["card-01"]
      })
    };
  }

  // 當學生作答或勾選時自動觸發同步
  async syncStudentProgress() {
    if (!this.profile) return;
    const record = this.buildCurrentStudentRecord();
    if (!record) return;

    // 1. 存入本機戰情室快取並透過 BroadcastChannel 即時通知同機教師分頁
    this.liveRecords[record.docId] = record;
    this.saveLocalClassroomRecords();
    if (this.bc) {
      try {
        this.bc.postMessage({ type: "STUDENT_RECORD_UPDATED", record });
      } catch {
        // ignore
      }
    }
    this.notifyListeners();

    // 2. 若已連線 Firebase Firestore，同步寫入雲端
    if (this.isCloudConnected && this.db && this.firestoreModule) {
      try {
        this.syncStatus = "syncing";
        this.updateTopBarLoginButton();
        const { doc, setDoc } = this.firestoreModule;
        const ref = doc(this.db, "ntc_elec_students", record.docId);
        await setDoc(ref, record, { merge: true });
        this.syncStatus = "synced";
        this.lastSyncedAt = new Date();
        this.updateTopBarLoginButton();
      } catch (err) {
        console.warn("Firebase 雲端寫入失敗（已保留於本機快取）：", err);
        this.syncStatus = "error";
        this.cloudError = err?.message || String(err);
        this.updateTopBarLoginButton();
      }
    } else {
      this.syncStatus = "local-only";
      this.updateTopBarLoginButton();
    }
  }

  // 學生跨裝置登入時，嘗試從雲端取回既有學習紀錄（以「學年度_班級_座號」獨立建檔，避免跨學年度同班名混淆）
  async tryRestoreStudentFromCloud(schoolYear, className, seatNo, studentName, pinCode) {
    const paddedSeat = String(seatNo).padStart(2, "0");
    const yr = schoolYear || CURRENT_SCHOOL_YEAR;
    const docId = `${yr}_${className}_${paddedSeat}`;

    let existing = this.liveRecords[docId] || null;
    if (this.isCloudConnected && this.db && this.firestoreModule) {
      try {
        const { doc, getDoc } = this.firestoreModule;
        const snap = await getDoc(doc(this.db, "ntc_elec_students", docId));
        if (snap.exists()) {
          existing = snap.data();
        }
      } catch (err) {
        console.warn("讀取雲端既有紀錄失敗：", err);
      }
    }

    if (existing) {
      // 驗證 PIN 碼（若舊紀錄有設定 PIN 碼且不一致，阻擋覆蓋）
      if (existing.pinCode && existing.pinCode !== pinCode) {
        return {
          ok: false,
          message: `⚠️ 「${yr} ${className} ${paddedSeat}號」已由「${existing.studentName}」設定個人通行碼（PIN），請輸入正確的 4 碼通行碼，或確認學年度／座號是否填錯！`
        };
      }

      // 若雲端紀錄有進度，還原到本機
      if (existing.rawWeek01Store && existing.overallWeek01Pct > 0) {
        try {
          const parsedStore = JSON.parse(existing.rawWeek01Store);
          if (this.app?.guidedStudy) {
            this.app.guidedStudy.store = parsedStore;
            localStorage.setItem("basic-electricity-island-progress-v1", JSON.stringify(parsedStore));
          }
        } catch {
          // ignore
        }
      }
      if (existing.rawAppState) {
        try {
          const parsedApp = JSON.parse(existing.rawAppState);
          if (this.app?.state) {
            Object.assign(this.app.state, parsedApp);
          }
        } catch {
          // ignore
        }
      }
      return { ok: true, restored: existing.overallWeek01Pct > 0 };
    }

    return { ok: true, restored: false };
  }

  // 教師端：啟動 Firestore 即時監聽 (onSnapshot)
  subscribeToClassroom() {
    if (!this.isCloudConnected || !this.db || !this.firestoreModule) return;
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    try {
      const { collection, onSnapshot } = this.firestoreModule;
      const colRef = collection(this.db, "ntc_elec_students");
      this.unsubscribeSnapshot = onSnapshot(
        colRef,
        (snapshot) => {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.docId) {
              this.liveRecords[data.docId] = data;
            }
          });
          this.saveLocalClassroomRecords();
          this.notifyListeners();
        },
        (err) => {
          console.warn("Firestore 即時監聽錯誤：", err);
          this.cloudError = err?.message || String(err);
        }
      );
    } catch (err) {
      console.warn("無法建立 Firestore 即時監聽：", err);
    }
  }

  onRecordsUpdated(cb) {
    this.onRecordsUpdateCallbacks.push(cb);
  }

  notifyListeners() {
    this.onRecordsUpdateCallbacks.forEach((cb) => {
      try {
        cb(this.liveRecords);
      } catch {
        // ignore
      }
    });
  }

  // 更新頂部導覽列的「學生登入／雲端狀態」按鈕
  updateTopBarLoginButton() {
    const btn = document.getElementById("btn-student-login");
    if (!btn) return;
    if (!this.profile) {
      btn.innerHTML = `👤 <span>學生登入</span>`;
      btn.className = "btn btn-student-pill";
      btn.title = "點此輸入班級、座號、姓名，自動記錄並同步學習歷程";
      return;
    }
    const statusIcon =
      this.syncStatus === "synced"
        ? "☁️"
        : this.syncStatus === "syncing"
        ? "⏳"
        : this.syncStatus === "error"
        ? "⚠️"
        : "💾";
    const statusLabel =
      this.syncStatus === "synced"
        ? "雲端已同步"
        : this.syncStatus === "syncing"
        ? "同步中..."
        : this.syncStatus === "error"
        ? "本機備份(雲端異常)"
        : "本機已記錄";
    const yr = this.profile.schoolYear || CURRENT_SCHOOL_YEAR;
    btn.innerHTML = `${statusIcon} <span>${yr} ${this.profile.className} ${this.profile.seatNo}號 ${this.profile.studentName}</span> <small class="sync-tag">${statusLabel}</small>`;
    btn.className = "btn btn-student-pill is-logged-in";
    btn.title = `目前登入：${yr} ${this.profile.className} ${this.profile.seatNo}號 ${this.profile.studentName}（${statusLabel}，點此切換或檢視個人歷程）`;
  }

  // 開啟「學生登入與學習歷程狀態」彈窗
  openStudentLoginModal() {
    if (!this.app) return;
    const p = this.profile || {
      schoolYear: CURRENT_SCHOOL_YEAR,
      className: DEFAULT_CLASSES[0],
      seatNo: "01",
      studentName: "",
      pinCode: ""
    };

    const yearOptions = DEFAULT_SCHOOL_YEARS.map(
      (y) => `<option value="${y}" ${(p.schoolYear || CURRENT_SCHOOL_YEAR) === y ? "selected" : ""}>${y}${y === CURRENT_SCHOOL_YEAR ? "（本學年度預設）" : ""}</option>`
    ).join("");
    const classOptions = DEFAULT_CLASSES.map(
      (c) => `<option value="${c}" ${p.className === c ? "selected" : ""}>${CLASS_DISPLAY_LABELS[c] || c}</option>`
    ).join("");
    const seatOptions = Array.from({ length: 45 }, (_, i) => {
      const s = String(i + 1).padStart(2, "0");
      return `<option value="${s}" ${String(p.seatNo).padStart(2, "0") === s ? "selected" : ""}>${s} 號</option>`;
    }).join("");

    const cloudBadge = this.isCloudConnected
      ? `<span class="badge badge-concept">☁️ Firebase 雲端即時資料庫已連線</span>`
      : `<span class="badge badge-sample">💾 本機雙軌記錄模式（教師設定 Firebase 後自動開啟全班雲端同步）</span>`;

    const currentRecord = this.profile ? this.buildCurrentStudentRecord() : null;
    const summaryHtml = currentRecord
      ? `
        <div class="section-card" style="margin-top:14px; background:var(--surface-alt);">
          <h4 style="margin:0 0 8px;">📊 你目前的學習歷程摘要（${currentRecord.schoolYear} · ${currentRecord.className} ${currentRecord.seatNo}號）</h4>
          <p class="wk-small" style="margin:4px 0;">
            <strong>第 1 節（電路的四個部分）：</strong>完成度 <strong>${currentRecord.l1.pct}%</strong>
            （畫重點 ${currentRecord.l1.markDone}/${currentRecord.l1.markTotal} · 隨讀題 ${currentRecord.l1.studyDone}/${currentRecord.l1.studyTotal} · 任務 ${currentRecord.l1.taskDone}/${currentRecord.l1.taskTotal} · 一次答對率 ${currentRecord.l1.firstTryRate}%）
          </p>
          <p class="wk-small" style="margin:4px 0;">
            <strong>第 2 節（通路、斷路與短路）：</strong>完成度 <strong>${currentRecord.l2.pct}%</strong>
            （畫重點 ${currentRecord.l2.markDone}/${currentRecord.l2.markTotal} · 隨讀題 ${currentRecord.l2.studyDone}/${currentRecord.l2.studyTotal} · 任務 ${currentRecord.l2.taskDone}/${currentRecord.l2.taskTotal} · 一次答對率 ${currentRecord.l2.firstTryRate}%）
          </p>
          <p class="wk-small wk-muted" style="margin:6px 0 0;">
            最後記錄時間：${new Date(currentRecord.updatedAt).toLocaleString("zh-TW")}
          </p>
        </div>
      `
      : "";

    const html = `
      <div class="student-login-modal">
        <div style="margin-bottom:10px;">${cloudBadge}</div>
        <p style="margin-top:0;">系統已為你預設鎖定<strong>「${CURRENT_SCHOOL_YEAR} · 汽車二」</strong>（跨學年度同班名皆獨立建檔不混淆）。你只需選擇<strong>座號</strong>、輸入<strong>姓名與 4 碼個人通行碼（PIN）</strong>即可開始！</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px;">
          <div>
            <label class="wk-bold wk-small" for="login-year-select">1. 學年度（預設 115學年度）</label>
            <div style="display:flex; gap:6px; margin-top:4px;">
              <select id="login-year-select" class="input-field" style="flex:1;">
                ${yearOptions}
                <option value="__custom__">其他學年度（自訂）</option>
              </select>
              <input type="text" id="login-year-custom" class="input-field" placeholder="如 119學年度" style="flex:1; display:none;" />
            </div>
          </div>

          <div>
            <label class="wk-bold wk-small" for="login-class-select">2. 修課班級（預設汽車二）</label>
            <div style="display:flex; gap:6px; margin-top:4px;">
              <select id="login-class-select" class="input-field" style="flex:1;">
                ${classOptions}
              </select>
            </div>
          </div>

          <div>
            <label class="wk-bold wk-small" for="login-seat-select">3. 座號</label>
            <select id="login-seat-select" class="input-field" style="width:100%; margin-top:4px;">
              ${seatOptions}
            </select>
          </div>
        </div>

        <div class="wk-two-col" style="gap:12px; margin-top:12px;">
          <div>
            <label class="wk-bold wk-small" for="login-student-name">4. 真實姓名</label>
            <input type="text" id="login-student-name" class="input-field" value="${p.studentName || ""}" placeholder="例如：王小明" maxlength="20" style="width:100%; margin-top:4px;" />
          </div>

          <div>
            <label class="wk-bold wk-small" for="login-student-pin">5. 個人 4 碼通行碼（防同學誤填／換機載入用）</label>
            <input type="password" id="login-student-pin" class="input-field" value="${p.pinCode || ""}" placeholder="請設定 4 位數字，如 1234" maxlength="8" style="width:100%; margin-top:4px;" />
          </div>
        </div>

        <div id="login-feedback-msg" class="wk-feedback" style="margin-top:12px;"></div>

        <div class="wk-btn-row" style="margin-top:14px; justify-content:space-between;">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" id="btn-confirm-student-login">✅ 儲存身分並開始同步歷程</button>
            ${
              this.profile
                ? `<button type="button" class="btn" id="btn-manual-sync-now">🔄 立即同步至雲端</button>
                   <button type="button" class="btn" id="btn-export-my-json">📥 下載個人歷程備份檔 (.json)</button>`
                : ""
            }
          </div>
          ${
            this.profile
              ? `<button type="button" class="btn" id="btn-student-logout" style="color:var(--danger);">登出切換學生</button>`
              : ""
          }
        </div>

        ${summaryHtml}
      </div>
    `;

    this.app.openModal("👤 學生學習歷程登入與雲端同步", html);

    const yearSelect = document.getElementById("login-year-select");
    const yearCustom = document.getElementById("login-year-custom");
    if (p.schoolYear && !DEFAULT_SCHOOL_YEARS.includes(p.schoolYear)) {
      yearSelect.value = "__custom__";
      yearCustom.style.display = "block";
      yearCustom.value = p.schoolYear;
    }
    yearSelect?.addEventListener("change", () => {
      yearCustom.style.display = yearSelect.value === "__custom__" ? "block" : "none";
    });

    const classSelect = document.getElementById("login-class-select");

    document.getElementById("btn-confirm-student-login")?.addEventListener("click", async () => {
      const schoolYear =
        yearSelect.value === "__custom__" ? yearCustom.value.trim() : yearSelect.value;
      const className = classSelect.value;
      const seatNo = document.getElementById("login-seat-select").value;
      const studentName = document.getElementById("login-student-name").value.trim();
      const pinCode = document.getElementById("login-student-pin").value.trim();
      const fb = document.getElementById("login-feedback-msg");

      if (!schoolYear) {
        fb.className = "wk-feedback error";
        fb.textContent = "請選擇或輸入學年度（如 115學年度）。";
        return;
      }
      if (!className) {
        fb.className = "wk-feedback error";
        fb.textContent = "請選擇或輸入班級名稱。";
        return;
      }
      if (!studentName) {
        fb.className = "wk-feedback error";
        fb.textContent = "請輸入你的真實姓名。";
        return;
      }
      if (!pinCode || pinCode.length < 4) {
        fb.className = "wk-feedback error";
        fb.textContent = "請設定至少 4 碼個人通行碼（PIN），防止同學誤填你的座號。";
        return;
      }

      fb.className = "wk-feedback";
      fb.textContent = "⏳ 正在核對並同步學習歷程...";

      const check = await this.tryRestoreStudentFromCloud(schoolYear, className, seatNo, studentName, pinCode);
      if (!check.ok) {
        fb.className = "wk-feedback error";
        fb.textContent = check.message;
        return;
      }

      this.saveProfile({ schoolYear, className, seatNo, studentName, pinCode });
      this.selectedYearFilter = schoolYear;
      this.selectedClassFilter = className;
      await this.syncStudentProgress();
      this.app.saveState();
      this.app.closeModal();
      if (this.app.currentIslandId && !document.getElementById("island-drawer")?.hidden) {
        this.app.openIslandDrawer(this.app.currentIslandId, this.app.currentTab);
      }
      this.app.showToast(
        check.restored
          ? `🎉 歡迎回來，${schoolYear} ${className} ${seatNo}號 ${studentName}！已為你載入先前的學習歷程。`
          : `✅ 已登入：${schoolYear} ${className} ${seatNo}號 ${studentName}，學習歷程將自動同步記錄！`
      );
    });

    document.getElementById("btn-manual-sync-now")?.addEventListener("click", async () => {
      await this.syncStudentProgress();
      this.app.showToast("☁️ 已立即同步最新學習歷程！");
      this.openStudentLoginModal();
    });

    document.getElementById("btn-export-my-json")?.addEventListener("click", () => {
      const rec = this.buildCurrentStudentRecord();
      if (!rec) return;
      const blob = new Blob([JSON.stringify(rec, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `基本電學歷程_${rec.schoolYear}_${rec.className}_${rec.seatNo}號_${rec.studentName}.json`;
      a.click();
    });

    document.getElementById("btn-student-logout")?.addEventListener("click", () => {
      this.saveProfile(null);
      this.app.closeModal();
      this.app.showToast("已登出學生身分。");
    });
  }

  // 產生 15 位模擬班級學生資料（供老師在尚未填入 Firebase 金鑰前，立即體驗全班紅綠燈戰情室與 CSV 匯出）
  seedDemoClassroomData(targetYear = CURRENT_SCHOOL_YEAR, targetClass = "汽車二") {
    const sampleNames = [
      "陳冠宇", "林承翰", "黃柏諺", "張家豪", "李宥廷",
      "王品睿", "吳宇翔", "劉子軒", "蔡承恩", "楊宗翰",
      "許哲瑋", "鄭博鈞", "謝佳樺", "郭子瑜", "洪靖雯"
    ];
    const catalog = this.getQuestionCatalog();
    const now = Date.now();

    sampleNames.forEach((name, idx) => {
      const seatNo = String(idx + 1).padStart(2, "0");
      const docId = `${targetYear}_${targetClass}_${seatNo}`;

      // 設計不同學習狀態：約 55% 綠燈通關、25% 黃燈進行中、20% 紅燈卡關需救援
      let mode = "green";
      if (idx % 5 === 2 || idx % 7 === 4) mode = "red";
      else if (idx % 4 === 1) mode = "yellow";

      const l1Done = mode === "green" ? true : mode === "yellow" ? idx % 2 === 0 : false;
      const l2Done = mode === "green" ? idx % 3 !== 0 : false;

      const struggling = [];
      if (mode === "red") {
        struggling.push({
          id: "open-match",
          title: catalog["open-match"]?.title || "[第2節-段落2-問題3] 配合題（課本第 3 章 p.69 圖 3-2(b)、(c)）",
          book: "課本第 3 章 p.69｜下方圖 3-2(b) 與圖 3-2(c)",
          errors: 3 + (idx % 2),
          resolved: false
        });
        if (idx % 2 === 0) {
          struggling.push({
            id: "short-eliminate",
            title: catalog["short-eliminate"]?.title || "[第2節-段落3-問題4] 消除題（短路判斷描述）",
            book: "課本第 3 章 p.69｜③「短路」與圖 3-2(d)",
            errors: 2,
            resolved: false
          });
        }
      } else if (mode === "yellow" && idx % 3 === 1) {
        struggling.push({
          id: "parts-drag",
          title: catalog["parts-drag"]?.title || "[第1節-段落2-問題2] 配對題（圖 3-1 標示①～④配對功能）",
          book: "課本第 3 章 p.68–69｜圖 3-1 標示①～④",
          errors: 2,
          resolved: true
        });
      }

      const l1Pct = l1Done ? 100 : mode === "yellow" ? 75 : 45;
      const l2Pct = l2Done ? 100 : mode === "green" ? 85 : mode === "yellow" ? 40 : 25;
      const l1FirstTry = mode === "green" ? 90 - (idx % 10) : mode === "yellow" ? 72 : 45;
      const l2FirstTry = mode === "green" ? 88 - (idx % 12) : mode === "yellow" ? 68 : 40;

      this.liveRecords[docId] = {
        docId,
        schoolYear: targetYear,
        className: targetClass,
        seatNo,
        studentName: name,
        pinCode: "1234",
        statusLight: mode,
        overallWeek01Pct: Math.round((l1Pct + l2Pct) / 2),
        overallArchipelagoPct: mode === "green" ? 35 + (idx % 20) : mode === "yellow" ? 20 : 10,
        l1: {
          markDone: l1Done ? 5 : 3,
          markTotal: 5,
          studyDone: l1Done ? 11 : mode === "yellow" ? 8 : 4,
          studyTotal: 11,
          taskDone: l1Done ? 4 : 2,
          taskTotal: 4,
          pct: l1Pct,
          completed: l1Done,
          firstTryRate: l1FirstTry,
          errors: mode === "red" ? 4 : mode === "yellow" ? 2 : 0,
          hints: mode === "red" ? 3 : 1,
          reflection: l1Done ? "開關斷開時燈泡不亮，因為電路路徑在開關處中斷，沒有形成完整迴路。" : "",
          struggling: struggling.filter((s) => s.id === "parts-drag")
        },
        l2: {
          markDone: l2Done ? 5 : mode === "green" ? 4 : 2,
          markTotal: 5,
          studyDone: l2Done ? 15 : mode === "green" ? 12 : mode === "yellow" ? 6 : 3,
          studyTotal: 15,
          taskDone: l2Done ? 4 : mode === "green" ? 3 : 1,
          taskTotal: 4,
          pct: l2Pct,
          completed: l2Done,
          firstTryRate: l2FirstTry,
          errors: mode === "red" ? 5 : mode === "yellow" ? 2 : 1,
          hints: mode === "red" ? 4 : 1,
          reflection: l2Done ? "斷路是路徑中斷無電流；短路是電流走低阻近路繞過負載，會造成過大電流與過熱危險。" : "",
          struggling: struggling.filter((s) => s.id !== "parts-drag")
        },
        totalErrors: mode === "red" ? 9 : mode === "yellow" ? 4 : 1,
        totalHints: mode === "red" ? 7 : 2,
        strugglingItems: struggling,
        quizScores: {
          "island-03": mode === "green" ? 100 : mode === "yellow" ? 80 : 60
        },
        finalExamScore: null,
        updatedAt: new Date(now - idx * 42000).toISOString(),
        isDemo: true
      };
    });

    this.saveLocalClassroomRecords();
    this.notifyListeners();
  }

  // 匯出全班 Excel (CSV) 平時成績單（含 UTF-8 BOM 防亂碼，支援依學年度與班級篩選）
  exportClassCsv(yearFilter = "ALL", classNameFilter = "ALL") {
    const records = Object.values(this.liveRecords)
      .filter((r) => {
        const yr = r.schoolYear || CURRENT_SCHOOL_YEAR;
        const matchYear = yearFilter === "ALL" || yr === yearFilter;
        const matchCls = classNameFilter === "ALL" || r.className === classNameFilter;
        return matchYear && matchCls;
      })
      .sort(
        (a, b) =>
          (a.schoolYear || CURRENT_SCHOOL_YEAR).localeCompare(b.schoolYear || CURRENT_SCHOOL_YEAR, "zh-Hant") ||
          a.className.localeCompare(b.className, "zh-Hant") ||
          a.seatNo.localeCompare(b.seatNo)
      );

    if (!records.length) {
      if (this.app) this.app.showToast("⚠️ 目前尚無符合篩選條件的學生紀錄可匯出。");
      return;
    }

    const headers = [
      "學年度",
      "班級",
      "座號",
      "姓名",
      "預警燈號",
      "第1週總完成率(%)",
      "第1節_完成率(%)",
      "第1節_課本畫重點(5)",
      "第1節_隨讀題(11)",
      "第1節_四步任務(4)",
      "第1節_一次答對率(%)",
      "第2節_完成率(%)",
      "第2節_課本畫重點(5)",
      "第2節_隨讀題(15)",
      "第2節_四步任務(4)",
      "第2節_一次答對率(%)",
      "累計錯誤次數",
      "累計提示次數",
      "卡關需救援題目",
      "第1節_學生反思",
      "第2節_學生反思",
      "第3課串聯_隨堂測驗",
      "第1課認識電_隨堂測驗",
      "第2課電阻_隨堂測驗",
      "第4課並聯_隨堂測驗",
      "第5課電容電感_隨堂測驗",
      "中央島_總複習測驗",
      "最後更新時間"
    ];

    const esc = (val) => {
      const s = val === null || val === undefined ? "" : String(val);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const lightLabel = (l) => (l === "red" ? "紅燈(需救援)" : l === "green" ? "綠燈(已通關)" : "黃燈(進行中)");

    const rows = records.map((r) => [
      r.schoolYear || CURRENT_SCHOOL_YEAR,
      r.className,
      r.seatNo,
      r.studentName,
      lightLabel(r.statusLight),
      r.overallWeek01Pct ?? 0,
      r.l1?.pct ?? 0,
      `${r.l1?.markDone ?? 0}/${r.l1?.markTotal ?? 5}`,
      `${r.l1?.studyDone ?? 0}/${r.l1?.studyTotal ?? 11}`,
      `${r.l1?.taskDone ?? 0}/${r.l1?.taskTotal ?? 4}`,
      r.l1?.firstTryRate ?? 0,
      r.l2?.pct ?? 0,
      `${r.l2?.markDone ?? 0}/${r.l2?.markTotal ?? 5}`,
      `${r.l2?.studyDone ?? 0}/${r.l2?.studyTotal ?? 15}`,
      `${r.l2?.taskDone ?? 0}/${r.l2?.taskTotal ?? 4}`,
      r.l2?.firstTryRate ?? 0,
      r.totalErrors ?? 0,
      r.totalHints ?? 0,
      (r.strugglingItems || []).map((x) => `${x.title}(錯${x.errors}次)`).join("；"),
      r.l1?.reflection || "",
      r.l2?.reflection || "",
      r.quizScores?.["island-03"] ?? "",
      r.quizScores?.["island-01"] ?? "",
      r.quizScores?.["island-02"] ?? "",
      r.quizScores?.["island-04"] ?? "",
      r.quizScores?.["island-05"] ?? "",
      r.finalExamScore ?? "",
      r.updatedAt ? new Date(r.updatedAt).toLocaleString("zh-TW") : ""
    ]);

    const csvContent =
      "\uFEFF" + [headers.map(esc).join(","), ...rows.map((row) => row.map(esc).join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `基本電學練工坊_學習歷程成績單_${yearFilter}_${classNameFilter}_${dateStr}.csv`;
    a.click();
    if (this.app) {
      this.app.showToast(`📥 已匯出 ${records.length} 位學生的 Excel (CSV) 學習歷程成績單！`);
    }
  }

  // ==================== 教師即時戰情室 UI 渲染器 ====================
  renderTeacherWarRoom(container) {
    container.innerHTML = "";
    const box = document.createElement("div");
    box.className = "section-card war-room-card";

    const cloudStatusBadge = this.isCloudConnected
      ? `<span class="war-status-pill is-online">🟢 Firebase (Firestore) 雲端即時同步連線中（專案：${this.firebaseConfig.projectId}）</span>`
      : `<span class="war-status-pill is-local">🟡 本機／同網域預覽模式（點右側「⚙️ Firebase 雲端設定」即可開啟跨裝置全班即時同步）</span>`;

    // 若尚未解鎖教師戰情室，提供簡易密碼驗證（預設 ntc2026，亦有一鍵體驗按鈕）
    if (!this.teacherUnlocked) {
      box.innerHTML = `
        <div class="war-room-header">
          <div>
            <h3 style="margin:0;">📡 全班學習歷程即時戰情室（Firebase 教師後台）</h3>
            <p class="wk-muted wk-small" style="margin:4px 0 0;">即時監控全班每位學生的課本畫重點、隨讀題作答、錯誤紅燈預警與一鍵匯出 Excel 平時成績單。</p>
          </div>
          ${cloudStatusBadge}
        </div>
        <div class="war-auth-box">
          <label class="wk-bold" for="teacher-pin-input">🔐 請輸入教師後台通行密碼（預設密碼：<code>ntc2026</code>）：</label>
          <div class="wk-btn-row" style="margin-top:8px;">
            <input type="password" id="teacher-pin-input" class="input-field" value="ntc2026" placeholder="輸入教師密碼" style="max-width:220px;" />
            <button type="button" class="btn btn-primary" id="btn-unlock-war-room">🔓 進入教師戰情室後台</button>
          </div>
          <p id="teacher-auth-err" class="wk-feedback error" style="display:none;"></p>
        </div>
      `;
      container.appendChild(box);
      box.querySelector("#btn-unlock-war-room")?.addEventListener("click", () => {
        const val = box.querySelector("#teacher-pin-input")?.value.trim();
        if (val === DEFAULT_TEACHER_PIN || val === "2026") {
          this.teacherUnlocked = true;
          sessionStorage.setItem(TEACHER_UNLOCK_KEY, "1");
          this.renderTeacherWarRoom(container);
        } else {
          const errEl = box.querySelector("#teacher-auth-err");
          errEl.style.display = "block";
          errEl.textContent = "密碼不正確（預設為 ntc2026）。";
        }
      });
      return;
    }

    // 篩選目前學年度與班級名單
    const allRecords = Object.values(this.liveRecords);
    const availableYears = Array.from(
      new Set([
        ...DEFAULT_SCHOOL_YEARS,
        ...allRecords.map((r) => r.schoolYear || CURRENT_SCHOOL_YEAR).filter(Boolean)
      ])
    );
    const availableClasses = Array.from(
      new Set([...DEFAULT_CLASSES, ...allRecords.map((r) => r.className).filter(Boolean)])
    );

    const yearMatchedRecords = allRecords.filter((r) => {
      const yr = r.schoolYear || CURRENT_SCHOOL_YEAR;
      return this.selectedYearFilter === "ALL" || yr === this.selectedYearFilter;
    });

    const filtered = yearMatchedRecords
      .filter((r) => this.selectedClassFilter === "ALL" || r.className === this.selectedClassFilter)
      .sort((a, b) => {
        if (this.sortBy === "status") {
          const rank = { red: 0, yellow: 1, green: 2 };
          return (rank[a.statusLight] ?? 1) - (rank[b.statusLight] ?? 1) || a.seatNo.localeCompare(b.seatNo);
        }
        if (this.sortBy === "progress") {
          return (b.overallWeek01Pct ?? 0) - (a.overallWeek01Pct ?? 0) || a.seatNo.localeCompare(b.seatNo);
        }
        return (
          (a.schoolYear || CURRENT_SCHOOL_YEAR).localeCompare(b.schoolYear || CURRENT_SCHOOL_YEAR, "zh-Hant") ||
          a.className.localeCompare(b.className, "zh-Hant") ||
          a.seatNo.localeCompare(b.seatNo)
        );
      });

    const totalCount = filtered.length;
    const greenCount = filtered.filter((r) => r.statusLight === "green").length;
    const yellowCount = filtered.filter((r) => r.statusLight === "yellow").length;
    const redCount = filtered.filter((r) => r.statusLight === "red").length;
    const avgPct = totalCount
      ? Math.round(filtered.reduce((s, r) => s + (r.overallWeek01Pct || 0), 0) / totalCount)
      : 0;
    const avgFirstTry = totalCount
      ? Math.round(
          filtered.reduce(
            (s, r) => s + Math.round(((r.l1?.firstTryRate ?? 100) + (r.l2?.firstTryRate ?? 100)) / 2),
            0
          ) / totalCount
        )
      : 0;

    // 計算全班共同迷思排行榜（統計最多人錯 >=2 次的題目）
    const misconceptionMap = {};
    filtered.forEach((r) => {
      (r.strugglingItems || []).forEach((item) => {
        if (!misconceptionMap[item.id]) {
          misconceptionMap[item.id] = {
            id: item.id,
            title: item.title,
            book: item.book,
            studentCount: 0,
            totalErrors: 0,
            students: []
          };
        }
        misconceptionMap[item.id].studentCount++;
        misconceptionMap[item.id].totalErrors += item.errors || 0;
        misconceptionMap[item.id].students.push(`${r.seatNo}號 ${r.studentName}`);
      });
    });
    const topMisconceptions = Object.values(misconceptionMap)
      .sort((a, b) => b.studentCount - a.studentCount || b.totalErrors - a.totalErrors)
      .slice(0, 4);

    const yearOptsHtml = [
      `<option value="ALL" ${this.selectedYearFilter === "ALL" ? "selected" : ""}>全部學年度（共 ${allRecords.length} 人）</option>`,
      ...availableYears.map((y) => {
        const cnt = allRecords.filter((r) => (r.schoolYear || CURRENT_SCHOOL_YEAR) === y).length;
        return `<option value="${y}" ${this.selectedYearFilter === y ? "selected" : ""}>${y}（${cnt} 人）</option>`;
      })
    ].join("");

    const classOptsHtml = [
      `<option value="ALL" ${this.selectedClassFilter === "ALL" ? "selected" : ""}>全部班級（共 ${yearMatchedRecords.length} 人）</option>`,
      ...availableClasses.map((c) => {
        const cnt = yearMatchedRecords.filter((r) => r.className === c).length;
        return `<option value="${c}" ${this.selectedClassFilter === c ? "selected" : ""}>${c}（${cnt} 人）</option>`;
      })
    ].join("");

    // Firebase 設定面板 HTML
    const configPanelHtml = this.showConfigPanel
      ? `
      <div class="war-config-panel">
        <h4>⚙️ Firebase (Firestore) 雲端即時資料庫設定精靈（5 分鐘免費申請）</h4>
        <ol class="wk-list wk-small">
          <li>前往 <a href="https://console.firebase.google.com/" target="_blank" rel="noopener">Firebase Console</a>，點選「建立專案（Create a project）」。</li>
          <li>在專案首頁點選「<strong>&lt;/&gt;（Web 網頁應用程式）</strong>」，註冊後複製畫面上的 <code>firebaseConfig</code> 物件內容。</li>
          <li>在左側選單點選「<strong>Build → Firestore Database → 建立資料庫</strong>」，位置選 <code>asia-east1 (台灣彰化)</code>，規則先選「<strong>以測試模式啟動（Test mode）</strong>」即可立即讀寫。</li>
          <li>將複製的 <code>firebaseConfig</code> 貼入下方文字框並按「💾 儲存並立即連線」；若要讓全班學生打開 GitHub Pages 網址直接自動連線，請將下方設定複製到專案的 <code>site/js/firebase-config.js</code> 檔案中推送即可！</li>
        </ol>
        <textarea id="firebase-config-textarea" class="wk-textarea" rows="6" placeholder='可直接貼上整段 firebaseConfig，例如：\n{\n  "apiKey": "AIzaSy...",\n  "authDomain": "your-project.firebaseapp.com",\n  "projectId": "your-project",\n  "storageBucket": "your-project.firebasestorage.app",\n  "messagingSenderId": "123456789",\n  "appId": "1:123456789:web:abcdef"\n}'>${
          this.hasValidFirebaseConfig() ? JSON.stringify(this.firebaseConfig, null, 2) : ""
        }</textarea>
        <div class="wk-btn-row" style="margin-top:8px;">
          <button type="button" class="btn btn-primary" id="btn-save-firebase-cfg">💾 儲存設定並立即連線 Firebase</button>
          <button type="button" class="btn" id="btn-clear-firebase-cfg">🧹 清除自訂設定（回復本機模式）</button>
        </div>
        ${
          this.cloudError
            ? `<p class="wk-feedback error" style="margin-top:8px;">⚠️ 連線錯誤訊息：${this.cloudError}</p>`
            : ""
        }
      </div>
    `
      : "";

    // 迷思排行榜 HTML
    const misconceptionsHtml = topMisconceptions.length
      ? `
      <div class="war-misconception-box">
        <h4 style="margin:0 0 8px;">🔥 全班共同迷思預警排行榜（自動統計錯誤 ≥ 2 次的高頻卡關題）</h4>
        <div class="war-misconception-grid">
          ${topMisconceptions
            .map(
              (m, i) => `
            <div class="war-misconception-item">
              <div class="wk-small wk-bold" style="color:var(--danger);">TOP ${i + 1}｜共 ${m.studentCount} 人卡關（累計錯 ${m.totalErrors} 次）</div>
              <div class="wk-bold" style="margin:4px 0;">${m.title}</div>
              <div class="wk-small wk-muted">📖 對照：${m.book}</div>
              <div class="wk-small" style="margin-top:4px;">👤 卡關學生：${m.students.join("、")}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
      : "";

    // 學生個人明細展開視圖
    const detailStudent = this.selectedStudentDetailId ? this.liveRecords[this.selectedStudentDetailId] : null;
    const studentDetailModalHtml = detailStudent
      ? `
      <div class="war-student-detail-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <h4 style="margin:0;">🔍 學生個人學習歷程明細：${detailStudent.schoolYear || CURRENT_SCHOOL_YEAR} · ${detailStudent.className} ${detailStudent.seatNo}號 ${detailStudent.studentName}</h4>
          <button type="button" class="btn" id="btn-close-student-detail">✕ 收合明細</button>
        </div>
        <div class="wk-two-col" style="margin-top:10px;">
          <div class="war-detail-subcard">
            <h5 style="margin:0 0 6px;">📘 第 1 節：電路的四個部分（完成度 ${detailStudent.l1?.pct ?? 0}%）</h5>
            <ul class="wk-list wk-small">
              <li>課本畫重點勾選：<strong>${detailStudent.l1?.markDone ?? 0} ／ ${detailStudent.l1?.markTotal ?? 5}</strong> 段</li>
              <li>隨讀互動題完成：<strong>${detailStudent.l1?.studyDone ?? 0} ／ ${detailStudent.l1?.studyTotal ?? 11}</strong> 題</li>
              <li>四步整合任務：<strong>${detailStudent.l1?.taskDone ?? 0} ／ ${detailStudent.l1?.taskTotal ?? 4}</strong> 步</li>
              <li>一次答對率：<strong>${detailStudent.l1?.firstTryRate ?? 100}%</strong>（錯誤 ${detailStudent.l1?.errors ?? 0} 次／提示 ${detailStudent.l1?.hints ?? 0} 次）</li>
              <li>學生反思：<em>${detailStudent.l1?.reflection ? `「${detailStudent.l1.reflection}」` : "（尚未填寫）"}</em></li>
            </ul>
          </div>
          <div class="war-detail-subcard">
            <h5 style="margin:0 0 6px;">📙 第 2 節：通路、斷路與短路（完成度 ${detailStudent.l2?.pct ?? 0}%）</h5>
            <ul class="wk-list wk-small">
              <li>課本畫重點勾選：<strong>${detailStudent.l2?.markDone ?? 0} ／ ${detailStudent.l2?.markTotal ?? 5}</strong> 段</li>
              <li>隨讀互動題完成：<strong>${detailStudent.l2?.studyDone ?? 0} ／ ${detailStudent.l2?.studyTotal ?? 15}</strong> 題</li>
              <li>四步整合任務：<strong>${detailStudent.l2?.taskDone ?? 0} ／ ${detailStudent.l2?.taskTotal ?? 4}</strong> 步</li>
              <li>一次答對率：<strong>${detailStudent.l2?.firstTryRate ?? 100}%</strong>（錯誤 ${detailStudent.l2?.errors ?? 0} 次／提示 ${detailStudent.l2?.hints ?? 0} 次）</li>
              <li>學生反思：<em>${detailStudent.l2?.reflection ? `「${detailStudent.l2.reflection}」` : "（尚未填寫）"}</em></li>
            </ul>
          </div>
        </div>
        ${
          detailStudent.strugglingItems && detailStudent.strugglingItems.length
            ? `<div class="wk-small" style="margin-top:8px; color:var(--danger);">
                <strong>⚠️ 曾反覆答錯（≥2次）的題目：</strong>
                ${detailStudent.strugglingItems
                  .map((s) => `${s.title}（錯 ${s.errors} 次，${s.resolved ? "已訂正通過" : "🔴 尚未通過"}）`)
                  .join(" ｜ ")}
               </div>`
            : `<div class="wk-small" style="margin-top:8px; color:var(--success);">🌟 答題穩定，無連續答錯超過 2 次的卡關題目！</div>`
        }
      </div>
    `
      : "";

    // 學生列表表格列
    const rowsHtml = filtered.length
      ? filtered
          .map((r) => {
            const lightBadge =
              r.statusLight === "red"
                ? `<span class="war-light is-red" title="有未解卡關題或錯誤較多，建議巡堂優先指導">🔴 需救援</span>`
                : r.statusLight === "green"
                ? `<span class="war-light is-green" title="進度順利完成">🟢 已通關</span>`
                : `<span class="war-light is-yellow" title="正在閱讀與作答中">🟡 進行中</span>`;

            const strugglingText =
              r.strugglingItems && r.strugglingItems.length
                ? r.strugglingItems
                    .map((s) => `<span class="war-struggle-tag">${s.title.split("]")[0]}](錯${s.errors})</span>`)
                    .join(" ")
                : `<span class="wk-muted wk-small">無卡關</span>`;

            const quiz3 = r.quizScores?.["island-03"] !== undefined && r.quizScores?.["island-03"] !== null
              ? `${r.quizScores["island-03"]}分`
              : "—";

            const timeAgo = r.updatedAt
              ? new Date(r.updatedAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "—";

            return `
              <tr class="${r.statusLight === "red" ? "war-row-alert" : ""}">
                <td>${lightBadge}</td>
                <td><span class="badge badge-sample">${r.schoolYear || CURRENT_SCHOOL_YEAR}</span></td>
                <td><strong>${r.className}</strong></td>
                <td><strong>${r.seatNo} 號</strong></td>
                <td><strong>${r.studentName}</strong></td>
                <td>
                  <div class="war-mini-bar"><span style="width:${r.l1?.pct ?? 0}%"></span></div>
                  <small>${r.l1?.pct ?? 0}% (標記${r.l1?.markDone ?? 0}/5·題${r.l1?.studyDone ?? 0}/11)</small>
                </td>
                <td>
                  <div class="war-mini-bar"><span style="width:${r.l2?.pct ?? 0}%"></span></div>
                  <small>${r.l2?.pct ?? 0}% (標記${r.l2?.markDone ?? 0}/5·題${r.l2?.studyDone ?? 0}/15)</small>
                </td>
                <td><strong>${Math.round(((r.l1?.firstTryRate ?? 100) + (r.l2?.firstTryRate ?? 100)) / 2)}%</strong> <small class="wk-muted">(錯${r.totalErrors ?? 0})</small></td>
                <td>${quiz3}</td>
                <td>${strugglingText}</td>
                <td><small>${timeAgo}</small></td>
                <td>
                  <button type="button" class="btn btn-sm btn-view-student" data-docid="${r.docId}">🔍 明細</button>
                </td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="12" style="text-align:center; padding:24px;">
            目前「${this.selectedYearFilter === "ALL" ? "全部學年度" : this.selectedYearFilter} · ${this.selectedClassFilter === "ALL" ? "全部班級" : this.selectedClassFilter}」尚無學生登入紀錄。<br/>
            請學生點擊畫面右上角「<strong>👤 學生登入</strong>」開始作答，或點上方「<strong>🧪 載入模擬班級資料（15人）</strong>」立即預覽戰情室效果！
          </td>
        </tr>
      `;

    box.innerHTML = `
      <div class="war-room-header">
        <div>
          <h3 style="margin:0;">📡 全班學習歷程即時戰情室（Firebase 雲端後台）</h3>
          <p class="wk-muted wk-small" style="margin:4px 0 0;">
            學生在前端勾選課本重點、作答隨讀題或操作模擬器時，系統會以「<strong>學年度＋班級＋座號</strong>」獨立建檔並雙軌記錄（本機＋Firebase 雲端），跨學年度同班名完全獨立不混淆。
          </p>
        </div>
        ${cloudStatusBadge}
      </div>

      <!-- 工具列 -->
      <div class="war-toolbar">
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <label class="wk-small wk-bold" for="war-year-filter">📅 學年度：</label>
          <select id="war-year-filter" class="input-field" style="min-width:145px;">
            ${yearOptsHtml}
          </select>

          <label class="wk-small wk-bold" for="war-class-filter" style="margin-left:4px;">🏫 班級：</label>
          <select id="war-class-filter" class="input-field" style="min-width:155px;">
            ${classOptsHtml}
          </select>

          <label class="wk-small wk-bold" for="war-sort-select" style="margin-left:4px;">排序：</label>
          <select id="war-sort-select" class="input-field">
            <option value="seat" ${this.sortBy === "seat" ? "selected" : ""}>依座號由小到大</option>
            <option value="status" ${this.sortBy === "status" ? "selected" : ""}>🔴 需救援優先顯示</option>
            <option value="progress" ${this.sortBy === "progress" ? "selected" : ""}>依完成率高低</option>
          </select>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn" id="btn-seed-demo-class" title="產生 15 位模擬學生的紅綠燈作答資料，方便老師預覽後台功能">🧪 載入模擬班級資料(15人)</button>
          <button type="button" class="btn btn-primary" id="btn-export-class-csv">📥 匯出全班 Excel (CSV) 成績單</button>
          <button type="button" class="btn" id="btn-import-student-json">📂 匯入學生 JSON 備份</button>
          <input type="file" id="war-import-json-input" accept=".json" style="display:none;" multiple />
          <button type="button" class="btn" id="btn-toggle-firebase-cfg">⚙️ Firebase 雲端設定</button>
          <button type="button" class="btn" id="btn-clear-demo-records" style="color:var(--danger);">🗑️ 清空本機名單</button>
        </div>
      </div>

      ${configPanelHtml}

      <!-- 6 大即時指標卡 -->
      <div class="war-kpi-grid">
        <div class="war-kpi-card">
          <div class="war-kpi-label">👥 已連線學生數</div>
          <div class="war-kpi-val">${totalCount} <small>人</small></div>
        </div>
        <div class="war-kpi-card is-green">
          <div class="war-kpi-label">🟢 順利通關</div>
          <div class="war-kpi-val">${greenCount} <small>人</small></div>
        </div>
        <div class="war-kpi-card is-yellow">
          <div class="war-kpi-label">🟡 作答進行中</div>
          <div class="war-kpi-val">${yellowCount} <small>人</small></div>
        </div>
        <div class="war-kpi-card is-red">
          <div class="war-kpi-label">🔴 卡關需救援</div>
          <div class="war-kpi-val">${redCount} <small>人</small></div>
        </div>
        <div class="war-kpi-card">
          <div class="war-kpi-label">📈 全班平均完成率</div>
          <div class="war-kpi-val">${avgPct}<small>%</small></div>
        </div>
        <div class="war-kpi-card">
          <div class="war-kpi-label">🎯 平均一次答對率</div>
          <div class="war-kpi-val">${avgFirstTry}<small>%</small></div>
        </div>
      </div>

      ${misconceptionsHtml}
      ${studentDetailModalHtml}

      <!-- 全班紅綠燈即時進度表 -->
      <div class="war-table-wrap">
        <table class="war-table">
          <thead>
            <tr>
              <th>預警燈號</th>
              <th>學年度</th>
              <th>班級</th>
              <th>座號</th>
              <th>姓名</th>
              <th>第 1 節（四個部分）</th>
              <th>第 2 節（通/斷/短路）</th>
              <th>一次答對率</th>
              <th>隨堂測驗</th>
              <th>高頻卡關預警（錯≥2次）</th>
              <th>最後更新</th>
              <th>個人歷程</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(box);

    // 綁定互動事件
    box.querySelector("#war-year-filter")?.addEventListener("change", (e) => {
      this.selectedYearFilter = e.target.value;
      this.renderTeacherWarRoom(container);
    });

    box.querySelector("#war-class-filter")?.addEventListener("change", (e) => {
      this.selectedClassFilter = e.target.value;
      this.renderTeacherWarRoom(container);
    });

    box.querySelector("#war-sort-select")?.addEventListener("change", (e) => {
      this.sortBy = e.target.value;
      this.renderTeacherWarRoom(container);
    });

    box.querySelector("#btn-seed-demo-class")?.addEventListener("click", () => {
      const targetYr = this.selectedYearFilter === "ALL" ? CURRENT_SCHOOL_YEAR : this.selectedYearFilter;
      const targetCls = this.selectedClassFilter === "ALL" ? "汽車二" : this.selectedClassFilter;
      this.seedDemoClassroomData(targetYr, targetCls);
      this.selectedYearFilter = targetYr;
      this.selectedClassFilter = targetCls;
      this.renderTeacherWarRoom(container);
      if (this.app) {
        this.app.showToast(`🧪 已載入「${targetYr} · ${targetCls}」15 位模擬學生的紅綠燈學習歷程資料！`);
      }
    });

    box.querySelector("#btn-export-class-csv")?.addEventListener("click", () => {
      this.exportClassCsv(this.selectedYearFilter, this.selectedClassFilter);
    });

    box.querySelector("#btn-import-student-json")?.addEventListener("click", () => {
      box.querySelector("#war-import-json-input")?.click();
    });

    box.querySelector("#war-import-json-input")?.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      let imported = 0;
      for (const f of files) {
        try {
          const text = await f.text();
          const data = JSON.parse(text);
          if (data && data.docId && data.studentName) {
            this.liveRecords[data.docId] = data;
            imported++;
          }
        } catch {
          // ignore invalid file
        }
      }
      if (imported > 0) {
        this.saveLocalClassroomRecords();
        this.renderTeacherWarRoom(container);
        if (this.app) this.app.showToast(`✅ 成功匯入 ${imported} 位學生的學習歷程檔案！`);
      }
    });

    box.querySelector("#btn-toggle-firebase-cfg")?.addEventListener("click", () => {
      this.showConfigPanel = !this.showConfigPanel;
      this.renderTeacherWarRoom(container);
    });

    box.querySelector("#btn-save-firebase-cfg")?.addEventListener("click", async () => {
      const rawText = box.querySelector("#firebase-config-textarea")?.value.trim() || "";
      try {
        // 支援直接貼上 JS 物件或 JSON
        const jsonCleaned = rawText
          .replace(/^[^{]*(\{[\s\S]*\})[^}]*$/, "$1")
          .replace(/(\w+)\s*:/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, "}");
        const parsed = JSON.parse(jsonCleaned);
        if (!parsed.apiKey || !parsed.projectId) {
          throw new Error("缺少 apiKey 或 projectId 欄位");
        }
        this.firebaseConfig = parsed;
        localStorage.setItem(FIREBASE_OVERRIDE_KEY, JSON.stringify(parsed));
        const ok = await this.initFirebaseIfConfigured();
        this.renderTeacherWarRoom(container);
        if (this.app) {
          this.app.showToast(
            ok
              ? `🎉 成功連線至 Firebase 專案「${parsed.projectId}」！`
              : `⚠️ 設定已儲存，但連線發生異常，請確認 Firestore 是否已啟用。`
          );
        }
      } catch (err) {
        alert("解析 Firebase 設定格式失敗，請確認貼上完整的 { apiKey: ..., projectId: ... } 內容。\n錯誤：" + err.message);
      }
    });

    box.querySelector("#btn-clear-firebase-cfg")?.addEventListener("click", () => {
      localStorage.removeItem(FIREBASE_OVERRIDE_KEY);
      this.firebaseConfig = { ...DEFAULT_FIREBASE_CONFIG };
      this.isCloudConnected = false;
      this.syncStatus = "local-only";
      this.updateTopBarLoginButton();
      this.renderTeacherWarRoom(container);
    });

    box.querySelector("#btn-clear-demo-records")?.addEventListener("click", () => {
      this.liveRecords = {};
      if (this.profile) {
        const myRec = this.buildCurrentStudentRecord();
        if (myRec) this.liveRecords[myRec.docId] = myRec;
      }
      this.saveLocalClassroomRecords();
      this.selectedStudentDetailId = null;
      this.renderTeacherWarRoom(container);
      if (this.app) this.app.showToast("🗑️ 已清空本機快取名單。");
    });

    box.querySelectorAll(".btn-view-student").forEach((btn) => {
      btn.addEventListener("click", () => {
        const docId = btn.dataset.docid;
        this.selectedStudentDetailId = this.selectedStudentDetailId === docId ? null : docId;
        this.renderTeacherWarRoom(container);
      });
    });

    box.querySelector("#btn-close-student-detail")?.addEventListener("click", () => {
      this.selectedStudentDetailId = null;
      this.renderTeacherWarRoom(container);
    });
  }
}
