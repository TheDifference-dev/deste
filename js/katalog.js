/* deste katalog: popüler kartlar (data/katalog.json), Türk mağaza fiyatları (data/tr-fiyatlar.json),
   ilan formunda katalogdan öneri. Veri dosyalarını başka araçlar üretir; burada yalnız okunur.
   Şemalar:
   - katalog.json: [{id, marka, ad, set, numara, yil, nadirlik, sira, olcut, resmi, kaynak}]
   - tr-fiyatlar.json: {tarih, magazalar[], tekKart[{marka,ad,set,numara,durum,fiyatTL,stok,magaza,url}], kapaliUrun[{marka,urun,fiyatTL,magaza,url}]}
     Dosya yoksa ya da boşsa mağaza bölümleri sessizce gizlenir. */
(() => {
  const { esc, norm } = D;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const MARKALAR = [["pokemon", "Pokémon"], ["yugioh", "Yu-Gi-Oh!"], ["magic", "Magic"], ["onepiece", "One Piece"]];
  const MARKA = Object.fromEntries(MARKALAR);
  const ADIM = 40;
  const K = { marka: "pokemon", q: "", limit: ADIM, son: "", elle: false };
  const str = v => typeof v === "string" ? v.trim() : typeof v === "number" && isFinite(v) ? String(v) : "";
  const bag = u => typeof u === "string" && /^https?:\/\/[^\s"'<>]+$/i.test(u.trim()) ? u.trim() : "";
  const bos = m => `<div class="bos">${m}</div>`;

  /* ---------- yükleme (bir kez, önbellekli) ---------- */
  let KAT = null, TR = null, katP = null, trP = null, katHata = false;
  function katTemizle(j) {
    if (!Array.isArray(j)) throw new Error("bicim");
    return j.filter(x => x && MARKA[x.marka] && str(x.ad)).map((x, i) => {
      const r = { id: str(x.id) || "k" + i, marka: x.marka, ad: str(x.ad), set: str(x.set), numara: str(x.numara), yil: str(x.yil), nadirlik: str(x.nadirlik),
        sira: Number(x.sira) > 0 ? Number(x.sira) : 9999, olcut: str(x.olcut), kaynak: str(x.kaynak), tur: str(x.tur), resmi: typeof x.resmi === "string" && D.RESMI.test(x.resmi) ? x.resmi : "" };
      r._n = norm(r.ad).trim(); r._ara = norm([r.ad, r.set, r.numara, r.yil, r.nadirlik].join(" "));
      return r;
    }).sort((a, b) => a.sira - b.sira);
  }
  function trTemizle(j) {
    if (!j || typeof j !== "object" || Array.isArray(j)) return null;
    const tek = (Array.isArray(j.tekKart) ? j.tekKart : []).filter(t => t && MARKA[t.marka] && str(t.ad) && Number(t.fiyatTL) > 0)
      .map(t => ({ marka: t.marka, ad: str(t.ad), _n: norm(str(t.ad)).trim(), set: str(t.set), numara: str(t.numara), durum: str(t.durum), fiyat: Number(t.fiyatTL), stok: t.stok, magaza: str(t.magaza) || "Mağaza", url: bag(t.url) }));
    const kapali = (Array.isArray(j.kapaliUrun) ? j.kapaliUrun : []).filter(u => u && MARKA[u.marka] && str(u.urun) && Number(u.fiyatTL) > 0)
      .map(u => ({ marka: u.marka, urun: str(u.urun), fiyat: Number(u.fiyatTL), magaza: str(u.magaza) || "Mağaza", url: bag(u.url) }));
    return tek.length || kapali.length ? { tarih: str(j.tarih), tek, kapali } : null;
  }
  D.katalogYukle = () => katP || (katP = fetch("data/katalog.json", { headers: { Accept: "application/json" } })
    .then(r => { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(j => { KAT = katTemizle(j); katHata = false; return KAT; })
    .catch(e => { katHata = true; katP = null; throw e; }));
  const trYukle = () => trP || (trP = fetch("data/tr-fiyatlar.json", { headers: { Accept: "application/json" } })
    .then(r => r.ok ? r.json() : null).then(trTemizle).catch(() => null).then(t => (TR = t)));
  function yukleBaslat() {
    if (!katP) D.katalogYukle().then(ciz, ciz);
    trYukle().then(() => { if (KAT && S_gorunur()) { K.son = ""; ciz(); } });
  }
  const S_gorunur = () => !$('[data-gorunum="katalog"]').hidden;

  /* ---------- eşleştirme ---------- */
  // pazardaki aktif ilan başlıkları (seçili markada); eşleşme: norm(ilan adı) katalog adını içerir
  const ilanBasliklari = marka => (D.ilanlar ? D.ilanlar() : []).filter(k => !k.satildi && k.kategori === marka).map(k => norm(k.baslik));
  const ilanSay = (k, bas) => k._n ? bas.filter(b => b.includes(k._n)).length : 0;
  // kart numarası anahtarı: "4/102" → "4", "LOB-EN001" → "1", "OP01-120" → "120"
  const numAnahtar = s => { const m = String(s || "").replace(/\/\s*\d+\s*$/, "").match(/\d+/g); return m ? String(+m[m.length - 1]) : ""; };
  const numTam = s => norm(s).replace(/[^a-z0-9/]/g, "").replace(/\d+/g, d => String(+d));
  const stokYok = s => s === false || s === 0 || (typeof s === "string" && /^(yok|tukendi|stokta yok|0|false|hayir)$/.test(norm(s).trim()));
  function trFiyat(k) {
    if (!TR) return null;
    const kn = numAnahtar(k.numara);
    let l = TR.tek.filter(t => t.marka === k.marka && t._n === k._n && !(kn && numAnahtar(t.numara) && numAnahtar(t.numara) !== kn));
    if (!l.length) return null;
    // en iyi eşleşme grubu: tam numara (+2) ve aynı set (+1); "4/102" ile "4/130" ayrışır
    const puan = t => (k.numara && t.numara && numTam(t.numara) === numTam(k.numara) ? 2 : 0) + (k.set && t.set && norm(t.set).trim() === norm(k.set).trim() ? 1 : 0);
    const enIyi = Math.max(...l.map(puan)); l = l.filter(t => puan(t) === enIyi);
    const stokta = l.filter(t => !stokYok(t.stok));
    return { ...(stokta.length ? stokta : l).slice().sort((a, b) => a.fiyat - b.fiyat)[0], tukendi: !stokta.length };
  }
  const tarihMetni = t => { if (/^\d{4}-\d{2}-\d{2}/.test(t)) { const d = new Date(t.slice(0, 10) + "T12:00:00"); if (!isNaN(d)) return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }); } return t; };
  // kaynak "Scryfall API · https://…" biçiminde olabilir: ad ve bağlantı ayrılır
  const kaynakAd = s => String(s || "").split(" · ")[0].replace(/https?:\/\/\S+/g, "").trim();
  const kaynakUrl = s => bag((String(s || "").match(/https?:\/\/[^\s"'<>]+/) || [""])[0]);
  const OLCUT = { views: "görüntülenme sayısı", edhrec: "EDHREC Commander sırası", tcgplayer: "TCGplayer satışları", cardmarket: "Cardmarket popülerliği" };
  const olcutAd = s => { const a = String(s || "").split(":")[0].trim(); return OLCUT[a.toLowerCase()] || (/^[\d.,\s]*$/.test(a) ? "" : a); };
  const disBag = (url, ic) => url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${ic}</a>` : ic;

  /* ---------- kart ---------- */
  const kartObj = k => ({ id: "katalog-" + k.id, baslik: k.ad, set: [k.set, k.yil].filter(Boolean).join(" "), durum: "Ham", kategori: k.marka, resmi: k.resmi,
    cizimSet: k.set, numara: k.numara, nadirlik: k.nadirlik, yil: k.yil, tur: k.tur });
  function pazarHTML(k, bas) {
    const n = ilanSay(k, bas);
    return `<p>${n ? `Pazarda <b>${n}</b> ilan` : "Pazarda ilan yok"}</p><div class="satir">${n ? `<button type="button" class="btn cizgi" data-kat-ilan="${esc(k.id)}">İlanları gör</button>` : ""}<button type="button" class="btn" data-kat-sat="${esc(k.id)}">Bu kartı sat</button></div>`;
  }
  function atifHTML(k, resmi) {
    const u = kaynakUrl(k.kaynak), ad = kaynakAd(k.kaynak);
    const p = [resmi ? "Görsel: " + esc(D.resmiKaynak(k.resmi)) : "", u ? disBag(u, "Kart kaynağı" + (ad ? ": " + esc(ad) : "") + " ↗") : ""].filter(Boolean);
    return p.length ? `<p class="kk-atif">${p.join(" · ")}</p>` : "";
  }
  function kartHTML(k, bas) {
    const o = kartObj(k), resmi = D.resmiGecerli(o), f = trFiyat(k);
    const tr = f ? `<p class="kk-tr">Mağazada: ${disBag(f.url, `${esc(D.TL.format(f.fiyat))} · ${esc(f.magaza)}`)}${f.tukendi ? " · stokta yok" : ""}${TR.tarih ? ` <span class="soluk">(${esc(tarihMetni(TR.tarih))})</span>` : ""}</p>` : "";
    return `<article class="kk" data-egim data-kat="${esc(k.id)}">${D.slab(o, resmi ? k.resmi : D.cizim({ ...o, set: o.cizimSet }))}
<h3>${esc(k.ad)}</h3><p class="mono">${esc([k.set, k.numara].filter(Boolean).join(" · ") || "—")}</p><p class="mono kk-sira">#${esc(k.sira < 9999 ? k.sira : "–")}${k.nadirlik ? " · " + esc(k.nadirlik) : ""}</p>
<div class="kk-pazar" data-pz="${esc(k.id)}">${pazarHTML(k, bas)}</div>${tr}${atifHTML(k, resmi)}</article>`;
  }

  /* ---------- sayfa ---------- */
  const liste = (marka = K.marka) => { const q = norm(K.q).trim(); return (KAT || []).filter(k => k.marka === marka && (!q || k._ara.includes(q))); };
  const anahtar = () => [K.marka, K.q, K.limit, KAT ? KAT.length : 0, TR ? 1 : 0, D.resmiKullan() ? 1 : 0].join("|");
  function sekmeCiz() {
    if (KAT && !K.elle && !KAT.some(k => k.marka === K.marka)) { const m = MARKALAR.find(([m]) => KAT.some(k => k.marka === m)); if (m) K.marka = m[0]; }
    $$("#katSekme [role=tab]").forEach(b => { const on = b.dataset.marka === K.marka, n = KAT ? KAT.filter(k => k.marka === b.dataset.marka).length : null;
      b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1;
      let s = b.querySelector("small"); if (n != null) { if (!s) { s = document.createElement("small"); b.append(" ", s); } s.textContent = n; } });
  }
  function dahaCiz(l) { const kalan = l.length - Math.min(K.limit, l.length), b = $("#katDaha"); b.hidden = kalan <= 0; b.textContent = `Daha fazla göster (${kalan} kart kaldı)`; }
  function olcutCiz() {
    const ilk = (KAT || []).find(k => k.marka === K.marka && (k.olcut || k.kaynak)), el = $("#katOlcut");
    if (!ilk) { el.hidden = true; return; }
    const o = olcutAd(ilk.olcut), ad = kaynakAd(ilk.kaynak) || (kaynakUrl(ilk.kaynak) ? kaynakUrl(ilk.kaynak).replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "") : "");
    el.hidden = false;
    el.textContent = `Popülerlik sırası${o ? " · ölçüt: " + o : ""}${ad ? " · kaynak: " + ad : ""}. Sıra fiyat ya da değer tahmini değildir.`;
  }
  function kapaliCiz() {
    const el = $("#katKapali"), l = TR ? TR.kapali.filter(u => u.marka === K.marka).sort((a, b) => a.fiyat - b.fiyat) : [];
    if (!l.length) { el.hidden = true; el.innerHTML = ""; return; }
    el.hidden = false;
    el.innerHTML = `<h2 class="h40" id="katKapaliH">Türk mağazalarında kapalı ürün fiyatları</h2>
<p class="mono soluk">${esc(MARKA[K.marka])}${TR.tarih ? " · " + esc(tarihMetni(TR.tarih)) + " itibarıyla" : ""} mağaza sitelerinden alındı. Fiyat ve stok değişebilir; deste satış yapmaz.</p>
<ul class="kapali-l">${l.map(u => `<li><span class="u">${esc(u.urun)}</span><span class="f">${esc(D.TL.format(u.fiyat))}</span><span class="m">${disBag(u.url, esc(u.magaza) + (u.url ? " ↗" : ""))}</span></li>`).join("")}</ul>`;
  }
  function ciz() {
    const grid = $("#katGrid");
    sekmeCiz();
    if (!KAT) {
      K.son = ""; $("#katDaha").hidden = true; $("#katKapali").hidden = true; $("#katOlcut").hidden = true;
      if (katHata) { $("#katSay").textContent = "Katalog yüklenemedi"; grid.innerHTML = bos(`Katalog yüklenemedi. Bağlantını kontrol et. <button type="button" class="btn cizgi" id="katTekrar">Tekrar dene</button>`); }
      else { $("#katSay").textContent = "Yükleniyor…"; grid.innerHTML = bos("Katalog yükleniyor…"); yukleBaslat(); }
      return;
    }
    if (!trP) trYukle().then(() => { K.son = ""; if (S_gorunur()) ciz(); });
    const l = liste(), bas = ilanBasliklari(K.marka), a = anahtar();
    if (a === K.son) { // yalnız ilan sayıları değişmiş olabilir: odak kaybolmasın diye yerinde güncelle
      $$("#katGrid [data-pz]").forEach(el => { const k = KAT.find(x => x.id === el.dataset.pz); if (!k) return; const h = pazarHTML(k, bas); if (el.innerHTML !== h && !el.contains(document.activeElement)) el.innerHTML = h; });
      return;
    }
    K.son = a;
    $("#katSay").textContent = K.q.trim() ? `${l.length} sonuç` : `${l.length} kart`;
    if (l.length) grid.innerHTML = l.slice(0, K.limit).map(k => kartHTML(k, bas)).join("");
    else {
      const diger = K.q.trim() ? MARKALAR.filter(([m]) => m !== K.marka).map(([m, ad]) => [m, ad, liste(m).length]).filter(x => x[2]) : [];
      grid.innerHTML = bos(`${K.q.trim() ? "Bu markada eşleşen kart yok." : "Bu markada henüz katalog kaydı yok."}${diger.length ? `<span class="satir" style="justify-content:center;margin-top:14px">${diger.map(([m, ad, n]) => `<button type="button" class="btn cizgi" data-kat-marka="${m}">${esc(ad)} (${n})</button>`).join("")}</span>` : ""}`);
    }
    dahaCiz(l); olcutCiz(); kapaliCiz();
  }
  D.katalogCiz = ciz;

  function markaSec(m, odak) { if (!MARKA[m]) return; K.marka = m; K.elle = true; K.limit = ADIM; ciz(); if (odak) $(`#katSekme [data-marka="${m}"]`)?.focus(); }
  $("#katSekme").addEventListener("click", e => { const b = e.target.closest("[data-marka]"); if (b) markaSec(b.dataset.marka); });
  $("#katSekme").addEventListener("keydown", e => {
    const i = MARKALAR.findIndex(([m]) => m === K.marka); let j = null;
    if (e.key === "ArrowRight") j = (i + 1) % MARKALAR.length; else if (e.key === "ArrowLeft") j = (i - 1 + MARKALAR.length) % MARKALAR.length;
    else if (e.key === "Home") j = 0; else if (e.key === "End") j = MARKALAR.length - 1;
    if (j != null) { e.preventDefault(); markaSec(MARKALAR[j][0], true); }
  });
  $("#katQ").addEventListener("input", e => { K.q = e.target.value; K.limit = ADIM; ciz(); });
  $("#katDaha").addEventListener("click", () => {
    const l = liste(), bas = ilanBasliklari(K.marka), ilk = K.limit; K.limit += ADIM;
    $("#katGrid").insertAdjacentHTML("beforeend", l.slice(ilk, K.limit).map(k => kartHTML(k, bas)).join(""));
    K.son = anahtar(); dahaCiz(l);
    if ($("#katDaha").hidden) $(`#katGrid .kk:nth-child(${ilk + 1}) [data-kat-sat]`)?.focus();
  });
  $('[data-gorunum="katalog"]').addEventListener("click", e => {
    if (e.target.closest("#katTekrar")) { katHata = false; ciz(); return; }
    const m = e.target.closest("[data-kat-marka]"); if (m) { markaSec(m.dataset.katMarka); return; }
    const il = e.target.closest("[data-kat-ilan]"), sat = e.target.closest("[data-kat-sat]");
    const k = KAT && KAT.find(x => x.id === (il || sat)?.dataset[il ? "katIlan" : "katSat"]); if (!k) return;
    if (il) D.pazarAra(k.ad, k.marka);
    else { D.ilanFormDoldur && D.ilanFormDoldur(k); location.hash = "#ilan-ver"; }
  });
  /* pazara geç ve arama kutusuna kart adını yaz (diğer filtreler temizlenir) */
  D.pazarAra = (q, kat) => { $("#filtre").reset(); $("#fQ").value = q; $("#fKat").value = D.KAT[kat] ? kat : ""; location.hash = "#pazar"; };

  /* ---------- ilan ver: katalogdan öneri (combobox + listbox) ---------- */
  const inp = $("#iBaslik"), lb = $("#iOneri");
  let oneriler = [], aktif = -1;
  function oneriKapat() { lb.hidden = true; lb.innerHTML = ""; oneriler = []; aktif = -1; inp.setAttribute("aria-expanded", "false"); inp.removeAttribute("aria-activedescendant"); }
  function oneriBul(q) {
    const n = norm(q).trim(); if (n.length < 2 || !KAT) return [];
    const sec = MARKA[$("#iKat").value] ? $("#iKat").value : "";
    const puan = k => k._n.startsWith(n) ? 0 : k._n.split(/[\s\-–,.:']+/).some(w => w.startsWith(n)) ? 1 : k._n.includes(n) ? 2 : 3;
    return KAT.filter(k => k._ara.includes(n)).map(k => [k, (sec && k.marka !== sec ? 10 : 0) + puan(k)]).sort((a, b) => a[1] - b[1] || a[0].sira - b[0].sira).slice(0, 8).map(x => x[0]);
  }
  function oneriCiz() {
    lb.innerHTML = oneriler.map((k, i) => `<li role="option" id="iOneri-${i}" data-i="${i}" aria-selected="${i === aktif}"><b>${esc(k.ad)}</b><span>${esc([MARKA[k.marka], k.set, k.numara, k.yil].filter(Boolean).join(" · "))}</span></li>`).join("");
    lb.hidden = !oneriler.length; inp.setAttribute("aria-expanded", String(!!oneriler.length));
    if (aktif >= 0) { inp.setAttribute("aria-activedescendant", "iOneri-" + aktif); $("#iOneri-" + aktif)?.scrollIntoView({ block: "nearest" }); } else inp.removeAttribute("aria-activedescendant");
  }
  function oneriGoster() { oneriler = oneriBul(inp.value); aktif = -1; if (!oneriler.length) return oneriKapat(); oneriCiz(); }
  function oneriSec(i) { const k = oneriler[i]; if (!k) return; oneriKapat(); D.ilanFormDoldur && D.ilanFormDoldur(k); inp.focus(); }
  const katalogHazirla = () => { if (!KAT) D.katalogYukle().then(() => { if (document.activeElement === inp) oneriGoster(); }).catch(() => {}); };
  inp.addEventListener("focus", katalogHazirla);
  inp.addEventListener("input", () => { katalogHazirla(); oneriGoster(); });
  $("#iKat").addEventListener("change", () => { if (!lb.hidden) oneriGoster(); });
  inp.addEventListener("keydown", e => {
    const acik = !lb.hidden && oneriler.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!acik) { oneriGoster(); if (!oneriler.length) return; }
      e.preventDefault(); const n = oneriler.length;
      aktif = e.key === "ArrowDown" ? (aktif + 1) % n : (aktif <= 0 ? n - 1 : aktif - 1); oneriCiz();
    } else if (e.key === "Enter" && acik && aktif >= 0) { e.preventDefault(); oneriSec(aktif); }
    else if (e.key === "Escape" && acik) { e.preventDefault(); e.stopPropagation(); oneriKapat(); }
    else if (e.key === "Tab" && acik) oneriKapat();
  });
  inp.addEventListener("blur", oneriKapat);
  lb.addEventListener("mousedown", e => e.preventDefault()); // odak kutuda kalsın
  lb.addEventListener("click", e => { const li = e.target.closest("[data-i]"); if (li) oneriSec(+li.dataset.i); });
  $("#ilanForm").addEventListener("reset", oneriKapat);
})();
