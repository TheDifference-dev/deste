# Kart kataloğu (data/katalog.json) — yöntem

Hazırlanma tarihi: 24.11.2026. Dosya: `data/katalog.json`. 400 kayıt var, her markadan 100. Kayıtlar önce markaya, sonra `sira` alanına göre dizilir.

Kartların hiçbir görseli indirilmedi ve depoya kopyalanmadı. `resmi` alanında yalnız kaynağın kendi görsel adresi durur (hotlink). Yu-Gi-Oh! ve One Piece kayıtlarında bu alan boştur.

`tur` alanı (24.11.2026): Yu-Gi-Oh! için YGOPRODeck `attribute` (büyü/tuzak kartlarında SPELL/TRAP), Pokémon için Pokémon TCG API `types[0]` (eğitmen kartlarında `supertype`), One Piece için OPTCG API `card_color`. Arayüzde yalnız temsilî çizimin renk ve desenini seçer. 1 Pokémon kaydında (sv3-223) API 502 verdiği için boş.

## Şema

| Alan | Anlamı |
|---|---|
| `id` | `ygo-<YGOPRODeck kart kimliği>`, `mtg-<Scryfall id'nin ilk 8 karakteri>`, `pk-<Pokémon TCG API id>`, `op-<OPTCG card_image_id>`. One Piece'te `_p1`/`_pr4` gibi ek, kartın varyant baskısını gösterir. |
| `marka` | `yugioh`, `magic`, `pokemon` ya da `onepiece` |
| `ad` | Kaynaktaki özgün İngilizce ad. TCGplayer'ın varyant ekleri (Alternate Art, SP…) silinir. |
| `set`, `numara`, `yil`, `nadirlik` | Seçilen baskının seti, set kodu veya numarası, setin çıkış yılı ve nadirliği |
| `sira` | Marka içindeki popülerlik sırası (1–100) |
| `olcut` | Sıranın dayandığı ham değer |
| `resmi` | Görsel adresi ya da `""` |
| `kaynak` | Veri kaynağı ve kartın sayfası ya da API adresi |

Aynı ad bir markada bir kez geçer. Aynı kartın birden çok baskısı varsa, ölçüte göre en üstte çıkan baskı seçildi. Ad karşılaştırması büyük/küçük harfe duyarsızdır.

## Yu-Gi-Oh! — YGOPRODeck görüntülenme sayısı

- **Ölçüt:** `misc_info[0].views`, yani YGOPRODeck'te kart sayfasının toplam görüntülenme sayısı. Bu, "en çok aranan" için doğrudan bir ölçüme en yakın açık veridir.
- **Veri:** Tüm kart listesi tek istekle çekildi: https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes (14.704 kart). Ayrıca set tarihleri için bir istek atıldı: https://db.ygoprodeck.com/api/v7/cardsets.php. İkisi de 24.11.2026 tarihli ve yerel önbellekten işlendi. Toplam 2 istek yapıldığından oran sınırına (20 istek/sn) uyuldu.
- **Filtre:** Token ve Skill kartları dışarıda bırakıldı. TCG biçiminde olmayan (yalnız OCG) ve hiç TCG baskısı olmayan kartlar da alınmadı.
- **Baskı seçimi:** TCG'deki ilk baskı alındı (`cardsets.php` tarihine göre en eski set). Aynı sette birden çok nadirlik varsa standart nadirlik seçildi (Secret > Ultra > Super > Rare > Common). Starlight, Ghost, Quarter Century gibi sonradan kovalanan varyantlar sona bırakıldı. `yil`, `misc_info.tcg_date` değerinden gelir.
- **Görsel:** Yok (`""`). YGOPRODeck görsellerin hotlink ile kullanılmasını yasaklıyor; görsel isteyen bunları indirip kendi sunucusunda barındırmalıdır.
- **Koşullar:** https://ygoprodeck.com/api-guide/
- **Sınırlamalar:** Görüntülenme sayısı tüm zamanların toplamıdır. Bu yüzden eski ve meta kartlar (Ash Blossom, Infinite Impermanence…) öne çıkar. Sayı koleksiyon talebini değil, oyuncu ilgisini ölçer.

## Magic: The Gathering — EDHREC sırası (Scryfall)

