// 基本電學練工坊｜第 2 週原創 SVG 圖解、熱點圖與互動實驗台（CH1 p.2–5、p.9–12）
// 所有圖像皆為程式繪製的原創示意，不複製課本圖片。

const C = {
  ink: "#173b55",
  muted: "#4b6577",
  proton: "#dc2626",
  neutron: "#94a3b8",
  electron: "#2563eb",
  valence: "#ea580c",
  ok: "#15803d",
  warn: "#b91c1c",
  panel: "#ffffff",
  line: "#cfe0e7"
};

function rect(x, y, w, h, fill, stroke, r, extra) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r === undefined ? 14 : r}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="2" ${extra || ""}/>`;
}
function txt(x, y, s, size, fill, weight, anchor, extra) {
  return `<text x="${x}" y="${y}" font-size="${size || 18}" fill="${fill || C.ink}" font-weight="${weight || 700}" text-anchor="${anchor || "middle"}" ${extra || ""}>${s}</text>`;
}
function circle(x, y, r, fill, stroke, w, extra) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="${w || 2}" ${extra || ""}/>`;
}
function line(x1, y1, x2, y2, color, w, extra) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color || C.muted}" stroke-width="${w || 3}" stroke-linecap="round" ${extra || ""}/>`;
}
function arrowDefs(key) {
  return `<defs><marker id="w2arrow-${key}" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="14" refX="13" refY="7" orient="auto"><path d="M 0 0 L 16 7 L 0 14 z" fill="#16a34a"/></marker><marker id="w2arrowb-${key}" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="14" refX="13" refY="7" orient="auto"><path d="M 0 0 L 16 7 L 0 14 z" fill="${C.electron}"/></marker></defs>`;
}
function svgWrap(key, title, caption, body) {
  return {
    title,
    caption,
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 300" role="img" aria-labelledby="w2v-${key}" preserveAspectRatio="xMidYMid meet">` +
      `<title id="w2v-${key}">${title}：${caption}</title>` +
      arrowDefs(key) +
      rect(1, 1, 678, 298, "#f8fbfc", "#d8e8ed", 18) +
      body +
      "</svg>"
  };
}
// 小粒子：質子、中子、電子
function proton(x, y, r) {
  return circle(x, y, r || 9, "#fecaca", C.proton, 2) + txt(x, y + 4.5, "+", (r || 9) + 4, C.proton, 900);
}
function neutron(x, y, r) {
  return circle(x, y, r || 9, "#e2e8f0", "#64748b", 2);
}
function electron(x, y, color, r) {
  const c = color || C.electron;
  return circle(x, y, r || 7, c === C.valence ? "#fed7aa" : "#dbeafe", c, 2.5) + txt(x, y + 4, "−", (r || 7) + 5, c, 900);
}
function pointsOnRing(cx, cy, r, n, offset) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (offset || -Math.PI / 2) + (i * 2 * Math.PI) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}
function f(n) {
  return Math.round(n * 10) / 10;
}

// 依課本 1-1.2：K、L、M、N 層最多 2、8、18、32 個電子，由內往外填
export function shellFill(e) {
  const caps = [2, 8, 18, 32];
  const out = [];
  let left = e;
  caps.forEach((c) => {
    const n = Math.max(0, Math.min(c, left));
    out.push(n);
    left -= n;
  });
  while (out.length && out[out.length - 1] === 0) out.pop();
  return out;
}

// 畫一顆原子（殼層＋電子＋原子核標示）
function atomRings(cx, cy, shells, opts) {
  const o = opts || {};
  const radii = o.radii || [30, 56, 84, 112];
  const names = ["K", "L", "M", "N"];
  let s = "";
  shells.forEach((n, i) => {
    const vIdx = o.valenceIndex === undefined ? shells.length - 1 : o.valenceIndex;
    const color = i === vIdx && o.highlightOuter ? C.valence : C.electron;
    let group = circle(cx, cy, radii[i], "none", "#9cc3d3", 1.6, 'stroke-dasharray="4 4"');
    if (o.hot) {
      group =
        circle(cx, cy, radii[i], "none", "transparent", 20, 'class="hot-ring" pointer-events="stroke"') + group;
    }
    pointsOnRing(cx, cy, radii[i], n, -Math.PI / 2 + i * 0.35).forEach((p) => {
      group += electron(f(p[0]), f(p[1]), color, o.eR || 6);
    });
    if (o.labels) {
      const lx = f(cx + radii[i] * 0.80);
      const ly = f(cy - radii[i] * 0.60);
      group += rect(lx - 9, ly - 13, 18, 18, "#ffffff", "#9cc3d3", 5) + txt(lx, ly + 1, names[i], 12, C.muted, 900);
    }
    s += o.hot
      ? `<g data-hot="${names[i]}" tabindex="0" role="button" aria-label="${names[i]} 層（${n} 個電子）">${group}</g>`
      : group;
  });
  s += circle(cx, cy, o.nucleusR || 18, "#fee2e2", C.proton, 3) + txt(cx, cy + 5, o.nucleusLabel || "核", o.nucleusSize || 14, C.proton, 900);
  return s;
}

