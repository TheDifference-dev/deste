# deste — Claude Code devir notu

Bu dosya, claude.ai sohbetinde 21–26 Kasım 2026 arasında yapılan bütün işin özetidir. Claude Code bu depoda çalışırken buradan devam eder. Son güncelleme: 26.11.2026 13:30.

## 1. Proje ne?

- **deste**: Türkiye'deki koleksiyoncuların kart ilanı verdiği, birbirine **para, takas ya da para + takas** teklifi gönderdiği bir pazar yeri.
- Görsel dil ve animasyonlar **tradetash.com**'dan alındı: gri sahne (#8a8a8a), 3 sütunlu ızgara çizgileri, gren katmanı, Inter + Geist Mono, yapışkan kaydırma sahneleri, CSS 3D kart kılıfı (slab).
- tash'in **iş modeli alınmadı**. Kart endeksinden pay satmak, sermaye piyasası aracı sayılabileceği için (SPK) bilerek dışarıda bırakıldı. Model, koleksiyoncular arası satış ve takas.
- Site **katalog değil, ilan pazarı**. Kart görselleri ilanı verenden gelir (sahibinden.com mantığı). İlan görselleri ana sayfa vitrininde de kullanılır.

## 2. Nerede ne var?

| Ne | Nerede |
|---|---|
| Kod deposu | GitHub `TheDifference-dev/deste` (public), dal `main` |
| Canlı site | GitHub Pages **henüz KAPALI** (404). Kullanıcı Settings › Pages › Deploy from a branch › `main` / `(root)` ile açacak. Adres: https://thedifference-dev.github.io/deste/ |
| claude.ai sayfası | https://claude.ai/artifact/JKHedaNyt2yYKWTUqPP4ZT (slug `8c390159-5984-426f-9f7c-aefd5589d256`). Çok dosyalı artifact, claude.ai'nın kendi veritabanını kullanır. Claude Code'dan güncellenemez; claude.ai sohbetinden `publish_files` ile güncellenir. |
| Veritabanı | Supabase projesi `deste`, ref `zerizspiikvjmvsusiav`, eu-central-1 |
| Kullanıcının PC'si | Masaüstü › `Cloude Work\deste` (klasör adı gerçekten "Cloude"). **Eski sürüm** (21.11, commit 5c616e6); uzak depoya bağlı değil, güncellenmesi gerekiyor. Masaüstündeki `deste.lnk` → `deste-baslat.cmd` (yerel sunucu 127.0.0.1:8642). Her uygulama `Cloude Work` içinde kendi proje klasöründe durur. |
| Proje notu | claude.ai Project "Card Trade Sitesi" › `claude/deste-site-notlari.md` (bu dosyanın kısa hâli) |

## 3. Çalıştırma ve test

Derleme adımı yok; düz HTML/CSS/JS.

```bash
python3 -m http.server 8765              # depo kökünde
# tarayıcı: http://localhost:8765/index.html?mod=yerel
```

- **`?mod=yerel` ŞART.** Bu parametre olmadan sayfa canlı Supabase'e bağlanır ve testte verilen ilan gerçek veritabanına yazılır. Bu bir kez oldu (aşağıda §10). 26.11'de `js/veri.js`'e zorlama eklendi: `?mod=yerel` varken Supabase'e hiç istek gitmez (ölçüldü: 0 istek).
- Sözdizimi denetimi: `for f in js/*.js sw.js; do node --check $f; done`
- Duman testi Playwright (Python) ile yapıldı: sayfa açılır, `pageerror` toplanır, ilan formu doldurulur, `#katalog` sekmeleri tıklanır, ekran görüntüsü alınır. Test dosyası depoda yok; gerekirse `tools/` altına eklenebilir.
- Bu kökteki `CLAUDE.md`, GuitarFlex'in `CLAUDE.md`'si değildir. GuitarFlex ayrı bir projedir; bu depoda ona dokunulmaz.

## 4. Dosyalar