- **Ölçüt:** Scryfall'ın `edhrec_rank` alanı, yani kartın EDHREC'te (Commander desteleri) kaç destede oynandığına göre sırası. "En çok oynanan/aranan" için vekil olarak kullanıldı.
- **Veri:** https://api.scryfall.com/cards/search?q=game:paper%20prefer:notub&order=edhrec&unique=cards — ilk sayfa (175 kart), 24.11.2026. `User-Agent` ve `Accept: application/json` başlıkları gönderildi, istekler arasında en az 100 ms beklendi.
- **Baskı seçimi:** `unique=cards` her kart için tek baskı döndürür. `prefer:notub` eklenince Scryfall, Universes Beyond (ör. Star Trek) dışındaki en güncel baskıyı seçer. Yalnız UB'de basılmış kartlar (ör. The One Ring) UB baskısıyla kalır.
- **Görsel:** `image_uris.normal`. Çift yüzlü kartlarda `card_faces[0].image_uris.normal` kullanılır. Hepsi `cards.scryfall.io` üzerindedir.
- **Koşullar:** API kuralları https://scryfall.com/docs/api, görseller https://scryfall.com/docs/api/images. Wizards içerik politikası: https://company.wizards.com/en/legal/fancontentpolicy. Görseller kırpılmamalı, üzerine filigran konmamalı ve sanatçı/telif satırı örtülmemelidir.
- **Sınırlamalar:** EDHREC yalnız Commander biçimini ölçer, Standard/Modern oyuncularını kapsamaz. EDHREC sıralamasında 4–8 arası Scryfall'da hiçbir kartta yok. Bunların temel araziler olduğu bir TAHMİN; Scryfall'da temel arazilerin `edhrec_rank` değeri boş. Bu yüzden listedeki 100. kartın EDHREC sırası 105'tir. Seçilen baskı çoğunlukla yeni bir Commander yeniden baskısıdır, ilk baskı değildir.

## Pokémon — TCGplayer satış adedi sırası + Pokémon TCG API

