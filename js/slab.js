/* Ortak yardımcılar ve dereceli kart kılıfı (slab) bileşeni */
(() => {
  const D = {};
  D.KATS = [["pokemon","Pokémon"],["yugioh","Yu-Gi-Oh!"],["magic","Magic: The Gathering"],["onepiece","One Piece"],["futbol","Futbol"],["basketbol","Basketbol"],["diger","Diğer"]];
  D.KAT = Object.fromEntries(D.KATS);
  D.KAT_ACIK = {pokemon:"Pokémon TCG kartları: Base Set klasiklerinden yeni setlerin özel illüstrasyonlarına.",yugioh:"Yu-Gi-Oh! kartları: 1. baskı LOB'dan turnuva kartlarına.",magic:"Magic: The Gathering kartları: Commander staple'larından eski setlere.",onepiece:"One Piece Card Game: alternatif art ve lider kartları.",futbol:"Futbol kartları ve çıkartmalar: Panini, Prizm, Süper Lig setleri.",basketbol:"Basketbol kartları: rookie'ler, paraleller, lotlar.",diger:"Diğer oyunlar ve koleksiyon kartları."};
  D.DURUMLAR = ["Ham · Mint","Ham · Near Mint","Ham · Hafif oynanmış","Ham · Oynanmış","PSA","BGS","CGC","Diğer derecelendirme"];
  D.ILLER = "Adana,Adıyaman,Afyonkarahisar,Ağrı,Aksaray,Amasya,Ankara,Antalya,Ardahan,Artvin,Aydın,Balıkesir,Bartın,Batman,Bayburt,Bilecik,Bingöl,Bitlis,Bolu,Burdur,Bursa,Çanakkale,Çankırı,Çorum,Denizli,Diyarbakır,Düzce,Edirne,Elazığ,Erzincan,Erzurum,Eskişehir,Gaziantep,Giresun,Gümüşhane,Hakkari,Hatay,Iğdır,Isparta,İstanbul,İzmir,Kahramanmaraş,Karabük,Karaman,Kars,Kastamonu,Kayseri,Kilis,Kırıkkale,Kırklareli,Kırşehir,Kocaeli,Konya,Kütahya,Malatya,Manisa,Mardin,Mersin,Muğla,Muş,Nevşehir,Niğde,Ordu,Osmaniye,Rize,Sakarya,Samsun,Şanlıurfa,Siirt,Sinop,Şırnak,Sivas,Tekirdağ,Tokat,Trabzon,Tunceli,Uşak,Van,Yalova,Yozgat,Zonguldak".split(",");
  D.SANAT = ["tilki","kapadokya","dalga","kedi","kartal","kristal","lale","yildirim","ay","goz","golcu","smac","kaleci"];
  D.SANAT_AD = {tilki:"Ateş Tilkisi",kapadokya:"Kapadokya Göğü",dalga:"Ege Dalgası",kedi:"Van Kedisi",kartal:"Toros Kartalı",kristal:"Kristal Golem",lale:"Lale Devri",yildirim:"Yıldırım Ruhu",ay:"Ay Büyücüsü",goz:"Ejder Gözü",golcu:"Golcü",smac:"Smaç Kralı",kaleci:"Uçan Kaleci"};
  D.TL = new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0});
  D.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  D.norm = s => String(s || "").toLocaleLowerCase("tr").replace(/ı/g,"i").normalize("NFD").replace(/[̀-ͯ]/g,"");
  D.hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  D.dereceli = d => !String(d || "").startsWith("Ham");
  D.dereceMetni = k => D.dereceli(k.durum) ? `${k.durum}${k.not != null && k.not !== "" ? " " + k.not : ""}` : String(k.durum || "Ham");
  D.fiyatMetni = k => k.tip === "takas" ? "Takaslık" : (typeof k.fiyat === "number" ? D.TL.format(k.fiyat) : "Fiyat sor") + (k.tip === "ikisi" ? " · takas olur" : "");
  D.sanatFor = k => "img/kart-" + D.SANAT[D.hash(k.id || k.baslik || "x") % D.SANAT.length] + ".webp";
  /* Resmî kart görseli: yalnız doğrudan bağlantıya izin veren kaynaklar (Scryfall, Pokémon TCG API).
     Yu-Gi-Oh! (YGOPRODeck hotlink yasak) ve One Piece (izin yok) görselleri bilerek listede yok.
     claude.ai'da (window.claude) CSP dış görseli engellediği için resmî görsel kullanılmaz. */
  D.RESMI = /^https:\/\/(images\.pokemontcg\.io|cards\.scryfall\.io)\/[A-Za-z0-9_\-./]+\.(png|jpg|jpeg|webp)(\?[0-9]+)?$/;
  D.resmiKullan = () => !window.claude;
  D.resmiGecerli = k => typeof k?.resmi === "string" && D.RESMI.test(k.resmi) && D.resmiKullan();
  D.resmiKaynak = u => /cards\.scryfall\.io/.test(u) ? "Scryfall · kart © Wizards of the Coast" : "Pokémon TCG API · kart © The Pokémon Company, Nintendo, Creatures, GAME FREAK";
  /* Dış görsel yüklenemezse temsilî çizime düş (satır içi onerror yok; yakalama aşamasında dinlenir). */
  document.addEventListener("error", e => {
    const i = e.target; if (!(i instanceof HTMLImageElement) || !i.dataset.yedek || i.dataset.dustu) return;
    i.dataset.dustu = "1"; i.closest(".sl")?.classList.remove("gercek"); i.src = i.dataset.yedek;
  }, true);
  const NOTAD = n => n >= 10 ? "GEM MT" : n >= 9 ? "MINT" : n >= 8 ? "NM-MT" : n >= 7 ? "NM" : n >= 5 ? "EX" : "VG";
  /* k: {id, baslik, set, durum, not, kategori} ; resim: url (yoksa temsilî sanat) */
  D.slab = (k, resim, ek = "") => {
    const der = D.dereceli(k.durum), n = Number(k.not);
    const kurum = der ? (k.durum === "Diğer derecelendirme" ? "DRC" : String(k.durum)) : "HAM";
    const sag = der && !isNaN(n) ? [NOTAD(n), String(k.not)] : [String(k.durum || "Ham").replace("Ham · ", "").toUpperCase(), ""];
    const sertifika = String(D.hash((k.id || "") + (k.baslik || "")) % 90000000 + 10000000);
    const yil = (String(k.set || "").match(/(19|20)\d\d/) || [""])[0];
    const ust = [yil, D.KAT[k.kategori] || ""].filter(Boolean).join(" ");
    const src = resim || D.sanatFor(k), gercek = D.RESMI.test(src), yedek = D.sanatFor(k);
    return `<div class="slw"><div class="sl${gercek ? " gercek" : ""} ${ek}"><div class="sl-et"><div class="sl-sol"><b>${D.esc(ust || "DESTE")}</b><b>${D.esc(k.baslik || "Kart adı")}</b><i class="sl-bar"></i></div>
<div class="sl-orta">${D.esc(kurum)}</div><div class="sl-sag"><b>#${String(D.hash(k.id || "a") % 400 + 1).padStart(2, "0")}</b><b>${D.esc(sag[0])}</b><b>${D.esc(sag[1])}</b><b>${sertifika}</b></div></div>
<div class="sl-kuyu"><img src="${D.esc(src)}" alt="" loading="lazy" decoding="async"${gercek ? ` data-yedek="${D.esc(yedek)}" referrerpolicy="no-referrer"` : ""}></div></div></div>`;
  };
  D.slabArka = () => `<div class="slw"><div class="sl arka"><div class="sl-et"><span>deste</span></div><div class="sl-kuyu"><img src="img/kart-arka.webp" alt=""></div></div></div>`;
  D.sanatKart = (ad, i) => ({ id: "sanat-" + ad, baslik: D.SANAT_AD[ad], set: "deste 2026", durum: ["PSA","BGS","CGC"][i % 3], not: [10, 9.5, 9, 10, 8.5][i % 5], kategori: ["golcu","smac","kaleci"].includes(ad) ? (ad === "smac" ? "basketbol" : "futbol") : "diger" });
  window.D = D;
})();