| Dosya | Görev |
|---|---|
| `index.html` | Tek sayfa: ana sayfa sahneleri + uygulama görünümleri (`#pazar`, `#katalog`, `#ilan-ver`, `#teklifler`, `#profil`). Hash ile yönlendirme. |
| `css/site.css` | Bütün stiller. Slab boyutu container query ile: `.slw` kapsayıcı, `.sl` font-size `calc(100cqw/24.9)`. |
| `js/ayar.js` | `window.DESTE_AYAR`: `supabaseUrl`, `supabaseKey` (publishable, tarayıcıda görünmesi normal), `bildirimEposta` (**boş**, kullanıcıdan adres bekleniyor). |
| `js/veri.js` | Veri katmanı `window.Veri`; üç arka uç, aynı arayüz (§5). |
| `js/slab.js` | Ortak `window.D`: `D.KATS` (markalar), `D.KAT_ACIK`, `D.DURUMLAR`, `D.ILLER`, `D.esc`, `D.hash`, `D.TL`, `D.slab(k, resim)` (kart kılıfı HTML), `D.RESMI` / `D.resmiGecerli` / `D.resmiKaynak`, `D.BAGLANTI` / `D.gorselGecerli`. |
| `js/cizim.js` | `D.cizim(k)`: görseli olmayan kart için kartın adını taşıyan SVG (data URI). Türe/renge göre soyut desen (alev, dalga, yaprak, şimşek, büyü çemberi…); tohum = ad + kimlik, aynı kart hep aynı çizim; 800 girdilik önbellek. |
| `js/ana.js` | Ana sayfa sahneleri (teker, ride, grafik, yuva, kıyas, final) + `D.ilanlar()`, `D.aktif()`, `D.resim(k)` (görsel önceliği), `D.sure`. |
| `js/katalog.js` | `#katalog` sayfası, İlan ver'de kart adı öneri listesi (listbox, klavye destekli), Türk mağaza fiyatları, `D.pazarAra`. |
| `js/uygulama.js` | Pazar filtreleri, ilan formu + önizleme, resmî görsel arama (Scryfall / Pokémon TCG API), foto sıkıştırma (~170 KB), teklif gönderme/yanıt, profil, yönlendirme (`GOR` dizisi). |
| `js/vendor/supabase.js` | supabase-js 2.119.0, depoya gömülü. |
| `sw.js` | Çevrimdışı kabuk. **Kabuk dosyası değişince `SURUM`'u artır** (şu an `deste-v4`). Yeni JS dosyası eklenirse `KABUK` listesine yaz. |
| `manifest.webmanifest`, `img/ikon-*.png`, `img/deste.ico` | PWA ve Windows simgesi. |
| `img/kart-*.webp` | 13 özgün kart çizimi (tools/kartlar.py ile üretildi); ana sayfa dekoru ve `D.sanatFor` yedeği. |
| `data/katalog.json` | 400 kart (§7). |
| `data/tr-fiyatlar.json` | Türk mağaza fiyatları (§7). |
| `supabase/schema.sql` | Tablolar, RLS, RPC'ler (§6). |
| `supabase/ornek-ilanlar.sql/.json` | 4 örnek satıcı, 18 örnek ilan. |
| `docs/fiyat-kaynaklari.md`, `docs/katalog-yontemi.md`, `docs/tr-fiyat-kaynaklari.md` | Fiyat ve katalog kaynakları, yöntemler, tarihler. |
| `deste-baslat.cmd`, `BENIOKU.txt` | Windows'ta yerel sunucu + Chrome/Edge uygulama penceresi. |
| `tools/kartlar.py` | Özgün kart çizimlerini üreten betik (Playwright ile SVG → PNG → WebP). |
| `README.md` | Vitrin sayfası. Özellik değişince "özellikler" kısmını güncelle. |

## 5. Veri katmanı (`js/veri.js`)

