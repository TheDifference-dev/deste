# deste — kart takas pazarı

Türkiye'de koleksiyoncuların kartlarını ilan verdiği, birbirine **para, takas ya da para + takas** teklifi gönderdiği bir pazar yeri. Pokémon, Yu-Gi-Oh!, Magic: The Gathering, One Piece ve futbol, basketbol kartları için.

Tasarım dili tradetash.com'dan esinlenir: taş gri sahne, üç sütunlu ızgara, kaydırmayla dönen 3B dereceli kart kılıfı, renkli katman geçişleri, kayan kart galerisi, adım izi. Kod, metinler ve kart çizimleri bu projeye özgüdür; başka bir markanın görseli ya da adı kullanılmaz.

## Özellikler
- **Ana sayfa:** kaydırmayla yönetilen sahne (kılıf dönüşü, fiyat, mavi takas çizgileri, kart çarkı, yeşil kart ızgarası), canlı ilanlardan kayan galeri, ilan sayısı grafiği, kategori kıyası, dört adımlık iz, SSS, 3B final kartı.
- **Pazar:** arama (Türkçe karakterden bağımsız), kategori, satılık/takaslık, ham/dereceli, 81 il, fiyat aralığı, sıralama.
- **İlan ver:** fotoğraf (tarayıcıda ~170 KB'a sıkıştırılır), canlı önizleme; Magic ve Pokémon için resmî kart görselini kaynağından (Scryfall / Pokémon TCG API) seçme.
- **Teklifler:** para / takas / karma teklif, kabul–red, mesajlaşma; kabulde iki tarafın iletişim notu açılır.
- **Profil:** takma ad, şehir, iletişim notu, ilan yönetimi, hesap anahtarını başka cihaza taşıma.
- **Yüklenebilir uygulama (PWA):** Chrome'da “Yükle” ile masaüstü/telefon uygulaması gibi açılır.
- Holografik ışık ve fareyle eğilme animasyonu.

## Hesap sistemi
Kayıt yok. Her tarayıcı rastgele 48 haneli bir **gizli anahtar** üretir; kullanıcı kimliği bu anahtarın SHA-256 özetidir. Veritabanı herkese okunur, ama bir belgeye yalnız anahtar sahibi yazabilir (`belge_yaz` / `foto_yaz` fonksiyonları). Anahtar Profil sayfasından kopyalanıp başka cihaza taşınabilir.

## Dosyalar
| Yol | İçerik |
|---|---|
| `index.html` | Tüm sayfa (ana sayfa + uygulama görünümleri, `#pazar`, `#ilan-ver`, `#teklifler`, `#profil`) |
| `css/site.css` | Tasarım ve animasyon stilleri |
| `js/ayar.js` | Supabase adresi ve publishable anahtar |
| `js/veri.js` | Veri katmanı: Supabase · claude.ai · yerel deneme |
| `js/slab.js` | Kart kılıfı bileşeni ve ortak yardımcılar |
| `js/ana.js` | Ana sayfa kaydırma animasyonları |
| `js/uygulama.js` | Pazar, ilan, teklif, profil mantığı |
| `supabase/schema.sql` | Veritabanı şeması, güvenlik kuralları, RPC'ler |
| `img/kart-*.webp` | Projeye özgü kart çizimleri |
| `tools/kartlar.py` | Kart çizimlerini üreten betik |

## Kurulum
1. Supabase'de `supabase/schema.sql` dosyasını SQL Editor'de çalıştır.
2. `js/ayar.js` içine proje adresini ve **publishable** anahtarı yaz (gizli anahtar değil).
3. GitHub Pages: *Settings → Pages → Deploy from a branch → main / root*.

Yerelde denemek için: `python3 -m http.server` ve `http://localhost:8000`. `js/ayar.js` boşsa site tarayıcıda (localStorage) deneme modunda çalışır.

## Notlar
- Site ödeme almaz, aracılık ya da yatırım hizmeti sunmaz; alışveriş taraflar arasındadır.
- Resmî kart görselleri depoya kopyalanmaz, ilgili API'nin sunucusundan gösterilir; hakları sahiplerine aittir.
- Örnek ilanlar (`ornek: true`) gerçek kullanıma geçmeden silinmeli.
- Örnek ilanlar gerçek Pokémon, Magic, Yu-Gi-Oh! ve One Piece kartlarıdır; fiyat kaynakları ve kur `docs/fiyat-kaynaklari.md` dosyasında. Görsel yalnız doğrudan bağlantıya izin veren kaynaklardan (Scryfall, Pokémon TCG API) gösterilir; Yu-Gi-Oh! ve One Piece ilanları temsilî çizimle görünür. Görsel önceliği: satıcı fotoğrafı › resmî görsel › özgün çizim.
