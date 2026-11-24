/* deste uygulama: pazar, ilan ver, teklifler, profil, ilan ayrıntısı, yönlendirme */
(() => {
  const { esc, norm, dereceli } = D;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const opts = (arr, sec) => arr.map(([v, t]) => `<option value="${esc(v)}"${v === sec ? " selected" : ""}>${esc(t)}</option>`).join("");
  const RESMI = D.RESMI; // izinli resmî görsel adresleri (js/slab.js)
  const S = { gorunum: "ana", onizFoto: null, resmi: "", gorsel: "", sil: null, profilDoldu: false };

  $("#fKat").insertAdjacentHTML("beforeend", opts(D.KATS));
  $("#iKat").innerHTML = opts(D.KATS);
  $("#iDurum").innerHTML = opts(D.DURUMLAR.map(d => [d, d]), "Ham · Near Mint");
  const ilOpts = opts(D.ILLER.map(i => [i, i]));
  $("#fIl").insertAdjacentHTML("beforeend", ilOpts);
  $("#iSehir").innerHTML = '<option value="">Seç</option>' + ilOpts; $("#pSehir").innerHTML = '<option value="">Seç</option>' + ilOpts;

  /* ---------- veri yardımcıları ---------- */
  const teklifler = () => Object.entries(Veri.teklif).flatMap(([uid, d]) => (Array.isArray(d.liste) ? d.liste : []).filter(t => t && Veri.idOk(t.id)).map(t => ({ ...t, aliciId: uid })));
  const yanit = t => { const y = (Veri.users[t.saticiId] || {}).yanitlar; return y && typeof y === "object" ? y[t.id] || null : null; };
  const durum = t => t.iptal ? "iptal" : (["kabul", "red"].includes(yanit(t)?.durum) ? yanit(t).durum : "bekliyor");
  const DURUM_AD = { bekliyor: "Yanıt bekliyor", kabul: "Kabul edildi", red: "Reddedildi", iptal: "Geri çekildi" };
  const ben = () => Veri.users[Veri.uid] || {};
  const benimIlanlar = () => D.ilanlar().filter(k => k.saticiId === Veri.uid);
  const yazmaHazir = () => !!Veri.uid && !Veri.kapi();
  const resim = k => D.resim(k); // fotoğraf > resmî görsel > özgün çizim (js/ana.js)
  let tt; const bildir = m => { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 3400); };

  /* ---------- kart HTML ---------- */
  function ilanHTML(k, onizleme) {
    const key = esc(k.saticiId + "|" + k.id);
    const rz = [k.tip === "takas" ? "Takas" : k.tip === "ikisi" ? "Satış + takas" : "Satılık", k.satildi ? "Satıldı" : k.rezerve ? "Anlaşma var" : "", k.ornek ? "Örnek ilan" : ""].filter(Boolean);
    return `<article class="ilan" ${onizleme ? "" : `data-ac="${key}" tabindex="0" role="button"`} data-egim>${D.slab(k, onizleme && S.onizFoto ? S.onizFoto : onizleme && S.gorsel ? S.gorsel : onizleme && S.resmi ? S.resmi : resim(k))}
<div class="rozetler">${rz.map((r, i) => `<span class="rz${i === 0 ? " ak" : ""}">${esc(r)}</span>`).join("")}</div>
<h3>${esc(k.baslik || "Kart adı")}</h3><p class="mono">${esc(D.dereceMetni(k))}${k.sehir ? " · " + esc(k.sehir) : ""}</p><p class="fy">${esc(D.fiyatMetni(k))}</p><p class="mono">${esc(k.satici || "")}</p></article>`;
  }
  const bosHTML = m => `<div class="bos">${m}</div>`;

  /* ---------- pazar ---------- */
  function filtrele() {
    const q = norm($("#fQ").value), kat = $("#fKat").value, tip = $("#fTip").value, der = $("#fDer").value, il = $("#fIl").value, min = +$("#fMin").value || 0, max = +$("#fMax").value || Infinity, sat = $("#fSatilan").checked;
    let l = D.ilanlar().filter(k => (sat || !k.satildi) && (!kat || k.kategori === kat) && (!tip || (tip === "satis" ? k.tip !== "takas" : k.tip !== "satis")) && (!der || (der === "ham") !== dereceli(k.durum)) && (!il || k.sehir === il) && (!q || norm([k.baslik, k.set, k.aciklama, k.istenen, k.satici, D.KAT[k.kategori]].join(" ")).includes(q)));
    if (min || max < Infinity) l = l.filter(k => typeof k.fiyat === "number" && k.fiyat >= min && k.fiyat <= max);
    const s = $("#fSira").value, fy = k => typeof k.fiyat === "number" ? k.fiyat : null;
    l.sort((a, b) => s === "yeni" ? (b.tarih || 0) - (a.tarih || 0) : (fy(a) == null) - (fy(b) == null) || (s === "ucuz" ? fy(a) - fy(b) : fy(b) - fy(a)));
    return l;
  }
  function pazarCiz() {
    const l = filtrele(), hepsi = D.ilanlar();
    $("#pazarSay").textContent = Veri.hazir ? `${l.length} ilan` : "Yükleniyor…";
    $("#pazarGrid").innerHTML = l.length ? l.map(k => ilanHTML(k)).join("") : bosHTML(hepsi.length ? "Bu filtrelere uyan ilan yok." : esc(Veri.hazir ? "Henüz ilan yok." : (Veri.hata || "İlanlar yükleniyor…")) + ` <a href="#ilan-ver">İlk ilanı sen ver.</a>`);
  }

  /* ---------- ilan ver ---------- */
  function formIlan() {
    return { id: "onizleme", saticiId: Veri.uid || "", baslik: $("#iBaslik").value.trim(), kategori: $("#iKat").value, set: $("#iSet").value.trim(), durum: $("#iDurum").value,
      not: $("#iNot").value === "" ? null : +$("#iNot").value, tip: $('[name=iTip]:checked').value, fiyat: $("#iFiyat").value === "" ? null : Math.round(+$("#iFiyat").value),
      sehir: $("#iSehir").value, istenen: $("#iIstenen").value.trim(), aciklama: $("#iAcik").value.trim(), satici: ben().takmaAd || $("#iTakma").value.trim() || "Sen" };
  }
  function onizle() {
    const g = ($("#iGorsel")?.value || "").trim(); S.gorsel = D.gorselGecerli({ gorsel: g }) ? g : "";
    $("#gorselSatir").hidden = Veri.mod === "claude";
    const k = formIlan(); $("#notSatir").hidden = !dereceli(k.durum); $("#fiyatSatir").hidden = k.tip === "takas"; $("#istenenSatir").hidden = k.tip === "satis";
    $("#onizleme").innerHTML = ilanHTML(k, true) + resmiAraHTML(k);
  }
  /* resmî görsel arama: Scryfall (Magic) ve Pokémon TCG API; görseller kaynağından gösterilir, kopyalanmaz */
  const resmiDestek = kat => (kat === "magic" || kat === "pokemon") && Veri.mod !== "claude";
  function resmiAraHTML(k) {
    if (!resmiDestek(k.kategori)) return `<p class="mono soluk" style="margin-top:14px;text-transform:none">${Veri.mod === "claude" ? "" : "Görsel eklemezsen ilan temsilî bir deste kartıyla görünür."}</p>`;
    return `<div class="resmi"><button type="button" class="btn cizgi" id="resmiAra">Resmî kart görselini bul</button>${S.resmi ? ` <button type="button" class="btn cizgi" id="resmiKaldir">Kaldır</button>` : ""}<div class="resmi-sonuc" id="resmiSonuc"></div>
<p class="mono soluk" style="text-transform:none;margin-top:8px">Kaynak: ${k.kategori === "magic" ? "Scryfall" : "Pokémon TCG API"}. Görsel kaynağından gösterilir; kart görselleri hak sahiplerine aittir.</p></div>`;
  }
  /* katalog kaydıyla formu doldur (js/katalog.js: öneri listesi ve "Bu kartı sat") */
  D.ilanFormDoldur = k => {
    $("#iBaslik").value = String(k.ad || "").slice(0, 90);
    if (D.KAT[k.marka]) $("#iKat").value = k.marka;
    $("#iSet").value = [k.set, k.numara, k.yil].filter(Boolean).join(" · ").slice(0, 60);
    S.resmi = D.resmiGecerli({ resmi: k.resmi }) && resmiDestek(k.marka) ? k.resmi : "";
    $("#iHata").textContent = ""; onizle();
  };
  async function resmiAra() {
    const k = formIlan(), q = k.baslik.replace(/[–—-].*$/, "").trim(), out = $("#resmiSonuc");
    if (q.length < 2) { out.textContent = "Önce kart adını yaz."; return; }
    out.textContent = "Aranıyor…";
    try {
      let l = [];
      if (k.kategori === "magic") {
        const r = await fetch(`https://api.scryfall.com/cards/search?unique=prints&order=released&q=${encodeURIComponent('!"' + q + '"')}`, { headers: { Accept: "application/json" } });
        let j = await r.json();
        if (j.object === "error") { const r2 = await fetch(`https://api.scryfall.com/cards/search?unique=prints&q=${encodeURIComponent(q)}`); j = await r2.json(); }
        l = (j.data || []).slice(0, 12).map(c => ({ ad: `${c.name} · ${c.set_name}`, url: (c.image_uris || c.card_faces?.[0]?.image_uris || {}).large })).filter(x => x.url);
      } else {
        const r = await fetch(`https://api.pokemontcg.io/v2/cards?pageSize=12&q=${encodeURIComponent('name:"' + q + '"')}`);
        if (!r.ok) throw new Error("api");
        const j = await r.json(); l = (j.data || []).map(c => ({ ad: `${c.name} · ${c.set?.name || ""}`, url: c.images?.large })).filter(x => x.url);
      }
      l = l.filter(x => RESMI.test(x.url));
      out.innerHTML = l.length ? l.map(x => `<button type="button" class="resmi-sec" data-url="${esc(x.url)}" title="${esc(x.ad)}"><img src="${esc(x.url)}" alt="${esc(x.ad)}" loading="lazy"></button>`).join("") : "Eşleşen kart bulunamadı; adı İngilizce yazmayı dene.";
    } catch { out.textContent = "Görsel servisi şu an yanıt vermiyor; birazdan tekrar dene ya da kendi fotoğrafını yükle."; }
  }
  $("#onizleme").addEventListener("click", e => {
    if (e.target.closest("#resmiAra")) resmiAra();
    else if (e.target.closest("#resmiKaldir")) { S.resmi = ""; onizle(); }
    else { const b = e.target.closest(".resmi-sec"); if (b && RESMI.test(b.dataset.url)) { S.resmi = b.dataset.url; S.onizFoto = null; $("#iFoto").value = ""; $("#iGorsel").value = ""; onizle(); } }
  });
  async function sikistir(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = url; });
      const m = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight)); const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * m); c.height = Math.round(img.naturalHeight * m); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      let q = .82, d = c.toDataURL("image/jpeg", q); while (d.length > 170000 && q > .35) { q -= .08; d = c.toDataURL("image/jpeg", q); } return d;
    } finally { URL.revokeObjectURL(url); }
  }
  $("#iFoto").onchange = async e => { const f = e.target.files[0]; S.onizFoto = null; if (f) { try { S.onizFoto = await sikistir(f); S.resmi = ""; $("#iGorsel").value = ""; } catch { $("#iHata").textContent = "Bu dosya okunamadı; JPG ya da PNG dene."; } } onizle(); };
  $("#ilanForm").addEventListener("input", e => { if (e.target.id !== "iFoto") onizle(); });
  $("#ilanForm").addEventListener("change", e => { if (e.target.id !== "iFoto") onizle(); });
  $("#ilanForm").onsubmit = async e => {
    e.preventDefault(); const h = $("#iHata"), k = formIlan(), ad = $("#iTakma").value.trim();
    if (!yazmaHazir()) return h.textContent = Veri.kapi() || "Pazar henüz hazır değil.";
    if (!ben().takmaAd && ad.length < 2) return h.textContent = "Takma adını yaz.";
    if (k.baslik.length < 3) return h.textContent = "Kart adını yaz.";
    if (dereceli(k.durum) && !(k.not >= 1 && k.not <= 10)) return h.textContent = "1 ile 10 arasında bir not yaz.";
    if (k.tip !== "takas" && !(k.fiyat >= 1)) return h.textContent = "Fiyatı yaz.";
    if (benimIlanlar().length >= 40) return h.textContent = "En fazla 40 ilanın olabilir; satılanları silerek yer aç.";
    const id = rid(); h.textContent = "Yayınlanıyor…"; $("#iGonder").disabled = true;
    try {
      let foto = false;
      if (S.onizFoto) { foto = await Veri.fotoKaydet(id, S.onizFoto); }
      const kayit = { id, baslik: k.baslik, kategori: k.kategori, set: k.set, durum: k.durum, not: dereceli(k.durum) ? k.not : null, tip: k.tip, fiyat: k.tip === "takas" ? null : k.fiyat,
        sehir: k.sehir, istenen: k.tip === "satis" ? "" : k.istenen, aciklama: k.aciklama, foto, gorsel: !foto && S.gorsel ? S.gorsel : "", resmi: !foto && !S.gorsel && S.resmi ? S.resmi : "", tarih: Date.now(), satildi: false, rezerve: false };
      await Veri.yaz("ilanlar", c => { const l = Array.isArray(c.kartlar) ? c.kartlar : []; l.push(kayit); return { ...c, takmaAd: c.takmaAd || ad, sehir: c.sehir || k.sehir, kartlar: l, guncel: Date.now() }; });
      $("#ilanForm").reset(); S.onizFoto = null; S.resmi = ""; S.gorsel = ""; h.textContent = ""; bildir("İlanın yayında."); location.hash = "#pazar";
    } catch (err) { h.textContent = Veri.hataMetni(err); } finally { $("#iGonder").disabled = !yazmaHazir(); }
  };

  /* ---------- teklifler ---------- */
  function teklifOzet(t) {
    const p = typeof t.tutar === "number" && t.tutar > 0 ? D.TL.format(t.tutar) : "";
    const tk = t.takasKartId ? (D.ilanlar().find(k => k.saticiId === t.aliciId && k.id === t.takasKartId)?.baslik || "ilanlarından bir kart") : (t.takasMetin || "");
    return [p, tk && "takas: " + tk].filter(Boolean).join(" + ") || "—";
  }
  function teklifHTML(t, gelen) {
    const d = durum(t), y = yanit(t) || {}, kars = gelen ? t.aliciId : t.saticiId, kAd = Veri.users[kars]?.takmaAd || "Koleksiyoncu";
    const ms = [...(Array.isArray(t.mesajlar) ? t.mesajlar.map(m => ({ ...m, k: t.aliciId })) : []), ...(Array.isArray(y.mesajlar) ? y.mesajlar.map(m => ({ ...m, k: t.saticiId })) : [])].filter(m => typeof m.m === "string").sort((a, b) => (a.t || 0) - (b.t || 0));
    const il = d === "kabul" ? (Veri.users[kars]?.iletisim ? `<p class="notk"><b>${esc(kAd)} iletişim:</b> ${esc(Veri.users[kars].iletisim)}</p>` : `<p class="notk">Anlaşma sağlandı. Karşı taraf henüz iletişim notu eklemedi; buradan mesajlaşabilirsiniz.</p>`) : "";
    const key = `${esc(t.aliciId)}|${esc(t.id)}`, akt = d === "bekliyor" || d === "kabul";
    return `<article class="teklif"><header><div><h3>${esc(t.kartBaslik || "Kart")}</h3><p class="mono">${gelen ? "Gönderen" : "Satıcı"}: ${esc(kAd)} · ${D.sure(t.tarih)}</p></div><span class="durum d-${d}">${DURUM_AD[d]}</span></header>
<p><b>Teklif:</b> ${esc(teklifOzet(t))}</p>${il}<div class="akis">${ms.map(m => `<div class="msj${m.k === Veri.uid ? " ben" : ""}">${esc(m.m)}<small>${D.sure(m.t)}</small></div>`).join("")}</div>
${akt ? `<form class="satir" data-msj="${key}" data-rol="${gelen ? "s" : "a"}"><input maxlength="300" placeholder="Mesaj yaz" aria-label="Mesaj"><button class="btn cizgi">Gönder</button></form>` : ""}
<div class="satir">${gelen && d === "bekliyor" ? `<button class="btn" data-islem="kabul" data-t="${key}">Kabul et</button><button class="btn cizgi" data-islem="red" data-t="${key}">Reddet</button>` : ""}${!gelen && d === "bekliyor" ? `<button class="btn cizgi" data-islem="iptal" data-t="${key}">Teklifi geri çek</button>` : ""}</div></article>`;
  }
  function guvenli(el, html) { if (el.contains(document.activeElement) && document.activeElement.matches("input,textarea,select")) { el.dataset.bekle = "1"; return; } el.innerHTML = html; delete el.dataset.bekle; }
  document.addEventListener("focusout", () => setTimeout(() => { if ($$("[data-bekle]").length) ciz(); }, 0));
  function teklifCiz() {
    const l = teklifler().sort((a, b) => (b.tarih || 0) - (a.tarih || 0));
    const gelen = l.filter(t => t.saticiId === Veri.uid && !t.iptal), giden = l.filter(t => t.aliciId === Veri.uid);
    guvenli($("#teklifAlan"), `<div><p class="mono" style="margin-bottom:14px">GELEN TEKLİFLER</p>${gelen.length ? gelen.map(t => teklifHTML(t, true)).join("") : bosHTML("İlanlarına henüz teklif gelmedi.")}</div>
<div><p class="mono" style="margin-bottom:14px">GÖNDERDİĞİM TEKLİFLER</p>${giden.length ? giden.map(t => teklifHTML(t, false)).join("") : bosHTML(`Henüz teklif göndermedin. <a href="#pazar">Pazardan bir ilan aç.</a>`)}</div>`);
  }

  /* ---------- profil ---------- */
  function profilCiz() {
    const l = benimIlanlar().sort((a, b) => (b.tarih || 0) - (a.tarih || 0));
    $("#profilAd").textContent = ben().takmaAd || "Koleksiyoncu";
    guvenli($("#ilanlarim"), l.length ? l.map(k => { const key = esc(k.saticiId + "|" + k.id);
      return `<article>${D.slab(k, resim(k))}<div><h3>${esc(k.baslik)}</h3><p class="mono">${esc(D.fiyatMetni(k))} · ${k.satildi ? "Satıldı" : k.rezerve ? "Anlaşma var" : "Yayında"}</p></div>
<div class="satir"><button class="btn cizgi" data-islem="satildi" data-k="${key}">${k.satildi ? "Yayına al" : "Satıldı"}</button><button class="btn ${S.sil === k.id ? "tehlike" : "cizgi"}" data-islem="sil" data-k="${key}">${S.sil === k.id ? "Eminim, sil" : "Sil"}</button></div></article>`; }).join("") : bosHTML(`Henüz ilanın yok. <a href="#ilan-ver">İlan ver</a>`));
    const ak = $("#anahtarAlan");
    if (Veri.mod === "supabase" && Veri.anahtar) {
      if (!ak) $("#profilForm").insertAdjacentHTML("afterend", `<div class="anahtar" id="anahtarAlan"><p class="mono">HESAP ANAHTARIN</p><p class="kucuk2">İlanların bu tarayıcıdaki anahtara bağlı. Başka bir cihazda yönetmek için anahtarı kopyalayıp orada yapıştır; kimseyle paylaşma.</p>
<div class="satir"><button type="button" class="btn cizgi" id="anahtarKopya">Anahtarı kopyala</button></div><div class="satir"><input id="anahtarGir" placeholder="Başka cihazdaki anahtarı yapıştır" autocomplete="off"><button type="button" class="btn cizgi" id="anahtarYukle">Bu anahtarı kullan</button></div><p class="mono" id="anahtarDurum" role="status"></p></div>`);
      if (Veri.kalici === false) $("#anahtarDurum").textContent = "Uyarı: tarayıcın veriyi saklamıyor; sayfa kapanınca ilanlarını yönetemezsin.";
    }
  }
  document.addEventListener("click", async e => {
    if (e.target.id === "anahtarKopya") { try { await navigator.clipboard.writeText(Veri.anahtar()); $("#anahtarDurum").textContent = "Kopyalandı."; } catch { $("#anahtarGir").value = Veri.anahtar(); $("#anahtarDurum").textContent = "Kopyalanamadı; anahtar kutuya yazıldı, elle kopyala."; } }
    if (e.target.id === "anahtarYukle") { try { await Veri.anahtarYukle($("#anahtarGir").value); $("#anahtarGir").value = ""; S.profilDoldu = false; $("#anahtarDurum").textContent = "Anahtar değişti; bu cihazda artık o hesapla işlem yapıyorsun."; ciz(); } catch (err) { $("#anahtarDurum").textContent = Veri.hataMetni(err); } }
  });
  $("#profilForm").onsubmit = async e => {
    e.preventDefault(); const d = $("#pDurum"); if (!yazmaHazir()) return d.textContent = Veri.kapi();
    const ad = $("#pTakma").value.trim(); if (ad.length < 2) return d.textContent = "Takma ad en az 2 harf.";
    d.textContent = "Kaydediliyor…";
    try { await Veri.yaz("ilanlar", c => ({ ...c, takmaAd: ad, sehir: $("#pSehir").value, iletisim: $("#pIletisim").value.trim(), guncel: Date.now() })); d.textContent = "Kaydedildi."; } catch (err) { d.textContent = Veri.hataMetni(err); }
  };

  /* ---------- ilan ayrıntısı ---------- */
  const dlg = $("#dlg");
  function ac(key) {
    const [uid, id] = String(key).split("|"); const k = D.ilanlar().find(x => x.saticiId === uid && x.id === id); if (!k) return;
    const benim = uid === Veri.uid, varolan = teklifler().find(t => t.aliciId === Veri.uid && t.saticiId === uid && t.kartId === id && durum(t) === "bekliyor");
    const takasSec = benimIlanlar().filter(x => !x.satildi).map(x => [x.id, x.baslik]);
    let alt;
    if (benim) alt = `<div class="satir"><a class="btn cizgi" href="#profil">İlanlarımda yönet</a><a class="btn cizgi" href="#teklifler">Gelen teklifler</a></div>`;
    else if (k.satildi) alt = `<p class="kapi">Bu kart satıldı.</p>`;
    else if (varolan) alt = `<p class="kapi">Bu ilana bekleyen bir teklifin var: ${esc(teklifOzet(varolan))}. <a href="#teklifler">Teklifler</a> sayfasından mesajlaşabilirsin.</p>`;
    else if (!yazmaHazir()) alt = `<p class="kapi">${esc(Veri.kapi() || "Pazar henüz hazır değil.")}</p>`;
    else alt = `<form id="teklifForm" class="alanlar" novalidate><p class="mono tam">TEKLİF GÖNDER</p>
${ben().takmaAd ? "" : `<label class="tam">Takma adın<input id="tTakma" maxlength="30"></label>`}
<label class="tam">Teklif türü<select id="tTip">${opts([["para", "Para"], ["takas", "Takas"], ["karma", "Para + takas"]], k.tip === "takas" ? "takas" : "para")}</select></label>
<label id="tTutarS">Tutar (₺)<input id="tTutar" type="number" min="1" inputmode="numeric" value="${typeof k.fiyat === "number" ? k.fiyat : ""}"></label>
<label id="tKartS">Takasa verdiğin kart<select id="tKart"><option value="">Listede yok, yazacağım</option>${opts(takasSec)}</select></label>
<label class="tam" id="tMetinS">Kartı yaz<input id="tMetin" maxlength="140" placeholder="Örn. Pikachu Promo, PSA 9"></label>
<label class="tam">Mesaj <small>isteğe bağlı</small><textarea id="tMesaj" maxlength="300"></textarea></label>
<div class="tam satir"><button class="btn">Teklifi gönder</button><span class="mono" id="tHata" role="alert"></span></div></form>`;
    const kaynak = k.foto ? "Satıcının eklediği görsel" : D.gorselGecerli(k) ? "Satıcının eklediği görsel bağlantısı" : D.resmiGecerli(k) ? "Resmî görsel · " + D.resmiKaynak(k.resmi) : "Fotoğraf eklenmemiş · temsilî deste kartı";
    $("#detay").innerHTML = `<div class="detay"><div class="dg" data-egim>${D.slab(k, resim(k))}<p class="mono">${esc(kaynak)}</p>${bildirimBag(k)}</div><div class="di">
<p class="mono">${esc(D.KAT[k.kategori] || "Diğer")}${k.ornek ? " · örnek ilan" : ""}</p><h2>${esc(k.baslik)}</h2><p class="fy">${esc(D.fiyatMetni(k))}</p>
<dl><dt>Durum</dt><dd>${esc(D.dereceMetni(k))}</dd>${k.set ? `<dt>Set / yıl</dt><dd>${esc(k.set)}</dd>` : ""}<dt>Satıcı</dt><dd>${esc(k.satici)}</dd>${k.sehir ? `<dt>Şehir</dt><dd>${esc(k.sehir)}</dd>` : ""}${k.istenen ? `<dt>Aradığı</dt><dd>${esc(k.istenen)}</dd>` : ""}<dt>Eklendi</dt><dd>${D.sure(k.tarih)}</dd></dl>
${k.aciklama ? `<p style="white-space:pre-line;color:rgba(255,255,255,.85)">${esc(k.aciklama)}</p>` : ""}${alt}</div></div>`;
    const tf = $("#teklifForm");
    if (tf) { const g = () => { const t = $("#tTip").value; $("#tTutarS").hidden = t === "takas"; $("#tKartS").hidden = $("#tMetinS").hidden = t === "para"; }; $("#tTip").onchange = g; g(); tf.onsubmit = e => { e.preventDefault(); teklifGonder(k); }; }
    if (!dlg.open) dlg.showModal();
  }
  D.ac = ac;
  /* hak ihlali bildirimi: ayar.js'te bildirimEposta tanımlıysa e-posta taslağı açar */
  function bildirimBag(k) {
    const e = (window.DESTE_AYAR || {}).bildirimEposta; if (!e || !(k.foto || k.gorsel || k.resmi)) return "";
    const konu = encodeURIComponent("deste hak ihlali bildirimi: " + (k.baslik || "")), govde = encodeURIComponent(`İlan: ${k.baslik || ""}\nİlan no: ${k.saticiId || ""}|${k.id || ""}\nHak sahibi / temsilci:\nAçıklama:\n`);
    return `<p class="mono"><a class="soluk" href="mailto:${esc(e)}?subject=${konu}&body=${govde}">Görsel için hak ihlali bildir</a></p>`;
  }
  { const e = (window.DESTE_AYAR || {}).bildirimEposta, y = $("#bildirimAyak"); if (e && y) y.innerHTML = `: <a href="mailto:${esc(e)}">${esc(e)}</a>`; }
  async function teklifGonder(k) {
    const tip = $("#tTip").value, tutar = Math.round(+$("#tTutar").value || 0), kart = $("#tKart").value, metin = $("#tMetin").value.trim(), msj = $("#tMesaj").value.trim(), h = $("#tHata"), ad = $("#tTakma")?.value.trim();
    if ($("#tTakma") && ad.length < 2) return h.textContent = "Takma adını yaz.";
    if (tip !== "takas" && tutar < 1) return h.textContent = "Tutarı yaz.";
    if (tip !== "para" && !kart && metin.length < 2) return h.textContent = "Takasa verdiğin kartı seç ya da yaz.";
    if ((Veri.teklif[Veri.uid]?.liste || []).filter(t => !t.iptal).length >= 60) return h.textContent = "En fazla 60 açık teklifin olabilir; eskileri geri çek.";
    h.textContent = "Gönderiliyor…";
    try {
      if (ad && !ben().takmaAd) await Veri.yaz("ilanlar", c => ({ ...c, takmaAd: c.takmaAd || ad, guncel: Date.now() }));
      await Veri.yaz("teklifler", c => { const l = Array.isArray(c.liste) ? c.liste : []; l.push({ id: rid(), saticiId: k.saticiId, kartId: k.id, kartBaslik: k.baslik, tip, tutar: tip === "takas" ? 0 : tutar, takasKartId: tip === "para" ? "" : kart, takasMetin: tip === "para" || kart ? "" : metin, mesajlar: msj ? [{ m: msj, t: Date.now() }] : [], tarih: Date.now() }); return { liste: l }; });
      dlg.close(); bildir("Teklifin gönderildi."); location.hash = "#teklifler";
    } catch (err) { h.textContent = Veri.hataMetni(err); }
  }

  /* ---------- işlemler ---------- */
  async function islem(b) {
    if (!yazmaHazir()) return bildir(Veri.kapi());
    const ne = b.dataset.islem;
    try {
      if (ne === "kabul" || ne === "red") { const [, id] = b.dataset.t.split("|"); const t = teklifler().find(x => x.id === id && x.saticiId === Veri.uid); if (!t) return; b.disabled = true;
        await Veri.yaz("ilanlar", c => { c.yanitlar = c.yanitlar || {}; c.yanitlar[id] = { ...(c.yanitlar[id] || {}), durum: ne, tarih: Date.now() }; if (ne === "kabul") (c.kartlar || []).forEach(k => { if (k.id === t.kartId) k.rezerve = true; }); return c; });
        bildir(ne === "kabul" ? "Teklifi kabul ettin." : "Teklif reddedildi."); }
      else if (ne === "iptal") { const [, id] = b.dataset.t.split("|"); b.disabled = true; await Veri.yaz("teklifler", c => { (c.liste || []).forEach(x => { if (x.id === id) x.iptal = true; }); return c; }); bildir("Teklif geri çekildi."); }
      else if (ne === "satildi") { const [, id] = b.dataset.k.split("|"); await Veri.yaz("ilanlar", c => { (c.kartlar || []).forEach(k => { if (k.id === id) k.satildi = !k.satildi; }); return c; }); }
      else if (ne === "sil") { const [, id] = b.dataset.k.split("|"); if (S.sil !== id) { S.sil = id; profilCiz(); return; } S.sil = null;
        const k = benimIlanlar().find(x => x.id === id);
        await Veri.yaz("ilanlar", c => ({ ...c, kartlar: (c.kartlar || []).filter(k => k.id !== id) })); if (k?.foto) await Veri.fotoSil(id, k.foto); bildir("İlan silindi."); }
    } catch (err) { b.disabled = false; bildir(Veri.hataMetni(err)); }
  }
  document.addEventListener("submit", async e => {
    const f = e.target.closest("[data-msj]"); if (!f) return; e.preventDefault();
    const inp = f.querySelector("input"), m = inp.value.trim(); if (!m || !yazmaHazir()) return;
    const [alici, id] = f.dataset.msj.split("|"); if (!teklifler().find(x => x.aliciId === alici && x.id === id)) return;
    inp.value = ""; inp.blur();
    try {
      if (f.dataset.rol === "a") await Veri.yaz("teklifler", c => { (c.liste || []).forEach(x => { if (x.id === id) x.mesajlar = [...(x.mesajlar || []), { m, t: Date.now() }].slice(-40); }); return c; });
      else await Veri.yaz("ilanlar", c => { c.yanitlar = c.yanitlar || {}; const y = c.yanitlar[id] || {}; y.mesajlar = [...(y.mesajlar || []), { m, t: Date.now() }].slice(-40); c.yanitlar[id] = y; return c; });
    } catch (err) { bildir(Veri.hataMetni(err)); inp.value = m; }
  });
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-ac]"); if (a && a.dataset.ac) { e.preventDefault(); ac(a.dataset.ac); return; }
    const b = e.target.closest("[data-islem]"); if (b) islem(b);
  });
  document.addEventListener("keydown", e => { const a = e.target.closest?.("[data-ac]"); if (a && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); ac(a.dataset.ac); } });
  $("#kapat").onclick = () => dlg.close(); dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  $("#filtre").addEventListener("input", () => pazarCiz()); $("#filtre").addEventListener("change", () => pazarCiz());
  $("#fSifir").onclick = () => { $("#filtre").reset(); pazarCiz(); };

  /* ---------- holografik eğilme ---------- */
  document.addEventListener("pointermove", e => {
    const el = e.target.closest?.("[data-egim]"); $$(".egik").forEach(x => { if (x !== el) { x.classList.remove("egik"); const s = x.querySelector(".sl"); if (s) s.style.transform = ""; } });
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const s = el.querySelector(".sl"); if (!s) return; const r = s.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.classList.add("egik"); s.style.transform = `perspective(700px) rotateY(${x * 18}deg) rotateX(${-y * 14}deg) scale(1.02)`; s.style.setProperty("--parla", (50 + x * 120) + "%");
  }, { passive: true });

  /* ---------- yönlendirme ---------- */
  const GOR = ["pazar", "katalog", "ilan-ver", "teklifler", "profil"];
  function rota() {
    let h = location.hash.slice(1); const uyg = GOR.includes(h);
    S.gorunum = uyg ? h : "ana";
    document.body.classList.toggle("sayfa-uyg", uyg);
    $("#ana").hidden = uyg; $("#uygulama").hidden = !uyg;
    $$("[data-gorunum]").forEach(v => v.hidden = v.dataset.gorunum !== h);
    $$(".nav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + h));
    if (dlg.open) dlg.close();
    menuAc(false); ciz();
    if (uyg) scrollTo(0, 0); else if (h && document.getElementById(h)) setTimeout(() => document.getElementById(h).scrollIntoView(), 30); else if (!h) { /* ana sayfa */ }
    D.anaIstek && D.anaIstek();
  }
  addEventListener("hashchange", rota);
  const menu = $("#menu"), sheet = $("#sheet");
  function menuAc(acik) { menu.classList.toggle("acik", acik); sheet.classList.toggle("acik", acik); sheet.inert = !acik; menu.setAttribute("aria-expanded", String(acik)); }
  menu.onclick = () => menuAc(!sheet.classList.contains("acik"));
  addEventListener("keydown", e => { if (e.key === "Escape") menuAc(false); });

  function ciz() {
    const kapi = Veri.kapi(); ["#ilanKapi", "#teklifKapi", "#profilKapi"].forEach(id => { $(id).hidden = !kapi; $(id).textContent = kapi; });
    $("#iGonder").disabled = !yazmaHazir(); $("#takmaSatir").hidden = !!ben().takmaAd;
    const bek = teklifler().filter(t => t.saticiId === Veri.uid && durum(t) === "bekliyor").length; $("#rozetSay").hidden = !bek; $("#rozetSay").textContent = bek;
    const ds = $("#durumSerit"); ds.hidden = !Veri.hata; ds.textContent = Veri.hata;
    if (!S.profilDoldu && Veri.hazir && Veri.uid) { const b = ben(); $("#pTakma").value = b.takmaAd || ""; $("#pSehir").value = b.sehir || ""; $("#pIletisim").value = b.iletisim || ""; if (!$("#iSehir").value) $("#iSehir").value = b.sehir || ""; S.profilDoldu = true; }
    if (S.gorunum === "pazar") pazarCiz(); else if (S.gorunum === "teklifler") teklifCiz(); else if (S.gorunum === "profil") profilCiz(); else if (S.gorunum === "ilan-ver") onizle(); else if (S.gorunum === "katalog") D.katalogCiz();
  }
  window.addEventListener("deste:veri", ciz);

  /* ---------- PWA: yüklenebilir uygulama ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:" && !window.claude) navigator.serviceWorker.register("sw.js").catch(() => {});

  rota();
  Veri.baslat(() => D.yenile());
})();