- **Mod seçimi:** `?mod=yerel` → yerel. Yoksa `window.claude.use` varsa `claude` (claude.ai artifact). Yoksa `DESTE_AYAR.supabaseUrl` + supabase-js varsa `supabase`. O da yoksa `yerel` (localStorage).
- **Giriş yok.** Tarayıcı 48 haneli hex bir gizli anahtar üretir (localStorage `deste-anahtar`). Kimlik (`uid`) = sha256(anahtar)'ın ilk 40 hanesi. Profil sayfasında anahtar gösterilir ve başka cihaza taşınabilir. Anahtar kaybolursa ilanlar sahipsiz kalır; bu yüzden gerçek hesap sistemi yol haritasında 1. sırada.
- **API:** `Veri.baslat(cb)`, `Veri.users` (uid → ilan belgesi), `Veri.teklif` (uid → teklif belgesi), `Veri.uid`, `Veri.kimlik()`, `Veri.yaz(kol, fn)` (sıralı kuyruk; oku-değiştir-yaz), `Veri.fotoKaydet(id, dataUrl)`, `Veri.fotoAdresi(uid, id, ref)`, `Veri.fotoSil`, `Veri.hataMetni(e)`, `Veri.kapi()`.
- **Belge modeli:**
  - `ilanlar/<uid>` = `{ takmaAd, sehir, iletisim, ornek?, guncel, kartlar: [ilan], yanitlar: { <teklifId>: { durum: "kabul"|"red"|…, tarih } } }`
  - ilan = `{ id, baslik, kategori, set, durum, not, tip: "satis"|"takas"|"ikisi", fiyat, sehir, istenen, aciklama, foto: bool, gorsel?: https adres, resmi?: izinli resmî adres, tur?, tarih, satildi, rezerve }`
  - `teklifler/<uid>` = `{ liste: [ { id, saticiId, kartId, kartBaslik, tip: "para"|"takas"|"karma", tutar, takasKartId, takasMetin, mesajlar: [{m, t}], tarih, iptal? } ] }` (en çok 60 açık teklif)
  - foto: Supabase'de `foto` tablosu (`<uid>/<ilanId>`); claude.ai'da `foto/<uid>/p/<id>`; yerelde `deste-foto-<id>`.

## 6. Supabase

- Tablolar: `docs(path, col, owner, data jsonb, updated_at)` (`col` ∈ ilanlar, teklifler; belge < 200 KB) ve `foto(path, data)` (yalnız `data:image/(jpeg|png|webp);base64`, < 240 KB).
- RLS: herkes okur (`select`). Doğrudan insert/update reddedilir (42501, test edildi).
- Yazma **yalnız** SECURITY DEFINER RPC'lerle, yalnız anahtar sahibinin kendi yoluna: `belge_yaz(p_kol, p_data, p_gizli)`, `foto_yaz(p_id, p_data, p_gizli)`, `foto_sil(p_id, p_gizli)`. `kimlik_kodu()` = sha256 ilk 40 hane. `docs` realtime yayınında.
- Şema `supabase/schema.sql` içinde; değişiklikler Supabase MCP `apply_migration` ile uygulandı.
- Veri (26.11): 4 örnek satıcı (`ilanlar/ornek-satici-1..4`, 18 ilan, `ornek: true`), 1 boş test teklifi `teklifler/fe518486…` (zararsız) ve **silinmesi gereken 1 test ilanı** (§10).
- Silme ifadeleri izin onayı ister. Kullanıcı yoksa onay zaman aşımına uğrar; önceki oturumda silme yerine upsert kullanıldı.

## 7. Katalog ve fiyat verisi

- `data/katalog.json`: Pokémon, Yu-Gi-Oh!, Magic, One Piece'te 100'er kart; alanlar `{id, marka, ad, set, numara, yil, nadirlik, sira 1..100, olcut, resmi, kaynak, tur}`. Ayrıntı ve tarihler `docs/katalog-yontemi.md`'de.
  - Yu-Gi-Oh!: YGOPRODeck görüntülenme sayısı. Görsel yok.
  - Magic: Scryfall `order=edhrec` (+`prefer:notub`). Görsel 100/100 `cards.scryfall.io`.
  - Pokémon: TCGplayer aylık "Top Selling" raporları (ABD, Ağu–Eki 2026) + Pokémon TCG API. 69 kartta `images.pokemontcg.io` görseli var. 31 kartta (ME setleri: me2pt5, me3, me4, me5, me55, me55c) API `images.scrydex.com` veriyor; Scrydex'in kullanım koşulu bulunamadığı için boş, kartlar çizimle görünüyor.
  - One Piece: TCGplayer satış raporları + OPTCG API. Görsel yok; 11 kayıtta `yil: null`.
  - `tur`: YGO `attribute` (SPELL/TRAP), Pokémon `types[0]`, One Piece `card_color`. Yalnız çizim rengini/desenini seçer. sv3-223 için API 502 verdi; tür internetten doğrulanıp elle girildi (Darkness).