- **Ölçüt:** TCGplayer'ın aylık "Top Selling Pokémon Cards" raporları. Bu raporlar, TCGplayer Marketplace'te ay içinde en çok kopya satılan kartları sıralar (satış **adedi**, dolar değil). Durum ve foil ayrımı yapılmaz, farklı setlerdeki aynı ad ayrı ürün sayılır. Ortalama satış fiyatı **50 $ ve üstü** olan rapor kullanıldı, çünkü takas pazarında el değiştiren koleksiyon kartlarını bu rapor yansıtır. Bu ölçüt market fiyatından daha iyidir: fiyat değeri ölçer, bu ise gerçek talebi.
  - Sıralama sırası: Ekim 2026 raporunun 1→100. satırı, ardından Eylül 2026'da yeni çıkan adlar, sonra Ağustos 2026'da yeni çıkan adlar. Daha önce geçen adlar atlandı, sonra kayıtlar 1–100 olarak yeniden numaralandı. `olcut` alanı ham kaynağı yazar, ör. `tcgplayer-satis:2026-10 $50+ #1 (ort. $53.46); market:...`.
  - Raporlar: https://seller.tcgplayer.com/blog/top-selling-pok%C3%A9mon-cards-on-tcgplayer-october-2026, …-september-2026, …-august-2026.
  - Ekim 2026 sayfasındaki "$50 or More" bağlantısı yanlışlıkla Eylül dosyasına gidiyor. Ekim dosyası aynı sunucuda, dosya adının "October 2026" sürümünde bulundu: `…/PKMN Top Selling Singles $50+ - October 2026.csv`. İçeriği sayfadaki Ekim öne çıkanlarıyla tutuyor (#1 Mew ex 158/128, ort. $53.46).
- **Kart verisi:** https://api.pokemontcg.io/v2/cards?q=set.id:<set>&pageSize=250. 45 set set başına çekildi. API sık sık 500/502 verdi; her istek artan beklemeyle 8 kez denendi ve istekler arasında 2,5 sn beklendi (anahtarsız sınır: 30 istek/dk). TCGplayer set adı API set kimliğine elle eşlendi (ör. "SV: Scarlet & Violet 151" → `sv3pt5`). Kart, rapordaki numarayla bulundu. Numara yoksa aynı adlı kartlar arasından API market fiyatı rapordaki ortalama satış fiyatına en yakın olan seçildi. "Full Art" etiketli kartlarda önce Ultra nadirlikler arandı.
- **Atlananlar (API'de karşılığı yok):** Ancient Mew ve Armarouge (What's Your Favorite Stamp), ikisi de "Miscellaneous Cards & Products". Ayrıca Nidorina 101 ve N's Zekrom 031 (Mega Evolution Promo): API'de ME promo seti yok.
- **Görsel:** `images.large`. Dolu olan 69 adresin hepsi `images.pokemontcg.io` üzerinde ve HEAD isteğiyle tek tek doğrulandı (24.11.2026: 69/69 `200 image/png`). **31 kayıtta `resmi` boş.** Ascended Heroes (`me2pt5`) ve sonraki setlerde (`me3`, `me4`, `me5`, `me55`, `me55c`) API'nin `images.large` alanı `images.pokemontcg.io` adresi değil, `https://images.scrydex.com/pokemon/<id>/large` adresi veriyor. Bu adresler de yanıt veriyor (5 örnek: `200 image/png`). Ancak görev koşulu yalnız `images.pokemontcg.io` olduğu için yazılmadı. Gerekirse adres `id`'den türetilebilir: `pk-` önekini at, `https://images.scrydex.com/pokemon/<id>/large`. Önce Scrydex koşulları incelenmeli.
- **Koşullar:** https://docs.pokemontcg.io/ (oran sınırları: https://docs.pokemontcg.io/getting-started/rate-limits). Halef hizmet: https://scrydex.com/docs. TCGplayer raporları kamuya açık blog içeriğidir. Pokémon görselleri The Pokémon Company / Nintendo telifindedir.
- **Sınırlamalar:** Yalnız ABD'deki TCGplayer satışlarını kapsar ve son üç aya bakar. Bu yüzden 30th Celebration gibi yeni setler öne çıkar. 50 $ altındaki çok satanlar (oyun kartları) bilerek dışarıda bırakıldı. API'deki market fiyatları 15.10.2026 tarihli; ME dönemi kartlarında fiyat yok (`market:yok`).

## One Piece — TCGplayer satış adedi sırası + OPTCG API

- **Ölçüt:** Pokémon ile aynı yöntem, TCGplayer'ın "Top Selling One Piece Cards" raporlarıyla. Sıra: Ekim, Eylül ve Ağustos 2026'nın 50 $+ raporları. Bunlar 100 benzersiz ad çıkarmadığı için ardından Ekim, Eylül ve Ağustos 2026'nın 1–49,99 $ raporları eklendi (`olcut` içinde `$50+` ya da `$1-50` yazar). One Piece'te aynı karakterin çok sayıda varyantı var (Luffy, Nami…), ad tekilleştirmesi listeyi hızla daraltıyor. 100 kaydın 65'i 50 $+ raporlarından geliyor.
  - Raporlar: https://seller.tcgplayer.com/blog/top-selling-one-piece-cards-on-tcgplayer-october-2026, …-september-2026, …-august-2026.
- **Kart verisi:** https://optcgapi.com/api/allSetCards/, https://optcgapi.com/api/allSTCards/ ve https://optcgapi.com/api/allPromos/. Veri 24.11.2026'da çekildi (`date_scraped` 23–24.11.2026). Eşleştirme TCGplayer ürün adı + set adıyla tam yapıldı. Starter Deck'lerde deste numarasıyla, gerekmezse yalnız adla eşlendi. `nadirlik` = OPTCG nadirliği + TCGplayer varyant etiketi (ör. `SR · Alternate Art`). `kaynak` alanı OPTCG kart uç noktasını gösterir (`/api/sets|decks|promos/card/<kod>/`).
- **Atlananlar:** 28 satır API'de bulunamadı ve atlandı. Çoğu DON!! kartı (Gold, World United…) ve bazı promolardır (Round 1 Promo, 3rd Anniversary Set, PSA Magazine…).
- **Yıl:** İngilizce çıkış yılları set kodundan alındı. Kaynaklar: OP-01…OP-16, EB-01…EB-03, PRB-01/02 için https://www.misprint.com/posts/one-piece-tcg-release-calendar; OP-17 için Beckett (28.08.2026); EB-05 (Heroines Edition Vol. 2) için samuraiswordtokyo.com (Ekim 2026). **11 kayıtta `yil: null`:** promo ve Starter Deck kartlarının çıkış tarihini veren bir kaynak yok, tahmin yazılmadı.
- **Görsel:** Yok (`""`). Resmî site izin vermiyor.
- **Koşullar:** https://optcgapi.com/documentation (OPTCG API fiyatları TCGplayer'dan alıyor). Kart görselleri ve adları Bandai / Eiichiro Oda / Shueisha telifindedir.
- **Sınırlamalar:** Yalnız ABD'deki TCGplayer satışlarını kapsar. Varyant baskılar (SP, Alternate Art) ön planda. `ad` alanında varyant eki yok, bu yüzden iki farklı ad aynı karakteri gösterebilir (ör. "Sanji" ve "Vinsmoke Sanji").

## Kontrol (24.11.2026)

- JSON geçerli, 147 KB.
- Her markada tam 100 kayıt, `sira` değerleri 1–100 ve benzersiz, `id` alanları benzersiz.
- Hiçbir markada kopya ad yok.
- `resmi` yalnız magic (100/100, `cards.scryfall.io`) ve pokemon (69/100, `images.pokemontcg.io`) kayıtlarında dolu.
- HEAD doğrulaması: Pokémon 69/69 ve Magic 25/25 örnek (her 4. kayıt) `200`.