// ---------- 熱點圖（給「圖上點選題」使用） ----------
export function copperHotspotSvg() {
  const body =
    atomRings(190, 150, [2, 8, 18, 1], { hot: true, labels: true, highlightOuter: false, nucleusLabel: "+29" }) +
    rect(380, 40, 270, 220, C.panel, C.line, 16) +
    txt(515, 76, "銅原子（原子序 29）", 20, C.ink, 800) +
    txt(515, 112, "點一下圖上的某一層", 17, C.muted, 700) +
    txt(515, 140, "（點在虛線圓圈附近即可）", 15, C.muted, 600) +
    txt(515, 186, "電子由內往外：K → L → M → N", 16, C.ink, 700) +
    txt(515, 222, "最外層的電子叫做「價電子」", 16, C.valence, 800);
  return wrapPlain("copper-hot", "銅原子電子層熱點圖", body);
}

export function pairsHotspotSvg() {
  const pair = (x, a, b, key, label) => {
    const ball = (bx, sign) =>
      line(bx, 70, bx, 150, "#64748b", 2) +
      circle(bx, 170, 26, sign === "+" ? "#fee2e2" : "#dbeafe", sign === "+" ? C.proton : C.electron, 3) +
      txt(bx, 179, sign === "+" ? "+" : "−", 28, sign === "+" ? C.proton : C.electron, 900);
    return (
      `<g data-hot="${key}" tabindex="0" role="button" aria-label="${label}">` +
      rect(x, 40, 190, 230, "#ffffff", C.line, 16, 'class="hot-box"') +
      line(x + 30, 70, x + 160, 70, "#334155", 5) +
      ball(x + 65, a) +
      ball(x + 125, b) +
      txt(x + 95, 245, label, 22, C.ink, 800) +
      "</g>"
    );
  };
  // 這裡只畫「電荷種類」，不畫結果，讓學生自己判斷
  const body = pair(20, "+", "+", "A", "A 組") + pair(245, "+", "−", "B", "B 組") + pair(470, "−", "−", "C", "C 組");
  return wrapPlain("pairs-hot", "三組懸吊帶電小球", body);
}

export function inductionHotspotSvg() {
  const body =
    // 帶負電的塑膠棒
    rect(40, 120, 190, 44, "#475569", "#1e293b", 10) +
    txt(135, 150, "− − − − −", 24, "#e0f2fe", 900) +
    txt(135, 200, "帶負電的塑膠棒", 17, C.ink, 800) +
    // 不帶電的導體棒：分三段可點
    `<g data-hot="near" tabindex="0" role="button" aria-label="導體棒靠近塑膠棒的一端">` +
    rect(290, 112, 110, 60, "#fef9c3", "#ca8a04", 10, 'class="hot-box"') +
    txt(345, 150, "近端", 20, "#854d0e", 800) +
    "</g>" +
    `<g data-hot="mid" tabindex="0" role="button" aria-label="導體棒的中間">` +
    rect(400, 112, 110, 60, "#fefce8", "#ca8a04", 0, 'class="hot-box"') +
    txt(455, 150, "中間", 20, "#854d0e", 800) +
    "</g>" +
    `<g data-hot="far" tabindex="0" role="button" aria-label="導體棒離塑膠棒較遠的一端">` +
    rect(510, 112, 110, 60, "#fef9c3", "#ca8a04", 10, 'class="hot-box"') +
    txt(565, 150, "遠端", 20, "#854d0e", 800) +
    "</g>" +
    txt(455, 210, "原本不帶電的金屬導體棒（懸空、不接地）", 16, C.muted, 700) +
    txt(340, 262, "提示：電子會被同性的負電荷推開", 17, C.muted, 700);
  return wrapPlain("induction-hot", "靜電感應熱點圖", body);
}

function wrapPlain(key, title, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 300" role="img" aria-label="${title}" preserveAspectRatio="xMidYMid meet">` +
    rect(1, 1, 678, 298, "#f8fbfc", "#d8e8ed", 18) +
    body +
    "</svg>"
  );
}

