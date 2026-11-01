// ============================================================================
// 基本電學練工坊｜學生學習歷程雙軌同步（LocalStorage + Firebase Firestore）與教師即時戰情室
// ============================================================================

import {
  DEFAULT_FIREBASE_CONFIG,
  CURRENT_SCHOOL_YEAR,
  DEFAULT_SCHOOL_YEARS,
  DEFAULT_CLASSES,
  CLASS_DISPLAY_LABELS,
  TEACHER_EMAILS
} from "./firebase-config.js";
import { WEEK01 } from "./week01-module.js";

const STUDENT_PROFILE_KEY = "ntc_elec_student_profile_v1";
const FIREBASE_OVERRIDE_KEY = "ntc_elec_firebase_config_override_v1";
const LOCAL_CLASSROOM_RECORDS_KEY = "ntc_elec_local_classroom_records_v1";
const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/10.12.2";

// 學生 PIN 以「文件編號＋PIN」做 SHA-256 雜湊後才上傳雲端（雲端不存放明文 PIN）
function hashStudentPin(docId, pin) {
  return sha256Hex(`ntc_pin_v1|${docId}|${String(pin || "").trim()}`);
}

// 純前端標準 SHA-256 單向加密雜湊函式（跨 http/https 環境皆可同步運算，不在程式碼留存明文帳密）
function sha256Hex(str) {
  const utf8 = new TextEncoder().encode(str);
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const bitLen = utf8.length * 8;
  const padLen = ((utf8.length + 9 + 63) >> 6) << 6;
  const buf = new Uint8Array(padLen);
  buf.set(utf8);
  buf[utf8.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(padLen - 4, bitLen >>> 0, false);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  const W = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  for (let i = 0; i < padLen; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = view.getUint32(i + t * 4, false);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }
  return H.map((v) => v.toString(16).padStart(8, "0")).join("");
}

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
    this.teacherUnlocked = false; // 由 Firebase Authentication 狀態決定（見 handleAuthStateChanged）
    this.teacherUser = null;
    this.authModule = null;
    this.auth = null;
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
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && parsed.__teacher_auth__) {
        delete parsed.__teacher_auth__;
      }
      return parsed;
    } catch {
      return {};
    }
  }

  isTeacherEmail(email) {
    const e = String(email || "").trim().toLowerCase();
    return Boolean(e) && TEACHER_EMAILS.map((x) => x.toLowerCase()).includes(e);
  }

  // Firebase 登入狀態改變時（教師登入／登出、重新整理頁面自動恢復登入）
  async handleAuthStateChanged(user) {
    const wasTeacher = this.teacherUnlocked;
    const isTeacher = Boolean(user && !user.isAnonymous && this.isTeacherEmail(user.email));
    this.teacherUser = isTeacher ? user : null;
    this.teacherUnlocked = isTeacher;

    if (isTeacher) {
      this.subscribeToClassroom();
    } else {
      if (this.unsubscribeSnapshot) {
        this.unsubscribeSnapshot();
        this.unsubscribeSnapshot = null;
      }
      if (wasTeacher) this.clearCachedClassroomRecords();
      // 學生端（或教師登出後）自動改用匿名身分，維持寫入自己學習紀錄的權限
      if (!user && this.auth && this.authModule) {
        try {
          await this.authModule.signInAnonymously(this.auth);
        } catch (err) {
          console.warn("匿名登入失敗：", err);
        }
      }
    }

    if (wasTeacher !== isTeacher && typeof this._lastAuthChangeCb === "function") {
      this._lastAuthChangeCb(isTeacher);
    }
  }

  // 教師登出時清除本機快取的全班資料（避免共用電腦留下學生紀錄），只保留目前學生自己的紀錄
  clearCachedClassroomRecords() {
    this.liveRecords = {};
    if (this.profile) {
      const myRec = this.buildCurrentStudentRecord();
      if (myRec) this.liveRecords[myRec.docId] = myRec;
    }
    this.selectedStudentDetailId = null;
    this.saveLocalClassroomRecords();
  }

  async teacherSignIn(email, password) {
    if (!this.auth || !this.authModule) {
      return { ok: false, message: "⚠️ 尚未連線 Firebase 雲端，無法進行教師驗證，請確認網路連線後重新整理頁面。" };
    }
    if (!this.isTeacherEmail(email)) {
      return { ok: false, message: "❌ 此電子郵件不是本課程的教師帳號。" };
    }
    try {
      await this.authModule.signInWithEmailAndPassword(this.auth, email.trim(), password);
      return { ok: true };
    } catch (err) {
      const code = err?.code || "";
      const message =
        code === "auth/too-many-requests"
          ? "⚠️ 嘗試次數過多，帳號已被 Firebase 暫時鎖定，請稍後再試或使用「忘記密碼」重設。"
          : code === "auth/network-request-failed"
          ? "⚠️ 網路連線失敗，請檢查網路後再試。"
          : "❌ 電子郵件或密碼不正確，請重新確認。";
      return { ok: false, message };
    }
  }

  async teacherSignOut() {
    if (this.auth && this.authModule) {
      await this.authModule.signOut(this.auth);
    } else {
      this.teacherUnlocked = false;
    }
  }

  async teacherSendPasswordReset(email) {
    if (!this.auth || !this.authModule) {
      return { ok: false, message: "⚠️ 尚未連線 Firebase 雲端。" };
    }
    if (!this.isTeacherEmail(email)) {
      return { ok: false, message: "❌ 請先在上方輸入正確的教師電子郵件。" };
    }
    try {
      await this.authModule.sendPasswordResetEmail(this.auth, email.trim());
      return { ok: true, message: `📧 已寄出密碼重設信到 ${email.trim()}，請到信箱（含垃圾郵件匣）點連結重設密碼。` };
    } catch (err) {
      return { ok: false, message: `⚠️ 寄送失敗：${err?.code || err?.message || err}` };
    }
  }

  // 教師重設某位學生的 PIN（清除雲端 PIN 雜湊，學生下次登入可設定新 PIN 並接回原紀錄）
  async resetStudentPin(docId) {
    const rec = this.liveRecords[docId];
    if (rec) {
      delete rec.pinHash;
      rec.pinCode = "";
      this.saveLocalClassroomRecords();
    }
    if (!this.teacherUnlocked || !this.isCloudConnected || !this.db || !this.firestoreModule) {
      return { ok: false };
    }
    try {
      const { doc, setDoc, deleteField } = this.firestoreModule;
      await setDoc(
        doc(this.db, "ntc_elec_students", docId),
        { pinHash: deleteField(), pinCode: "", pinResetAt: new Date().toISOString() },
        { merge: true }
      );
      return { ok: true };
    } catch (err) {
      console.warn("重設學生 PIN 失敗：", err);
      return { ok: false, message: err?.message || String(err) };
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
      const appMod = await import(`${FIREBASE_SDK}/firebase-app.js`);
      const fsMod = await import(`${FIREBASE_SDK}/firebase-firestore.js`);
      this.firestoreModule = fsMod;

      const existingApps = appMod.getApps();
      const fbApp = existingApps.length
        ? existingApps[0]
        : appMod.initializeApp(this.firebaseConfig);

      // Firebase Authentication：學生自動匿名登入；教師以電子郵件／密碼登入（安全規則依此判斷權限）
      try {
        const authMod = await import(`${FIREBASE_SDK}/firebase-auth.js`);
        const auth = authMod.getAuth(fbApp);
        this.authModule = authMod;
        this.auth = auth;
        await auth.authStateReady();
        if (!auth.currentUser) {
          await authMod.signInAnonymously(auth);
        }
        authMod.onAuthStateChanged(auth, (user) => this.handleAuthStateChanged(user));
      } catch (err) {
        console.warn("Firebase 驗證初始化失敗（請確認已啟用「匿名」登入）：", err);
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
      // 全班即時監聽只在教師登入後啟動（由 handleAuthStateChanged 負責）
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
      // 雲端只存 PIN 雜湊碼；pinCode 欄位清空（相容並清除舊版明文 PIN）
      ...(this.profile.pinCode ? { pinHash: hashStudentPin(docId, this.profile.pinCode) } : {}),
      pinCode: "",
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
      // 驗證 PIN 碼（新版比對雜湊碼；舊版紀錄比對明文；教師重設後兩者皆空則允許設定新 PIN）
      const pinMismatch = existing.pinHash
        ? existing.pinHash !== hashStudentPin(docId, pinCode)
        : Boolean(existing.pinCode && existing.pinCode !== pinCode);
      if (pinMismatch) {
        return {
          ok: false,
          message: `⚠️ 「${yr} ${className} ${paddedSeat}號」已由「${existing.studentName}」設定個人通行碼（PIN），請輸入正確的 4 碼通行碼，或確認學年度／座號是否填錯！忘記 PIN 請找老師在戰情室按「🔄 重設 PIN」。`
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
    if (!this.isCloudConnected || !this.db || !this.firestoreModule || !this.teacherUnlocked) return;
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
            if (docSnap.id.startsWith("__")) return; // 略過系統文件
            if (data && data.docId && data.seatNo && data.studentName) {
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
  renderTeacherWarRoom(container, onAuthStateChange = null) {
    if (typeof onAuthStateChange === "function") {
      this._lastAuthChangeCb = onAuthStateChange;
    }
    const triggerAuthChange = () => {
      if (typeof this._lastAuthChangeCb === "function") {
        this._lastAuthChangeCb(this.teacherUnlocked);
      } else {
        this.renderTeacherWarRoom(container);
      }
    };

    container.innerHTML = "";
    const box = document.createElement("div");
    box.className = "section-card war-room-card";

    const cloudStatusBadge = this.isCloudConnected
      ? `<span class="war-status-pill is-online">🟢 Firebase (Firestore) 雲端即時同步連線中（專案：${this.firebaseConfig.projectId}）</span>`
      : `<span class="war-status-pill is-local">🟡 本機／同網域預覽模式（點右側「⚙️ Firebase 雲端設定」即可開啟跨裝置全班即時同步）</span>`;

    // 若尚未解鎖教師戰情室，要求以 Firebase Authentication「教師電子郵件 ＋ 密碼」登入
    if (!this.teacherUnlocked) {
      box.innerHTML = `
        <div class="war-room-header">
          <div>
            <h3 style="margin:0;">🔐 教師專區驗證（全班戰情室 ＆ 教師備課解答）</h3>
            <p class="wk-muted wk-small" style="margin:4px 0 0;">
              為保護全班學生學習歷程隱私與隨讀題解答，請以教師電子郵件與密碼登入（由 Firebase 官方驗證）。
            </p>
          </div>
          ${cloudStatusBadge}
        </div>
        <div class="war-auth-box" style="max-width:560px;">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
            <div>
              <label class="wk-bold wk-small" for="teacher-account-input">📧 教師電子郵件</label>
              <input
                type="email"
                id="teacher-account-input"
                class="input-field"
                value=""
                autocomplete="username"
                placeholder="請輸入教師電子郵件"
                style="width:100%; margin-top:4px;"
              />
            </div>
            <div>
              <label class="wk-bold wk-small" for="teacher-pin-input">🔑 教師密碼</label>
              <div style="display:flex; gap:6px; margin-top:4px;">
                <input
                  type="password"
                  id="teacher-pin-input"
                  class="input-field"
                  value=""
                  autocomplete="current-password"
                  placeholder="請輸入教師密碼"
                  style="flex:1;"
                />
                <button type="button" class="btn btn-sm" id="btn-toggle-pwd-vis" title="顯示或隱藏密碼">👁️</button>
              </div>
            </div>
          </div>
          <div class="wk-btn-row" style="margin-top:12px;">
            <button type="button" class="btn btn-primary" id="btn-unlock-war-room">🔓 登入教師後台</button>
            <button type="button" class="btn" id="btn-teacher-forgot-pwd">❓ 忘記密碼</button>
          </div>
          <p id="teacher-auth-err" class="wk-feedback error" style="display:none; margin-top:8px;"></p>
        </div>
      `;
      container.appendChild(box);

      const accInput = box.querySelector("#teacher-account-input");
      const pwdInput = box.querySelector("#teacher-pin-input");
      const toggleVisBtn = box.querySelector("#btn-toggle-pwd-vis");
      const errEl = box.querySelector("#teacher-auth-err");
      const showMsg = (text, isError = true) => {
        if (!errEl) return;
        errEl.style.display = "block";
        errEl.className = `wk-feedback ${isError ? "error" : "ok"}`;
        errEl.textContent = text;
      };

      toggleVisBtn?.addEventListener("click", () => {
        if (!pwdInput) return;
        const isPwd = pwdInput.type === "password";
        pwdInput.type = isPwd ? "text" : "password";
        toggleVisBtn.textContent = isPwd ? "🙈" : "👁️";
      });

      const loginBtn = box.querySelector("#btn-unlock-war-room");
      const handleLogin = async () => {
        const email = accInput?.value.trim() || "";
        const pwd = pwdInput?.value || "";
        if (!email || !pwd) {
          showMsg("⚠️ 請同時輸入「教師電子郵件」與「教師密碼」。");
          return;
        }
        if (loginBtn) loginBtn.disabled = true;
        showMsg("⏳ 驗證中…", false);
        const res = await this.teacherSignIn(email, pwd);
        if (loginBtn) loginBtn.disabled = false;
        if (res.ok) {
          if (this.app) this.app.showToast("✅ 教師身分驗證成功！已解鎖全班即時戰情室與備課解答。");
          // 畫面切換由 onAuthStateChanged → handleAuthStateChanged 觸發
        } else {
          showMsg(res.message);
        }
      };

      box.querySelector("#btn-teacher-forgot-pwd")?.addEventListener("click", async () => {
        const res = await this.teacherSendPasswordReset(accInput?.value || "");
        showMsg(res.message, !res.ok);
      });

      loginBtn?.addEventListener("click", handleLogin);
      accInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleLogin();
      });
      pwdInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleLogin();
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
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn btn-sm" id="btn-reset-student-pin" data-docid="${detailStudent.docId}" title="清除此座號的雲端 PIN 碼，學生忘記 PIN 時點此即可讓學生重新自訂">🔄 重設 PIN 碼</button>
            <button type="button" class="btn btn-sm" id="btn-close-student-detail">✕ 收合明細</button>
          </div>
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
          <button type="button" class="btn" id="btn-lock-war-room" title="登出並鎖定教師後台與備課解答">🔒 登出教師後台</button>
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

    box.querySelector("#btn-lock-war-room")?.addEventListener("click", async () => {
      await this.teacherSignOut();
      if (this.app) {
        this.app.showToast("🔒 已登出並鎖定教師後台與備課解答。");
      }
      triggerAuthChange();
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

    box.querySelector("#btn-reset-student-pin")?.addEventListener("click", async (e) => {
      const docId = e.currentTarget.dataset.docid;
      if (!docId) return;
      const rec = this.liveRecords[docId];
      const name = rec ? `${rec.className} ${rec.seatNo}號 ${rec.studentName}` : docId;
      if (confirm(`確定要為「${name}」重設 PIN 碼嗎？\n重設後該座號先前的 PIN 碼將被清除，學生下次登入時可重新自訂新的 4 碼 PIN 碼並接續作答。`)) {
        const res = await this.resetStudentPin(docId);
        if (res.ok) {
          if (this.app) this.app.showToast(`✅ 已重設「${name}」的 PIN 碼！`);
          this.renderTeacherWarRoom(container);
        } else {
          alert("重設失敗：" + (res.message || "未知錯誤"));
        }
      }
    });
  }
}
