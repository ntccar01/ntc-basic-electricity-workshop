// 基本電學探索島｜18 週學期地圖與第 1 週（CH3 p.68–70）課本導讀、畫重點、SVG 圖解、7 種互動題型、電路模擬器與教師引導模組

export const COURSE = {
  version: "2026-10-28-w1-v5",
  title: "基本電學探索島",
  weeks: [
    { id: 1, islandId: "island-03", islandName: "第 3 課：串聯電路", title: "讓車燈亮起來", source: "CH3 p.68–70", status: "open", lessons: ["電路的四個部分", "通路、斷路與短路"], goal: "能辨認電源、導線、開關、負載，並判斷車燈不亮的原因。" },
    { id: 2, islandId: "island-01", islandName: "第 1 課：電的基本認識", title: "電荷與電子", source: "CH1 p.2–12", status: "planned", lessons: ["原子、電子與導體", "電荷與靜電"], goal: "能用圖解說明電荷移動與靜電現象。" },
    { id: 3, islandId: "island-01", islandName: "第 1 課：電的基本認識", title: "單位與電壓", source: "CH1 p.5–7、13–18", status: "planned", lessons: ["常用電學單位", "電壓與兩點間的差"], goal: "能辨認電壓及其量測位置。" },
    { id: 4, islandId: "island-01", islandName: "第 1 課：電的基本認識", title: "電流", source: "CH1 p.19–21", status: "planned", lessons: ["電流的意義", "方向與簡單計算"], goal: "能分辨傳統電流與電子移動方向。" },
    { id: 5, islandId: "island-01", islandName: "第 1 課：電的基本認識", title: "電功率與電能", source: "CH1 p.22–29", status: "planned", lessons: ["車燈的功率", "電能與單元回顧"], goal: "能讀懂簡單電器標示與功率、時間的關係。" },
    { id: 6, islandId: "island-02", islandName: "第 2 課：電阻", title: "電阻與元件", source: "CH2 p.36–51", status: "planned", lessons: ["電阻限制電流", "電阻器與色碼"], goal: "能從實物與電路圖辨認電阻器。" },
    { id: 7, islandId: "island-02", islandName: "第 2 課：電阻", title: "歐姆定律入門", source: "CH2 p.48–56", status: "planned", lessons: ["溫度與電阻", "從讀值建立關係"], goal: "能判斷電壓、電流與電阻的變化。" },
    { id: 8, islandId: "island-02", islandName: "第 2 課：電阻", title: "歐姆定律解題板", source: "CH2 p.52–60", status: "planned", lessons: ["分步列式", "焦耳定律與補救"], goal: "能辨認已知量、列式並檢查單位。" },
    { id: 9, islandId: "island-03", islandName: "第 3 課：串聯電路", title: "串聯電路", source: "CH3 p.68–76", status: "planned", lessons: ["只有一條路", "串聯的電流與電阻"], goal: "能指出串聯電路的單一路徑。" },
    { id: 10, islandId: "island-03", islandName: "第 3 課：串聯電路", title: "沿路看電壓", source: "CH3 p.77–81", status: "planned", lessons: ["克希荷夫電壓定律", "電壓分配"], goal: "能沿迴路解釋電壓關係。" },
    { id: 11, islandId: "island-03", islandName: "第 3 課：串聯電路", title: "串聯故障診斷", source: "CH3 p.82–86", status: "planned", lessons: ["串聯應用", "故障判讀與回顧"], goal: "能根據現象選擇合理的檢查點。" },
    { id: 12, islandId: "island-04", islandName: "第 4 課：並聯電路", title: "並聯電路", source: "CH4 p.90–97", status: "planned", lessons: ["看出分支", "並聯的電壓與電流"], goal: "能指出並聯的不同支路。" },
    { id: 13, islandId: "island-04", islandName: "第 4 課：並聯電路", title: "分流與匯流", source: "CH4 p.98–102", status: "planned", lessons: ["克希荷夫電流定律", "電流分配"], goal: "能說明各支路電流如何形成總電流。" },
    { id: 14, islandId: "island-04", islandName: "第 4 課：並聯電路", title: "串並聯整合", source: "CH4 p.103–112", status: "planned", lessons: ["並聯應用", "簡單混合電路"], goal: "能先辨認連接方式再計算。" },
    { id: 15, islandId: "island-05", islandName: "第 5 課：電容與電感", title: "電容與電場", source: "CH5 p.122–146", status: "planned", lessons: ["電容器與充放電", "電場與電位的圖像"], goal: "能辨認電容器構造和儲能現象。" },
    { id: 16, islandId: "island-05", islandName: "第 5 課：電容與電感", title: "電感與磁", source: "CH5 p.147–171", status: "planned", lessons: ["電感器與磁場", "電磁現象與車用案例"], goal: "能描述電磁現象，較深計算依課程進度選用。" },
    { id: 17, islandId: "center-island", islandName: "中央島：基本電學練工坊", title: "彈性補救", source: "依班級進度", status: "planned", lessons: ["未完成站點", "常見錯誤修復"], goal: "依學習紀錄補強較弱的概念。" },
    { id: 18, islandId: "center-island", islandName: "中央島：基本電學練工坊", title: "整合任務", source: "CH1–CH5", status: "planned", lessons: ["車用電系綜合任務", "回顧與展示"], goal: "能依證據說明簡單電路的運作或故障。" }
  ]
};

