/* deste ana sayfa: kaydırmayla yönetilen sahne, kart kılıfı animasyonları, canlı pazar verisi */
(() => {
  const { esc } = D;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const yumusak = t => t * t * (3 - 2 * t);
  const seg = (p, a, b) => yumusak(clamp((p - a) / (b - a)));
  const mobil = () => matchMedia("(max-width:809px)").matches;
  const azHareket = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- pazar verisinden türetilenler (uygulama.js de kullanır) ---------- */
  D.ilanlar = () => Object.entries(Veri.users).flatMap(([uid, u]) => (Array.isArray(u.kartlar) ? u.kartlar : [])
    .filter(k => k && Veri.idOk(k.id) && typeof k.baslik === "string")
    .map(k => ({ ...k, saticiId: uid, satici: String(u.takmaAd || "Koleksiyoncu"), sehir: String(k.sehir || u.sehir || ""), ornek: !!u.ornek })));
  D.aktif = () => D.ilanlar().filter(k => !k.satildi);
  let yenileZ;
  D.yenile = () => { clearTimeout(yenileZ); yenileZ = setTimeout(() => window.dispatchEvent(new Event("deste:veri")), 80); };
  /* görsel önceliği: satıcının fotoğrafı > satıcının görsel bağlantısı > resmî kart görseli > temsilî çizim (izinli kaynak, claude.ai dışında) > özgün deste çizimi */
  D.resim = k => {
    if (k.foto) { const c = Veri.fotoOnbellek(k.saticiId, k.id); if (c) return c; if (c === undefined) Veri.fotoAdresi(k.saticiId, k.id, k.foto).then(u => u && D.yenile()); }
    if (D.gorselGecerli(k)) return k.gorsel;
    if (D.resmiGecerli(k)) return k.resmi;
    return D.cizim(k); // temsilî çizim, kartın adıyla (js/cizim.js)
  };
  D.sure = t => { const d = (Date.now() - (t || 0)) / 6e4; return d < 1 ? "az önce" : d < 60 ? `${Math.round(d)} dk önce` : d < 1440 ? `${Math.round(d / 60)} sa önce` : new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }); };

  /* ---------- hikâye: kart kılıfı ---------- */
  const hikaye = $("#hikaye"), kutu = $("#kartkutu"), slab = $("#slab3d"), yuzOn = $("#yuzOn"), golge = $("#golge");
  $("#yuzArka").innerHTML = D.slabArka();
  const sanatlar = D.SANAT.map((a, i) => D.sanatKart(a, i));
  let yuzler = [sanatlar[0], sanatlar[1], sanatlar[2]], yuzNo = -1, oneCikan = null;
  sanatlar.forEach(k => { k.resim = "img/kart-" + k.id.replace("sanat-", "") + ".webp"; });
  D.sanatResim = k => k.resim || D.sanatFor(k);
  const yuzKoy2 = i => { if (i === yuzNo) return; yuzNo = i; const k = yuzler[Math.min(i, yuzler.length - 1)]; yuzOn.innerHTML = D.slab(k, k.saticiId ? D.resim(k) : k.resim); };

  const teker = $("#teker"), kizgara = $("#kizgara");
  const dSpan = $$("#dGrad span");
  const katman = { mavi: $("#kMavi"), gri: $("#kGri"), fiyat: $("#kFiyat"), yesil: $("#kYesil") };
  const fiyatBlok = $(".fiyat-blok"), sabitler = $(".sabitler .hero-t"), heroSag = $(".hero-sag");
  const c1 = $("#c1"), c2 = $("#c2"), kes = $("#cKesisim");
  const L1 = c1.getTotalLength(), L2 = c2.getTotalLength();
  [[c1, L1], [c2, L2]].forEach(([c, L]) => { c.style.strokeDasharray = L; c.style.strokeDashoffset = L; });
  const TEKER_N = 14;
  function tekerKur() {
    const akt = D.aktif();
    teker.innerHTML = Array.from({ length: TEKER_N }, (_, i) => {
      if (i === 0) return `<div class="tk" data-i="0"></div>`;
      const k = akt[i - 1] || sanatlar[i % sanatlar.length];
      return `<div class="tk" data-i="${i}">${D.slab(k, k.saticiId ? D.resim(k) : k.resim)}</div>`;
    }).join("");
  }
  function grizKur() {
    const akt = D.aktif();
    const hucre = [];
    for (let i = 0; i < 9; i++) {
      if (i === 4 && !mobil()) { hucre.push(`<div class="hucre"><div class="bos-hucre" id="merkezHucre"></div></div>`); continue; }
      const k = akt[i > 4 ? i - 1 : i] || sanatlar[(i + 3) % sanatlar.length];
      const tag = k.saticiId ? `<span>${esc(k.tip === "takas" ? "Takas" : typeof k.fiyat === "number" ? D.TL.format(k.fiyat) : "Teklif")}</span><span>${esc(k.sehir || "")}</span>` : `<span>Örnek</span><span>deste</span>`;
      hucre.push(`<div class="hucre">${D.slab(k, k.saticiId ? D.resim(k) : k.resim)}<div class="tag">${tag}</div></div>`);
    }
    kizgara.innerHTML = hucre.join("");
  }

  const ara = (kf, p) => { // anahtar kareler arasında yumuşak geçiş
    if (p <= kf[0].p) return { ...kf[0] };
    for (let i = 1; i < kf.length; i++) if (p <= kf[i].p) { const a = kf[i - 1], b = kf[i], t = yumusak((p - a.p) / (b.p - a.p)); const o = {}; for (const k in b) o[k] = a[k] + (b[k] - a[k]) * t; return o; }
    return { ...kf[kf.length - 1] };
  };
  let W = innerWidth, H = innerHeight, merkez = { x: 0, y: 0, s: .4 };
  function olc() {
    W = innerWidth; H = Math.max(innerHeight, 640);
    teker.style.top = H * 1.5 + "px";
    const m = $("#merkezHucre");
    if (m) { const r = m.getBoundingClientRect(), s = $("#sahne").getBoundingClientRect(); merkez = { x: r.left + r.width / 2 - (s.left + s.width / 2), y: r.top + r.height / 2 - (s.top + s.height / 2), s: r.width / 249 }; }
  }
  let sonFl = new WeakMap();
  const flAc = (el, t) => { const sp = el.querySelectorAll("span"); sp.forEach((s, i) => s.classList.toggle("on", t > (i + .2) / (sp.length + .2))); };
  let tekerAci = 0;
  function hikayeGuncelle() {
    if (mobil()) { hikayeMobil(); return; }
    const r = hikaye.getBoundingClientRect(), top = hikaye.offsetHeight - innerHeight;
    const p = clamp(-r.top / top);
    if (r.bottom < -50 || r.top > innerHeight) return;
    const R = H * 1.0;
    tekerAci = -seg(p, .5, .62) * 34;
    const a0 = (-90 + tekerAci) * Math.PI / 180;
    const koltuk = { x: Math.cos(a0) * R, y: H * 1.5 - R + (Math.sin(a0) * R + R) - H / 2, rz: tekerAci };
    const kf = [
      { p: 0, x: 0, y: 0, s: 1, ry: 0, rz: 0 }, { p: .06, x: 0, y: 0, s: 1, ry: 0, rz: 0 },
      { p: .18, x: 0, y: 0, s: 1, ry: 360, rz: 0 }, { p: .21, x: 0, y: 0, s: 1, ry: 360, rz: 0 },
      { p: .27, x: -W * .17, y: 0, s: 1, ry: 720, rz: 0 }, { p: .33, x: -W * .17, y: 0, s: 1, ry: 720, rz: 0 },
      { p: .37, x: 0, y: 0, s: 1, ry: 720, rz: 0 }, { p: .46, x: 0, y: 0, s: 1, ry: 720, rz: 0 },
      { p: .5, x: 0, y: 0, s: .723, ry: 720, rz: 0 }, { p: .62, x: koltuk.x, y: koltuk.y, s: .723, ry: 720, rz: koltuk.rz },
      { p: .68, x: merkez.x, y: merkez.y, s: merkez.s, ry: 720, rz: 0 }, { p: 1, x: merkez.x, y: merkez.y, s: merkez.s, ry: 720, rz: 0 }];
    let c = ara(kf, p);
    if (p > .5 && p <= .62) { c.x = koltuk.x; c.y = koltuk.y; c.rz = koltuk.rz; }
    const yuz = Math.floor((c.ry + 90) / 360); yuzKoy2(Math.max(0, yuz));
    const tilt = p < .06 && !azHareket ? Math.sin(performance.now() / 900) * 4 : 0;
    kutu.style.transform = `translate(${c.x}px,${c.y + tilt}px) scale(${c.s}) rotate(${c.rz}deg)`;
    slab.style.transform = `rotateY(${c.ry}deg) rotateX(${p < .06 ? Math.sin(performance.now() / 1300) * 3 : 0}deg)`;
    yuzOn.querySelector(".sl")?.style.setProperty("--parla", (50 + Math.sin(c.ry * Math.PI / 180) * 60) + "%");
    golge.style.opacity = String(1 - seg(p, .46, .5));
    // hero yazısı
    const h = seg(p, .015, .06);
    sabitler.style.opacity = heroSag.style.opacity = String(1 - h); sabitler.style.transform = `translateY(${-h * 40}px)`;
    sabitler.style.visibility = heroSag.style.visibility = h >= 1 ? "hidden" : "visible";
    // Dereceli. Kayıtlı. Takaslık.
    const dg = $("#dGrad"); dg.style.opacity = String(seg(p, .065, .09) * (1 - seg(p, .2, .23)));
    dSpan.forEach((s, i) => s.classList.toggle("on", p > .09 + i * .03));
    // fiyat
    const f = seg(p, .25, .28) * (1 - seg(p, .32, .35));
    katman.fiyat.style.opacity = f > 0 ? 1 : 0; fiyatBlok.style.opacity = String(f); fiyatBlok.style.transform = `translate(${(1 - f) * 40}px,-55%)`;
    fiyatBlok.style.pointerEvents = f > .5 ? "auto" : "none";
    // mavi
    const mv = seg(p, .34, .38);
    katman.mavi.style.opacity = mv > 0 ? 1 : 0; katman.mavi.style.clipPath = `inset(${(1 - mv) * 100}% 0 0 0)`;
    const ciz = seg(p, .38, .46);
    c1.style.strokeDashoffset = L1 * (1 - ciz); c2.style.strokeDashoffset = L2 * (1 - ciz);
    kes.style.opacity = ciz > .52 ? 1 : 0;
    $$(".mavi .etiket").forEach((e, i) => e.style.opacity = i === 2 ? (ciz > .52 ? 1 : 0) : (ciz > .95 ? 1 : 0));
    $$(".mavi .fl").forEach(e => flAc(e, seg(p, .37, .45)));
    // gri teker
    const gr = seg(p, .47, .5);
    katman.gri.style.opacity = gr > 0 ? 1 : 0; katman.gri.style.clipPath = `inset(${(1 - gr) * 100}% 0 0 0)`;
    $$("#teker .tk").forEach(el => { const i = +el.dataset.i, a = -90 + tekerAci + i * (360 / TEKER_N);
      el.style.transform = `rotate(${a + 90}deg) translateY(${-R}px)`; });
    $$(".gri .fl").forEach(e => flAc(e, seg(p, .5, .6)));
    // yeşil ızgara
    const ye = seg(p, .63, .67);
    katman.yesil.style.opacity = ye > 0 ? 1 : 0; katman.yesil.style.clipPath = `inset(${(1 - ye) * 100}% 0 0 0)`;
    kizgara.style.opacity = String(seg(p, .64, .69));
    $$(".yesil .fl").forEach(e => flAc(e, seg(p, .67, .76)));
  }
  let mobilYuz = 0;
  function hikayeMobil() {
    const t = clamp(scrollY / 900);
    const ry = t * 360; yuzKoy2(Math.floor((ry + 90) / 360));
    kutu.style.transform = ""; slab.style.transform = `rotateY(${ry}deg)`;
    katman.mavi.style.opacity = katman.gri.style.opacity = katman.yesil.style.opacity = katman.fiyat.style.opacity = 1;
    [c1, c2].forEach(c => c.style.strokeDashoffset = 0); kes.style.opacity = 1;
    sabitler.style.opacity = 1; sabitler.style.transform = ""; sabitler.style.visibility = "visible"; kizgara.style.opacity = 1;
    $$(".katman .fl span").forEach(s => s.classList.add("on"));
  }

  /* ---------- ride: kayan kılıflar ---------- */
  const ride = $("#ride"), sira = $("#rideSira");
  let rideKartlar = [];
  const RENK = { pokemon: "#ffd98a", yugioh: "#d9c8ff", magic: "#b8ecc6", onepiece: "#b5d8ff", futbol: "#e2574c", basketbol: "#f28c28", diger: "#c4c4c4" };
  function rideKur() {
    const akt = D.aktif().sort((a, b) => (b.tarih || 0) - (a.tarih || 0)).slice(0, 11);
    rideKartlar = akt.length >= 5 ? akt : [...akt, ...sanatlar.slice(0, 7 - akt.length)];
    sira.innerHTML = rideKartlar.map((k, i) => `<div class="rk" data-i="${i}" ${k.saticiId ? `data-ac="${esc(k.saticiId + "|" + k.id)}" role="button" tabindex="0" aria-label="${esc(k.baslik)}"` : ""}>${D.slab(k, k.saticiId ? D.resim(k) : k.resim)}</div>`).join("");
  }
  let rideSon = -1;
  function rideGuncelle() {
    if (mobil() || !rideKartlar.length) return;
    const r = ride.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const p = clamp(-r.top / (ride.offsetHeight - innerHeight)), n = rideKartlar.length, c = p * (n - 1);
    $$("#rideSira .rk").forEach(el => { const d = +el.dataset.i - c, ad = Math.abs(d);
      el.style.transform = `translateX(${d * 250}px) translateZ(${-ad * 260}px) rotateY(${-Math.sign(d) * Math.min(ad, 1.4) * 28}deg)`;
      // resmî kart görselleri bulanıklaştırılmaz (Scryfall görsel kuralları); derinlik yalnız saydamlıkla verilir
      const gercek = !!el.querySelector(".sl.gercek");
      el.style.filter = gercek ? "none" : `blur(${Math.min(9, ad * 3.2).toFixed(1)}px)`;
      el.style.opacity = String(gercek ? clamp(1 - Math.max(0, ad - .6) * .4) : clamp(1 - (ad - 2.6) * .6)); el.style.zIndex = String(100 - Math.round(ad * 10)); });
    const i = Math.round(c);
    if (i !== rideSon) { rideSon = i; const k = rideKartlar[i]; if (!k) return;
      $("#rideAd").textContent = k.baslik;
      $("#rideMeta").textContent = [k.set, D.dereceMetni(k), k.sehir].filter(Boolean).join(" · ") + (k.saticiId ? "" : " · deste örnek kartı");
      const a = RENK[k.kategori] || "#c4c4c4", b = RENK[(rideKartlar[i + 1] || k).kategori] || "#888";
      $("#rideZemin").style.background = `radial-gradient(40% 50% at 30% 40%, ${a}, transparent 70%), radial-gradient(45% 55% at 75% 60%, ${b}, transparent 70%), radial-gradient(30% 40% at 55% 20%, #163a92, transparent 70%)`; }
  }

  /* ---------- ilan sayısı grafiği ---------- */
  const g2 = $("#grafik2"), yol = $("#g2yol"), svg = $("#g2svg"), nokta = $("#g2nokta");
  let grafikL = 0;
  function grafikKur() {
    const t = D.ilanlar().map(k => k.tarih).filter(x => typeof x === "number").sort((a, b) => a - b);
    const w = 1000, h = 400; svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    if (!t.length) { yol.setAttribute("d", `M0,${h} L${w},${h}`); $("#yeks").innerHTML = "<span>1</span><span>0</span>"; $("#xeks").innerHTML = "<span>–</span>"; grafikL = w; return; }
    const t1 = Math.max(Date.now(), t[t.length - 1] + 1), t0 = Math.min(t[0], t1 - 14 * 864e5), maxN = t.length;
    const ust = Math.max(4, Math.ceil(maxN * 1.15 / 4) * 4);
    const X = x => (x - t0) / (t1 - t0) * w, Y = n => h - n / ust * h;
    let d = `M0,${h}`; t.forEach((x, i) => { d += ` L${X(x).toFixed(1)},${Y(i).toFixed(1)} L${X(x).toFixed(1)},${Y(i + 1).toFixed(1)}`; }); d += ` L${w},${Y(maxN).toFixed(1)}`;
    yol.setAttribute("d", d); grafikL = yol.getTotalLength(); yol.style.strokeDasharray = grafikL;
    $("#yeks").innerHTML = [4, 3, 2, 1, 0].map(i => `<span>${Math.round(ust * i / 4)}</span>`).join("");
    const fm = x => new Date(x).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    $("#xeks").innerHTML = [0, .25, .5, .75, 1].map(f => `<span>${fm(t0 + (t1 - t0) * f)}</span>`).join("");
    nokta.style.left = "100%"; nokta.style.top = (Y(maxN) / h * 100) + "%";
  }
  function grafikGuncelle() {
    const r = g2.getBoundingClientRect(); const p = mobil() || azHareket ? 1 : clamp((innerHeight * .9 - r.top) / (r.height + innerHeight * .3));
    yol.style.strokeDashoffset = grafikL * (1 - p); nokta.style.opacity = p > .97 ? 1 : 0;
  }

  /* ---------- söz ---------- */
  const soz = $("#soz"), sozMetin = $("#sozMetin");
  const SOZ = "deste, kartları doğrudan | koleksiyoncudan koleksiyoncuya taşır.";
  sozMetin.innerHTML = SOZ.split(" ").map(w => w === "|" ? `<span class="yuva" id="yuva"></span>` : `<span class="k">${esc(w)}</span>`).join(" ");
  const sozK = $$("#sozMetin .k");
  function yuvaKur() { const akt = D.aktif(); const l = (akt.length ? akt : sanatlar).slice(0, 8);
    $("#yuva").innerHTML = l.map((k, i) => `<div style="transform:translateY(-140px) rotate(${(i % 2 ? 1 : -1) * (4 + i)}deg);opacity:0">${D.slab(k, k.saticiId ? D.resim(k) : k.resim)}</div>`).join(""); }
  function sozGuncelle() {
    const akt = D.aktif().length;
    const r = soz.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const p = mobil() ? 1 : clamp(-r.top / (soz.offsetHeight - innerHeight));
    const n = Math.floor(seg(p, .05, .55) * sozK.length + .001); sozK.forEach((s, i) => s.classList.toggle("on", i < n));
    const kartlar = $$("#yuva > div"), k = Math.floor(seg(p, .2, .8) * kartlar.length + .001);
    kartlar.forEach((el, i) => { const ac = i < k; el.style.transform = ac ? `rotate(${(i % 2 ? 1 : -1) * (2 + i * .6)}deg)` : `translateY(-140px) rotate(${(i % 2 ? 1 : -1) * 12}deg)`; el.style.opacity = ac ? 1 : 0; });
    $("#sozN").textContent = String(Math.round(seg(p, .3, .9) * akt)).padStart(2, "0");
  }

  /* ---------- kategori kıyası ---------- */
  const kiyas = $("#kiyas");
  let kiyasL = [], kiyasSecili = -1, kiyasElle = null;
  function kiyasKur() {
    const akt = D.aktif(); const say = {}; akt.forEach(k => { say[k.kategori] = (say[k.kategori] || 0) + 1; });
    kiyasL = D.KATS.map(([id, ad]) => ({ id, ad, n: say[id] || 0 })).sort((a, b) => b.n - a.n).slice(0, 5);
    $("#basliklar").innerHTML = kiyasL.map((c, i) => `<p data-k="${i}">${esc(c.ad)}</p>`).join("");
    kiyasSecili = -1;
  }
  function kiyasSec(i) {
    if (i === kiyasSecili || !kiyasL[i]) return; kiyasSecili = i; const c = kiyasL[i], mx = Math.max(1, ...kiyasL.map(x => x.n));
    $$("#basliklar p").forEach((p, j) => p.classList.toggle("on", j === i));
    $("#kiyasV").textContent = `${c.n} ilan`; $("#kiyasBar").style.height = Math.max(3, c.n / mx * 100) + "%";
    $("#kiyasD").textContent = D.KAT_ACIK[c.id] || "";
  }
  function kiyasGuncelle() {
    if (!kiyasL.length) return;
    const r = kiyas.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    if (mobil()) { kiyasSec(kiyasElle ?? 0); return; }
    const p = clamp(-r.top / (kiyas.offsetHeight - innerHeight));
    kiyasSec(Math.min(kiyasL.length - 1, Math.floor(p * kiyasL.length)));
  }
  $("#basliklar").addEventListener("click", e => { const p = e.target.closest("[data-k]"); if (!p) return; kiyasElle = +p.dataset.k;
    if (mobil()) kiyasSec(kiyasElle); else { const top = kiyas.offsetTop + (kiyas.offsetHeight - innerHeight) * (kiyasElle + .5) / kiyasL.length; scrollTo({ top, behavior: azHareket ? "auto" : "smooth" }); } });

  /* ---------- adımlar: iz ve binici kart ---------- */
  const adimlar = $("#nasil"), iz = $("#iz"), izYol = $("#izYol"), izDolu = $("#izYolDolu"), binici = $("#binici");
  let izL = 0, izH = 1900;
  function izKur() {
    const w = adimlar.clientWidth; izH = 1900; iz.setAttribute("viewBox", `0 0 ${w} ${izH}`);
    const sutun = x => 16 + (w - 32) * x / 1408;
    const sag = sutun(908) - 0, sol = sutun(500);
    const ys = $$(".adim").map(a => +a.dataset.y * izH);
    const d = `M${w * .5},0 C${w * .5},${ys[0] * .5} ${sag},${ys[0] * .6} ${sag},${ys[0]} C${sag},${ys[0] + 220} ${sol},${ys[1] - 260} ${sol},${ys[1]} C${sol},${ys[1] + 240} ${sag},${ys[2] - 240} ${sag},${ys[2]} C${sag},${ys[2] + 240} ${sol},${ys[3] - 240} ${sol},${ys[3]} C${sol},${ys[3] + 160} ${w * .5},${izH - 120} ${w * .5},${izH}`;
    izYol.setAttribute("d", d); izDolu.setAttribute("d", d); izL = izDolu.getTotalLength(); izDolu.style.strokeDasharray = izL;
    $$(".adim").forEach(a => { a.style.top = (240 + +a.dataset.y * izH - 48) + "px"; });
  }
  function adimGuncelle() {
    if (mobil()) return;
    const r = adimlar.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const p = clamp((innerHeight * .55 - r.top - 240) / izH);
    izDolu.style.strokeDashoffset = izL * (1 - p);
    const pt = izDolu.getPointAtLength(izL * p), pt2 = izDolu.getPointAtLength(Math.min(izL, izL * p + 4));
    const aci = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI - 90;
    binici.style.transform = `translate(${pt.x}px,${pt.y + 240}px) rotate(${aci * .35}deg)`;
    $$(".adim").forEach(a => a.classList.toggle("on", p >= +a.dataset.y - .04));
  }

  /* ---------- final kartı ---------- */
  const finalKart = $("#finalKart"), finalSlab = $("#finalSlab");
  $("#finalOn").innerHTML = D.slab(sanatlar[4], sanatlar[4].resim); $("#finalArka").innerHTML = D.slabArka();
  let egim = { x: 0, y: 0 };
  addEventListener("pointermove", e => { egim = { x: (e.clientX / innerWidth - .5) * 16, y: (e.clientY / innerHeight - .5) * -10 }; istek(); }, { passive: true });
  function finalGuncelle() {
    const r = finalKart.getBoundingClientRect(); if (r.top > innerHeight + 300) return;
    const t = clamp(1 - r.top / innerHeight);
    finalSlab.style.transform = `rotateY(${azHareket ? 0 : -50 + t * 62 + egim.x}deg) rotateX(${azHareket ? 0 : egim.y}deg)`;
  }

  /* ---------- canlı hero sayıları ---------- */
  function heroSayilar() {
    const akt = D.aktif(); if (!Veri.hazir) { $("#hSon").textContent = Veri.hata || "Pazar yükleniyor…"; return; }
    $("#hIlan").textContent = akt.length; $("#hSatici").textContent = new Set(akt.map(k => k.saticiId)).size;
    const son = [...akt].sort((a, b) => (b.tarih || 0) - (a.tarih || 0))[0];
    $("#hSon").textContent = son ? `Son ilan ${D.sure(son.tarih)}${son.sehir ? " · " + son.sehir : ""}` : "İlk ilanı sen ver.";
    oneCikan = akt.filter(k => typeof k.fiyat === "number").sort((a, b) => b.fiyat - a.fiyat)[0] || null;
    if (oneCikan) {
      yuzler = [sanatlar[0], sanatlar[1], oneCikan]; yuzNo = -1;
      $("#fiyat").textContent = D.TL.format(oneCikan.fiyat);
      $("#fiyatMeta").textContent = [D.dereceMetni(oneCikan), oneCikan.sehir, oneCikan.tip === "ikisi" ? "takas olur" : ""].filter(Boolean).join(" · ").toLocaleUpperCase("tr");
      $("#fiyatGit").dataset.ac = oneCikan.saticiId + "|" + oneCikan.id;
    } else { yuzler = [sanatlar[0], sanatlar[1], sanatlar[2]]; yuzNo = -1; $("#fiyat").textContent = "₺—"; $("#fiyatMeta").textContent = "HENÜZ FİYATLI İLAN YOK"; }
  }

  /* ---------- döngü ---------- */
  let bekliyor = false;
  function istek() { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kare); } }
  function kare() {
    bekliyor = false;
    if (document.body.classList.contains("sayfa-uyg")) return;
    hikayeGuncelle(); rideGuncelle(); grafikGuncelle(); sozGuncelle(); kiyasGuncelle(); adimGuncelle(); finalGuncelle();
    const r = hikaye.getBoundingClientRect(); if (!azHareket && r.top > -innerHeight * .4 && r.top <= 1) istek(); // hero'da hafif süzülme
  }
  addEventListener("scroll", istek, { passive: true });
  addEventListener("resize", () => { olc(); izKur(); grafikKur(); rideSon = -1; istek(); });
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("lit")), { threshold: .4 }).observe($("#neden"));

  function hepsiniKur() { heroSayilar(); tekerKur(); grizKur(); rideKur(); grafikKur(); yuvaKur(); kiyasKur(); olc(); rideSon = -1; istek(); }
  window.addEventListener("deste:veri", hepsiniKur);
  D.anaIstek = istek;
  // ilk çizim (veri gelmeden de sahne dolu görünsün)
  hepsiniKur(); izKur(); kare();
  document.fonts?.ready.then(() => { olc(); izKur(); istek(); });
})();
