// ============================================================================
// 基本電學練工坊｜Firebase (Firestore) 雲端資料庫設定檔
// ============================================================================
// 💡 使用說明：
// 1. 您可以在網站內的「👨‍🏫 教師引導 → 📡 全班戰情室 → ⚙️ Firebase 雲端設定」直接貼上設定並測試連線；
// 2. 若要讓全班學生打開 GitHub Pages 網址就自動連上您的資料庫（免個別設定），
//    請將您在 Firebase Console 取得的 firebaseConfig 填入下方欄位，並推送至 GitHub 即可！
// ============================================================================

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhamHPMCBjGQMpxTtX43JLcPab7QfsTgg",
  authDomain: "classtool1141019.firebaseapp.com",
  projectId: "classtool1141019",
  storageBucket: "classtool1141019.firebasestorage.app",
  messagingSenderId: "864195851107",
  appId: "1:864195851107:web:de3fd1a48896528b145956"
};

// 預設學年度清單（避免跨年度同班名「汽車二」資料混淆，每筆紀錄皆以「學年度_班級_座號」獨立建檔）
export const CURRENT_SCHOOL_YEAR = "115學年度";
export const DEFAULT_SCHOOL_YEARS = [
  "115學年度",
  "114學年度",
  "116學年度",
  "117學年度",
  "118學年度"
];

// 本校專屬三個班級（本課程固定開設於「汽車二」，預設直接鎖定「汽車二」）
export const DEFAULT_CLASSES = [
  "汽車二",
  "汽車三",
  "汽車一"
];

export const CLASS_DISPLAY_LABELS = {
  "汽車二": "汽車二（本課程修課班級）",
  "汽車三": "汽車三（學長姐複習／檢定補強）",
  "汽車一": "汽車一（學弟妹先修體驗）"
};

// 教師帳號白名單（Firebase Authentication 電子郵件／密碼登入）
// ⚠️ 真正的權限控管在 Firestore 安全規則中（規則內的 isTeacher() 也必須列出相同信箱）
// 密碼由 Firebase 官方管理，不存放在本網站任何程式碼中
export const TEACHER_EMAILS = ["lin1102@gm.ntc.edu.tw"];