export const WEEK01 = {
  1: {
    id: "w01-l01",
    version: 4,
    title: "電路的四個部分",
    subtitle: "一盞車燈為什麼會亮？",
    source: "基本電學 CH3，課本 p.68–69；本平台的車燈情境為原創教學示意。",
    goals: ["指出電源、導線、開關與負載", "在電路圖中畫出完整路徑", "用開關狀態預測燈泡是否亮起"],
    teacher: {
      guide: [
        { title: "先看現象", example: "車燈亮起來了。", talk: "先問學生：燈泡自己會亮嗎？需要哪些條件？" },
        { title: "電源提供能量", example: "以電池作為示意電源。", talk: "指出電池是供能元件，先不急著談公式。" },
        { title: "導線形成路徑", example: "用手指沿著線繞一圈。", talk: "請學生跟著畫線，確認是否能回到電源。" },
        { title: "開關控制連接", example: "開關打開時路徑中斷。", talk: "對照畫面中斷開與接通的形狀。" },
        { title: "負載產生作用", example: "燈泡把電能轉成光與熱。", talk: "這節只辨認角色，不討論耗電計算。" },
        { title: "完整路徑才運作", example: "電池→開關→燈泡→回到電池。", talk: "讓學生口說四個元件與一條完整的路。" }
      ],
      demoQuestion: "示範：電池、開關與小馬達接成一圈；開關打開時，小馬達會轉嗎？",
      demoSteps: ["先請全班預測，暫不公布。", "在示意圖上指出斷開處，再將開關接通。", "沿導線從電源出發、經過馬達，再回到電源。"],
      observe: ["學生是否把燈泡誤認為電源", "是否只看開關位置，沒有確認完整路徑", "能否說出電流需要閉合路徑"],
      exit: ["指出四個元件的角色", "用一句話解釋開關打開時為何不亮"]
    },
    concepts: [
      { title: "一盞燈需要一條路", text: "電源、導線、開關和燈泡接成完整的一圈，燈才有機會亮。", action: "先用手指沿著圖上的線走一圈。" },
      { title: "元件各有工作", text: "電源提供能量；導線連接；開關控制通斷；燈泡是負載。", action: "在課本 p.68 的電路圖中找出四種角色。" },
      { title: "開關斷開，路就中斷", text: "開關打開時，路徑不完整，燈泡不會亮。", action: "先預測，再使用下面的模擬開關驗證。" }
    ],
    tasks: [
      {
        id: "source",
        type: "choice",
        prompt: "下列哪個元件負責提供電能？",
        choices: [
          { id: "lamp", label: "燈泡", feedback: "燈泡是負載，會把電能轉成光與熱。" },
          { id: "battery", label: "電池", feedback: "對。電池是這張示意圖中的電源。" },
          { id: "wire", label: "導線", feedback: "導線負責連接，並不是電源。" }
        ],
        correct: "battery",
        hint: "回想：哪個元件在電路中扮演供能的角色？"
      },
      { id: "close", type: "sim", prompt: "把示意開關切換到「通路（接通）」，觀察燈泡是否亮起。", expected: "closed", hint: "看開關處：導線要連成完整的一圈。" },
      {
        id: "path",
        type: "choice",
        prompt: "電池和燈泡都有，但開關斷開。哪個說法最能解釋燈不亮？",
        choices: [
          { id: "used", label: "電流被燈泡用完了", feedback: "先看路徑。這時開關處已經斷開，無法形成完整迴路。" },
          { id: "bright", label: "燈泡太亮，所以停了", feedback: "題目沒有亮度變化；先看開關造成的路徑。" },
          { id: "open", label: "電路不成完整的一圈", feedback: "對。開關斷開使電路成為開路。" }
        ],
        correct: "open",
        hint: "用手指從電池沿導線走一圈，在哪裡停住？"
      },
      {
        id: "roles",
        type: "choice",
        prompt: "在這個車燈示意電路中，燈泡扮演什麼角色？",
        choices: [
          { id: "load", label: "負載：把電能轉成光與熱", feedback: "對。燈泡是負載。" },
          { id: "source", label: "電源：提供電能", feedback: "提供電能的是電池；再看燈泡的作用。" },
          { id: "switch", label: "開關：控制通斷", feedback: "控制通斷的是開關；再看燈泡的作用。" }
        ],
        correct: "load",
        hint: "想想燈泡亮起時，能量變成了什麼。"
      }
    ],
    reflection: "請完成一句話：開關斷開時，燈泡不亮，因為＿＿＿＿。",
    study: [
      {
        id: "parts",
        title: "先找出電路的四個部分",
        book: "CH3 p.68｜3-1.1「電路的組成」第一段",
        read: "請打開課本 p.68，先讀「一個電路通常包括……」這一段，再看圖 3-1。",
        core: ["電路的基本組成：電源、導線、開關、負載。", "先辨認每個元件的角色，再討論燈為何會亮。"],
        apply: "用手指在課本圖 3-1 中各指出一個元件。",
        mark: {
          strategy: "先看小標題「電路的組成」，再找第一段列出的四個名稱。只畫名稱，不把整段塗滿。",
          instruction: "用黃色螢光筆畫出四個組成名稱，並在旁邊寫「四部分」。",
          question: "這段最值得畫起來的是哪一組資訊？",
          choices: ["電源、導線、開關、負載", "英文單字的字母數量", "頁碼與章節裝飾"],
          correct: 0,
          wrong: "重點應直接回答小標題「電路由什麼組成」。",
          hint: "找能讓你回答「是哪四個部分」的文字。",
          explanation: "這四個名稱就是本段的核心清單。"
        },
        checks: [
          { id: "four", type: "choice", prompt: "哪一組完整列出課本說的四個部分？", choices: ["電源、導線、開關、負載", "電源、電阻、電壓、功率", "導線、電流、電壓、燈光"], correct: 0, wrong: "這一段在列「元件」，不是電學量。", hint: "回到第一段，找四個以頓號分開的名稱。", explanation: "四個部分是電源、導線、開關、負載。" },
          { id: "wirepart", type: "tf", prompt: "是非題：導線是電路基本組成的一部分。", correct: true, wrong: "再看第一段的四個名稱。", hint: "想想圖 3-1 中電池和燈泡靠什麼連起來。", explanation: "導線負責把元件連成路徑。" }
        ]
      },
      {
        id: "switchwire",
        title: "開關與導線各做什麼？",
        book: "CH3 p.68｜圖 3-1 標示①開關、②導線",
        read: "閱讀圖 3-1 左側的①與右上的②；特別看「接通或切斷」與「連接」這兩個動詞。",
        core: ["開關控制電路的接通或切斷。", "導線將元件連接成迴路，讓電流有路可走。", "開關打開時，路徑在開關處中斷。"],
        apply: "沿著課本圖 3-1 的線從電池出發，指出開關的位置。",
        mark: {
          strategy: "先看圖旁邊的說明文字，想想：開關可以做什麼？導線把哪些東西連起來？把元件名稱和它的工作一起畫起來。",
          instruction: "圈出圖 3-1 的①開關與②導線；分別畫出「控制通斷」和「連接成路徑」的意思。",
          question: "讀圖 3-1 時，哪一組是應該標記的重點？",
          choices: ["開關控制通斷；導線連接元件", "ON 和 OFF 字母的大小", "圖中的背景顏色"],
          correct: 0,
          wrong: "找能解釋元件工作的文字，不是圖的外觀。",
          hint: "問自己：拿掉這句，還能說明開關和導線的用途嗎？",
          explanation: "標記「元件＋作用」可幫你重新讀懂電路圖。"
        },
        checks: [
          { id: "switch", type: "choice", prompt: "要讓車燈的路徑接通或中斷，主要操作哪個元件？", choices: ["開關", "燈泡", "電池外殼"], correct: 0, wrong: "先找課本圖 3-1 的標示①。", hint: "哪個元件有 ON、OFF 兩種位置？", explanation: "開關控制電路通斷。" },
          { id: "wire", type: "tf", prompt: "是非題：導線的主要工作是把元件連接成路徑。", correct: true, wrong: "請再看標示②的文字。", hint: "導線連起的是哪些元件？", explanation: "導線負責連接，形成電流可走的路徑。" },
          { id: "switchmatch", type: "match", prompt: "配合題：把元件與工作配對。", pairs: [["開關", "控制通斷"], ["導線", "連接元件"]], options: ["控制通斷", "連接元件", "提供能量"], wrong: "至少有一個元件的工作配錯了。", hint: "先找 ON／OFF 對應的元件，再看剩下的連接工作。", explanation: "開關控制通斷；導線連接元件。" },
          {
            id: "roles-drag",
            type: "drag",
            prompt: "拖拉配對：把三種元件放到正確的工作旁。也可先點元件，再點放置區。",
            pairs: [["開關", "控制通斷"], ["導線", "連接元件"], ["電池", "提供電能"]],
            wrong: "至少有一個元件的工作不相符。請再看圖 3-1 的標示。",
            hint: "先找有 ON／OFF 的元件，再分辨連接與供能。",
            explanation: "開關控制通斷；導線連接元件；電池提供電能。"
          }
        ]
      },
      {
        id: "source-load",
        title: "電源與負載各做什麼？",
        book: "CH3 p.68｜圖 3-1 標示③電源、④負載",
        read: "閱讀圖 3-1 下方的③與④。注意圖中的電池是電源，燈泡是負載。",
        core: ["電源提供或轉換電能；此圖以電池示意。", "負載接收電能並完成工作；燈泡把電能轉成光與熱。", "同一元件在電路圖中的角色，須由它在此電路的作用判斷。"],
        apply: "說出「電池供能、燈泡發光」各對應哪個角色。",
        mark: {
          strategy: "先辨認③與④，再找「誰提供、誰接收」的對比詞。",
          instruction: "圈出圖 3-1 的③電源與④負載；用兩種顏色分別畫出「提供電能」與「接收電能做功」。",
          question: "哪一組詞最能幫你分清電源和負載？",
          choices: ["提供電能／接收電能", "左邊／右邊", "大圖／小圖"],
          correct: 0,
          wrong: "元件角色要看作用，不看畫在圖的哪一側。",
          hint: "在課本圖說找出「提供」與「接收」的對比。",
          explanation: "用供能與用能區分電源、負載。"
        },
        checks: [
          { id: "source", type: "choice", prompt: "課本圖 3-1 中，電池屬於哪個部分？", choices: ["電源", "負載", "開關"], correct: 0, wrong: "先看標示③的說明。", hint: "哪個角色負責供應電能？", explanation: "電池在這張圖中扮演電源。" },
          { id: "load", type: "choice", prompt: "燈泡亮起，主要是把電能轉成什麼？", choices: ["光與熱", "更多電池", "導線"], correct: 0, wrong: "想想眼睛看見什麼，摸到可能感到什麼。", hint: "燈泡是一種負載，會產生光，也可能發熱。", explanation: "燈泡把電能轉成光與熱。" },
          { id: "sourcematch", type: "match", prompt: "配合題：把課本圖中的例子配上角色。", pairs: [["電池", "電源"], ["燈泡", "負載"]], options: ["電源", "負載", "開關"], wrong: "請回到標示③、④。", hint: "誰供應能量？誰接收能量並發光？", explanation: "電池是電源；燈泡是負載。" }
        ]
      },
      {
        id: "active-passive",
        title: "主動元件與被動元件",
        book: "CH3 p.68｜頁面下方「Fun 電一下：主動元件與被動元件」",
        read: "閱讀 p.68 下方藍色方框。先找「供給或放大能量」與「消耗或儲存能量」兩句。",
        core: ["課本將供給或放大能量的元件列為主動元件，例如電池。", "課本將消耗或儲存能量的元件列為被動元件，例如電阻器與電容器。", "這裡先辨認例子，暫不做複雜分類計算。"],
        apply: "在方框中圈出一個主動元件與一個被動元件的例子。",
        mark: {
          strategy: "讀兩行定義時先畫對比：主動元件和被動元件處理能量的方式不同。",
          instruction: "在 p.68 藍色方框，用兩色畫出「供給或放大」與「消耗或儲存」，再各圈一個例子。",
          question: "這個方框最應該抓住哪一組對比？",
          choices: ["供給或放大／消耗或儲存", "藍色／白色", "英文／中文"],
          correct: 0,
          wrong: "找能用來分類元件的條件。",
          hint: "找兩行定義中描述「能量」的動詞。",
          explanation: "關鍵動詞能幫你判斷兩類元件。"
        },
        checks: [
          { id: "active", type: "choice", prompt: "依課本方框，哪個是主動元件的例子？", choices: ["電池", "電阻器", "電容器"], correct: 0, wrong: "回到方框的第一行找例子。", hint: "哪個例子能供給電路能量？", explanation: "電池是課本列出的主動元件例子。" },
          { id: "passive", type: "tf", prompt: "是非題：電阻器是課本列出的被動元件例子。", correct: true, wrong: "請看方框的第二行。", hint: "被動元件可消耗或儲存能量。", explanation: "電阻器屬於課本列出的被動元件。" },
          { id: "activematch", type: "match", prompt: "配合題：把課本的兩類元件配上主要描述。", pairs: [["主動元件", "供給或放大能量"], ["被動元件", "消耗或儲存能量"]], options: ["供給或放大能量", "消耗或儲存能量", "控制通斷"], wrong: "再對照方框的兩句定義。", hint: "先找「供給」屬於哪一類。", explanation: "主動元件供給或放大能量；被動元件消耗或儲存能量。" },
          {
            id: "active-classify",
            type: "classify",
            prompt: "分類題：把課本方框中的例子放進主動元件或被動元件。",
            categories: ["主動元件", "被動元件"],
            items: ["電池", "電阻器", "電容器"],
            correct: { "電池": "主動元件", "電阻器": "被動元件", "電容器": "被動元件" },
            wrong: "請再用「供給能量」與「消耗或儲存能量」區分。",
            hint: "先把供給電能的例子放入主動元件，其餘再看課本第二行。",
            explanation: "電池是主動元件；電阻器與電容器是被動元件。"
          }
        ]
      },
      {
        id: "diagram",
        title: "從實物圖讀到電路圖",
        book: "CH3 p.68｜圖 3-1 右側「電路圖」",
        read: "比較圖 3-1 左側的實物連接圖和右側的簡化電路圖，找出電池、開關與燈泡。",
        core: ["電路圖用符號簡化實物連接，方便追蹤路徑。", "圖 3-1 的電池、開關、燈泡在兩種畫法中角色相同。", "看電路圖時，先沿導線找完整路徑，再判斷燈能否運作。"],
        apply: "用手指在右側電路圖走一圈，再回到左側找對應實物。",
        mark: {
          strategy: "讀圖不只看符號；先找左右兩圖相同的元件，再沿導線追蹤路徑。",
          instruction: "用色筆在圖 3-1 左右兩圖，各圈出電源、開關、燈泡；以同色連結相對應的元件。",
          question: "比較實物圖與電路圖，最該找的是什麼？",
          choices: ["兩圖對應的元件與連接路徑", "哪張圖比較漂亮", "每個圖框的大小"],
          correct: 0,
          wrong: "比較兩圖是為了讀懂電路，不是比較畫風。",
          hint: "回想本節四個部分，兩張圖中能不能各找到它們？",
          explanation: "找到對應元件，才能把實物連接轉成電路符號。"
        },
        checks: [
          { id: "diagram-tf", type: "tf", prompt: "是非題：電路圖與實物圖畫法不同，但可以表示同一組連接。", correct: true, wrong: "比較圖 3-1 的左右兩種畫法。", hint: "右側只是把左側的元件改用符號畫出來。", explanation: "兩種圖可表示同一個電路。" },
          { id: "diagram-route", type: "choice", prompt: "看電路圖時，第一步最適合做什麼？", choices: ["沿導線找出路徑與元件", "只看燈泡畫得大不大", "先猜功率數字"], correct: 0, wrong: "這節的目標是辨認組成與路徑。", hint: "從電源出發，用手指沿線走一圈。", explanation: "先找路徑和元件，才容易判斷電路狀態。" }
        ]
      }
    ]
  },
  2: {
    id: "w01-l02",
    version: 4,
    title: "通路、斷路與短路",
    subtitle: "車燈不亮，要先查哪裡？",
    source: "基本電學 CH3，課本 p.69–70；短路僅以畫面模擬，不進行實體短接。",
    goals: ["分辨通路、斷路與短路", "說出短路為何危險", "依電路路徑選擇安全的檢查方向"],
    teacher: {
      guide: [
        { title: "同一張圖，三種狀態", example: "燈亮、斷線、旁路。", talk: "先看圖，不先給名稱。" },
        { title: "通路", example: "電流經過燈泡再回電源。", talk: "沿著完整路徑慢慢指出元件。" },
        { title: "斷路", example: "開關打開，路徑中斷。", talk: "問學生在何處走不過去。" },
        { title: "短路", example: "導線繞過燈泡，直接回到電源。", talk: "只用示意圖說明，不做實體短接。" },
        { title: "先看燈是否在路上", example: "有一條近路繞過燈泡。", talk: "區分『路斷了』與『有危險的近路』。" },
        { title: "檢查前先顧安全", example: "停止操作、請老師確認。", talk: "提醒學生短路可能造成過熱，不自行接線試驗。" }
      ],
      demoQuestion: "示範：電池、開關與小馬達的圖中，若有一段導線繞過馬達直接回電源，這是斷路還是短路？",
      demoSteps: ["先沿原本經過馬達的路徑畫一遍。", "再沿新出現的近路畫一遍，指出馬達被繞過。", "收束為短路的危險，不做實體示範。"],
      observe: ["是否把短路說成『路太短』而忽略負載被繞過", "是否把斷路與短路當成同一件事", "是否知道可疑短路時不能自行通電試驗"],
      exit: ["能用圖指出通路、斷路、短路", "能說出一項安全處置"]
    },
    concepts: [
      { title: "通路：正常的一圈", text: "路徑完整，而且電流會經過燈泡。", action: "切到「通路」，沿線指出燈泡。" },
      { title: "斷路：路被切開", text: "開關打開或導線斷開，電路無法形成完整的一圈。", action: "切到「斷路」，找出中斷處。" },
      { title: "短路：危險的近路", text: "導線繞過燈泡，讓電源兩端經低阻路徑相連，可能產生過大電流與過熱。", action: "只觀察模擬圖，不要實際短接電源。" }
    ],
    tasks: [
      {
        id: "open",
        type: "choice",
        prompt: "開關打開，導線沒有接成一圈。這是哪一種狀態？",
        choices: [
          { id: "short", label: "短路", feedback: "短路是出現繞過負載的低阻近路；這張圖是開關處中斷。" },
          { id: "open", label: "斷路", feedback: "對。電路在開關處中斷。" },
          { id: "closed", label: "通路", feedback: "通路需要完整的一圈；目前開關斷開。" }
        ],
        correct: "open",
        hint: "先問：線有沒有接成完整的一圈？"
      },
      { id: "bypass", type: "sim", prompt: "切換到「短路示意」，找出繞過燈泡的近路。這只是畫面模擬。", expected: "short", hint: "觀察是否有導線從電源出發，不經過燈泡就回到電源。" },
      {
        id: "difference",
        type: "choice",
        prompt: "斷路與短路最大的不同是什麼？",
        choices: [
          { id: "same", label: "兩者都是線斷掉", feedback: "短路不是斷線，而是出現繞過負載的低阻近路。" },
          { id: "size", label: "只看導線長短", feedback: "重點是路徑是否中斷，或是否繞過負載。" },
          { id: "route", label: "斷路是中斷；短路是繞過負載的近路", feedback: "對。先沿著導線找路徑，就容易分辨。" }
        ],
        correct: "route",
        hint: "分別用手指在兩張圖上找：哪一張走不通？哪一張繞過燈泡？"
      },
      {
        id: "safety",
        type: "choice",
        prompt: "懷疑電路短路時，下列哪個做法比較安全？",
        choices: [
          { id: "stop", label: "停止操作並請老師確認", feedback: "對。先停止操作，再依教師指示檢查。" },
          { id: "bridge", label: "用導線直接跨接電池兩端試試看", feedback: "這可能造成大電流與過熱，不能這樣測試。" },
          { id: "touch", label: "通電時用手摸導線找熱點", feedback: "不可在通電狀態用手觸碰可疑導線。" }
        ],
        correct: "stop",
        hint: "先考慮：哪個做法不會增加短路風險？"
      }
    ],
    reflection: "請完成一句話：斷路是＿＿＿＿；短路是＿＿＿＿。",
    study: [
      {
        id: "closed",
        title: "通路：電流走得完整",
        book: "CH3 p.69｜①「通路」與圖 3-2(a)",
        read: "讀 p.69 第①點，沿圖 3-2(a) 從電源、開關、負載，再回到電源。",
        core: ["通路是完整的電流路徑。", "電流經過開關與負載，回到電源，負載才能正常運作。"],
        apply: "在圖 3-2(a) 上指出電流經過的負載。",
        mark: {
          strategy: "先找狀態名稱，再找能回答「電流經過哪裡、最後到哪裡」的路徑詞。",
          instruction: "畫出 p.69 第①點「經過負載並回到電源」的意思；圈出圖 3-2(a) 的負載。",
          question: "哪一組資訊能幫你判斷圖 (a) 是通路？",
          choices: ["路徑完整、經過負載、回到電源", "圖中的線畫得很方正", "開關旁有英文字母"],
          correct: 0,
          wrong: "要找電流走的路，而不是圖的形狀。",
          hint: "找「經過」與「回到」後面的元件。",
          explanation: "通路的判斷依據是完整且經過負載的路徑。"
        },
        checks: [
          { id: "closed-tf", type: "tf", prompt: "是非題：通路中的電流會經過負載並回到電源。", correct: true, wrong: "再沿圖 3-2(a) 的線走一圈。", hint: "看第①點「經過」哪些元件。", explanation: "通路完整，電流經過負載。" },
          { id: "closed-choice", type: "choice", prompt: "圖 3-2(a) 中，負載正常運作的關鍵是什麼？", choices: ["路徑完整且經過負載", "開關打開", "導線繞過負載"], correct: 0, wrong: "請看第①點的「完成電流的循環」。", hint: "路徑是否連成一圈？有沒有經過負載？", explanation: "完整且經過負載的路徑是通路。" },
          {
            id: "route-order",
            type: "order",
            prompt: "順序題：依圖 3-2(a)，把電流經過的位置排成一圈。",
            items: ["負載", "電源正端", "電源負端", "開關"],
            correct: ["電源正端", "開關", "負載", "電源負端"],
            wrong: "再從電源正端出發，沿圖上的導線走一圈。",
            hint: "開關在負載之前；最後回到電源負端。",
            explanation: "從電源正端出發，經開關、負載，回到電源負端。"
          }
        ]
      },
      {
        id: "open",
        title: "斷路：路徑在某處中斷",
        book: "CH3 p.69｜②「斷路或開路」與圖 3-2(b)(c)",
        read: "讀 p.69 第②點，對照圖 3-2(b) 的開關打開與 (c) 的元件損壞。",
        core: ["開關打開、跳脫、元件損壞或斷線，都可能造成斷路。", "斷路時沒有完整迴路，負載無法正常運作。", "先在圖上指出中斷的位置。"],
        apply: "分別指一指圖 3-2(b) 與 (c) 的中斷處。",
        mark: {
          strategy: "抓「原因→結果」：什麼地方斷了？負載因此會怎樣？",
          instruction: "在 p.69 第②點圈出開關打開、元件損壞或斷線等原因，畫出「負載無法正常運作」的結果。",
          question: "哪一組最像本段的「原因→結果」？",
          choices: ["路徑中斷 → 負載無法正常運作", "燈泡很大 → 電池變小", "圖 (b) 在圖 (c) 左邊"],
          correct: 0,
          wrong: "找造成斷路的原因，以及它對負載的影響。",
          hint: "先找「斷」在哪裡，再看負載能否運作。",
          explanation: "因果一起標，才不會只背「斷路」兩個字。"
        },
        checks: [
          { id: "open-cause", type: "choice", prompt: "下列哪件事可能使電路斷路？", choices: ["導線斷掉", "導線繞過負載", "電池外殼顏色改變"], correct: 0, wrong: "斷路的重點是路徑中斷。", hint: "想像用手指沿線走，在哪裡會走不過去？", explanation: "斷線會讓路徑中斷。" },
          { id: "open-tf", type: "tf", prompt: "是非題：只要有電池，開關打開時負載仍會正常運作。", correct: false, wrong: "再看看圖 3-2(b) 的開關位置。", hint: "有電源也需要完整路徑。", explanation: "開關打開形成斷路，負載無法正常運作。" },
          { id: "open-match", type: "match", prompt: "配合題：把圖 3-2 的情況配上原因。", pairs: [["圖 (b)", "開關打開"], ["圖 (c)", "元件損壞"]], options: ["開關打開", "元件損壞", "繞過負載"], wrong: "請直接對照圖 (b) 與 (c) 的斷開位置。", hint: "一張斷在開關，一張斷在負載附近。", explanation: "圖 (b) 是開關打開；圖 (c) 是元件損壞。" }
        ]
      },
      {
        id: "short",
        title: "短路：有危險的低阻近路",
        book: "CH3 p.69｜③「短路」與圖 3-2(d)",
        read: "讀 p.69 第③點，找出圖 3-2(d) 紅色導線；注意它沒有經過負載。",
        core: ["短路時電流不經過原本的負載，而走低阻的旁路。", "電流可能變得很大，造成導線過熱、電源損壞甚至火災。", "只能用圖和模擬器觀察，不可實際短接電源。"],
        apply: "在圖 3-2(d) 指出紅色近路，說明它繞過哪個元件。",
        mark: {
          strategy: "用三個問題找重點：有沒有經過負載？走了哪條近路？可能造成什麼後果？",
          instruction: "圈出圖 3-2(d) 的紅色旁路；在第③點畫出「不經負載」「低阻近路」「電流可能過大」三個關鍵意思。",
          question: "哪一組資訊最能解釋短路的危險？",
          choices: ["繞過負載、低阻近路、電流可能過大", "紅線比黑線好看", "圖 (d) 排在最後"],
          correct: 0,
          wrong: "找路徑變化和可能後果。",
          hint: "短路不只是「線很短」，還要看負載是否被繞過。",
          explanation: "這三個意思連在一起，才能說明短路原因與風險。"
        },
        checks: [
          { id: "short-route", type: "choice", prompt: "圖 3-2(d) 的紅色路徑繞過了什麼？", choices: ["負載", "電源", "整張課本"], correct: 0, wrong: "紅線在負載前就直接往回接。", hint: "看圖右側 R 有沒有在紅線的路徑上。", explanation: "紅色近路繞過負載。" },
          { id: "short-tf", type: "tf", prompt: "是非題：短路與斷路都是「導線斷掉」。", correct: false, wrong: "再比較第②點與第③點。", hint: "短路多出近路；斷路是原本的路中斷。", explanation: "短路是低阻近路，斷路是路徑中斷。" },
          { id: "short-effect", type: "choice", prompt: "短路為什麼危險？", choices: ["電流可能過大並使導線過熱", "燈泡會自動變成電池", "電路會永遠沒有電流"], correct: 0, wrong: "找第③點對導線與電源的警告。", hint: "想想低阻路徑可能讓電流如何變化。", explanation: "過大電流可能導致過熱與損壞。" },
          {
            id: "short-eliminate",
            type: "eliminate",
            prompt: "消除題：點掉兩個不正確的短路說法，留下可用來判斷短路的描述。",
            options: ["出現繞過負載的低阻近路", "短路就是導線斷掉", "電流可能異常大", "可以直接跨接電池兩端試驗"],
            eliminate: [1, 3],
            wrong: "應保留能描述短路路徑與後果的說法，消除錯誤或危險的說法。",
            hint: "斷路與短路不同；不可用實體短接來驗證。",
            explanation: "短路有繞過負載的近路，電流可能過大；直接短接電源很危險。"
          }
        ]
      },
      {
        id: "compare",
        title: "把三種狀態放在一起比較",
        book: "CH3 p.69｜圖 3-2(a)–(d) 與「範例 1」",
        read: "先看圖 3-2 四個小圖，再讀範例 1 的三種情況。這裡先判讀狀態，不要求算出範例中的電流。",
        core: ["通路：完整路徑經過負載。", "斷路：路徑中斷，電流不能正常流通。", "短路：低阻近路繞過負載，電流可能異常大。"],
        apply: "在圖 3-2(a)、(b)、(d) 各用一句話說出判斷依據。",
        mark: {
          strategy: "比較圖時先找相同的觀察項目：路徑有沒有斷？是否經過負載？",
          instruction: "在圖 3-2(a)、(b)、(d) 各圈出通路、斷路、短路的關鍵位置，旁邊各寫一個判斷詞。",
          question: "三張圖都應該用哪兩個問題比較？",
          choices: ["路徑是否中斷？是否繞過負載？", "圖有幾種顏色？字體多大？", "哪張圖排第一？哪張排最後？"],
          correct: 0,
          wrong: "比較要用同一組與電路運作有關的標準。",
          hint: "想想通路、斷路、短路差在「路」的哪裡。",
          explanation: "用相同判斷標準看三張圖，才能真正分辨。"
        },
        checks: [
          { id: "compare-match", type: "match", prompt: "配合題：狀態與判斷依據。", pairs: [["通路", "經過負載的完整路徑"], ["斷路", "路徑中斷"], ["短路", "低阻近路繞過負載"]], options: ["經過負載的完整路徑", "路徑中斷", "低阻近路繞過負載"], wrong: "先看路徑是否斷掉，再看是否繞過負載。", hint: "三種狀態分別是完整、中斷、近路。", explanation: "能用路徑判斷，才不會只憑燈亮不亮猜。" },
          { id: "compare-dark", type: "choice", prompt: "燈不亮時，能只憑這個現象就斷定是短路嗎？", choices: ["不能，還要追查路徑", "可以，一定是短路", "可以，一定是電池壞掉"], correct: 0, wrong: "燈不亮也可能是斷路。", hint: "圖 (b) 和 (d) 的負載都可能不正常，原因卻不同。", explanation: "需要沿路徑檢查，不能只靠現象下結論。" }
        ]
      },
      {
        id: "safety",
        title: "安全收尾：遇到可疑電路怎麼辦？",
        book: "CH3 p.70｜「Fun 電一下：觸電及用電安全」第 1、2 點",
        read: "讀 p.70 藍色方框的觸電說明，再讀「用電安全簡介」第 (2)、(3)、(4)、(5) 項。",
        core: ["觸電危害與電流大小、通過人體的時間有關，不可只看電壓數字。", "使用電器前要確認規格相符，避免插座過載。", "不要用潮濕的手操作電源開關；懷疑短路時先停止操作，請老師處理。"],
        apply: "從第 (2)–(5) 項選出一個你在教室能做到的安全習慣。",
        mark: {
          strategy: "安全段落不要整段畫滿；找能直接變成「我會怎麼做」的行動語句。",
          instruction: "在 p.70 用電安全第 (2)–(5) 項，圈出「核對規格、避免過載、避免潮濕操作」三個行動重點。",
          question: "下列哪一組最適合畫成自己的安全提醒？",
          choices: ["核對規格、避免過載、手濕不操作", "表格的底色與插圖大小", "只記住「安全」兩個字"],
          correct: 0,
          wrong: "安全重點應是能實際照做的行動。",
          hint: "找「先做什麼」與「避免什麼」。",
          explanation: "可執行的行動語句，比只背標題有用。"
        },
        checks: [
          { id: "safety-wet", type: "tf", prompt: "是非題：手潮濕時操作電源開關是安全的。", correct: false, wrong: "請回到 p.70 用電安全第 (5) 項。", hint: "水分會增加觸電風險。", explanation: "不可用潮濕的手操作電源開關。" },
          { id: "safety-overload", type: "choice", prompt: "哪個做法較符合課本的用電安全提醒？", choices: ["先確認電器規格，避免插座過載", "同一插座盡量接越多越好", "不看規格直接通電"], correct: 0, wrong: "請看第 (2)、(3) 項。", hint: "先核對規格，再避免負荷過重。", explanation: "應確認規格並避免插座過載。" },
          { id: "safety-action", type: "choice", prompt: "課堂模擬發現疑似短路，下一步最安全的是？", choices: ["停止操作並請老師確認", "用導線跨接電池兩端驗證", "在通電時摸線找熱點"], correct: 0, wrong: "短路可能過熱，不能再增加風險。", hint: "先停，再請教師協助。", explanation: "停止操作並請老師確認。" }
        ]
      }
    ]
  }
};

