/* deste veri katmanı: aynı arayüz, üç arka uç.
   - claude: sayfa claude.ai'da yayınlandığında (window.claude.use("db"))
   - supabase: GitHub Pages ya da başka bir sunucuda (js/ayar.js)
   - yerel: ikisi de yoksa tarayıcıda deneme (localStorage)
   Veri modeli: ilanlar/<uid> = {takmaAd, sehir, iletisim, kartlar[], yanitlar{}}, teklifler/<uid> = {liste[]} */
(() => {
  const idOk = s => typeof s === "string" && /^[A-Za-z0-9_\-.~:@+]{1,120}$/.test(s) && s !== "." && s !== "..";
  const V = { mod: "yerel", hazir: false, hata: "", uid: null, yazabilir: null, users: {}, teklif: {}, idOk };
  let dinleyici = () => {};
  const bildir = () => dinleyici();
  const ayir = (path, data) => { const [kol, id] = String(path).split("/"); if (!idOk(id) || !data || typeof data !== "object") return;
    if (kol === "ilanlar") V.users[id] = data; else if (kol === "teklifler") V.teklif[id] = data; };
  const sil = path => { const [kol, id] = String(path).split("/"); if (kol === "ilanlar") delete V.users[id]; else if (kol === "teklifler") delete V.teklif[id]; };

  /* ---------- claude.ai ---------- */
  async function claudeBaslat() {
    let user = null, db = null;
    try { user = await window.claude.use("user"); } catch {}
    try { db = await window.claude.use("db"); } catch {}
    if (user) { try { V.uid = await user.id(); } catch {} try { V.yazabilir = await user.can("data.write"); } catch {} }
    if (!idOk(V.uid)) V.uid = null;
    if (!db) { V.hata = "Pazar verisine ulaşılamıyor. Sayfayı claude.ai'da oturum açıkken aç."; bildir(); return; }
    V._db = db;
    let a = false, b = false;
    const zaman = setTimeout(() => { if (!V.hazir) { V.hata = "Pazar verisi henüz yüklenemedi; bağlantını kontrol et."; bildir(); } }, 10000);
    const tamam = () => { if (a && b && !V.hazir) { V.hazir = true; V.hata = ""; clearTimeout(zaman); } };
    const hata = e => { clearTimeout(zaman); V.hata = e?.code === "revoked" ? "Bu sayfaya erişimin değişti." : "Pazar verisi okunamadı; sayfayı yenile."; bildir(); };
    db.collection("ilanlar").onSnapshot(s => { V.users = {}; s.docs.forEach(d => d.exists && ayir("ilanlar/" + d.id, d.data())); if (!s.metadata.fromCache) { a = true; tamam(); } bildir(); }, hata);
    db.collection("teklifler").onSnapshot(s => { V.teklif = {}; s.docs.forEach(d => d.exists && ayir("teklifler/" + d.id, d.data())); if (!s.metadata.fromCache) { b = true; tamam(); } bildir(); }, hata);
  }

  /* ---------- Supabase ----------
     Giriş yok: her tarayıcı rastgele bir gizli anahtar üretir; kimlik = sha256(anahtar) ilk 40 hane.
     Okuma herkese açık (RLS select), yazma yalnız belge_yaz/foto_yaz RPC'leriyle ve yalnız kendi yoluna. */
  let sb = null, gizli = null;
  const AK = "deste-anahtar";
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  const kimlikKodu = async g => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(g))).slice(0, 40);
  async function anahtarHazirla(yeni) {
    let g = yeni || null;
    if (!g) { try { g = localStorage.getItem(AK); } catch {} }
    if (!g || !/^[a-f0-9]{48}$/.test(g)) { const b = new Uint8Array(24); crypto.getRandomValues(b); g = hex(b); }
    try { localStorage.setItem(AK, g); V.kalici = localStorage.getItem(AK) === g; } catch { V.kalici = false; }
    gizli = g; V.uid = await kimlikKodu(g);
  }
  V.anahtar = () => gizli;
  V.anahtarYukle = async g => { g = String(g || "").trim().toLowerCase(); if (!/^[a-f0-9]{48}$/.test(g)) throw { code: "anahtar" }; await anahtarHazirla(g); bildir(); };
  async function sbBaslat() {
    const A = window.DESTE_AYAR;
    sb = window.supabase.createClient(A.supabaseUrl, A.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
    await anahtarHazirla();
    V.yazabilir = true;
    const yukle = async () => {
      const { data, error } = await sb.from("docs").select("path,col,data").limit(5000);
      if (error) throw error;
      V.users = {}; V.teklif = {}; (data || []).forEach(r => ayir(r.path, r.data));
      V.hazir = true; V.hata = ""; bildir();
    };
    try { await yukle(); } catch (e) { V.hata = "Pazar verisi okunamadı; bağlantını kontrol edip sayfayı yenile."; bildir(); }
    try {
      sb.channel("docs-degisim").on("postgres_changes", { event: "*", schema: "public", table: "docs" }, pl => {
        if (pl.eventType === "DELETE") sil(pl.old?.path); else ayir(pl.new?.path, pl.new?.data);
        bildir();
      }).subscribe();
    } catch {}
    setInterval(() => { if (document.visibilityState === "visible") yukle().catch(() => {}); }, 45000);
  }

  /* ---------- yerel deneme ---------- */
  const YK = "deste-yerel";
  const yerelOku = () => { try { return JSON.parse(localStorage.getItem(YK)) || {}; } catch { return {}; } };
  const yerelYaz = o => { try { localStorage.setItem(YK, JSON.stringify(o)); } catch {} };
  function yerelBaslat() {
    V.uid = "yerel-kullanici"; V.yazabilir = true;
    const o = yerelOku(); Object.entries(o).forEach(([p, d]) => ayir(p, d));
    V.hazir = true; V.hata = ""; bildir();
  }

  /* ---------- ortak arayüz ---------- */
  V.baslat = async (cb) => {
    dinleyici = cb || dinleyici;
    if (window.claude && typeof window.claude.use === "function") { V.mod = "claude"; return claudeBaslat(); }
    if (window.DESTE_AYAR?.supabaseUrl && window.supabase?.createClient) { V.mod = "supabase"; return sbBaslat(); }
    V.mod = "yerel"; yerelBaslat();
  };
  V.kapi = () => {
    if (V.mod === "claude") {
      if (!V._db) return V.hata || "Pazar verisine bağlanılıyor…";
      if (!V.uid) return "Kim olduğunu doğrulayamadık; claude.ai'da oturum açık olmalı.";
      if (V.yazabilir === false) return "Bu sayfada yalnızca görüntüleme erişimin var. İlan vermek ve teklif göndermek için sayfa sahibinden “Katkıda bulunan” erişimi iste.";
    }
    return "";
  };
  V.kimlik = async () => {
    if (V.uid && (V.mod !== "claude" || V.yazabilir !== false)) return V.uid;
    throw { code: "yetki" };
  };
  let kuyruk = Promise.resolve();
  V.yaz = (kol, fn) => {
    const p = kuyruk.then(async () => {
      const uid = await V.kimlik(); const path = kol + "/" + uid;
      if (V.mod === "claude") { const ref = V._db.doc(path); const s = await ref.get(); const cur = s.exists ? structuredClone(s.data()) : {}; await ref.set(fn(cur)); return; }
      if (V.mod === "supabase") {
        const { data, error } = await sb.from("docs").select("data").eq("path", path).maybeSingle(); if (error) throw error;
        const next = fn(data?.data ? structuredClone(data.data) : {});
        const r = await sb.rpc("belge_yaz", { p_kol: kol, p_data: next, p_gizli: gizli }); if (r.error) throw r.error;
        ayir(path, next); bildir(); return;
      }
      const o = yerelOku(); const next = fn(o[path] ? structuredClone(o[path]) : {}); o[path] = next; yerelYaz(o); ayir(path, next); bildir();
    });
    kuyruk = p.catch(() => {}); return p;
  };
  V.fotoKaydet = async (id, dataUrl) => {
    const uid = await V.kimlik();
    if (V.mod === "claude") { await V._db.doc(`foto/${uid}/p/${id}`).set({ d: dataUrl }); return true; }
    if (V.mod === "supabase") {
      const { error } = await sb.rpc("foto_yaz", { p_id: id, p_data: dataUrl, p_gizli: gizli });
      if (error) throw error;
      return true;
    }
    try { localStorage.setItem("deste-foto-" + id, dataUrl); } catch {} return true;
  };
  const onbellek = {};
  V.fotoAdresi = async (uid, id, ref) => {
    if (!ref || !idOk(uid) || !idOk(id)) return null;
    const k = uid + "|" + id; if (k in onbellek) return onbellek[k];
    let u = null;
    const dogru = d => typeof d === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d);
    if (V.mod === "supabase") { try { const { data } = await sb.from("foto").select("data").eq("path", uid + "/" + id).maybeSingle(); if (dogru(data?.data)) u = data.data; } catch { return null; } }
    else if (V.mod === "claude" && V._db) { try { const s = await V._db.doc(`foto/${uid}/p/${id}`).get(); const d = s.exists && s.data().d; if (typeof d === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d)) u = d; } catch { return null; } }
    else if (V.mod === "yerel") { try { u = localStorage.getItem("deste-foto-" + id); } catch {} }
    onbellek[k] = u; return u;
  };
  V.fotoOnbellek = (uid, id) => onbellek[uid + "|" + id];
  V.fotoSil = async (id, ref) => {
    try {
      if (V.mod === "claude") await V._db.doc(`foto/${V.uid}/p/${id}`).delete();
      else if (V.mod === "supabase") await sb.rpc("foto_sil", { p_id: id, p_gizli: gizli });
      else localStorage.removeItem("deste-foto-" + id);
    } catch {}
  };
  V.hataMetni = e => e?.code === "PGRST202" ? "Sunucu henüz hazır değil (veritabanı fonksiyonu eksik)." :
    e?.code === "anahtar" ? "Anahtar 48 haneli olmalı (0-9, a-f)." :
    e?.code === "yetki" ? V.kapi() || "Bu işlem için yetkin yok." :
    e?.code === "quota_exceeded" ? "Depolama sınırı doldu; eski ilanlarından bazılarını sil." :
    e?.code === "invalid_argument" || e?.code === "42501" || e?.code === "23514" || e?.code === "22023" ? "Kaydedilemedi: yazma iznin yok ya da veri çok büyük." :
    e?.code === "resource_exhausted" || e?.status === 429 ? "Çok hızlı işlem yapıldı; birkaç saniye sonra tekrar dene." :
    "Kaydedilemedi, bağlantını kontrol edip tekrar dene.";
  window.Veri = V;
})();