- Dragon Ball Super Fusion World'ün **kataloğu yok**. Kullanıcı "isim ve resimlerle sonra ilgileniriz" dedi.
- `data/tr-fiyatlar.json`: `{tarih, magazalar[{ad, url, tekKartSatiyor, not}], tekKart[93 kayıt, hepsi Card House], kapaliUrun[33]}`.
  - Goblin Oyun Kulübü fiyatları **çıkarıldı**: kullanım koşulu (Md. 7) içerik kopyalamayı yazılı izne bağlıyor.
  - Card House sözleşmesi (5.2) yalnız görsel ve metin kopyalamayı kısıtlıyor; fiyatlar kaynak bağlantısıyla gösteriliyor, görsel alınmıyor.
  - D20'de kullanım koşulu sayfası yok. Kutugo'da TCG ürünü yok. Da Vinci = kutuoyunual.com (yalnız Pokémon kapalı ürün, stokta yok).
- Örnek ilan fiyatları: TCGplayer / PriceCharting / Scryfall USD × TCMB 23.11.2026 kuru 50,6026 (`docs/fiyat-kaynaklari.md`).

## 8. Markalar (kullanıcı kararı, 25.11)

`D.KATS` (js/slab.js): `pokemon` Pokémon · `yugioh` Yu-Gi-Oh! · `magic` **Magic: The Gathering** (etiket "Magic" değil) · `onepiece` One Piece · `dragonball` Dragon Ball Super Fusion World · `futbol` · `basketbol` · `diger`.

- Dayanak: TCGplayer Q3 2026 satış sıralaması (1 MTG, 2 Pokémon, 3 One Piece, 4 Yu-Gi-Oh!, … 10 Dragon Ball Super Fusion World). Kullanıcı "ilk 4 + 5. olarak Dragon Ball" dedi.
- 24.11'de eklenen Riftbound, Disney Lorcana ve Gundam bu karar üzerine çıkarıldı.
- Yeni marka eklerken değişecek yerler: `D.KATS`, `D.KAT_ACIK` (slab.js), `MARKA` (cizim.js), `index.html`'deki meta açıklama ve "deste nedir?" metni, `README.md`, varsa katalog `MARKALAR` (katalog.js) ve `#katSekme` sekmeleri.

## 9. Görseller ve telif (önemli kurallar)

- **Görsel önceliği** (`D.resim`): satıcının yüklediği görsel > satıcının görsel bağlantısı (`gorsel`, yalnız https, kopyalanmaz, `referrerpolicy=no-referrer`, yüklenemezse çizime düşer) > izinli resmî görsel (`resmi`) > `D.cizim` temsilî çizimi.
- **Resmî görsel yalnız iki kaynaktan, yalnız bağlantıyla** gösterilir; depoya kopyalanmaz:
  - Magic → `cards.scryfall.io`. Scryfall kuralı gereği kırpma ve bulanıklaştırma yok; bu yüzden `.sl.gercek` sınıfında holo bindirmesi kapalı ve kaynak bilgisi (`D.resmiKaynak`) gösteriliyor.
  - Pokémon → `images.pokemontcg.io`.
- Yu-Gi-Oh! (YGOPRODeck doğrudan bağlantıyı yasaklıyor) ve One Piece (Bandai sitesi çoğaltmayı yasaklıyor) için resmî görsel **yok**. Kullanıcı Google Görseller'den toplu indirme istedi; telif nedeniyle iki kez reddedildi. Bunun yerine satıcı görsel yükleme modeli kuruldu.
- **Temsilî çizimlerde** tanınan karakter (Pikachu, Luffy, Blue-Eyes…) çizilmez; desen soyut kalır, kartta "Temsilî çizim · resmî kart görseli değildir" yazar. Örnek ilanlara Claude kendisi resmî görsel indirip koymaz; kullanıcı kendi ilanlarını formdan görselle ekler.
- **Hak beyanı:** formda "görselin ilanda ve vitrinde gösterilmesine izin verirsin, sorumluluk sende, itirazda kaldırılır" notu var. Alt bilgide yer sağlayıcı metni (5651 sayılı Kanun md. 5: içeriği denetleme yükümlülüğü yok, bildirim gelince kaldırma yükümlülüğü var).
- İlan detayında "Görsel için hak ihlali bildir" bağlantısı (mailto) **yalnız `bildirimEposta` doluysa** görünür. Kullanıcıya bu iş için ayrı bir e-posta adresi açması önerildi; adres hâlâ gelmedi.
- claude.ai artifact'ında CSP dış görselleri engeller (`D.resmiGecerli` false döner). Orada yüklenen fotoğraflar ve çizimler çalışır, bağlantılı görseller çizime düşer.

## 10. Açık sorunlar