// 10 張原創 SVG 概念圖解產生器（完整移植自 week01-visuals.js）
function buildVisuals() {
  function line(x1, y1, x2, y2, color, width, extra) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (color || "#24627b") + '" stroke-width="' + (width || 5) + '" stroke-linecap="round" ' + (extra || "") + "/>";
  }
  function rect(x, y, w, h, fill, stroke, radius) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (radius || 14) + '" fill="' + fill + '" stroke="' + (stroke || "none") + '" stroke-width="2"/>';
  }
  function txt(x, y, content, size, fill, weight, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 18) + '" fill="' + (fill || "#173b55") + '" font-weight="' + (weight || 700) + '" ' + (extra || "") + ">" + content + "</text>";
  }
  function circle(x, y, r, fill, stroke, width) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (width || 4) + '"/>';
  }
  function wrap(key, title, caption, body) {
    return {
      title: title,
      caption: caption,
      svg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 300" role="img" aria-labelledby="visual-' +
        key +
        '" preserveAspectRatio="xMidYMid meet">' +
        '<title id="visual-' +
        key +
        '">' +
        title +
        "：" +
        caption +
        "</title>" +
        '<defs><marker id="arrow-' +
        key +
        '" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="14" refX="13" refY="7" orient="auto"><path d="M 0 0 L 16 7 L 0 14 z" fill="#16a34a"/></marker></defs>' +
        rect(1, 1, 678, 298, "#f8fbfc", "#d8e8ed", 18) +
        body +
        "</svg>"
    };
  }
  function badge(x, y, label, color) {
    return circle(x, y, 19, color, color, 1) + txt(x, y + 6, label, 17, "#ffffff", 800, 'text-anchor="middle"');
  }
  function circuit(state, key) {
    var wireColor = "#475569"; // 導線：深鐵灰
    var sourceColor = "#1565c0"; // 電源：寶石藍
    var switchColor = "#ea580c"; // 開關：鮮明亮橘
    var loadColor = state === "closed" ? "#d97706" : "#7c3aed"; // 負載：發亮金珀色 / 未通電紫羅蘭色
    var switchBox =
      '<rect x="234" y="46" width="82" height="52" rx="10" fill="#fff7ed" stroke="#fb923c" stroke-width="2" stroke-dasharray="5 3"/>';
    var top = line(132, 82, 250, 82, wireColor, 6) + line(300, 82, 506, 82, wireColor, 6);
    var contacts =
      circle(250, 82, 6.5, "#ffffff", switchColor, 3.5) + circle(300, 82, 6.5, "#ffffff", switchColor, 3.5);
    var switchBlade =
      state === "open"
        ? line(250, 82, 293, 55, switchColor, 7)
        : line(250, 82, 300, 82, switchColor, 8);
    var wires =
      top +
      line(506, 82, 506, 126, wireColor, 6) +
      line(506, 176, 506, 222, wireColor, 6) +
      line(506, 222, 132, 222, wireColor, 6) +
      line(132, 222, 132, 176, wireColor, 6) +
      line(132, 126, 132, 82, wireColor, 6);
    var battery =
      circle(132, 151, 26, "#dbeafe", sourceColor, 4.5) +
      txt(132, 158, "+ −", 20, "#1e3a8a", 800, 'text-anchor="middle"');
    var lampFill = state === "closed" ? "#fef08a" : "#f3e8ff";
    var lampGlow = state === "closed" ? '<circle cx="506" cy="151" r="34" fill="#fde047" fill-opacity="0.35"/>' : "";
    var lamp =
      lampGlow +
      circle(506, 151, 25, lampFill, loadColor, 5) +
      txt(506, 158, "✦", 22, loadColor, 800, 'text-anchor="middle"');
    var bypass =
      state === "short"
        ? '<path d="M 346 82 L 346 222 L 506 222" fill="none" stroke="#dc2626" stroke-width="9" stroke-linejoin="round"/>' +
          txt(412, 162, "⚡ 危險近路", 18, "#b91c1c", 800, 'text-anchor="middle"')
        : "";
    var route =
      state === "closed"
        ? line(350, 82, 430, 82, "#16a34a", 5, 'marker-end="url(#arrow-' + key + ')"') +
          txt(390, 62, "電流方向", 15, "#15803d", 800, 'text-anchor="middle"')
        : "";
    var stateText =
      state === "closed"
        ? "路徑完整，經過負載"
        : state === "open"
        ? "開關處中斷，走不成一圈"
        : "紅色近路繞過負載";
    var switchCallout =
      line(275, 98, 275, 110, switchColor, 2.5) +
      txt(275, 136, state === "open" ? "開關(斷開)" : "開關(接通)", 17, "#c2410c", 800, 'text-anchor="middle"');
    var wireCallout =
      line(340, 245, 340, 222, wireColor, 2.5) + txt(340, 272, "導線", 18, wireColor, 800, 'text-anchor="middle"');
    return (
      switchBox +
      wires +
      switchBlade +
      contacts +
      battery +
      lamp +
      bypass +
      route +
      txt(132, 272, "電源", 18, sourceColor, 800, 'text-anchor="middle"') +
      switchCallout +
      wireCallout +
      txt(506, 272, "負載", 18, loadColor, 800, 'text-anchor="middle"') +
      txt(340, 36, stateText, 22, state === "short" ? "#b91c1c" : "#174d65", 800, 'text-anchor="middle"')
    );
  }

  var visuals = {};
  visuals.parts = wrap("parts", "電路的四個部分", "電源、導線、開關、負載連成完整路徑。", circuit("closed", "parts"));
  visuals.switchwire = wrap(
    "switchwire",
    "開關與導線",
    "橘色表示開關接片，深灰色表示導線。開關控制通斷，導線負責連接。",
    txt(170, 48, "開關斷開", 23, "#c2410c", 800, 'text-anchor="middle"') +
      txt(510, 48, "開關接通", 23, "#15803d", 800, 'text-anchor="middle"') +
      '<rect x="128" y="96" width="82" height="58" rx="10" fill="#fff7ed" stroke="#fb923c" stroke-width="2" stroke-dasharray="5 3"/>' +
      '<rect x="454" y="96" width="92" height="58" rx="10" fill="#fff7ed" stroke="#fb923c" stroke-width="2" stroke-dasharray="5 3"/>' +
      line(46, 135, 145, 135, "#475569", 6) +
      line(192, 135, 290, 135, "#475569", 6) +
      line(145, 135, 187, 108, "#ea580c", 7) +
      circle(145, 135, 6, "#ffffff", "#ea580c", 3.5) +
      circle(192, 135, 6, "#ffffff", "#ea580c", 3.5) +
      line(390, 135, 470, 135, "#475569", 6) +
      line(530, 135, 630, 135, "#475569", 6) +
      line(470, 135, 530, 135, "#ea580c", 7) +
      circle(470, 135, 6, "#ffffff", "#ea580c", 3.5) +
      circle(530, 135, 6, "#ffffff", "#ea580c", 3.5) +
      line(340, 118, 298, 131, "#475569", 2.5) +
      txt(340, 106, "導線", 18, "#475569", 800, 'text-anchor="middle"') +
      badge(70, 211, "1", "#c2410c") +
      txt(98, 218, "線路中斷", 20, "#69432f") +
      badge(410, 211, "2", "#15803d") +
      txt(438, 218, "線路連接", 20, "#225d52") +
      txt(340, 273, "橘色接片是開關；深灰色連接線是導線。", 19, "#456172", 700, 'text-anchor="middle"')
  );
  visuals["source-load"] = wrap(
    "source-load",
    "電源與負載的角色",
    "電源提供電能，負載接收電能並產生作用。這是能量角色圖，不是接線圖。",
    rect(55, 100, 140, 105, "#e5f3f6", "#27738d") +
      txt(125, 142, "電池", 25, "#174d65", 800, 'text-anchor="middle"') +
      txt(125, 177, "電源：供能", 18, "#174d65", 700, 'text-anchor="middle"') +
      line(208, 151, 448, 151, "#279478", 8, 'marker-end="url(#arrow-source-load)"') +
      txt(330, 127, "提供電能", 21, "#177250", 800, 'text-anchor="middle"') +
      rect(470, 100, 150, 105, "#fff0d1", "#d99637") +
      txt(545, 142, "燈泡", 25, "#8e581d", 800, 'text-anchor="middle"') +
      txt(545, 177, "負載：用能", 18, "#8e581d", 700, 'text-anchor="middle"') +
      txt(545, 245, "產生光與熱", 19, "#8e581d", 800, 'text-anchor="middle"')
  );
  visuals["active-passive"] = wrap(
    "active-passive",
    "主動與被動元件",
    "用對能量的作用來分類，而不是看外形。",
    rect(32, 55, 290, 190, "#e3f4ee", "#6bb49a") +
      txt(177, 96, "主動元件", 26, "#166a4d", 800, 'text-anchor="middle"') +
      txt(177, 138, "供給或放大能量", 20, "#166a4d", 700, 'text-anchor="middle"') +
      rect(105, 165, 145, 48, "#ffffff", "#77b9a3", 12) +
      txt(177, 197, "例：電池", 20, "#166a4d", 800, 'text-anchor="middle"') +
      rect(358, 55, 290, 190, "#fff2df", "#e5b66e") +
      txt(503, 96, "被動元件", 26, "#8c5b1d", 800, 'text-anchor="middle"') +
      txt(503, 138, "消耗或儲存能量", 20, "#8c5b1d", 700, 'text-anchor="middle"') +
      rect(420, 165, 166, 48, "#ffffff", "#e5b66e", 12) +
      txt(503, 197, "例：電阻／電容", 19, "#8c5b1d", 800, 'text-anchor="middle"')
  );
  visuals.diagram = wrap(
    "diagram",
    "實物圖與電路圖",
    "畫法不同，電源（藍）、開關（橘）、負載（紫／金黃）仍可一一對應。",
    txt(170, 45, "實物示意", 23, "#174d65", 800, 'text-anchor="middle"') +
      txt(510, 45, "電路符號（分色對應）", 23, "#174d65", 800, 'text-anchor="middle"') +
      rect(60, 88, 82, 70, "#dbeafe", "#1565c0", 10) +
      txt(101, 131, "電池", 17, "#1e3a8a", 800, 'text-anchor="middle"') +
      rect(170, 88, 82, 70, "#ffedd5", "#ea580c", 10) +
      txt(211, 131, "開關", 17, "#c2410c", 800, 'text-anchor="middle"') +
      rect(280, 88, 82, 70, "#fef3c7", "#d97706", 10) +
      txt(321, 131, "燈泡", 17, "#b45309", 800, 'text-anchor="middle"') +
      line(390, 124, 445, 124, "#16a34a", 5, 'marker-end="url(#arrow-diagram)"') +
      line(462, 130, 483, 130, "#1565c0", 5) +
      line(462, 111, 462, 149, "#1565c0", 5) +
      line(483, 118, 483, 142, "#1565c0", 5) +
      line(503, 130, 515, 130, "#475569", 5) +
      line(515, 130, 538, 111, "#ea580c", 6) +
      circle(515, 130, 5, "#ffffff", "#ea580c", 3) +
      circle(540, 130, 5, "#ffffff", "#ea580c", 3) +
      circle(578, 130, 23, "#fef3c7", "#d97706", 4.5) +
      txt(578, 139, "✦", 25, "#d97706", 800, 'text-anchor="middle"') +
      txt(473, 203, "電源", 16, "#1565c0", 800, 'text-anchor="middle"') +
      txt(526, 203, "開關", 16, "#ea580c", 800, 'text-anchor="middle"') +
      txt(578, 203, "負載", 16, "#d97706", 800, 'text-anchor="middle"') +
      txt(340, 265, "不同元件以不同顏色標示，沿導線即可清楚追蹤連接。", 19, "#456172", 700, 'text-anchor="middle"')
  );
  visuals.closed = wrap("closed", "通路", "路徑完整，而且電流經過負載再回到電源。", circuit("closed", "closed"));
  visuals.open = wrap("open", "斷路", "開關或元件處中斷，負載無法正常運作。", circuit("open", "open"));
  visuals.short = wrap("short", "短路", "紅色低阻近路繞過負載；只能觀察示意圖，不可實際短接。", circuit("short", "short"));
  visuals.compare = wrap(
    "compare",
    "三種電路狀態比較",
    "看兩件事：路有沒有斷、是否繞過負載。",
    rect(24, 65, 200, 170, "#e5f4ec", "#7dbda1") +
      rect(240, 65, 200, 170, "#f3f4f5", "#bdc9cd") +
      rect(456, 65, 200, 170, "#fff0eb", "#e49a90") +
      txt(124, 104, "通路", 25, "#176d4e", 800, 'text-anchor="middle"') +
      txt(340, 104, "斷路", 25, "#526773", 800, 'text-anchor="middle"') +
      txt(556, 104, "短路", 25, "#a8302c", 800, 'text-anchor="middle"') +
      txt(124, 150, "完整的一圈", 19, "#176d4e", 700, 'text-anchor="middle"') +
      txt(340, 150, "路被切開", 19, "#526773", 700, 'text-anchor="middle"') +
      txt(556, 150, "危險近路", 19, "#a8302c", 700, 'text-anchor="middle"') +
      txt(124, 193, "經過負載", 19, "#176d4e", 700, 'text-anchor="middle"') +
      txt(340, 193, "無法通過", 19, "#526773", 700, 'text-anchor="middle"') +
      txt(556, 193, "繞過負載", 19, "#a8302c", 700, 'text-anchor="middle"') +
      txt(340, 277, "同樣燈不亮，也可能有不同原因。", 19, "#456172", 700, 'text-anchor="middle"')
  );
  visuals.safety = wrap(
    "safety",
    "用電安全三步驟",
    "核對規格、避免過載、手濕不操作；可疑短路先停止並請教師協助。",
    rect(24, 68, 200, 175, "#e5f4ec", "#85bda5") +
      rect(240, 68, 200, 175, "#fff2df", "#e5b66e") +
      rect(456, 68, 200, 175, "#fff0eb", "#e49a90") +
      badge(124, 107, "1", "#23825e") +
      badge(340, 107, "2", "#c47b2b") +
      badge(556, 107, "3", "#c5453d") +
      txt(124, 162, "核對規格", 24, "#176d4e", 800, 'text-anchor="middle"') +
      txt(340, 162, "避免過載", 24, "#8c5b1d", 800, 'text-anchor="middle"') +
      txt(556, 162, "手濕不操作", 23, "#a8302c", 800, 'text-anchor="middle"') +
      txt(340, 277, "發現可疑短路：停止操作，請老師確認。", 19, "#456172", 700, 'text-anchor="middle"')
  );
  return {
    get(segmentId) {
      return visuals[segmentId] || null;
    }
  };
}