// ---------- 10 張概念圖解 ----------
export function buildWeek02Visuals() {
  const v = {};

  // 1. 物質 → 分子 → 原子（以水為例）
  const water =
    `<path d="M115 70 C 95 105, 75 130, 75 160 A 40 40 0 0 0 155 160 C 155 130, 135 105, 115 70 Z" fill="#bfdbfe" stroke="#2563eb" stroke-width="3"/>` +
    txt(115, 168, "水", 22, "#1e3a8a", 900);
  const molecule = (x, y) =>
    circle(x, y, 15, "#fecaca", "#dc2626", 2) +
    txt(x, y + 5, "O", 14, "#991b1b", 900) +
    circle(x - 17, y + 13, 9, "#ffffff", "#64748b", 2) +
    txt(x - 17, y + 17, "H", 10, "#334155", 900) +
    circle(x + 17, y + 13, 9, "#ffffff", "#64748b", 2) +
    txt(x + 17, y + 17, "H", 10, "#334155", 900);
  v["w2-matter"] = svgWrap(
    "matter",
    "物質、分子、原子",
    "以水為例：一滴水（物質）→ 水分子 H₂O（分子）→ 氧原子與氫原子（原子），越分越小。",
    rect(20, 40, 190, 200, C.panel, C.line) +
      water +
      txt(115, 222, "① 物質：一滴水", 17, C.ink, 800) +
      rect(245, 40, 190, 200, C.panel, C.line) +
      molecule(300, 105) +
      molecule(375, 110) +
      molecule(335, 170) +
      txt(340, 222, "② 分子：水分子 H₂O", 17, C.ink, 800) +
      rect(470, 40, 190, 200, C.panel, C.line) +
      atomRings(565, 130, [2, 6], { radii: [26, 50], nucleusLabel: "O", nucleusR: 15, eR: 5 }) +
      txt(565, 222, "③ 原子：氧原子", 17, C.ink, 800) +
      line(212, 140, 240, 140, "#16a34a", 4, 'marker-end="url(#w2arrow-matter)"') +
      line(437, 140, 465, 140, "#16a34a", 4, 'marker-end="url(#w2arrow-matter)"') +
      txt(227, 120, "物理", 13, C.ok, 800) +
      txt(452, 120, "化學", 13, C.ok, 800) +
      txt(340, 275, "物理方法細分仍保有特性 → 分子；化學方法分解失去特性 → 原子", 16, C.muted, 700)
  );

  // 2. 原子的帶電性與帶電量
  const nucleus =
    proton(160, 140) + neutron(178, 140) + proton(169, 156) + neutron(151, 156) + proton(178, 158) + neutron(160, 124);
  v["w2-atom-charge"] = svgWrap(
    "atomcharge",
    "原子的帶電性與帶電量",
    "質子帶正電、電子帶負電、中子不帶電；質子數＝電子數時，原子不帶電（電中性）。",
    circle(165, 145, 62, "none", "#9cc3d3", 1.6, 'stroke-dasharray="4 4"') +
      circle(165, 145, 100, "none", "#9cc3d3", 1.6, 'stroke-dasharray="4 4"') +
      nucleus +
      electron(103, 145) +
      electron(227, 145) +
      electron(165, 45) +
      txt(165, 272, "示意：3 個質子、3 個中子、3 個電子", 15, C.muted, 700) +
      rect(310, 40, 350, 200, C.panel, C.line) +
      txt(360, 76, "名稱", 17, C.muted, 800) +
      txt(460, 76, "帶電性", 17, C.muted, 800) +
      txt(580, 76, "帶電量（庫侖）", 17, C.muted, 800) +
      line(325, 90, 645, 90, C.line, 2) +
      neutron(338, 120, 8) +
      txt(372, 126, "中子", 18) +
      txt(460, 126, "不帶電", 18) +
      txt(580, 126, "0", 18) +
      proton(338, 168, 8) +
      txt(372, 174, "質子", 18, C.proton) +
      txt(460, 174, "正（＋）", 18, C.proton) +
      txt(580, 174, "＋1.602×10⁻¹⁹", 18, C.proton) +
      electron(338, 214, C.electron, 8) +
      txt(372, 220, "電子", 18, C.electron) +
      txt(460, 220, "負（－）", 18, C.electron) +
      txt(580, 220, "－1.602×10⁻¹⁹", 18, C.electron) +
      txt(485, 272, "質子數＝電子數 → 整個原子不帶電", 18, C.ok, 800)
  );

  // 3. 銅原子的電子分布 2-8-18-1
  v["w2-copper"] = svgWrap(
    "copper",
    "銅原子的電子分布",
    "銅有 29 個電子，依序填入 K=2、L=8、M=18，N 層只剩 1 個，這 1 個就是價電子。",
    atomRings(175, 150, [2, 8, 18, 1], { labels: true, highlightOuter: true, nucleusLabel: "+29" }) +
      rect(355, 36, 300, 228, C.panel, C.line, 16) +
      txt(505, 70, "銅原子（原子序 29）", 20, C.ink, 800) +
      txt(400, 108, "K 層", 18, C.muted, 800, "start") +
      txt(620, 108, "2 個", 18, C.ink, 800, "end") +
      txt(400, 140, "L 層", 18, C.muted, 800, "start") +
      txt(620, 140, "8 個", 18, C.ink, 800, "end") +
      txt(400, 172, "M 層", 18, C.muted, 800, "start") +
      txt(620, 172, "18 個", 18, C.ink, 800, "end") +
      txt(400, 204, "N 層", 18, C.valence, 900, "start") +
      txt(620, 204, "29−2−8−18＝1 個", 18, C.valence, 900, "end") +
      txt(505, 244, "橘色＝最外層的價電子", 16, C.valence, 800)
  );

  // 4. 價電子 → 自由電子；正離子與負離子
  const miniAtom = (x, label, e, sub, color) =>
    circle(x, 205, 34, "none", "#9cc3d3", 1.5, 'stroke-dasharray="4 4"') +
    circle(x, 205, 13, "#fee2e2", C.proton, 2.5) +
    txt(x, 210, "+3", 12, C.proton, 900) +
    pointsOnRing(x, 205, 34, e, -Math.PI / 2)
      .map((p) => electron(f(p[0]), f(p[1]), C.electron, 6))
      .join("") +
    txt(x, 263, label, 17, color, 900) +
    txt(x, 284, sub, 13, C.muted, 700);
  v["w2-free"] = svgWrap(
    "free",
    "價電子、自由電子與離子",
    "最外層的價電子吸收外界能量後脫離軌道，變成自由電子；原子失去電子成正離子、得到電子成負離子。",
    circle(120, 90, 40, "none", "#9cc3d3", 1.5, 'stroke-dasharray="4 4"') +
      circle(120, 90, 16, "#fee2e2", C.proton, 2.5) +
      txt(120, 95, "核", 13, C.proton, 900) +
      electron(80, 90) +
      electron(160, 90) +
      electron(120, 50, C.valence) +
      `<path d="M 128 44 C 180 20, 230 25, 270 50" fill="none" stroke="${C.valence}" stroke-width="3" stroke-dasharray="6 5" marker-end="url(#w2arrow-free)"/>` +
      electron(285, 58, C.valence, 8) +
      txt(285, 92, "自由電子", 16, C.valence, 900) +
      txt(200, 22, "⚡ 光能、熱能、磁能激勵", 14, "#b45309", 800) +
      rect(350, 30, 310, 110, C.panel, C.line, 14) +
      txt(505, 60, "束縛電子：被原子核吸住、固定在軌道", 15, C.ink, 700) +
      txt(505, 90, "價電子：最外層軌道上的電子", 15, C.valence, 800) +
      txt(505, 120, "自由電子：脫離軌道、可以自由活動", 15, C.ink, 700) +
      line(20, 150, 660, 150, C.line, 2) +
      miniAtom(130, "電中性", 3, "電子數＝質子數", C.ink) +
      miniAtom(340, "正離子", 2, "失去電子：電子數＜質子數", C.proton) +
      miniAtom(550, "負離子", 4, "獲得電子：電子數＞質子數", C.electron)
  );

  // 5. 導體、半導體、絕緣體＋汽車線束剖面
  v["w2-materials"] = svgWrap(
    "materials",
    "導體、半導體與絕緣體",
    "價電子少於 4 個多為導體、等於 4 個為半導體、多於 4 個多為絕緣體；汽車線束就是銅芯（導體）外包絕緣皮。",
    circle(130, 140, 88, "#fde68a", "#b45309", 3) +
      circle(130, 140, 58, "#f59e0b", "#92400e", 2) +
      pointsOnRing(130, 140, 34, 6, 0)
        .map((p) => circle(f(p[0]), f(p[1]), 14, "#fbbf24", "#b45309", 2))
        .join("") +
      circle(130, 140, 14, "#fbbf24", "#b45309", 2) +
      txt(130, 252, "汽車電線剖面（情境示意）", 15, C.muted, 700) +
      line(205, 95, 238, 75, "#b45309", 2) +
      txt(242, 70, "外皮：絕緣體", 14, "#92400e", 800, "start") +
      line(160, 140, 238, 140, "#b45309", 2) +
      txt(242, 145, "芯線：銅＝導體", 14, "#92400e", 800, "start") +
      rect(350, 30, 310, 72, "#ecfdf5", "#16a34a", 14) +
      txt(505, 58, "導體：價電子＜4", 18, "#166534", 900) +
      txt(505, 86, "銀、銅、金、鋁、鐵、石墨", 15, "#166534", 700) +
      rect(350, 114, 310, 72, "#eff6ff", "#2563eb", 14) +
      txt(505, 142, "半導體：價電子＝4", 18, "#1e3a8a", 900) +
      txt(505, 170, "矽、鍺 → IC 晶片；高溫導電較好", 15, "#1e3a8a", 700) +
      rect(350, 198, 310, 72, "#fef2f2", "#dc2626", 14) +
      txt(505, 226, "絕緣體：價電子＞4", 18, "#991b1b", 900) +
      txt(505, 254, "雲母、玻璃、石英", 15, "#991b1b", 700)
  );

  // 6. 基本電荷與庫侖
  let dots = "";
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 9; c++) {
      dots += circle(402 + c * 24, 102 + r * 26, 7, "#dbeafe", C.electron, 2);
    }
  }
  v["w2-unit"] = svgWrap(
    "unit",
    "基本電荷與庫侖",
    "1 個電子帶電約 1.6×10⁻¹⁹ C；反過來，6.25×10¹⁸ 個電子的電量合起來才有 1 庫侖。",
    rect(30, 60, 230, 170, C.panel, C.line, 16) +
      electron(145, 120, C.electron, 16) +
      txt(145, 176, "1 個電子（基本電荷）", 17, C.ink, 800) +
      txt(145, 206, "≈ 1.6×10⁻¹⁹ C", 20, C.electron, 900) +
      line(270, 145, 360, 145, "#16a34a", 4, 'marker-end="url(#w2arrow-unit)"') +
      txt(315, 128, "收集", 15, C.ok, 800) +
      rect(380, 70, 250, 160, "#eff6ff", C.electron, 18) +
      dots +
      txt(505, 258, "1 庫侖（1 C）＝ 6.25×10¹⁸ 個電子", 19, C.ink, 900) +
      txt(340, 34, "電量 Q 的單位：庫侖（C）", 20, C.ink, 900) +
      txt(145, 270, "電子數 ÷ 6.25×10¹⁸ ＝ 庫侖數", 15, C.muted, 800)
  );

  // 7. 原子帶電量計算
  const calcCard = (x, p, e, head, color, result) =>
    rect(x, 76, 300, 196, C.panel, C.line, 16) +
    txt(x + 150, 108, head, 19, color, 900) +
    txt(x + 150, 144, `質子 ${p} 個、電子 ${e} 個`, 18, C.ink, 800) +
    txt(x + 150, 180, `（${p} − ${e}）× 1.602×10⁻¹⁹`, 18, C.ink, 700) +
    txt(x + 150, 222, result, 21, color, 900) +
    txt(x + 150, 254, p > e ? "質子較多 → 帶正電" : "電子較多 → 帶負電", 16, C.muted, 800);
  v["w2-ion-calc"] = svgWrap(
    "ioncalc",
    "原子的帶電量計算",
    "帶電量＝（質子數－電子數）×1.602×10⁻¹⁹ C；先減再乘，正負號就是帶電的種類。",
    txt(340, 44, "Q ＝（質子數 − 電子數）× 1.602×10⁻¹⁹ C", 22, C.ink, 900) +
      calcCard(30, 5, 3, "例 A：失去電子", C.proton, "＝ ＋3.204×10⁻¹⁹ C") +
      calcCard(350, 3, 6, "例 B：得到電子", C.electron, "＝ －4.806×10⁻¹⁹ C")
  );

  // 8. 摩擦起電
  const rubRow = (y, rodFill, rodText, rodSign, cloth, clothFill, clothSign, flowToCloth) => {
    const rodSigns = rodSign === "+" ? "+ + + +" : "− − − −";
    const clothSigns = clothSign === "+" ? "+ + +" : "− − −";
    return (
      rect(40, y, 170, 34, rodFill, "#334155", 8) +
      txt(125, y + 24, rodSigns, 20, rodSign === "+" ? C.proton : "#e0f2fe", 900) +
      txt(125, y + 58, rodText, 16, C.ink, 800) +
      `<path d="M 420 ${y - 6} q 40 -12 80 0 q 40 12 80 0 l 0 46 q -40 12 -80 0 q -40 -12 -80 0 z" fill="${clothFill}" stroke="#334155" stroke-width="2"/>` +
      txt(500, y + 24, clothSigns, 20, clothSign === "+" ? C.proton : C.electron, 900) +
      txt(500, y + 58, cloth, 16, C.ink, 800) +
      (flowToCloth
        ? line(230, y + 17, 400, y + 17, C.electron, 3, 'stroke-dasharray="7 5" marker-end="url(#w2arrowb-friction)"')
        : line(400, y + 17, 230, y + 17, C.electron, 3, 'stroke-dasharray="7 5" marker-end="url(#w2arrowb-friction)"')) +
      electron(315, y + 2, C.electron, 7) +
      txt(315, y + 40, flowToCloth ? "電子 →" : "← 電子", 14, C.electron, 800)
    );
  };
  v["w2-friction"] = svgWrap(
    "friction",
    "摩擦起電：移動的是電子",
    "玻璃棒的電子移到絲綢 → 玻璃棒帶正電、絲綢帶負電；毛皮的電子移到塑膠棒 → 塑膠棒帶負電、毛皮帶正電。",
    rubRow(48, "#e0f2fe", "玻璃棒：失去電子 → 帶正電", "+", "絲綢：得到電子 → 帶負電", "#fbcfe8", "−", true) +
      rubRow(170, "#475569", "塑膠棒：得到電子 → 帶負電", "−", "毛皮：失去電子 → 帶正電", "#d6b48a", "+", false) +
      txt(340, 284, "電荷不會憑空產生，只是電子「搬家」", 16, C.ok, 800)
  );

  // 9. 同性相斥、異性相吸
  const hang = (cx, a, b, apart) => {
    const dx = apart ? 34 : 14;
    const ball = (x, s) =>
      circle(x, 190, 24, s === "+" ? "#fee2e2" : "#dbeafe", s === "+" ? C.proton : C.electron, 3) +
      txt(x, 199, s === "+" ? "+" : "−", 26, s === "+" ? C.proton : C.electron, 900);
    return (
      line(cx - 90, 60, cx + 90, 60, "#334155", 5) +
      line(cx - 20, 60, cx - 20 - dx, 168, "#64748b", 2) +
      line(cx + 20, 60, cx + 20 + dx, 168, "#64748b", 2) +
      ball(cx - 20 - dx, a) +
      ball(cx + 20 + dx, b)
    );
  };
  v["w2-attract"] = svgWrap(
    "attract",
    "同性相斥、異性相吸",
    "帶同種電荷的物體互相推開，帶不同種電荷的物體互相拉近。",
    hang(170, "+", "+", true) +
      txt(170, 258, "同性相斥（推開）", 20, C.warn, 900) +
      txt(170, 284, "＋ 和 ＋、－ 和 －", 15, C.muted, 700) +
      line(340, 40, 340, 270, C.line, 2) +
      hang(510, "+", "−", false) +
      line(498, 190, 522, 190, C.ok, 3, 'stroke-dasharray="3 3"') +
      txt(510, 258, "異性相吸（拉近）", 20, C.ok, 900) +
      txt(510, 284, "＋ 和 －", 15, C.muted, 700)
  );

  // 10. 靜電感應＋靜電噴漆
  let mist = "";
  [
    [455, 120],
    [478, 140],
    [470, 104],
    [500, 126],
    [492, 156],
    [515, 108],
    [522, 142]
  ].forEach((p) => {
    mist += circle(p[0], p[1], 5, "#dbeafe", C.electron, 1.5);
  });
  v["w2-induction"] = svgWrap(
    "induction",
    "靜電感應與靜電噴漆",
    "帶電物體靠近不帶電的導體：近端感應異性電荷、遠端感應同性電荷。靜電噴漆利用異性相吸，讓帶負電的漆霧附著到帶正電的工件。",
    rect(24, 100, 120, 40, "#475569", "#1e293b", 10) +
      txt(84, 127, "− − − −", 18, "#e0f2fe", 900) +
      txt(84, 165, "帶負電的棒", 14, C.ink, 800) +
      rect(160, 100, 160, 40, "#fef9c3", "#ca8a04", 10) +
      txt(190, 127, "+ +", 18, C.proton, 900) +
      txt(292, 127, "− −", 18, C.electron, 900) +
      txt(190, 165, "近端：異性", 14, C.proton, 800) +
      txt(292, 165, "遠端：同性", 14, C.electron, 800) +
      txt(172, 64, "① 靜電感應", 20, C.ink, 900) +
      line(340, 40, 340, 270, C.line, 2) +
      txt(505, 64, "② 應用：靜電噴漆", 20, C.ink, 900) +
      rect(370, 112, 64, 34, "#64748b", "#1e293b", 6) +
      txt(402, 135, "−", 20, "#e0f2fe", 900) +
      txt(402, 170, "噴槍（負）", 13, C.ink, 800) +
      mist +
      `<path d="M 548 196 L 556 150 Q 562 120 598 116 L 636 118 Q 652 122 654 150 L 656 196 Z" fill="#fee2e2" stroke="${C.proton}" stroke-width="3"/>` +
      txt(602, 165, "+ + +", 18, C.proton, 900) +
      txt(602, 222, "工件（正，例：車殼）", 14, C.ink, 800) +
      txt(505, 262, "漆霧被異性電荷吸過去，附著得又勻又省漆", 14, C.muted, 700) +
      txt(170, 230, "原本不帶電的導體", 14, C.muted, 700)
  );

  return v;
}