1. **Canlı veritabanında test ilanı var.** 24.11'de Playwright testi `?mod=yerel` ile yapıldı ama o zaman bu parametre yoktu; test canlı Supabase'e yazdı. Kayıt: `ilanlar/2f28a06d73bd2784ce9aa636b7d21d97eda5d8f8`, takma ad "arda", ilan "Blue-Eyes White Dragon", 1.500 ₺, görsel bağlantısı `https://ornek.test/kart.jpg`. Silme onayı reddedildi; kullanıcı onaylarsa şu sorgu çalıştırılır:
   `delete from docs where path = 'ilanlar/2f28a06d73bd2784ce9aa636b7d21d97eda5d8f8';`
   Kullanıcı aynı sorguyu Supabase › SQL Editor'den de çalıştırabilir. Sorunun kaynağı düzeltildi (`?mod=yerel` zorlaması).
2. `bildirimEposta` boş.
3. GitHub Pages kapalı.
4. PC kopyası eski. Güncelleme yolu: `git clone https://github.com/TheDifference-dev/deste` ya da mevcut klasöre uzak depo ekleyip `pull`. Kısayolu Pages adresine çevirmek de bir seçenek.
5. Gerçek kullanıma geçmeden: örnek ilanları sil (`delete from docs where path like 'ilanlar/ornek-%'`), RPC'lere hız sınırı, KVKK aydınlatma metni, kullanım koşulları sayfası.

## 11. Yol haritası (24.11 araştırması; kullanıcı henüz seçmedi)

Önerilen sıra 1 → 2 → 3:

1. **Gerçek hesap sistemi** (Supabase Auth: e-posta bağlantısı ya da Google). Puan, mesaj ve istek listesi buna dayanıyor. Mevcut anahtarlı ilanların hesaba taşınması planlanmalı.
2. **İstek listesi + eşleşme / takas önerisi** (Cardmarket "Wants" + "Shopping Wizard" benzeri): aranan kart ilanlanınca haber; "sizinle takas edebilecek kişiler".
3. **Toplu ilan** (TCGplayer "Mass Entry" benzeri): `4 Sol Ring [SLD] 84` gibi satırlar katalogla eşleşir, çoklu ilan olur.
4. Koleksiyon / portföy değeri (Collectr benzeri).
5. Satıcı puanı ve yorum (tamamlanan teklif sonrası).
6. Site içi mesajlaşma + sahte "güvenli ödeme" bağlantı uyarısı (sahibinden "Param Güvende" taklidi dolandırıcılıkları yaygın).
7. Fiyat geçmişi ve fiyat alarmı (zaman serisi veri toplamak gerekir).
8. Güvenli ödeme (escrow): şirket, ETBİS kaydı ve iyzico pazaryeri (alt üye işyeri) gerekir. Büyük iş; en sona. Hukuki danışmanlık önerildi.
9. Kargo entegrasyonu, turnuva/mağaza haritası, fotoğraftan kart tanıma.
10. Dragon Ball Super Fusion World kataloğu, isimleri ve görselleri.

## 12. Kullanıcıyla çalışma kuralları

- Türkçe, kısa ve samimi yaz. Uzun açıklama yerine örnek ver.
- Cevabın ilk satırı zaman damgası: `TZ=Europe/Istanbul date '+%d.%m.%Y %A %H:%M'`.
- Bilgiyi etiketle: **ÖLÇTÜM** (kaynağa baktım) / **KAYNAK SÖYLÜYOR** (doğrulamadım) / **TAHMİN**. Rakam, yol, tarih uydurma.
- Otonom çalış: yöntem, araç ve dosya adı senin kararın. Geri alınabilir işi yap, sonra söyle. Geri alınamaz ya da dışarı çıkan işi (silme, yayın, ödeme, yetki) hazırla ve onay al.
- Netleştirme gerekirse seçenekli soru sor. Her dediğine katılma; yanlış bulduğun yeri gerekçesiyle söyle.
- Bir kaynak hata verirse (API 502 gibi) pes etme; internetten araştırmaya devam et.
- Toplu işte kaç öğenin işlendiğini ve atlandığını yaz. "Hata vermedi" doğrulama sayılmaz; çıktıyı kaynağa karşı ölç.
- Telif ve kullanım koşulu belirsizse önce koşulu oku; yasaklıysa kullanma, alternatif öner.
- Commit mesajları Türkçe. Her özellik değişikliğinden sonra `README.md`'yi güncelle, commit'le ve `main`'e push'la.