export const ElectricVisuals = buildVisuals();

const PROGRESS_KEY = "basic-electricity-island-progress-v1";

export class GuidedStudyController {
  constructor(app) {
    this.app = app;
    this.lessonNo = 1; // 1 or 2
    this.ui = {
      concept: 0,
      task: 0,
      sim: "open",
      guide: 0,
      studyIndex: 0,
      studyChoices: {},
      markChoices: {},
      shuffleCache: {},
      chosen: null,
      wrong: 0,
      solved: false,
      ink: "#17405e",
      eraser: false,
      drawing: false,
      previewWeek01OnOtherIsland: false,
      unlockMissionPreview: false
    };
    this.store = this.readStore();
  }

  readStore() {
    try {
      const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }

  saveStore() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.store));
    } catch {
      // ignore quota error
    }
    if (this.app && typeof this.app.saveState === "function") {
      this.app.saveState();
    }
  }

  resetAllStore() {
    this.store = {};
    this.saveStore();
  }

  progressFor(lesson) {
    let p = this.store[lesson.id];
    if (!p || p.version !== lesson.version) {
      p = {
        version: lesson.version,
        completed: false,
        answers: {},
        studyAnswers: {},
        markAnswers: {},
        reflection: "",
        updatedAt: null
      };
      this.store[lesson.id] = p;
      this.saveStore();
    }
    return p;
  }

  node(tag, className, value) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (value !== undefined) n.textContent = value;
    return n;
  }

  append(parent, ...children) {
    children.forEach((c) => {
      if (c) parent.appendChild(c);
    });
    return parent;
  }

  btn(text, action, cls = "wk-btn") {
    const n = this.node("button", cls, text);
    n.type = "button";
    n.addEventListener("click", action);
    return n;
  }

  shuffledOnce(key, items) {
    if (!this.ui.shuffleCache[key]) {
      const copy = items.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      this.ui.shuffleCache[key] = copy;
    }
    return this.ui.shuffleCache[key].slice();
  }

  shuffledDifferent(key, items, reference) {
    const order = this.shuffledOnce(key, items);
    if (reference.length > 1 && reference.every((item, index) => item === order[index])) {
      order.push(order.shift());
      this.ui.shuffleCache[key] = order.slice();
    }
    return order;
  }

  shuffledStartOrder(q) {
    const order = this.shuffledOnce("order:" + q.id, q.items);
    if (order.every((item, index) => item === q.correct[index])) {
      order.push(order.shift());
      this.ui.shuffleCache["order:" + q.id] = order.slice();
    }
    return order;
  }

  markComplete(p, seg) {
    const record = p.markAnswers && p.markAnswers[seg.id];
    return Boolean(record && record.correct && record.marked);
  }

  studyCount(lesson, p) {
    const all = lesson.study.reduce((sum, seg) => sum + seg.checks.length + 1, 0);
    const done = lesson.study.reduce((sum, seg) => {
      return (
        sum +
        seg.checks.filter((q) => p.studyAnswers[q.id] && p.studyAnswers[q.id].correct).length +
        (this.markComplete(p, seg) ? 1 : 0)
      );
    }, 0);
    return { all, done };
  }

  studyComplete(lesson, p) {
    const count = this.studyCount(lesson, p);
    return count.done === count.all;
  }

  statusSummary(lesson, p) {
    const total = Object.keys(p.answers).filter((id) => p.answers[id].correct).length;
    const count = this.studyCount(lesson, p);
    return `本裝置紀錄：課本導讀 ${count.done}／${count.all} 步、整合任務 ${total}／${lesson.tasks.length} 題${
      p.completed ? "，本節已完成 ✅" : ""
    }`;
  }

  // ==================== 1. 18 週學期地圖（嵌入中央島或獨立開啟） ====================
  renderSemesterMap(container) {
    container.innerHTML = "";
    const wrap = this.node("div", "wk-container");

    // 頂部橫幅
    const hero = this.node("div", "wk-hero");
    this.append(
      hero,
      this.node("div", "wk-eyebrow", "18 週 × 每週 2 節 × 每節 50 分鐘｜基本電學探索島課綱整合"),
      this.node("h3", "", "從車燈出發，探索基本電學（18 週學期地圖）"),
      this.node(
        "p",
        "",
        "每節課保留約 25–30 分鐘平台自學（課本畫重點 → 解鎖 SVG 概念圖解 → 7 種互動題型 → 電路模擬器），搭配教師引導與出口小卡。第 1 週已完整開放，並與 3D 群島 5 座章節島無縫串聯！"
      )
    );
    wrap.appendChild(hero);

    // 第 1 週快速入口 + 每節課建議節奏
    const topGrid = this.node("div", "wk-two-col");
    const introCard = this.node("div", "section-card");
    this.append(
      introCard,
      this.node("h3", "", "🔥 第 1 週：讓車燈亮起來（已建置開放）"),
      this.node("p", "", "從熟悉的車燈情境出發，辨認電源、導線、開關、負載（第 1 節），再比較通路、斷路與短路（第 2 節）。對應【第 3 課：串聯電路】課本 CH3 p.68–70。")
    );
    const introActions = this.node("div", "wk-btn-row");
    this.append(
      introActions,
      this.btn(
        "🎯 開始第 1 節（電路的四個部分）",
        () => {
          this.lessonNo = 1;
          this.ui.studyIndex = 0;
          if (this.app.scene3D) this.app.scene3D.flyToIsland("island-03");
          this.app.openIslandDrawer("island-03", "guidedStudy");
        },
        "btn btn-primary"
      ),
      this.btn(
        "🎯 開始第 2 節（通路、斷路與短路）",
        () => {
          this.lessonNo = 2;
          this.ui.studyIndex = 0;
          if (this.app.scene3D) this.app.scene3D.flyToIsland("island-03");
          this.app.openIslandDrawer("island-03", "guidedStudy");
        },
        "btn btn-accent"
      ),
      this.btn(
        "👨‍🏫 進入第 1 週教師引導頁",
        () => {
          this.lessonNo = 1;
          if (this.app.scene3D) this.app.scene3D.flyToIsland("island-03");
          this.app.openIslandDrawer("island-03", "teacherMode");
        },
        "btn"
      )
    );
    introCard.appendChild(introActions);

    const paceCard = this.node("div", "section-card");
    this.append(paceCard, this.node("h3", "", "⏱️ 每節課 50 分鐘建議節奏"));
    const ol = this.node("ol", "wk-list");
    [
      "5 分鐘：情境引入與學習目標",
      "12 分鐘：教師點開概念講解卡與小馬達示範",
      "25–30 分鐘：學生課本畫重點自學、SVG 圖解與分步任務",
      "3–8 分鐘：回饋、出口小卡與補救"
    ].forEach((item) => this.append(ol, this.node("li", "", item)));
    this.append(paceCard, ol, this.node("p", "wk-muted wk-small", "這是建議節奏，教師可依班級程度彈性調整。"));

    this.append(topGrid, introCard, paceCard);
    wrap.appendChild(topGrid);

    // 18 週卡片網格
    const mapHeader = this.node("h3", "wk-section-heading", "🗓️ 18 週學期進度與 3D 島嶼對照總覽");
    wrap.appendChild(mapHeader);

    const weekGrid = this.node("div", "wk-week-grid");
    COURSE.weeks.forEach((w) => {
      const card = this.node("div", "wk-week-card");
      const badgeRow = this.node("div", "wk-badge-row");
      const statusBadge = this.node(
        "span",
        w.status === "open" ? "wk-status open" : "wk-status planned",
        w.status === "open" ? "✅ 已建置開放" : "⏳ 規劃中"
      );
      const islandBadge = this.node("span", "badge", `🏝️ ${w.islandName}`);
      this.append(badgeRow, statusBadge, islandBadge);

      this.append(
        card,
        badgeRow,
        this.node("h4", "", `第 ${w.id} 週｜${w.title}`),
        this.node("p", "wk-small", `節次：${w.lessons.join(" ／ ")}`),
        this.node("p", "wk-muted wk-small", `目標：${w.goal}`),
        this.node("p", "wk-muted wk-small", `課本對照：${w.source}`)
      );

      const actionRow = this.node("div", "wk-btn-row");
      if (w.status === "open") {
        this.append(
          actionRow,
          this.btn(
            "🎯 進入本週導讀闖關",
            () => {
              this.lessonNo = 1;
              this.ui.studyIndex = 0;
              if (this.app.scene3D) this.app.scene3D.flyToIsland(w.islandId);
              this.app.openIslandDrawer(w.islandId, "guidedStudy");
            },
            "btn btn-primary"
          ),
          this.btn(
            "👨‍🏫 教師模式",
            () => {
              this.lessonNo = 1;
              if (this.app.scene3D) this.app.scene3D.flyToIsland(w.islandId);
              this.app.openIslandDrawer(w.islandId, "teacherMode");
            },
            "btn"
          )
        );
      } else {
        this.append(
          actionRow,
          this.btn(
            `📖 前往${w.islandName.split("：")[0]}教材`,
            () => {
              if (this.app.scene3D) this.app.scene3D.flyToIsland(w.islandId);
              this.app.openIslandDrawer(w.islandId, w.islandId === "center-island" ? "library" : "textbook");
            },
            "btn"
          )
        );
      }
      card.appendChild(actionRow);
      weekGrid.appendChild(card);
    });
    wrap.appendChild(weekGrid);
    container.appendChild(wrap);
  }

  // ==================== 2. 島嶼內「🎯 課本導讀闖關（學生自學）」分頁 ====================
  renderStudentGuidedTab(container, islandId) {
    const savedScroll = container.scrollTop;
    container.innerHTML = "";
    const wrap = this.node("div", "wk-container");

    // 若不是第 3 島（第 1 週所在章節 CH3），且尚未開啟預覽，先顯示該島對應週次規畫，並提供一鍵切換至第 1 週完整互動體驗
    if (islandId !== "island-03" && !this.ui.previewWeek01OnOtherIsland) {
      this.renderPlannedIslandOverview(wrap, islandId, "student");
      container.appendChild(wrap);
      return;
    }

    if (islandId !== "island-03") {
      const notice = this.node("div", "mascot-tip-box");
      notice.innerHTML = `
        <div style="font-size:1.6rem;">🧭</div>
        <div class="tip-content" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; width:100%;">
          <span>目前正在預覽<strong>「第 1 週：讓車燈亮起來（CH3 p.68–70）」</strong>完整互動導讀教材。</span>
          <button type="button" class="btn" id="btn-back-island-weeks">← 返回本島週次規畫</button>
        </div>
      `;
      wrap.appendChild(notice);
      notice.querySelector("#btn-back-island-weeks").addEventListener("click", () => {
        this.ui.previewWeek01OnOtherIsland = false;
        this.renderStudentGuidedTab(container, islandId);
      });
    }

    const lesson = WEEK01[this.lessonNo];
    const p = this.progressFor(lesson);

    // 頂部標題與節次切換列
    const hero = this.node("div", "wk-hero");
    this.append(
      hero,
      this.node("div", "wk-eyebrow", `第 1 週 · 第 ${this.lessonNo} 節 · 學生課本導讀與互動闖關`),
      this.node("h3", "", `${lesson.title} — ${lesson.subtitle}`),
      this.node("p", "", lesson.source)
    );
    wrap.appendChild(hero);

    // 節次切換與教師模式快捷鈕
    const tabBar = this.node("div", "wk-lesson-tabs");
    [1, 2].forEach((n) => {
      const b = this.btn(
        `第 ${n} 節｜${WEEK01[n].title}`,
        () => {
          this.lessonNo = n;
          this.ui.concept = 0;
          this.ui.task = 0;
          this.ui.sim = "open";
          this.ui.studyIndex = 0;
          this.ui.chosen = null;
          this.ui.wrong = 0;
          container.scrollTop = 0;
          this.renderStudentGuidedTab(container, islandId);
        },
        `btn ${this.lessonNo === n ? "btn-primary" : ""}`
      );
      tabBar.appendChild(b);
    });
    const toTeacherBtn = this.btn(
      "👨‍🏫 切換至教師引導模式",
      () => {
        this.app.openIslandDrawer(islandId, "teacherMode");
      },
      "btn btn-accent"
    );
    tabBar.appendChild(toTeacherBtn);
    wrap.appendChild(tabBar);

    // 今天要會的事
    const overview = this.node("div", "section-card");
    this.append(overview, this.node("h3", "", "🎯 今天要會的事（學習目標）"));
    const goalList = this.node("ul", "wk-list");
    lesson.goals.forEach((g) => this.append(goalList, this.node("li", "", g)));
    this.append(overview, goalList, this.node("p", "wk-muted wk-small", `課本對照：${lesson.source}`));
    wrap.appendChild(overview);

    // 課本導讀與隨讀檢核區
    this.renderStudySection(wrap, lesson, p, () => {
      this.renderStudentGuidedTab(container, islandId);
    });

    // 概念卡片 + 電路觀察器（互動模擬器）
    const stageGrid = this.node("div", "wk-two-col");
    const leftConcept = this.node("div", "section-card");
    const rightSim = this.node("div", "section-card");

    this.renderConceptBox(leftConcept, lesson, () => {
      this.renderStudentGuidedTab(container, islandId);
    });

    this.append(
      rightSim,
      this.node("h3", "", "🔌 電路觀察器（互動狀態模擬）"),
      this.node("p", "wk-muted wk-small", "點選下方狀態按鈕，沿著圖上的線找路徑。這是概念示意，不作為實體接線指示。")
    );
    this.renderSimulatorBox(rightSim, false, () => {
      this.renderStudentGuidedTab(container, islandId);
    });

    this.append(stageGrid, leftConcept, rightSim);
    wrap.appendChild(stageGrid);

    // 四步整合任務站
    if (this.studyComplete(lesson, p) || this.ui.unlockMissionPreview) {
      this.renderMissionSection(wrap, lesson, p, () => {
        this.renderStudentGuidedTab(container, islandId);
      });
    } else {
      const locked = this.node("div", "section-card wk-mission-locked");
      this.append(
        locked,
        this.node("h3", "", "🔒 任務站尚未開啟（四步整合任務）"),
        this.node("p", "", "請先完成上方 5 個段落的「課本畫重點標記」與「隨讀檢核題」，即可自動開啟四步整合任務！")
      );
      const previewRow = this.node("div", "wk-btn-row");
      previewRow.appendChild(
        this.btn(
          "🔓 預覽／直接開啟整合任務站",
          () => {
            this.ui.unlockMissionPreview = true;
            this.renderStudentGuidedTab(container, islandId);
          },
          "btn"
        )
      );
      locked.appendChild(previewRow);
      wrap.appendChild(locked);
    }

    container.appendChild(wrap);
    container.scrollTop = savedScroll;
  }

  renderPlannedIslandOverview(wrap, islandId, mode) {
    const islandWeeks = COURSE.weeks.filter((w) => w.islandId === islandId);
    const islObj = this.app.content.islands.find((x) => x.id === islandId);
    const islTitle = islObj ? `第 ${islObj.order} 課：${islObj.name}` : "本島";

    const card = this.node("div", "section-card");
    this.append(
      card,
      this.node("h3", "", `🗓️ ${islTitle} — 對應學期週次規畫（共 ${islandWeeks.length} 週）`),
      this.node(
        "p",
        "",
        "依照我們的開發計畫，目前已優先完整移植並開放「第 1 週：讓車燈亮起來（對應第 3 課 CH3 p.68–70）」。待您檢視第 1 週的課本導讀、SVG 圖解、7 種互動題型與教師模式確認無誤後，即可依相同規格繼續擴充本島週次！"
      )
    );

    const grid = this.node("div", "wk-week-grid");
    islandWeeks.forEach((w) => {
      const wCard = this.node("div", "wk-week-card");
      this.append(
        wCard,
        this.node("span", "wk-status planned", `第 ${w.id} 週｜規劃中`),
        this.node("h4", "", w.title),
        this.node("p", "wk-small", `預定兩節課：${w.lessons.join(" ／ ")}`),
        this.node("p", "wk-muted wk-small", `學習目標：${w.goal}`),
        this.node("p", "wk-muted wk-small", `教材對照：${w.source}`)
      );
      grid.appendChild(wCard);
    });
    card.appendChild(grid);

    const actionRow = this.node("div", "wk-btn-row");
    this.append(
      actionRow,
      this.btn(
        "⚡ 飛往第 3 島體驗「第 1 週：讓車燈亮起來」完整互動教材",
        () => {
          this.lessonNo = 1;
          this.ui.studyIndex = 0;
          if (this.app.scene3D) this.app.scene3D.flyToIsland("island-03");
          this.app.openIslandDrawer("island-03", mode === "teacher" ? "teacherMode" : "guidedStudy");
        },
        "btn btn-primary"
      ),
      this.btn(
        "👁️ 在本島直接預覽「第 1 週」教材",
        () => {
          this.ui.previewWeek01OnOtherIsland = true;
          this.app.renderDrawerBody();
        },
        "btn btn-accent"
      ),
      this.btn(
        "🗓️ 查看 18 週學期地圖",
        () => {
          if (this.app.scene3D) this.app.scene3D.flyToIsland("center-island");
          this.app.openIslandDrawer("center-island", "semesterMap");
        },
        "btn"
      )
    );
    card.appendChild(actionRow);
    wrap.appendChild(card);
  }

  // ==================== 課本導讀與畫重點 + SVG 圖解 + 7 種題型 ====================
  renderStudySection(parent, lesson, p, rerender) {
    const sec = this.node("div", "section-card wk-study-panel");
    const count = this.studyCount(lesson, p);

    this.append(
      sec,
      this.node("h3", "", "📖 課本導讀、畫重點標記與隨讀檢核"),
      this.node(
        "p",
        "wk-muted wk-small",
        "先讀指定課本段落，自己判斷並在課本標記重點，即可解鎖「原創 SVG 概念圖解」與「多元隨讀互動題（是非、選擇、配合、拖拉、分類、排序、消除）」。"
      )
    );

    // 進度條
    const meta = this.node("div", "wk-guide-meta", `本節導讀進度：已完成 ${count.done} ／ ${count.all} 項`);
    const track = this.node("div", "wk-progress-track");
    const fill = this.node("div", "wk-progress-fill");
    fill.style.width = `${Math.round((count.done / count.all) * 100)}%`;
    track.appendChild(fill);
    this.append(sec, meta, track);

    // 5 個導讀段落快速切換按鈕列
    const segNav = this.node("div", "wk-seg-pills");
    lesson.study.forEach((s, idx) => {
      const isDone =
        this.markComplete(p, s) && s.checks.every((q) => p.studyAnswers[q.id] && p.studyAnswers[q.id].correct);
      const pill = this.btn(
        `${isDone ? "✅ " : ""}${idx + 1}. ${s.title}`,
        () => {
          this.ui.studyIndex = idx;
          rerender();
        },
        `wk-seg-pill ${this.ui.studyIndex === idx ? "active" : ""}`
      );
      segNav.appendChild(pill);
    });
    sec.appendChild(segNav);

    // 當前段落卡片
    if (this.ui.studyIndex >= lesson.study.length) this.ui.studyIndex = 0;
    const seg = lesson.study[this.ui.studyIndex];
    const card = this.node("div", "wk-reading-card");
    this.append(
      card,
      this.node("div", "wk-guide-meta", `導讀段落 ${this.ui.studyIndex + 1} ／ ${lesson.study.length}`),
      this.node("h4", "wk-seg-title", seg.title),
      this.node("p", "wk-book-locator", `📍 請看課本：${seg.book}`),
      this.node("p", "", seg.read)
    );

    // ① 課本重點標記檢核
    this.renderMarkBox(card, seg, p, rerender);

    // 完成標記後解鎖 SVG 圖解 + 核心知識 + 隨讀檢核題
    if (this.markComplete(p, seg)) {
      this.renderVisualBox(card, seg);
      this.append(card, this.node("h5", "wk-subhead", "💡 核心知識與重點"));
      const coreList = this.node("ul", "wk-list");
      seg.core.forEach((c) => this.append(coreList, this.node("li", "", c)));
      this.append(card, coreList, this.node("p", "wk-reading-action", `👉 讀後動作：${seg.apply}`));

      this.append(card, this.node("h5", "wk-subhead", "✍️ 讀完，回答問題"));
      seg.checks.forEach((q, idx) => {
        this.renderStudyQuestion(card, q, idx, p, rerender);
      });
    } else {
      const hintLock = this.node(
        "p",
        "wk-muted wk-small",
        "🔒 請先在上方選出這段的關鍵資訊，並在課本完成標記勾選，即可解鎖「原創 SVG 概念圖解」與「段落理解題」！（或點下方按鈕快速解鎖預覽）"
      );
      const quickUnlockBtn = this.btn(
        "🔓 快速完成本段課本標記（預覽 SVG 圖解與互動題）",
        () => {
          p.markAnswers[seg.id] = { attempts: 1, errors: 0, hints: 0, correct: true, marked: true, firstTry: true };
          p.updatedAt = new Date().toISOString();
          this.saveStore();
          rerender();
        },
        "btn"
      );
      this.append(card, hintLock, quickUnlockBtn);
    }

    // 上一段 / 下一段按鈕
    const navRow = this.node("div", "wk-btn-row");
    const prevBtn = this.btn(
      "← 上一個段落",
      () => {
        if (this.ui.studyIndex > 0) {
          this.ui.studyIndex--;
          rerender();
        }
      },
      "btn"
    );
    prevBtn.disabled = this.ui.studyIndex === 0;
    navRow.appendChild(prevBtn);

    if (this.ui.studyIndex < lesson.study.length - 1) {
      const nextBtn = this.btn(
        "下一個段落 →",
        () => {
          this.ui.studyIndex++;
          rerender();
        },
        "btn btn-primary"
      );
      navRow.appendChild(nextBtn);
    }
    card.appendChild(navRow);
    sec.appendChild(card);
    parent.appendChild(sec);
  }

  renderMarkBox(card, seg, p, rerender) {
    const mark = seg.mark;
    const box = this.node("div", "wk-mark-card");
    this.append(
      box,
      this.node("h5", "", "① 先找重點，再動筆標記"),
      this.node("p", "", `🔍 找重點方法：${mark.strategy}`)
    );

    const record = p.markAnswers[seg.id];
    if (record && record.correct) {
      this.append(
        box,
        this.node("p", "wk-feedback ok", `✅ 你選到了關鍵資訊！${mark.explanation}`),
        this.node("p", "wk-mark-instruction", `🖍️ 課本標記指令：${mark.instruction}`)
      );
      const label = this.node("label", "wk-mark-confirm");
      const check = this.node("input");
      check.type = "checkbox";
      check.checked = Boolean(record.marked);
      check.addEventListener("change", () => {
        record.marked = check.checked;
        p.updatedAt = new Date().toISOString();
        this.saveStore();
        rerender();
      });
      this.append(
        label,
        check,
        this.node("span", "", "我已在自己的課本完成畫線或圈選，並能指出標記的位置。（勾選後解鎖下方 SVG 圖解與互動題）")
      );
      this.append(
        box,
        label,
        this.node("p", "wk-muted wk-small", "這是自我檢核；平台無法檢查紙本標記，請確實完成後再勾選。")
      );
      card.appendChild(box);
      return;
    }

    this.append(box, this.node("p", "wk-bold", `問題：${mark.question}`));
    const group = this.node("div", "wk-option-list");
    mark.choices.forEach((optText, index) => {
      const selected = this.ui.markChoices[seg.id] === index;
      const b = this.btn(
        optText,
        () => {
          this.ui.markChoices[seg.id] = index;
          group.querySelectorAll("button").forEach((x) => {
            x.classList.remove("selected");
            x.setAttribute("aria-pressed", "false");
          });
          b.classList.add("selected");
          b.setAttribute("aria-pressed", "true");
        },
        `wk-option ${selected ? "selected" : ""}`
      );
      b.setAttribute("aria-pressed", selected ? "true" : "false");
      group.appendChild(b);
    });
    box.appendChild(group);

    const feedback = this.node("div", "wk-feedback");
    const actions = this.node("div", "wk-btn-row");
    this.append(
      actions,
      this.btn(
        "檢查我找的重點",
        () => {
          const selected = this.ui.markChoices[seg.id];
          if (selected === undefined) {
            feedback.className = "wk-feedback error";
            feedback.textContent = "請先選出你認為該標記的資訊。";
            return;
          }
          const result = p.markAnswers[seg.id] || { attempts: 0, errors: 0, hints: 0, correct: false, marked: false };
          result.attempts++;
          if (selected === mark.correct) {
            result.correct = true;
            result.firstTry = result.errors === 0;
            p.markAnswers[seg.id] = result;
            p.updatedAt = new Date().toISOString();
            this.saveStore();
            rerender();
          } else {
            result.errors++;
            p.markAnswers[seg.id] = result;
            this.saveStore();
            feedback.className = "wk-feedback error";
            feedback.textContent = mark.wrong + (result.errors >= 2 ? " 💡 提示：" + mark.hint : "");
          }
        },
        "btn btn-primary"
      ),
      this.btn(
        "💡 找重點提示",
        () => {
          const result = p.markAnswers[seg.id] || { attempts: 0, errors: 0, hints: 0, correct: false, marked: false };
          result.hints++;
          p.markAnswers[seg.id] = result;
          this.saveStore();
          feedback.className = "wk-feedback";
          feedback.textContent = "💡 提示：" + mark.hint;
        },
        "btn"
      )
    );
    this.append(box, feedback, actions);
    card.appendChild(box);
  }

  renderVisualBox(parent, seg) {
    const visual = ElectricVisuals.get(seg.id);
    if (!visual) return;
    const figure = this.node("figure", "wk-concept-visual");
    const art = this.node("div", "wk-concept-visual-art");
    art.innerHTML = visual.svg;
    const caption = this.node("figcaption", "", visual.caption);
    this.append(figure, this.node("div", "wk-guide-meta", `🎨 原創概念圖解｜${visual.title}`), art, caption);
    parent.appendChild(figure);
  }

  renderStudyQuestion(card, q, number, p, rerender) {
    const box = this.node("div", "wk-check-card");
    const typeLabels = {
      tf: "是非題",
      choice: "單選題",
      match: "下拉配對題",
      drag: "拖拉／點選配對題",
      classify: "概念分類題",
      order: "流程順序題",
      eliminate: "錯誤消除題"
    };
    this.append(
      box,
      this.node("div", "wk-badge-row", ""),
      this.node("h5", "", `問題 ${number + 1}（${typeLabels[q.type] || "互動題"}）｜${q.prompt}`)
    );

    const saved = p.studyAnswers[q.id];
    if (saved && saved.correct) {
      this.append(box, this.node("p", "wk-feedback ok", `✅ 已完成！${q.explanation}`));
      card.appendChild(box);
      return;
    }

    if (q.type === "choice" || q.type === "tf") {
      const opts = q.type === "tf" ? ["是（正確）", "非（錯誤）"] : q.choices;
      const group = this.node("div", "wk-option-list");
      opts.forEach((label, index) => {
        const selected = this.ui.studyChoices[q.id] === index;
        const b = this.btn(
          label,
          () => {
            this.ui.studyChoices[q.id] = index;
            group.querySelectorAll("button").forEach((x) => {
              x.classList.remove("selected");
              x.setAttribute("aria-pressed", "false");
            });
            b.classList.add("selected");
            b.setAttribute("aria-pressed", "true");
          },
          `wk-option ${selected ? "selected" : ""}`
        );
        b.setAttribute("aria-pressed", selected ? "true" : "false");
        group.appendChild(b);
      });
      box.appendChild(group);
    } else if (q.type === "match") {
      const current = this.ui.studyChoices[q.id] || {};
      const rowOrder = this.shuffledDifferent(
        "match-rows:" + q.id,
        q.pairs.map((_, i) => i),
        q.pairs.map((_, i) => i)
      );
      const rowAnswers = rowOrder.map((i) => q.pairs[i][1]);
      const optionOrder = this.shuffledDifferent("match-options:" + q.id, q.options, rowAnswers);
      rowOrder.forEach((index) => {
        const pair = q.pairs[index];
        const label = this.node("label", "wk-match-row", `${pair[0]} → `);
        const select = this.node("select");
        select.setAttribute("aria-label", `${pair[0]}的配對`);
        const empty = this.node("option", "", "請選擇");
        empty.value = "";
        select.appendChild(empty);
        optionOrder.forEach((option) => {
          const o = this.node("option", "", option);
          o.value = option;
          select.appendChild(o);
        });
        select.value = current[index] || "";
        select.addEventListener("change", () => {
          if (!this.ui.studyChoices[q.id] || typeof this.ui.studyChoices[q.id] !== "object") {
            this.ui.studyChoices[q.id] = {};
          }
          this.ui.studyChoices[q.id][index] = select.value;
        });
        label.appendChild(select);
        box.appendChild(label);
      });
    } else {
      this.renderVariantWidget(box, q);
    }

    const feedback = this.node("div", "wk-feedback");
    const actions = this.node("div", "wk-btn-row");
    this.append(
      actions,
      this.btn(
        "檢查答案",
        () => {
          const answer = this.ui.studyChoices[q.id];
          const result = this.questionResult(q, answer);
          if (!result.valid) {
            feedback.className = "wk-feedback error";
            feedback.textContent = "請先完成這一題的選擇或配置，再按檢查。";
            return;
          }
          const record = p.studyAnswers[q.id] || { attempts: 0, errors: 0, hints: 0 };
          record.attempts++;
          if (result.ok) {
            record.correct = true;
            record.firstTry = record.errors === 0;
            p.studyAnswers[q.id] = record;
            p.updatedAt = new Date().toISOString();
            this.saveStore();
            rerender();
          } else {
            record.errors++;
            record.correct = false;
            p.studyAnswers[q.id] = record;
            p.updatedAt = new Date().toISOString();
            this.saveStore();
            feedback.className = "wk-feedback error";
            feedback.textContent = q.wrong + (record.errors >= 2 ? " 💡 提示：" + q.hint : "");
          }
        },
        "btn btn-primary"
      ),
      this.btn(
        "💡 給我提示",
        () => {
          const record = p.studyAnswers[q.id] || { attempts: 0, errors: 0, hints: 0 };
          record.hints++;
          p.studyAnswers[q.id] = record;
          this.saveStore();
          feedback.className = "wk-feedback";
          feedback.textContent = "💡 提示：" + q.hint;
        },
        "btn"
      )
    );
    this.append(box, feedback, actions);
    card.appendChild(box);
  }

  renderVariantWidget(box, q) {
    const wrap = this.node("div", "wk-variant-widget");
    box.appendChild(wrap);
    if (q.type === "drag") this.renderDrag(wrap, q);
    else if (q.type === "order") this.renderOrder(wrap, q);
    else if (q.type === "eliminate") this.renderEliminate(wrap, q);
    else if (q.type === "classify") this.renderClassify(wrap, q);
  }

  renderDrag(wrap, q) {
    const state = this.ui.studyChoices[q.id] || {};
    this.ui.studyChoices[q.id] = state;
    let chosen = null;
    const chips = this.shuffledOnce(
      "drag-chips:" + q.id,
      q.pairs.map((pair) => pair[0])
    );
    const targetOrder = this.shuffledDifferent(
      "drag-targets:" + q.id,
      q.pairs.map((_, i) => i),
      q.pairs.map((_, i) => i)
    );
    const assign = (index, chip) => {
      if (!q.pairs.some((pair) => pair[0] === chip)) return;
      Object.keys(state).forEach((k) => {
        if (state[k] === chip) delete state[k];
      });
      state[index] = chip;
      chosen = null;
      draw();
    };
    const draw = () => {
      wrap.replaceChildren();
      this.append(
        wrap,
        this.node("p", "wk-muted wk-small", "拖曳元件到工作區；也可先點元件，再點工作區。點已放入的工作區可取回。")
      );
      const pool = this.node("div", "wk-chip-pool");
      chips.forEach((chip) => {
        const b = this.btn(
          chip,
          () => {
            chosen = chip;
            draw();
          },
          `wk-chip ${chosen === chip ? "selected" : ""}`
        );
        b.draggable = true;
        b.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", chip));
        pool.appendChild(b);
      });
      wrap.appendChild(pool);

      const targets = this.node("div", "wk-target-grid");
      targetOrder.forEach((index) => {
        const pair = q.pairs[index];
        const target = this.btn(
          `${pair[1]} ← ${state[index] || "【點此放入元件】"}`,
          () => {
            if (chosen) assign(index, chosen);
            else if (state[index]) {
              delete state[index];
              draw();
            }
          },
          "wk-drop-target"
        );
        target.addEventListener("dragover", (e) => e.preventDefault());
        target.addEventListener("drop", (e) => {
          e.preventDefault();
          assign(index, e.dataTransfer.getData("text/plain"));
        });
        targets.appendChild(target);
      });
      wrap.appendChild(targets);
    };
    draw();
  }

  renderOrder(wrap, q) {
    const state = this.ui.studyChoices[q.id] || this.shuffledStartOrder(q);
    this.ui.studyChoices[q.id] = state;
    const move = (from, to) => {
      if (from === to || to < 0 || to >= state.length) return;
      const item = state.splice(from, 1)[0];
      state.splice(to, 0, item);
      draw();
    };
    const draw = () => {
      wrap.replaceChildren();
      this.append(wrap, this.node("p", "wk-muted wk-small", "順序已打亂。請用上下按鈕或拖曳調整，由上往下排列正確順序。"));
      state.forEach((item, index) => {
        const row = this.node("div", "wk-order-row");
        row.draggable = true;
        row.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", String(index)));
        row.addEventListener("dragover", (e) => e.preventDefault());
        row.addEventListener("drop", (e) => {
          e.preventDefault();
          const from = Number(e.dataTransfer.getData("text/plain"));
          if (Number.isInteger(from)) move(from, index);
        });
        this.append(row, this.node("span", "wk-order-number", String(index + 1)), this.node("span", "wk-order-label", item));
        const up = this.btn("↑ 上移", () => move(index, index - 1), "btn");
        const down = this.btn("↓ 下移", () => move(index, index + 1), "btn");
        up.disabled = index === 0;
        down.disabled = index === state.length - 1;
        this.append(row, up, down);
        wrap.appendChild(row);
      });
    };
    draw();
  }

  renderEliminate(wrap, q) {
    const state = this.ui.studyChoices[q.id] || [];
    this.ui.studyChoices[q.id] = state;
    const optionOrder = this.shuffledOnce(
      "eliminate:" + q.id,
      q.options.map((_, i) => i)
    );
    const draw = () => {
      wrap.replaceChildren();
      this.append(wrap, this.node("p", "wk-muted wk-small", "點選要消除的錯誤說法（會畫上刪除線）；再點一次可恢復。留下的說法必須正確。"));
      optionOrder.forEach((index) => {
        const option = q.options[index];
        const removed = state.indexOf(index) !== -1;
        const b = this.btn(
          option,
          () => {
            const at = state.indexOf(index);
            if (at === -1) state.push(index);
            else state.splice(at, 1);
            draw();
          },
          `wk-eliminate-option ${removed ? "removed" : ""}`
        );
        b.setAttribute("aria-pressed", removed ? "true" : "false");
        wrap.appendChild(b);
      });
    };
    draw();
  }

  renderClassify(wrap, q) {
    const state = this.ui.studyChoices[q.id] || {};
    this.ui.studyChoices[q.id] = state;
    let chosen = null;
    const itemOrder = this.shuffledOnce("classify-items:" + q.id, q.items);
    const categoryOrder = this.shuffledOnce("classify-categories:" + q.id, q.categories);
    const assign = (category, item) => {
      if (q.items.indexOf(item) === -1) return;
      state[item] = category;
      chosen = null;
      draw();
    };
    const draw = () => {
      wrap.replaceChildren();
      this.append(wrap, this.node("p", "wk-muted wk-small", "分類與例子已打亂。請先點選例子（或拖曳），再點下方的分類區放入。"));
      const pool = this.node("div", "wk-chip-pool");
      itemOrder.forEach((item) => {
        const b = this.btn(
          item + (state[item] ? `（已分至：${state[item]}）` : ""),
          () => {
            chosen = item;
            draw();
          },
          `wk-chip ${chosen === item ? "selected" : ""}`
        );
        b.draggable = true;
        b.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", item));
        pool.appendChild(b);
      });
      wrap.appendChild(pool);

      const buckets = this.node("div", "wk-target-grid");
      categoryOrder.forEach((category) => {
        const assigned = q.items.filter((item) => state[item] === category);
        const b = this.btn(
          `${category}：${assigned.length ? assigned.join("、") : "【點此放入例子】"}`,
          () => {
            if (chosen) assign(category, chosen);
          },
          "wk-drop-target"
        );
        b.addEventListener("dragover", (e) => e.preventDefault());
        b.addEventListener("drop", (e) => {
          e.preventDefault();
          assign(category, e.dataTransfer.getData("text/plain"));
        });
        buckets.appendChild(b);
      });
      wrap.appendChild(buckets);
    };
    draw();
  }

  questionResult(q, answer) {
    if (q.type === "choice") return { valid: answer !== undefined, ok: answer === q.correct };
    if (q.type === "tf") return { valid: answer !== undefined, ok: answer === (q.correct ? 0 : 1) };
    if (q.type === "match") {
      return {
        valid: Boolean(answer) && q.pairs.every((_, i) => Boolean(answer[i])),
        ok: Boolean(answer) && q.pairs.every((pair, i) => answer[i] === pair[1])
      };
    }
    if (q.type === "drag") {
      return {
        valid: Boolean(answer) && q.pairs.every((_, i) => Boolean(answer[i])),
        ok: Boolean(answer) && q.pairs.every((pair, i) => answer[i] === pair[0])
      };
    }
    if (q.type === "classify") {
      return {
        valid: Boolean(answer) && q.items.every((item) => Boolean(answer[item])),
        ok: Boolean(answer) && q.items.every((item) => answer[item] === q.correct[item])
      };
    }
    if (q.type === "order") {
      return {
        valid: Array.isArray(answer) && answer.length === q.correct.length,
        ok: Array.isArray(answer) && q.correct.every((item, i) => answer[i] === item)
      };
    }
    if (q.type === "eliminate") {
      return {
        valid: Array.isArray(answer) && answer.length > 0,
        ok:
          Array.isArray(answer) &&
          answer.length === q.eliminate.length &&
          q.eliminate.every((i) => answer.indexOf(i) !== -1)
      };
    }
    return { valid: false, ok: false };
  }

  teacherAnswer(q) {
    if (q.type === "tf") return q.correct ? "是" : "非";
    if (q.type === "choice") return q.choices[q.correct];
    if (q.type === "match" || q.type === "drag") return q.pairs.map((pair) => `${pair[0]} → ${pair[1]}`).join("；");
    if (q.type === "classify") return q.items.map((item) => `${item} → ${q.correct[item]}`).join("；");
    if (q.type === "order") return q.correct.join(" → ");
    if (q.type === "eliminate") return "消除：" + q.eliminate.map((i) => q.options[i]).join("、");
    return "";
  }

  // ==================== 概念卡與電路觀察器（模擬器） ====================
  renderConceptBox(target, lesson, rerender) {
    if (this.ui.concept >= lesson.concepts.length) this.ui.concept = 0;
    const c = lesson.concepts[this.ui.concept];
    this.append(
      target,
      this.node("h3", "", "💡 核心概念卡"),
      this.node("p", "wk-guide-meta", `概念 ${this.ui.concept + 1} ／ ${lesson.concepts.length}`),
      this.node("div", "point-item", `${c.title}：${c.text}`),
      this.node("p", "wk-muted wk-small", `👉 動手看：${c.action}`)
    );
    const row = this.node("div", "wk-btn-row");
    const prev = this.btn(
      "← 上一個概念",
      () => {
        this.ui.concept--;
        rerender();
      },
      "btn"
    );
    const next = this.btn(
      "下一個概念 →",
      () => {
        this.ui.concept++;
        rerender();
      },
      "btn btn-primary"
    );
    prev.disabled = this.ui.concept === 0;
    next.disabled = this.ui.concept === lesson.concepts.length - 1;
    this.append(row, prev, next);
    target.appendChild(row);
  }

  simMarkup(mode, motor = false) {
    const isClosed = mode === "closed";
    const isShort = mode === "short";
    // 四大元件分色系統：電源(寶石藍 #1565c0)、導線(深鐵灰 #475569)、開關(亮琥珀橘 #ea580c)、負載(運轉亮金黃 #d97706 / 未運作紫羅蘭 #7c3aed)、短路(警示紅 #dc2626)
    const wireColor = "#475569";
    const sourceColor = "#1565c0";
    const switchColor = "#ea580c";
    const loadColor = isClosed ? "#d97706" : "#7c3aed";
    const loadFill = isShort ? "#fee2e2" : isClosed ? "#fef08a" : "#f3e8ff";
    const loadText = motor ? "小馬達（負載）" : "車燈（負載）";
    const loadSign = motor ? "M" : "✦";

    // 開關專屬淺橘底框＋雙接點端子＋亮橘色閘刀（導通與斷開皆清晰可辨，絕不與導線混淆）
    const switchBgBox =
      '<rect x="114" y="30" width="102" height="48" rx="12" fill="#fff7ed" stroke="#fb923c" stroke-width="2" stroke-dasharray="5 3"/>';
    const switchBlade =
      isClosed || isShort
        ? `<line x1="130" y1="56" x2="200" y2="56" stroke="${switchColor}" stroke-width="8" stroke-linecap="round"/>`
        : `<line x1="130" y1="56" x2="192" y2="37" stroke="${switchColor}" stroke-width="8" stroke-linecap="round"/>`;
    const switchTerminals =
      `<circle cx="130" cy="56" r="7" fill="#ffffff" stroke="${switchColor}" stroke-width="4"/>` +
      `<circle cx="200" cy="56" r="7" fill="#ffffff" stroke="${switchColor}" stroke-width="4"/>`;
    const switchStateLabel = isClosed || isShort ? "開關（接通）" : "開關（斷開）";

    // 通路時的綠色電流方向箭頭（使用 markerUnits="userSpaceOnUse" 固定尺寸，避免箭頭放大與文字重疊）
    const currentArrow = isClosed
      ? '<defs><marker id="sim-arrow" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="16" refX="14" refY="8" orient="auto"><path d="M 0 0 L 18 8 L 0 16 z" fill="#16a34a"/></marker></defs>' +
        '<rect x="250" y="12" width="88" height="25" rx="12.5" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>' +
        '<text x="294" y="29" font-size="14" fill="#15803d" font-weight="800" text-anchor="middle">電流方向</text>' +
        '<line x1="252" y1="56" x2="334" y2="56" stroke="#16a34a" stroke-width="5" stroke-linecap="round" marker-end="url(#sim-arrow)"/>'
      : "";

    // 短路危險紅色近路（紅線 x=223 與開關框 x=216 分離；標籤框 x=231..339 與右側燈泡圓框左緣 x=346 保持清晰安全間距）
    const bypass = isShort
      ? '<path d="M 223 56 L 223 206 L 377 206" fill="none" stroke="#dc2626" stroke-width="8" stroke-linejoin="round"/>' +
        '<rect x="231" y="128" width="108" height="28" rx="6" fill="#dc2626"/>' +
        '<text x="285" y="147" fill="#ffffff" font-size="13.5" font-weight="800" text-anchor="middle">⚡ 危險短路近路</text>'
      : "";

    // 負載發光光暈
    const loadGlow = isClosed ? '<circle cx="377" cy="149" r="38" fill="#fde047" fill-opacity="0.38"/>' : "";

    return (
      '<svg role="img" aria-label="' +
      (isShort ? "短路：紅線繞過負載直接回電源" : isClosed ? "通路：開關接通，電流經過負載" : "斷路：開關打開，路徑中斷") +
      '" viewBox="0 0 500 265" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="500" height="265" rx="14" fill="#f8fafc"/>' +
      switchBgBox +
      // 導線（深鐵灰色 #475569，與開關、電源、負載明確區分）
      `<path d="M 80 56 L 130 56 M 200 56 L 377 56 L 377 120 M 377 178 L 377 224 L 80 224 L 80 178 M 80 120 L 80 56" fill="none" stroke="${wireColor}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` +
      currentArrow +
      bypass +
      switchBlade +
      switchTerminals +
      // 電源（寶石藍 #1565c0）
      `<circle cx="80" cy="149" r="29" fill="#dbeafe" stroke="${sourceColor}" stroke-width="5"/><text x="80" y="158" font-size="26" font-weight="800" fill="#1e3a8a" text-anchor="middle">+ −</text>` +
      // 負載（紫羅蘭 #7c3aed / 通電亮金黃 #d97706）
      loadGlow +
      `<circle cx="377" cy="149" r="28" fill="${loadFill}" stroke="${loadColor}" stroke-width="6"/><text x="377" y="159" font-size="28" font-weight="800" fill="${loadColor}" text-anchor="middle">${loadSign}</text>` +
      // 四大元件分色文字標籤
      `<text x="80" y="252" font-size="17" fill="${sourceColor}" font-weight="800" text-anchor="middle">電源(電池)</text>` +
      `<text x="165" y="21" font-size="17" fill="#c2410c" font-weight="800" text-anchor="middle">${switchStateLabel}</text>` +
      `<text x="230" y="248" font-size="16" fill="${wireColor}" font-weight="800" text-anchor="middle">導線</text>` +
      `<text x="377" y="252" font-size="17" fill="${loadColor}" font-weight="800" text-anchor="middle">${loadText}</text>` +
      "</svg>"
    );
  }

  renderSimulatorBox(target, motor = false, rerender) {
    const sim = this.node("div", "wk-sim");
    const art = this.node("div", "wk-sim-art");
    art.innerHTML = this.simMarkup(this.ui.sim, motor);

    // 元件分色圖例列（幫助學生一眼辨識不同元件）
    const legend = this.node("div", "wk-badge-row");
    legend.style.margin = "8px 0 4px";
    legend.innerHTML = `
      <span class="badge" style="background:#dbeafe; color:#1e3a8a; border-color:#1565c0;">🔵 電源（供能）</span>
      <span class="badge" style="background:#ffedd5; color:#c2410c; border-color:#ea580c;">🟠 開關（控制通斷）</span>
      <span class="badge" style="background:#f1f5f9; color:#334155; border-color:#475569;">⚫ 導線（連接路徑）</span>
      <span class="badge" style="background:#fef3c7; color:#b45309; border-color:#d97706;">🟣/🟡 負載（用能做功）</span>
    `;

    const controls = this.node("div", "wk-btn-row");
    [
      { id: "open", label: "斷路（開關打開）" },
      { id: "closed", label: "通路（開關接通）" },
      { id: "short", label: "短路示意（危險旁路）" }
    ].forEach((x) => {
      const b = this.btn(
        x.label,
        () => {
          this.ui.sim = x.id;
          rerender();
        },
        `btn ${this.ui.sim === x.id ? "btn-primary" : ""}`
      );
      b.setAttribute("aria-pressed", this.ui.sim === x.id ? "true" : "false");
      controls.appendChild(b);
    });

    const msg =
      this.ui.sim === "closed"
        ? "✅ 通路狀態：橘色開關接通，路徑完整，電流經過負載使其正常運作。"
        : this.ui.sim === "short"
        ? "⚠️ 短路狀態：負載被紅色低阻近路繞過；短路可能造成大電流與過熱！"
        : "⏸️ 斷路狀態：橘色開關斷開，路徑不完整，電流無法流通。";

    this.append(sim, art, legend, controls, this.node("p", "wk-sim-status", msg));
    if (this.ui.sim === "short") {
      this.append(sim, this.node("p", "wk-warning", "🚨 安全提醒：只看畫面示意，切勿將實體電源兩端直接用導線短接！"));
    }
    target.appendChild(sim);
  }

  // ==================== 四步整合任務站 ====================
  renderMissionSection(parent, lesson, p, rerender) {
    const box = this.node("div", "section-card wk-mission-card");
    this.append(
      box,
      this.node("h3", "", "🏆 任務站｜四步整合任務"),
      this.node("p", "wk-muted wk-small", this.statusSummary(lesson, p))
    );

    const done = Object.keys(p.answers).filter((id) => p.answers[id].correct).length;
    const track = this.node("div", "wk-progress-track");
    const fill = this.node("div", "wk-progress-fill");
    fill.style.width = `${Math.round((done / lesson.tasks.length) * 100)}%`;
    track.appendChild(fill);
    box.appendChild(track);

    const dots = this.node("div", "wk-step-dots");
    lesson.tasks.forEach((t, idx) => {
      const cls = p.answers[t.id] && p.answers[t.id].correct ? "done" : idx === this.ui.task ? "current" : "";
      dots.appendChild(this.node("span", cls, String(idx + 1)));
    });
    box.appendChild(dots);

    if (done === lesson.tasks.length) {
      this.renderMissionComplete(box, lesson, p, rerender);
      parent.appendChild(box);
      return;
    }

    if (this.ui.task >= lesson.tasks.length || (p.answers[lesson.tasks[this.ui.task].id] && p.answers[lesson.tasks[this.ui.task].id].correct)) {
      const nextIdx = lesson.tasks.findIndex((t) => !p.answers[t.id] || !p.answers[t.id].correct);
      this.ui.task = nextIdx >= 0 ? nextIdx : 0;
    }
    const task = lesson.tasks[this.ui.task];

    this.append(box, this.node("h4", "", `第 ${this.ui.task + 1} 步：${task.prompt}`));
    if (task.type === "choice") {
      const options = this.node("div", "wk-option-list");
      task.choices.forEach((choice) => {
        const selected = this.ui.chosen === choice.id;
        const b = this.btn(
          choice.label,
          () => {
            this.ui.chosen = choice.id;
            options.querySelectorAll("button").forEach((x) => {
              x.classList.remove("selected");
              x.setAttribute("aria-pressed", "false");
            });
            b.classList.add("selected");
            b.setAttribute("aria-pressed", "true");
          },
          `wk-option ${selected ? "selected" : ""}`
        );
        b.setAttribute("aria-pressed", selected ? "true" : "false");
        options.appendChild(b);
      });
      box.appendChild(options);
    } else {
      this.append(box, this.node("p", "wk-reading-action", "👉 請先在上方「🔌 電路觀察器」切換到對應的狀態，再按下方「檢查這一步」按鈕！"));
    }

    const feedback = this.node("div", "wk-feedback");
    const row = this.node("div", "wk-btn-row");
    const checkBtn = this.btn(
      "檢查這一步",
      () => {
        const answer = task.type === "choice" ? this.ui.chosen : this.ui.sim;
        if (!answer) {
          feedback.className = "wk-feedback error";
          feedback.textContent = "請先選一個答案，再檢查。";
          return;
        }
        const correct = answer === (task.type === "choice" ? task.correct : task.expected);
        if (correct) {
          const prev = p.answers[task.id] || { attempts: 0, errors: 0, hints: 0 };
          prev.attempts++;
          prev.correct = true;
          prev.firstTry = prev.errors === 0;
          p.answers[task.id] = prev;
          p.updatedAt = new Date().toISOString();
          this.saveStore();
          feedback.className = "wk-feedback ok";
          feedback.textContent =
            "✅ " + (task.type === "choice" ? task.choices.find((x) => x.id === answer).feedback : "做到了！你選出的電路狀態符合這一步。");
          checkBtn.disabled = true;
          hintBtn.disabled = true;
          const nextBtn = this.btn(
            this.ui.task === lesson.tasks.length - 1 ? "🎉 完成本節任務" : "下一步 →",
            () => {
              this.ui.task++;
              this.ui.chosen = null;
              this.ui.wrong = 0;
              if (this.ui.task >= lesson.tasks.length) {
                p.completed = true;
                p.updatedAt = new Date().toISOString();
                this.saveStore();
              }
              rerender();
            },
            "btn btn-primary"
          );
          row.appendChild(nextBtn);
        } else {
          const old = p.answers[task.id] || { attempts: 0, errors: 0, hints: 0 };
          old.attempts++;
          old.errors++;
          old.correct = false;
          p.answers[task.id] = old;
          p.updatedAt = new Date().toISOString();
          this.saveStore();
          this.ui.wrong++;
          feedback.className = "wk-feedback error";
          feedback.textContent =
            "❌ " +
            (task.type === "choice" ? task.choices.find((x) => x.id === answer).feedback : "再觀察一次：目前「電路觀察器」的狀態尚未符合任務要求。");
          if (this.ui.wrong >= 2) feedback.textContent += " 💡 提示：" + task.hint;
        }
      },
      "btn btn-primary"
    );

    const hintBtn = this.btn(
      "💡 給我提示",
      () => {
        const old = p.answers[task.id] || { attempts: 0, errors: 0, hints: 0 };
        old.hints++;
        p.answers[task.id] = old;
        this.saveStore();
        feedback.className = "wk-feedback";
        feedback.textContent = "💡 提示：" + task.hint;
      },
      "btn"
    );

    this.append(row, checkBtn, hintBtn);
    this.append(box, feedback, row);
    parent.appendChild(box);
  }

  renderMissionComplete(box, lesson, p, rerender) {
    p.completed = true;
    p.updatedAt = p.updatedAt || new Date().toISOString();
    this.saveStore();
    this.append(
      box,
      this.node("h4", "", "🎉 本節四步整合任務全部完成！"),
      this.node("p", "", "可以用自己的話整理剛學會的概念（自動保存在本機瀏覽器）："),
      this.node("label", "wk-bold", lesson.reflection)
    );
    const input = this.node("textarea", "wk-textarea");
    input.value = p.reflection || "";
    input.maxLength = 300;
    input.placeholder = "在此輸入你的想法…";
    input.addEventListener("input", () => {
      p.reflection = input.value;
      this.saveStore();
    });
    box.appendChild(input);

    const row = this.node("div", "wk-btn-row");
    this.append(
      row,
      this.btn(
        "📋 看本節回顧",
        () => {
          const existing = box.querySelector(".wk-review-box");
          if (existing) existing.remove();
          const rev = this.node("div", "wk-review-box");
          this.append(rev, this.node("h5", "", "本節任務回顧"));
          lesson.tasks.forEach((t, idx) => {
            const a = p.answers[t.id] || {};
            this.append(rev, this.node("p", "wk-small", `${idx + 1}. ${t.prompt} ｜ ${a.firstTry ? "🌟 第一次就答對" : "✓ 經提示或重試完成"}`));
          });
          box.appendChild(rev);
        },
        "btn"
      ),
      this.btn(
        "🔄 重新練習本節",
        () => {
          this.store[lesson.id] = {
            version: lesson.version,
            completed: false,
            answers: {},
            studyAnswers: {},
            markAnswers: {},
            reflection: "",
            updatedAt: null
          };
          this.saveStore();
          this.ui.task = 0;
          this.ui.chosen = null;
          this.ui.wrong = 0;
          rerender();
        },
        "btn"
      )
    );
    if (this.lessonNo === 1) {
      row.appendChild(
        this.btn(
          "繼續第 2 節（通路、斷路與短路） →",
          () => {
            this.lessonNo = 2;
            this.ui.studyIndex = 0;
            this.ui.task = 0;
            rerender();
          },
          "btn btn-primary"
        )
      );
    }
    box.appendChild(row);
  }

  // ==================== 3. 島嶼內「👨‍🏫 教師引導模式」分頁 ====================
  renderTeacherGuidedTab(container, islandId) {
    const savedScroll = container.scrollTop;
    container.innerHTML = "";
    const wrap = this.node("div", "wk-container");

    if (islandId !== "island-03" && !this.ui.previewWeek01OnOtherIsland) {
      this.renderPlannedIslandOverview(wrap, islandId, "teacher");
      container.appendChild(wrap);
      return;
    }

    if (islandId !== "island-03") {
      const notice = this.node("div", "mascot-tip-box");
      notice.innerHTML = `
        <div style="font-size:1.6rem;">👨‍🏫</div>
        <div class="tip-content" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; width:100%;">
          <span>目前正在預覽<strong>「第 1 週：讓車燈亮起來（CH3 p.68–70）」</strong>教師授課與講解模式。</span>
          <button type="button" class="btn" id="btn-back-teacher-weeks">← 返回本島週次規畫</button>
        </div>
      `;
      wrap.appendChild(notice);
      notice.querySelector("#btn-back-teacher-weeks").addEventListener("click", () => {
        this.ui.previewWeek01OnOtherIsland = false;
        this.renderTeacherGuidedTab(container, islandId);
      });
    }

    const lesson = WEEK01[this.lessonNo];
    const p = this.progressFor(lesson);

    const hero = this.node("div", "wk-hero");
    this.append(
      hero,
      this.node("div", "wk-eyebrow", `第 1 週 · 第 ${this.lessonNo} 節 · 👨‍🏫 教師課堂講解與備課引導`),
      this.node("h3", "", `${lesson.title}（教師講解頁）`),
      this.node("p", "", "可在課堂投影逐張點開概念講解卡，搭配小馬達示範模擬器、手寫白板與課本畫重點解答總覽。")
    );
    wrap.appendChild(hero);

    // 節次切換與返回學生自學模式
    const tabBar = this.node("div", "wk-lesson-tabs");
    [1, 2].forEach((n) => {
      const b = this.btn(
        `第 ${n} 節｜${WEEK01[n].title}`,
        () => {
          this.lessonNo = n;
          this.ui.guide = 0;
          this.ui.sim = "open";
          container.scrollTop = 0;
          this.renderTeacherGuidedTab(container, islandId);
        },
        `btn ${this.lessonNo === n ? "btn-primary" : ""}`
      );
      tabBar.appendChild(b);
    });
    tabBar.appendChild(
      this.btn(
        "🎯 切換至學生課本導讀闖關頁",
        () => {
          this.app.openIslandDrawer(islandId, "guidedStudy");
        },
        "btn btn-accent"
      )
    );
    wrap.appendChild(tabBar);

    // 課堂節奏
    const pace = this.node("div", "section-card");
    this.append(
      pace,
      this.node("h3", "", "⏱️ 課堂節奏與學習目標"),
      this.node("p", "", "建議節奏：情境引入 5 分鐘 → 概念講解與示範 12 分鐘 → 平台自學 25–30 分鐘 → 回饋與出口小卡 3–8 分鐘。"),
      this.node("p", "wk-muted wk-small", `教材對照：${lesson.source}`)
    );
    const goalsDetails = this.node("details", "wk-details");
    goalsDetails.open = true;
    goalsDetails.appendChild(this.node("summary", "", "展開本節學習目標"));
    const gList = this.node("ul", "wk-list");
    lesson.goals.forEach((g) => gList.appendChild(this.node("li", "", g)));
    goalsDetails.appendChild(gList);
    pace.appendChild(goalsDetails);
    wrap.appendChild(pace);

    // 教師概念講解卡 + 小馬達示範模擬器
    const grid1 = this.node("div", "wk-two-col");
    const leftGuide = this.node("div", "section-card");
    const rightDemo = this.node("div", "section-card");

    this.append(leftGuide, this.node("h3", "", "🗣️ 教師概念講解卡（課堂投影）"));
    if (this.ui.guide >= lesson.teacher.guide.length) this.ui.guide = 0;
    const g = lesson.teacher.guide[this.ui.guide];
    const gCard = this.node("div", "wk-guide-card");
    this.append(
      gCard,
      this.node("div", "wk-guide-meta", `講解卡 ${this.ui.guide + 1} ／ ${lesson.teacher.guide.length}`),
      this.node("h4", "", g.title),
      this.node("p", "wk-bold", `情境舉例：${g.example}`),
      this.node("p", "wk-muted", `💬 可以這樣對學生說：「${g.talk}」`)
    );
    leftGuide.appendChild(gCard);

    const gRow = this.node("div", "wk-btn-row");
    const prevG = this.btn(
      "← 上一張",
      () => {
        this.ui.guide--;
        this.renderTeacherGuidedTab(container, islandId);
      },
      "btn"
    );
    const nextG = this.btn(
      "下一張 →",
      () => {
        this.ui.guide++;
        this.renderTeacherGuidedTab(container, islandId);
      },
      "btn btn-primary"
    );
    prevG.disabled = this.ui.guide === 0;
    nextG.disabled = this.ui.guide === lesson.teacher.guide.length - 1;
    this.append(gRow, prevG, nextG);
    leftGuide.appendChild(gRow);

    this.append(
      rightDemo,
      this.node("h3", "", "⚙️ 教師示範｜小馬達電路模擬器"),
      this.node("p", "wk-bold", lesson.teacher.demoQuestion)
    );
    this.renderSimulatorBox(rightDemo, true, () => {
      this.renderTeacherGuidedTab(container, islandId);
    });
    const demoDetails = this.node("details", "wk-details");
    demoDetails.open = true;
    demoDetails.appendChild(this.node("summary", "", "展開課堂示範步驟"));
    const dList = this.node("ol", "wk-list");
    lesson.teacher.demoSteps.forEach((step) => dList.appendChild(this.node("li", "", step)));
    demoDetails.appendChild(dList);
    rightDemo.appendChild(demoDetails);

    this.append(grid1, leftGuide, rightDemo);
    wrap.appendChild(grid1);

    // 課本導讀、畫重點與檢核題（教師備課解答總覽）
    const prepSec = this.node("div", "section-card");
    const prepHeaderRow = this.node("div", "wk-btn-row");
    prepHeaderRow.style.justifyContent = "space-between";
    prepHeaderRow.style.alignItems = "center";
    prepHeaderRow.appendChild(this.node("h3", "", "📚 課本導讀、畫重點指令與檢核題解答（教師備課）"));
    const toggleAllBtn = this.btn(
      "📂 全部展開／收合",
      () => {
        const allDetails = prepSec.querySelectorAll("details");
        const shouldOpen = Array.from(allDetails).some((d) => !d.open);
        allDetails.forEach((d) => (d.open = shouldOpen));
      },
      "btn"
    );
    prepHeaderRow.appendChild(toggleAllBtn);
    prepSec.appendChild(prepHeaderRow);
    this.append(
      prepSec,
      this.node("p", "wk-muted wk-small", "點開各段落即可直接查看課本頁碼、找重點策略、螢光筆標記指令、原創 SVG 圖解與所有隨讀題建議答案。")
    );

    lesson.study.forEach((seg, index) => {
      const details = this.node("details", "wk-details");
      if (index === 0) details.open = true;
      details.appendChild(this.node("summary", "", `${index + 1}. ${seg.title} ｜ ${seg.book}`));
      this.append(
        details,
        this.node("p", "", seg.read),
        this.node("p", "", `🔍 找重點方法：${seg.mark.strategy}`),
        this.node("p", "wk-mark-instruction", `🖍️ 課本標記指令：${seg.mark.instruction}`)
      );
      this.renderVisualBox(details, seg);
      this.append(
        details,
        this.node("p", "wk-small wk-bold", `✅ 重點辨識題：${seg.mark.question} ｜ 建議答案：${seg.mark.choices[seg.mark.correct]}`)
      );
      const cList = this.node("ul", "wk-list");
      seg.core.forEach((c) => cList.appendChild(this.node("li", "", c)));
      this.append(details, cList, this.node("p", "wk-reading-action", `👉 讀後動作：${seg.apply}`));
      seg.checks.forEach((q, qIdx) => {
        const ans = this.teacherAnswer(q);
        this.append(details, this.node("p", "wk-small", `問題 ${qIdx + 1}：${q.prompt} ｜ 💡 建議答案：${ans}`));
      });
      prepSec.appendChild(details);
    });
    wrap.appendChild(prepSec);

    // 課堂手寫白板 + 學習紀錄與出口小卡
    const grid2 = this.node("div", "wk-two-col");
    const boardCard = this.node("div", "section-card");
    const supportCard = this.node("div", "section-card");

    this.append(
      boardCard,
      this.node("h3", "", "✏️ 課堂手寫白板"),
      this.node("p", "wk-muted wk-small", "可在課堂上直接畫圈、寫字或標示電流路徑（支援滑鼠與觸控筆）。")
    );
    const tools = this.node("div", "wk-board-tools");
    [
      ["#17405e", "🖊️ 藍筆"],
      ["#c03a31", "🖍️ 紅筆"],
      ["#197b5c", "🟢 綠筆"]
    ].forEach((entry) => {
      const b = this.btn(
        entry[1],
        () => {
          this.ui.ink = entry[0];
          this.ui.eraser = false;
          this.markBoardTools(tools);
        },
        "btn"
      );
      b.dataset.ink = entry[0];
      tools.appendChild(b);
    });
    const eraseBtn = this.btn(
      "🧽 橡皮擦",
      () => {
        this.ui.eraser = true;
        this.markBoardTools(tools);
      },
      "btn"
    );
    eraseBtn.dataset.eraser = "true";
    const clearBtn = this.btn(
      "🗑️ 清空",
      () => {
        const c = boardCard.querySelector("canvas");
        if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
      },
      "btn"
    );
    const sizeInput = this.node("input");
    sizeInput.type = "range";
    sizeInput.min = "2";
    sizeInput.max = "16";
    sizeInput.value = "5";
    const sizeLabel = this.node("label", "wk-small", "筆粗 ");
    sizeLabel.appendChild(sizeInput);
    this.append(tools, eraseBtn, clearBtn, sizeLabel);
    boardCard.appendChild(tools);

    const canvas = this.node("canvas", "wk-whiteboard");
    canvas.width = 720;
    canvas.height = 300;
    canvas.setAttribute("aria-label", "教師手寫白板");
    boardCard.appendChild(canvas);
    this.bindWhiteboardCanvas(canvas, sizeInput);
    this.markBoardTools(tools);

    this.append(
      supportCard,
      this.node("h3", "", "📊 課堂觀察重點、出口小卡與本機紀錄"),
      this.node("p", "", "學生操作相同概念，但題目採「車燈」情境；教師示範採「小馬達」情境。"),
      this.node("p", "wk-bold", this.statusSummary(lesson, p))
    );
    const errors = lesson.tasks.filter((t) => p.answers[t.id] && p.answers[t.id].errors > 0).map((t) => t.prompt);
    this.append(
      supportCard,
      this.node("p", "wk-muted wk-small", errors.length ? `曾答錯的步驟：${errors.join("；")}` : "本裝置目前尚無整合任務答錯紀錄。")
    );

    const observeDetails = this.node("details", "wk-details");
    observeDetails.open = true;
    observeDetails.appendChild(this.node("summary", "", "👀 課堂巡視觀察重點與常見誤解"));
    const obsList = this.node("ul", "wk-list");
    lesson.teacher.observe.forEach((o) => obsList.appendChild(this.node("li", "", o)));
    observeDetails.appendChild(obsList);

    const exitDetails = this.node("details", "wk-details");
    exitDetails.open = true;
    exitDetails.appendChild(this.node("summary", "", "🎫 出口小卡（Exit Ticket）提問"));
    const extList = this.node("ul", "wk-list");
    lesson.teacher.exit.forEach((e) => extList.appendChild(this.node("li", "", e)));
    exitDetails.appendChild(extList);

    this.append(supportCard, observeDetails, exitDetails);
    this.append(grid2, boardCard, supportCard);
    wrap.appendChild(grid2);

    container.appendChild(wrap);
    container.scrollTop = savedScroll;
  }

  markBoardTools(toolbar) {
    toolbar.querySelectorAll("button").forEach((b) => {
      const active = this.ui.eraser ? b.dataset.eraser === "true" : b.dataset.ink === this.ui.ink;
      b.classList.toggle("btn-primary", active);
    });
  }

  bindWhiteboardCanvas(canvas, sizeInput) {
    const ctx = canvas.getContext("2d");
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) * canvas.width) / r.width,
        y: ((e.clientY - r.top) * canvas.height) / r.height
      };
    };
    canvas.addEventListener("pointerdown", (e) => {
      this.ui.drawing = true;
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
      const p = point(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!this.ui.drawing) return;
      const p = point(e);
      ctx.globalCompositeOperation = this.ui.eraser ? "destination-out" : "source-over";
      ctx.strokeStyle = this.ui.ink;
      ctx.lineWidth = this.ui.eraser ? 28 : Number(sizeInput.value);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => {
      canvas.addEventListener(name, () => {
        this.ui.drawing = false;
        ctx.beginPath();
      });
    });
  }
}