// ---------- 互動實驗台 ----------
const ELEMENTS = {
  al: { name: "鋁", p: 13 },
  si: { name: "矽", p: 14 },
  cu: { name: "銅", p: 29 },
  ge: { name: "鍺", p: 32 }
};

function chargeText(diff) {
  if (diff === 0) return "0 C（不帶電）";
  const v = (Math.abs(diff) * 1.602).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return `${diff > 0 ? "＋" : "－"}${v}×10⁻¹⁹ C`;
}

export const WEEK02_LABS = {
  atom: {
    title: "⚛️ 原子組裝台",
    intro: "選一種原子，再按按鈕讓它失去或得到電子，觀察它變成正離子還是負離子、帶電量多少。電子依課本 K、L、M、N 層由內往外填入。",
    note: "這是依課本 1-1.2 填法畫的概念示意，不是真實原子大小比例。",
    init() {
      return { el: "cu", e: 29 };
    },
    key(s) {
      const p = ELEMENTS[s.el].p;
      const d = p - s.e;
      return `${s.el}:${d === 0 ? "neutral" : d > 0 ? "pos" : "neg"}:${Math.abs(d)}`;
    },
    controls(s) {
      const p = ELEMENTS[s.el].p;
      const list = Object.keys(ELEMENTS).map((k) => ({
        label: `${ELEMENTS[k].name}（${ELEMENTS[k].p}）`,
        active: s.el === k,
        apply: () => ({ el: k, e: ELEMENTS[k].p })
      }));
      list.push({ label: "➖ 失去 1 個電子", disabled: s.e <= p - 3, apply: () => ({ el: s.el, e: s.e - 1 }) });
      list.push({ label: "➕ 得到 1 個電子", disabled: s.e >= p + 3, apply: () => ({ el: s.el, e: s.e + 1 }) });
      list.push({ label: "↺ 回到電中性", apply: () => ({ el: s.el, e: p }) });
      return list;
    },
    markup(s) {
      const el = ELEMENTS[s.el];
      const shells = shellFill(s.e);
      const neutralShells = shellFill(el.p);
      const valence = neutralShells[neutralShells.length - 1];
      const d = el.p - s.e;
      const state = d === 0 ? "電中性（不帶電）" : d > 0 ? `正離子（少了 ${d} 個電子）` : `負離子（多了 ${-d} 個電子）`;
      const stateColor = d === 0 ? C.ok : d > 0 ? C.proton : C.electron;
      const type = valence < 4 ? "導體" : valence === 4 ? "半導體" : "絕緣體";
      const names = ["K", "L", "M", "N"];
      const radii = [26, 50, 76, 102];
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 300" role="img" aria-label="${el.name}原子：${state}">` +
        rect(1, 1, 678, 298, "#f8fbfc", "#d8e8ed", 18) +
        atomRings(160, 150, shells, { radii, highlightOuter: true, valenceIndex: neutralShells.length - 1, nucleusLabel: "+" + el.p, nucleusSize: 13, eR: 5.5 }) +
        rect(300, 26, 356, 248, C.panel, C.line, 16) +
        txt(478, 58, `${el.name}原子：質子 ${el.p} 個、電子 ${s.e} 個`, 18, C.ink, 900) +
        txt(478, 92, "各層電子：" + shells.map((n, i) => `${names[i]}=${n}`).join("、"), 16, C.muted, 800) +
        txt(478, 132, state, 21, stateColor, 900) +
        txt(478, 168, "帶電量＝（" + el.p + "−" + s.e + "）×1.602×10⁻¹⁹", 15, C.muted, 700) +
        txt(478, 196, "＝ " + chargeText(d), 19, stateColor, 900) +
        line(318, 214, 638, 214, C.line, 2) +
        txt(478, 240, `電中性時最外層有 ${valence} 個價電子`, 16, C.valence, 800) +
        txt(478, 262, `課本分類：${type}（價電子${valence < 4 ? "＜" : valence === 4 ? "＝" : "＞"}4）`, 16, C.ink, 800) +
        "</svg>"
      );
    },
    status(s) {
      const el = ELEMENTS[s.el];
      const d = el.p - s.e;
      if (d === 0) return `✅ ${el.name}原子的電子數＝質子數，整個原子不帶電。`;
      if (d > 0) return `🔴 ${el.name}原子失去 ${d} 個電子，電子比質子少，成為帶正電的正離子。`;
      return `🔵 ${el.name}原子得到 ${-d} 個電子，電子比質子多，成為帶負電的負離子。`;
    }
  },

  friction: {
    title: "🧶 摩擦起電實驗台",
    intro: "先選一組材料按「摩擦」，看電子往哪裡搬家；再把摩擦過的棒子靠近懸吊、帶負電的塑膠棒，觀察吸引還是排斥。",
    note: "依課本 1-3.2 與圖 1-6 繪製的概念示意。",
    init() {
      return { pair: "glass", rubbed: false, near: false };
    },
    key(s) {
      return `${s.pair}:${s.rubbed ? "rubbed" : "plain"}:${s.near ? "near" : "far"}`;
    },
    controls(s) {
      return [
        { label: "玻璃棒＋絲綢", active: s.pair === "glass", apply: () => ({ pair: "glass", rubbed: false, near: false }) },
        { label: "塑膠棒＋毛皮", active: s.pair === "plastic", apply: () => ({ pair: "plastic", rubbed: false, near: false }) },
        { label: "🤝 互相摩擦", active: s.rubbed, apply: () => ({ pair: s.pair, rubbed: true, near: s.near }) },
        {
          label: s.near ? "👈 把棒子移開" : "👉 靠近懸吊的帶負電塑膠棒",
          active: s.near,
          disabled: !s.rubbed,
          apply: () => ({ pair: s.pair, rubbed: s.rubbed, near: !s.near })
        },
        { label: "↺ 重來", apply: () => ({ pair: s.pair, rubbed: false, near: false }) }
      ];
    },
    markup(s) {
      const glass = s.pair === "glass";
      const rodCharge = !s.rubbed ? "" : glass ? "+" : "−";
      const clothCharge = !s.rubbed ? "" : glass ? "−" : "+";
      const rodX = s.near ? 300 : 60;
      const rodY = s.near ? 140 : 72;
      const rodFill = glass ? "#e0f2fe" : "#475569";
      const rodLabel = glass ? "玻璃棒" : "塑膠棒";
      const clothLabel = glass ? "絲綢" : "毛皮";
      const clothFill = glass ? "#fbcfe8" : "#d6b48a";
      const signs = (c, n) => (c ? Array(n).fill(c === "+" ? "+" : "−").join(" ") : "不帶電");
      const signColor = (c, onDark) => (c === "+" ? C.proton : c === "−" ? (onDark ? "#e0f2fe" : C.electron) : C.muted);
      // 懸吊棒（帶負電）：吸引時轉向左、排斥時轉向右
      let shift = 0;
      let result = "";
      if (s.near && s.rubbed) {
        shift = rodCharge === "+" ? -26 : 20;
        result = rodCharge === "+" ? "異性相吸 → 懸吊棒被吸過來" : "同性相斥 → 懸吊棒被推開";
      }
      const resultColor = rodCharge === "+" ? C.ok : C.warn;
      const flow = s.rubbed && !s.near
        ? glass
          ? line(250, 92, 380, 92, C.electron, 3, 'stroke-dasharray="7 5" marker-end="url(#w2arrowb-lab)"') + txt(315, 80, "電子 →", 14, C.electron, 800)
          : line(380, 92, 250, 92, C.electron, 3, 'stroke-dasharray="7 5" marker-end="url(#w2arrowb-lab)"') + txt(315, 80, "← 電子", 14, C.electron, 800)
        : "";
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 300" role="img" aria-label="摩擦起電實驗：${rodLabel}與${clothLabel}">` +
        arrowDefs("lab") +
        rect(1, 1, 678, 298, "#f8fbfc", "#d8e8ed", 18) +
        // 摩擦的棒子
        rect(rodX, rodY, 180, 40, rodFill, "#334155", 10) +
        txt(rodX + 90, rodY + 27, signs(rodCharge, 4), 20, signColor(rodCharge, !glass), 900) +
        txt(rodX + 90, rodY + 64, rodLabel, 16, C.ink, 800) +
        // 布料（靠近時留在原地）
        (s.near
          ? ""
          : `<path d="M 390 70 q 35 -10 70 0 q 35 10 70 0 l 0 44 q -35 10 -70 0 q -35 -10 -70 0 z" fill="${clothFill}" stroke="#334155" stroke-width="2"/>` +
            txt(460, 98, signs(clothCharge, 3), 20, signColor(clothCharge), 900) +
            txt(460, 136, clothLabel, 16, C.ink, 800)) +
        flow +
        // 懸吊的帶負電塑膠棒
        line(560, 30, 640, 30, "#334155", 5) +
        line(600, 30, 600 + shift, 150, "#64748b", 2) +
        `<g transform="translate(${shift} 0)">` +
        rect(540, 150, 120, 22, "#475569", "#1e293b", 8) +
        txt(600, 167, "− − − −", 16, "#e0f2fe", 900) +
        "</g>" +
        txt(600, 206, "懸吊：帶負電塑膠棒", 14, C.ink, 800) +
        (result ? txt(340, 256, result, 22, resultColor, 900) : "") +
        (!s.rubbed ? txt(300, 256, "請按「互相摩擦」", 18, C.muted, 800) : "") +
        (s.rubbed && !s.near ? txt(300, 256, `${rodLabel}帶${rodCharge === "+" ? "正" : "負"}電，${clothLabel}帶${clothCharge === "+" ? "正" : "負"}電`, 19, C.ink, 900) : "") +
        "</svg>"
      );
    },
    status(s) {
      const glass = s.pair === "glass";
      if (!s.rubbed) return "⏸️ 兩種材料還沒摩擦，都還是電中性。";
      if (!s.near)
        return glass
          ? "🔴 玻璃棒的電子跑到絲綢上：玻璃棒失去電子帶正電，絲綢得到電子帶負電。"
          : "🔵 毛皮的電子跑到塑膠棒上：塑膠棒得到電子帶負電，毛皮失去電子帶正電。";
      return glass
        ? "✅ 帶正電的玻璃棒靠近帶負電的懸吊棒：異性相吸，懸吊棒被吸過來。"
        : "⚠️ 帶負電的塑膠棒靠近帶負電的懸吊棒：同性相斥，懸吊棒被推開。";
    }
  }
};
