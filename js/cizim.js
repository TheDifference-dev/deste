/* deste temsilî kart çizimi.
   Görseli olmayan ilan ve katalog kartları için kartın adını taşıyan özgün bir yüz çizer.
   Çizim soyuttur: kartın türüne/rengine göre desen (alev, dalga, yaprak…), karakter ya da resmî kart sanatı içermez.
   Aynı kart her zaman aynı çizimi alır (ad + kimlikten tohum). */
(() => {
  const D = window.D;
  const P = {
    ates: ["Ateş", "#c8401f", "#f6a93b"], su: ["Su", "#1f63b8", "#79c6f0"], ot: ["Ot", "#2f7d3c", "#a6d86a"],
    simsek: ["Şimşek", "#c79a00", "#fff07a"], psisik: ["Psişik", "#6d33b8", "#e08ad8"], dovus: ["Dövüş", "#94461f", "#e6a86b"],
    karanlik: ["Karanlık", "#20233a", "#6b5fa0"], metal: ["Metal", "#5d6876", "#d3dbe3"], ejder: ["Ejder", "#8f6c16", "#5577d6"],
    renksiz: ["Renksiz", "#8c867c", "#ece6dc"], peri: ["Peri", "#c24d8f", "#f9c3dc"], egitmen: ["Eğitmen", "#4f6173", "#d9e2ea"],
    enerji: ["Enerji", "#3a7f8c", "#bfe9ef"], isik: ["Işık", "#c9a227", "#fff8d8"], toprak: ["Toprak", "#71532b", "#d2b27a"],
    ruzgar: ["Rüzgâr", "#3d9a6c", "#d5f2e2"], ilahi: ["İlahi", "#b8860b", "#fff3b0"], buyu: ["Büyü", "#137f73", "#8be0cf"],
    tuzak: ["Tuzak", "#9a2660", "#f08cb8"], kirmizi: ["Kırmızı", "#b3262c", "#f2867c"], yesil: ["Yeşil", "#2c7a3f", "#9fdc9a"],
    mavi: ["Mavi", "#1d5aa8", "#8cc4f2"], mor: ["Mor", "#5b2c99", "#c79af0"], siyah: ["Siyah", "#1d1d22", "#7a7f8a"],
    sari: ["Sarı", "#b98d00", "#ffe680"], kristal: ["Kristal", "#3f5fa0", "#c9b6f2"]
  };
  const TUR = {
    Fire: "ates", Water: "su", Grass: "ot", Lightning: "simsek", Psychic: "psisik", Fighting: "dovus", Darkness: "karanlik",
    Metal: "metal", Dragon: "ejder", Colorless: "renksiz", Fairy: "peri", Trainer: "egitmen", Energy: "enerji",
    DARK: "karanlik", LIGHT: "isik", FIRE: "ates", WATER: "su", EARTH: "toprak", WIND: "ruzgar", DIVINE: "ilahi", SPELL: "buyu", TRAP: "tuzak",
    Red: "kirmizi", Green: "yesil", Blue: "mavi", Purple: "mor", Black: "siyah", Yellow: "sari"
  };
  const MOTIF = {
    ates: ["alev", "isin", "kristal"], su: ["dalga", "sarmal", "halka"], ot: ["yaprak", "dag", "pirilti"], simsek: ["simsek", "isin", "zikzak"],
    psisik: ["sarmal", "halka", "pirilti"], dovus: ["dag", "zikzak", "kare"], karanlik: ["hilal", "pul", "sarmal"], metal: ["petek", "kare", "kristal"],
    ejder: ["pul", "alev", "dag"], renksiz: ["kare", "pusula", "halka"], peri: ["pirilti", "yaprak", "halka"], egitmen: ["pusula", "kare", "petek"],
    enerji: ["halka", "sarmal", "isin"], isik: ["isin", "pirilti", "pusula"], toprak: ["dag", "kristal", "petek"], ruzgar: ["girdap", "dalga", "yaprak"],
    ilahi: ["isin", "halka", "cember"], buyu: ["cember", "pirilti", "halka", "kare"], tuzak: ["zikzak", "kare", "petek", "pul"],
    kirmizi: ["alev", "isin", "zikzak"], yesil: ["yaprak", "girdap", "dag"], mavi: ["dalga", "halka", "petek"], mor: ["sarmal", "pirilti", "cember"],
    siyah: ["hilal", "pul", "kare"], sari: ["simsek", "isin", "pusula"], kristal: ["kristal", "petek", "pirilti"]
  };
  const MARKA = { pokemon: "Pokémon", yugioh: "Yu-Gi-Oh!", onepiece: "One Piece", magic: "Magic" };
  const X = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const kis = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  const rng = t => () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };

  /* sanat penceresi 0..520 x 0..380 koordinatında */
  const W = 520, H = 380, CX = 260, CY = 190;
  const desen = {
    alev: (r, a, b) => { let s = `<circle cx="${CX}" cy="${CY + 40}" r="120" fill="${b}" opacity=".25"/>`;
      for (let i = 0; i < 7; i++) { const x = 90 + i * 57 + r() * 20, h = 120 + r() * 150, w = 36 + r() * 30;
        s += `<path d="M${x - w} ${H} C${x - w} ${H - h * .5} ${x - 8} ${H - h * .7} ${x} ${H - h} C${x + 10} ${H - h * .6} ${x + w} ${H - h * .45} ${x + w} ${H}Z" fill="${i % 2 ? a : b}" opacity="${.55 + r() * .4}"/>`; } return s; },
    dalga: (r, a, b) => { let s = ""; for (let i = 0; i < 7; i++) { const y = 120 + i * 40, k = 26 + r() * 22, f = r() * 100;
        s += `<path d="M-20 ${y} Q ${60 + f} ${y - k} ${140 + f} ${y} T ${300 + f} ${y} T ${460 + f} ${y} T ${620 + f} ${y} V${H} H-20Z" fill="${i % 2 ? a : b}" opacity="${.18 + i * .1}"/>`; }
      return `<circle cx="${380 + r() * 60}" cy="80" r="40" fill="${b}" opacity=".6"/>` + s; },
    yaprak: (r, a, b) => { let s = ""; for (let i = 0; i < 9; i++) { const ang = i * 40 + r() * 15, l = 100 + r() * 50;
        s += `<g transform="rotate(${ang} ${CX} ${CY})"><path d="M${CX} ${CY} q 30 ${-l / 2} 0 ${-l} q -30 ${l / 2} 0 ${l}Z" fill="${i % 2 ? a : b}" opacity=".8"/><line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - l}" stroke="#fff" stroke-opacity=".35" stroke-width="2"/></g>`; }
      return s + `<circle cx="${CX}" cy="${CY}" r="18" fill="${b}"/>`; },
    simsek: (r, a, b) => { const x = CX - 20 + r() * 40;
      return `<circle cx="${CX}" cy="${CY}" r="150" fill="none" stroke="${b}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="12 16"/><circle cx="${CX}" cy="${CY}" r="105" fill="${a}" opacity=".35"/>
<path d="M${x + 30} 40 L${x - 60} 210 L${x} 205 L${x - 30} 345 L${x + 80} 160 L${x + 18} 165 L${x + 60} 40Z" fill="${b}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`; },
    sarmal: (r, a, b) => { let s = ""; for (let i = 9; i > 0; i--) s += `<circle cx="${CX + Math.sin(i) * 8}" cy="${CY + Math.cos(i) * 8}" r="${i * 17}" fill="none" stroke="${i % 2 ? a : b}" stroke-width="${3 + r() * 5}" opacity="${.3 + i * .06}"/>`;
      return s + `<circle cx="${CX}" cy="${CY}" r="14" fill="${b}"/>`; },
    dag: (r, a, b) => { let s = `<circle cx="${120 + r() * 280}" cy="90" r="46" fill="${b}" opacity=".7"/>`;
      for (let k = 0; k < 3; k++) { let d = `M-10 ${H}`; const y0 = 190 + k * 55; for (let x = -10; x <= W + 60; x += 70 + r() * 50) d += ` L${x} ${y0 - r() * (110 - k * 25)}`;
        s += `<path d="${d} L${W + 60} ${H}Z" fill="${k % 2 ? b : a}" opacity="${.45 + k * .2}"/>`; } return s; },
    hilal: (r, a, b) => { let s = ""; for (let i = 0; i < 40; i++) s += `<circle cx="${r() * W}" cy="${r() * H}" r="${.8 + r() * 2.4}" fill="#fff" opacity="${.3 + r() * .7}"/>`;
      return s + `<circle cx="${CX}" cy="${CY}" r="110" fill="${b}"/><circle cx="${CX + 46}" cy="${CY - 30}" r="100" fill="${a}"/>`; },
    petek: (r, a, b) => { let s = ""; const R = 34; for (let y = 0; y < 8; y++) for (let x = 0; x < 10; x++) { const cx = x * R * 1.75 + (y % 2 ? R * .87 : 0), cy = y * R * 1.5;
        const p = [0, 1, 2, 3, 4, 5].map(i => `${cx + R * Math.cos(Math.PI / 3 * i + Math.PI / 6)},${cy + R * Math.sin(Math.PI / 3 * i + Math.PI / 6)}`).join(" ");
        s += `<polygon points="${p}" fill="${r() < .3 ? b : a}" opacity="${.25 + r() * .5}" stroke="#fff" stroke-opacity=".25"/>`; } return s; },
    pul: (r, a, b) => { let s = ""; for (let y = 0; y < 9; y++) for (let x = 0; x < 11; x++) { const cx = x * 52 + (y % 2 ? 26 : 0), cy = y * 44;
        s += `<path d="M${cx - 26} ${cy} A26 26 0 0 0 ${cx + 26} ${cy}" fill="${(x + y) % 3 ? a : b}" opacity="${.4 + r() * .5}" stroke="#fff" stroke-opacity=".3"/>`; } return s; },
    kare: (r, a, b) => { let s = ""; for (let i = 8; i > 0; i--) s += `<rect x="${CX - i * 20}" y="${CY - i * 20}" width="${i * 40}" height="${i * 40}" rx="${i * 3}" fill="${i % 2 ? a : b}" opacity="${.15 + (8 - i) * .1}" transform="rotate(${i * 7 + r() * 6} ${CX} ${CY})"/>`; return s; },
    pirilti: (r, a, b) => { let s = ""; const yildiz = (x, y, k, c) => `<path d="M${x} ${y - k} Q${x} ${y} ${x + k} ${y} Q${x} ${y} ${x} ${y + k} Q${x} ${y} ${x - k} ${y} Q${x} ${y} ${x} ${y - k}Z" fill="${c}"/>`;
      s += `<circle cx="${CX}" cy="${CY}" r="120" fill="${b}" opacity=".35"/>` + yildiz(CX, CY, 90, "#fff");
      for (let i = 0; i < 12; i++) s += yildiz(r() * W, r() * H, 8 + r() * 22, i % 2 ? b : "#fff"); return s; },
    pusula: (r, a, b) => `<circle cx="${CX}" cy="${CY}" r="150" fill="none" stroke="${b}" stroke-width="6"/><circle cx="${CX}" cy="${CY}" r="120" fill="${a}" opacity=".5"/>
${[0, 45, 90, 135].map(d => `<path d="M${CX} ${CY - (d % 90 ? 90 : 140)} L${CX + 14} ${CY} L${CX} ${CY + (d % 90 ? 90 : 140)} L${CX - 14} ${CY}Z" fill="${d % 90 ? b : "#fff"}" transform="rotate(${d} ${CX} ${CY})"/>`).join("")}<circle cx="${CX}" cy="${CY}" r="12" fill="${a}"/>`,
    halka: (r, a, b) => { let s = ""; for (let i = 0; i < 3; i++) s += `<ellipse cx="${CX}" cy="${CY}" rx="150" ry="52" fill="none" stroke="${i % 2 ? a : b}" stroke-width="7" transform="rotate(${i * 60 + r() * 10} ${CX} ${CY})"/>`;
      return s + `<circle cx="${CX}" cy="${CY}" r="34" fill="${b}"/>`; },
    isin: (r, a, b) => { let s = ""; const n = 18; for (let i = 0; i < n; i++) s += `<path d="M${CX} ${CY} L${CX - 14} ${CY - 260} L${CX + 14} ${CY - 260}Z" fill="${i % 2 ? b : a}" opacity=".6" transform="rotate(${i * 360 / n} ${CX} ${CY})"/>`;
      return s + `<circle cx="${CX}" cy="${CY}" r="70" fill="${b}"/><circle cx="${CX}" cy="${CY}" r="44" fill="#fff" opacity=".85"/>`; },
    girdap: (r, a, b) => { let s = ""; for (let i = 0; i < 8; i++) { const y = 60 + i * 38, f = r() * 120;
        s += `<path d="M${-20 + f} ${y} C ${120 + f} ${y - 50} ${240 + f} ${y + 50} ${380 + f} ${y} S ${560} ${y - 30} ${600} ${y}" fill="none" stroke="${i % 2 ? a : b}" stroke-width="${4 + r() * 6}" stroke-linecap="round" opacity=".75"/>`; } return s; },
    cember: (r, a, b) => { const k = 5 + Math.floor(r() * 3), R = 130, p = []; for (let i = 0; i < k; i++) { const t = -Math.PI / 2 + i * 2 * Math.PI / k; p.push([CX + R * Math.cos(t), CY + R * Math.sin(t)]); }
      const yol = p.map((_, i) => p[(i * 2) % k]).map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ") + "Z";
      return `<circle cx="${CX}" cy="${CY}" r="${R + 22}" fill="${a}" opacity=".35"/><circle cx="${CX}" cy="${CY}" r="${R + 22}" fill="none" stroke="${b}" stroke-width="4"/><circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 8"/>
<path d="${yol}" fill="none" stroke="${b}" stroke-width="5" stroke-linejoin="round"/>${p.map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="9" fill="#fff"/>`).join("")}`; },
    zikzak: (r, a, b) => { let s = ""; for (let i = 0; i < 6; i++) { const y = 40 + i * 58; let d = `M-10 ${y}`; for (let x = 0; x <= W + 40; x += 52) d += ` L${x} ${y + (x / 52 % 2 ? 34 : 0)}`;
        s += `<path d="${d}" fill="none" stroke="${i % 2 ? a : b}" stroke-width="${10 + r() * 6}" stroke-linejoin="miter" opacity=".7"/>`; }
      return s + `<rect x="${CX - 70}" y="${CY - 70}" width="140" height="140" fill="none" stroke="#fff" stroke-width="6" transform="rotate(45 ${CX} ${CY})"/>`; },
    kristal: (r, a, b) => { let s = ""; for (let i = 0; i < 7; i++) { const x = 90 + i * 57, h = 110 + r() * 170, w = 26 + r() * 18;
        s += `<path d="M${x - w} ${H - 30} L${x - w} ${H - 30 - h * .7} L${x} ${H - 30 - h} L${x + w} ${H - 30 - h * .7} L${x + w} ${H - 30}Z" fill="${i % 2 ? a : b}" opacity=".8" stroke="#fff" stroke-opacity=".5"/>`; } return s; }
  };
  const kim = k => k.tur || k.kategori || k.marka || "";
  const paletAnahtar = k => {
    const t = String(k.tur || "").split(" ").map(x => TUR[x]).filter(Boolean);
    if (t.length) return t;
    const yedek = Object.keys(P); return [yedek[D.hash(k.baslik || k.ad || k.id || "x") % yedek.length]];
  };
  const onbellek = new Map();
  D.cizim = k => {
    const ad = String(k.baslik || k.ad || "Kart"), id = String(k.id || ad), anahtar = id + "|" + ad + "|" + kim(k);
    if (onbellek.has(anahtar)) return onbellek.get(anahtar);
    const r = rng(D.hash(anahtar) ^ D.hash(ad + "·" + id.length)); r(); r(); const pk = paletAnahtar(k), p1 = P[pk[0]], p2 = P[pk[1] || pk[0]];
    const a = p1[1], b = p2[2], ml = MOTIF[pk[0]] || ["kristal"], motif = desen[ml[Math.floor(r() * ml.length)]] || desen.kristal;
    const marka = MARKA[k.marka || k.kategori] || D.KAT?.[k.kategori] || "";
    const etiket = pk.map(x => P[x][0]).join(" / ");
    const fs = Math.max(22, Math.min(40, Math.floor(760 / Math.max(ad.length, 10))));
    const set = kis(k.set || "", 40), no = kis(k.numara || "", 18), nad = kis(k.nadirlik || "", 28);
    const satir = (y, renk, sol, sag) => `<circle cx="80" cy="${y - 7}" r="9" fill="${renk}"/><text x="100" y="${y}" font-size="20" font-weight="600" fill="#2a2a2a">${X(sol)}</text><text x="560" y="${y}" font-size="20" font-weight="700" fill="#2a2a2a" text-anchor="end">${X(sag)}</text><line x1="72" x2="560" y1="${y + 16}" y2="${y + 16}" stroke="#2a2a2a" stroke-opacity=".12"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 880" font-family="Inter,Helvetica,Arial,sans-serif">
<defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p1[2]}"/><stop offset=".5" stop-color="${a}"/><stop offset="1" stop-color="${p2[2]}"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14121c"/><stop offset="1" stop-color="${a}"/></linearGradient><clipPath id="p"><rect width="${W}" height="${H}" rx="8"/></clipPath></defs>
<rect width="630" height="880" rx="34" fill="url(#c)"/><rect x="22" y="22" width="586" height="836" rx="22" fill="#f4ecd8"/>
<text x="56" y="88" font-size="${fs}" font-weight="800" fill="#1d1d1f"${ad.length > 30 ? ` textLength="440" lengthAdjust="spacingAndGlyphs"` : ""}>${X(kis(ad, 48))}</text>
<text x="574" y="86" font-size="18" font-weight="700" fill="${a}" text-anchor="end">${X(etiket.toUpperCase())}</text>
<g transform="translate(55 118)"><rect x="-6" y="-6" width="${W + 12}" height="${H + 12}" rx="12" fill="${b}"/><g clip-path="url(#p)"><rect width="${W}" height="${H}" fill="url(#g)"/>${motif(r, a, b)}
<text x="${W - 18}" y="${H - 18}" font-size="120" font-weight="900" fill="#fff" fill-opacity=".14" text-anchor="end">${X(ad.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase())}</text></g></g>
<rect x="86" y="516" width="458" height="30" rx="4" fill="${b}" opacity=".45"/><text x="315" y="537" font-size="15" font-style="italic" fill="#3a3a3a" text-anchor="middle">Temsilî çizim · deste · resmî kart görseli değildir</text>
${satir(608, a, "Set", set || "—")}${satir(664, b, "Numara", no || "—")}${satir(720, a, "Nadirlik", nad || (k.durum ? String(k.durum) : "—"))}
<text x="56" y="818" font-size="16" fill="#555">${X(marka)}${k.yil ? " · " + X(k.yil) : ""}</text><text x="574" y="818" font-size="16" fill="#555" text-anchor="end">deste 2026</text></svg>`;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    if (onbellek.size > 800) onbellek.clear(); onbellek.set(anahtar, url); return url;
  };
})();
