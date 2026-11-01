// ============================================================================
// 基本電學練工坊｜Firebase (Firestore) 雲端資料庫設定檔
// ============================================================================
// 💡 使用說明：
// 1. 您可以在網站內的「👨‍🏫 教師引導 → 📡 全班戰情室 → ⚙️ Firebase 雲端設定」直接貼上設定並測試連線；
// 2. 若要讓全班學生打開 GitHub Pages 網址就自動連上您的資料庫（免個別設定），
//    請將您在 Firebase Console 取得的 firebaseConfig 填入下方欄位，並推送至 GitHub 即可！
// ============================================================================

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "",            // 例如: "AIzaSyA1234567890abcdefghijklmnop"
  authDomain: "",        // 例如: "ntc-elec-workshop.firebaseapp.com"
  projectId: "",         // 例如: "ntc-elec-workshop"
  storageBucket: "",     // 例如: "ntc-elec-workshop.firebasestorage.app"
  messagingSenderId: "", // 例如: "123456789012"
  appId: ""              // 例如: "1:123456789012:web:abcdef1234567890"
};

// 預設學年度清單（避免跨年度同班名如「汽車二甲」資料混淆，每筆紀錄皆以「學年度_班級_座號」獨立建檔）
export const CURRENT_SCHOOL_YEAR = "115學年度";
export const DEFAULT_SCHOOL_YEARS = [
  "114學年度",
  "115學年度",
  "116學年度",
  "117學年度",
  "118學年度"
];

// 預設班級清單（學生登入下拉選單快速選擇，亦可手動輸入其他班級）
export const DEFAULT_CLASSES = [
  "汽車一甲",
  "汽車一乙",
  "汽車二甲",
  "汽車二乙",
  "建教一甲",
  "展示體驗班"
];

// 預設教師後台管理密碼（可在教師後台介面中修改）
export const DEFAULT_TEACHER_PIN = "ntc2026";
