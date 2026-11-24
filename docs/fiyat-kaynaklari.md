# Örnek ilan fiyat kaynakları

Hazırlanma tarihi: 24.11.2026. Örnek ilanlar `supabase/ornek-ilanlar.sql` / `supabase/ornek-ilanlar.json` dosyalarındadır (satıcılar `ilanlar/ornek-satici-1…4`, `ornek: true`).

## Kur

| Kur | Değer | Kaynak |
|---|---|---|
| USD/TRY | 50,6026 | TCMB 23.11.2026 bülteni (2026/220), döviz satış — https://www.tcmb.gov.tr/kurlar/today.xml |
| EUR/TRY | 55,5655 | TCMB 23.11.2026 bülteni, döviz satış (kullanılmadı; tüm referanslar USD) |
| Çapraz kontrol | USD/TRY 50,59 · EUR/TRY 55,34 | ECB referans kuru 23.11.2026 (api.frankfurter.app) |

## Yöntem

- **Ham (derecesiz) kart:** Near Mint fiyatı veren kaynak (TCGplayer Market — Pokémon TCG API / Scryfall `prices.usd` / OPTCG API). Yu-Gi-Oh! ham kartlarda tarihli NM kaynağı olmadığından PriceCharting *Ungraded* (eBay satılmış ortalaması, durum karışık) kullanıldı.
- **Durum indirimi (TAHMİN):** NM kaynaklı fiyata *Hafif oynanmış* ×0,85, *Oynanmış* ×0,65. Kaynak değildir, yaygın piyasa farkına dayalı varsayımdır.
- **Dereceli kart:** PriceCharting (eBay satılmış ilan ortalamaları) ilgili not sütunu. PriceCharting'in *Grade 9.5* sütunu kurum ayırmaz; BGS 9.5 ve CGC 9.5 kartlar için bu sütun kullanıldı.
- **TL:** USD × 50,6026, sonra yuvarlama (1.000 ₺ altı 50'lik, 10.000 ₺ altı 250'lik, 100.000 ₺ altı 1.000'lik, üstü 5.000'lik). Gümrük/kargo/komisyon eklenmedi.
- **Takaslık ilanlarda** `fiyat` boştur; hesaplanan tutar yalnız açıklamada "takas değeri" olarak geçer.
- **Türk siteleri:** Web aramasında (24.11.2026) bu kartlar için TL fiyatlı, tarihli bir Türk satış sayfası bulunamadı; Türk kaynağı kullanılmadı.

## Kartlar

| Oyun | Kart | Set / no / yıl | Durum | İlan türü | Satıcı · şehir | Kaynak | Kaynak fiyatı | Kaynak tarihi | Hesap | İlan fiyatı | Görsel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Pokémon | Charizard – Base Set 2 4/130 (Holo) | Base Set 2 · 4/130 · 2000 | PSA 8 | Satılık | EgeHolo · İzmir | [PriceCharting · Grade 8 (PSA 8)](https://www.pricecharting.com/game/pokemon-base-set-2/charizard-4) | 735,00 $ | 24.11.2026 | 735,00 × 50,6026 = 37.193 ₺ | 37.000 ₺ | Pokémon TCG API |
| Pokémon | Umbreon VMAX – Alternatif Art 215/203 | Evolving Skies · 215/203 · 2021 | Ham · Near Mint | Satış + takas | BogazKart · İstanbul | [TCGplayer Market (Pokémon TCG API)](https://prices.pokemontcg.io/tcgplayer/swsh7-215) | 2.264,70 $ | 2026/10/15 | 2.264,70 × 50,6026 = 114.600 ₺ | 115.000 ₺ | Pokémon TCG API |
| Pokémon | Charizard ex – Special Illustration Rare 199/165 | Scarlet & Violet 151 · 199/165 · 2023 | PSA 10 | Satılık | BogazKart · İstanbul | [PriceCharting · PSA 10](https://www.pricecharting.com/game/pokemon-scarlet-&-violet-151/charizard-ex-199) | 1.150,00 $ | 24.11.2026 | 1.150,00 × 50,6026 = 58.193 ₺ | 58.000 ₺ | Pokémon TCG API |
| Pokémon | Lugia V – Alternatif Art 186/195 | Silver Tempest · 186/195 · 2022 | Ham · Mint | Takaslık | AkdenizTCG · Antalya | [TCGplayer Market (Pokémon TCG API)](https://prices.pokemontcg.io/tcgplayer/swsh12-186) | 488,36 $ | 2026/10/15 | 488,36 × 50,6026 = 24.712 ₺ | — (takas değeri 25.000 ₺) | Pokémon TCG API |
| Pokémon | Blastoise – Base Set 2 2/130 (Holo) | Base Set 2 · 2/130 · 2000 | Ham · Hafif oynanmış | Satılık | EgeHolo · İzmir | [TCGplayer Market (Pokémon TCG API)](https://prices.pokemontcg.io/tcgplayer/base4-2) | 170,64 $ | 2026/10/15 | 170,64 × 50,6026 × 0.85 = 7.340 ₺ | 7.250 ₺ | Pokémon TCG API |
| Magic | Sheoldred, the Apocalypse | Dominaria United (DMU) · #107 · 2022 | Ham · Near Mint | Satılık | AnkaraDeste · Ankara | [Scryfall prices.usd (TCGplayer)](https://scryfall.com/card/dmu/107/sheoldred-the-apocalypse) | 99,87 $ | 24.11.2026 | 99,87 × 50,6026 = 5.054 ₺ | 5.000 ₺ | Scryfall |
| Magic | The One Ring | The Lord of the Rings: Tales of Middle-earth (LTR) · #246 · 2023 | Ham · Near Mint | Satış + takas | AnkaraDeste · Ankara | [Scryfall prices.usd (TCGplayer)](https://scryfall.com/card/ltr/246/the-one-ring) | 105,49 $ | 24.11.2026 | 105,49 × 50,6026 = 5.338 ₺ | 5.250 ₺ | Scryfall |
| Magic | Ragavan, Nimble Pilferer | Modern Horizons 2 (MH2) · #138 · 2021 | Ham · Hafif oynanmış | Takaslık | EgeHolo · İzmir | [Scryfall prices.usd (TCGplayer)](https://scryfall.com/card/mh2/138/ragavan-nimble-pilferer) | 38,98 $ | 24.11.2026 | 38,98 × 50,6026 × 0.85 = 1.677 ₺ | — (takas değeri 1.750 ₺) | Scryfall |
| Magic | Jace, the Mind Sculptor | Worldwake (WWK) · #31 · 2010 | PSA 9 | Satılık | BogazKart · İstanbul | [PriceCharting · Grade 9 (PSA 9)](https://www.pricecharting.com/game/magic-worldwake/jace-the-mind-sculptor-31) | 132,00 $ | 24.11.2026 | 132,00 × 50,6026 = 6.680 ₺ | 6.750 ₺ | Scryfall |
| Magic | Lightning Bolt | Revised Edition (3ED) · #162 · 1994 | Ham · Oynanmış | Satılık | AkdenizTCG · Antalya | [Scryfall prices.usd (TCGplayer)](https://scryfall.com/card/3ed/162/lightning-bolt) | 2,73 $ | 24.11.2026 | 2,73 × 50,6026 × 0.65 = 90 ₺ | 100 ₺ | Scryfall |
| Yu-Gi-Oh! | Blue-Eyes White Dragon – LOB-001 Ultra Rare | Legend of Blue Eyes White Dragon · LOB-001 · 2002 · Unlimited | Ham · Hafif oynanmış | Satılık | AnkaraDeste · Ankara | [PriceCharting · Ungraded](https://www.pricecharting.com/game/yugioh-legend-of-blue-eyes-white-dragon/blue-eyes-white-dragon-lob-001) | 85,00 $ | 24.11.2026 | 85,00 × 50,6026 = 4.301 ₺ | 4.250 ₺ | yok |
| Yu-Gi-Oh! | Dark Magician Girl – MFC-000 Secret Rare | Magician's Force · MFC-000 · 2003 · Unlimited | PSA 9 | Satılık | BogazKart · İstanbul | [PriceCharting · Grade 9 (PSA 9)](https://www.pricecharting.com/game/yugioh-magician%27s-force/dark-magician-girl-mfc-000) | 593,41 $ | 24.11.2026 | 593,41 × 50,6026 = 30.028 ₺ | 30.000 ₺ | yok |
| Yu-Gi-Oh! | Exodia the Forbidden One – LOB-124 Ultra Rare | Legend of Blue Eyes White Dragon · LOB-124 · 2002 · Unlimited | BGS 9.5 | Satış + takas | AkdenizTCG · Antalya | [PriceCharting · Grade 9.5](https://www.pricecharting.com/game/yugioh-legend-of-blue-eyes-white-dragon/exodia-the-forbidden-one-lob-124) | 359,00 $ | 24.11.2026 | 359,00 × 50,6026 = 18.166 ₺ | 18.000 ₺ | yok |
| Yu-Gi-Oh! | Ash Blossom & Joyous Spring – MACR-EN036 Secret Rare | Maximum Crisis · MACR-EN036 · 2017 · 1. baskı | Ham · Near Mint | Takaslık | EgeHolo · İzmir | [PriceCharting · Ungraded (1st Edition)](https://www.pricecharting.com/game/yugioh-maximum-crisis/ash-blossom-&-joyous-spring-1st-edition-macr-en036) | 21,01 $ | 24.11.2026 | 21,01 × 50,6026 = 1.063 ₺ | — (takas değeri 1.000 ₺) | yok |
| One Piece | Monkey.D.Luffy – OP05-119 SEC Alternatif Art | Awakening of the New Era (OP-05) · OP05-119 · 2023 | Ham · Mint | Satılık | BogazKart · İstanbul | [TCGplayer Market (OPTCG API)](https://optcgapi.com/api/sets/card/OP05-119/) | 155,28 $ | 23.11.2026 | 155,28 × 50,6026 = 7.858 ₺ | 7.750 ₺ | yok |
| One Piece | Shanks – OP01-120 SEC Parallel | Romance Dawn (OP-01) · OP01-120 · 2022 | PSA 10 | Satış + takas | AnkaraDeste · Bursa | [PriceCharting · PSA 10](https://www.pricecharting.com/game/one-piece-romance-dawn/shanks-alternate-art-op01-120) | 183,00 $ | 24.11.2026 | 183,00 × 50,6026 = 9.260 ₺ | 9.250 ₺ | yok |
| One Piece | Yamato – OP01-121 SEC Parallel | Romance Dawn (OP-01) · OP01-121 · 2022 | Ham · Near Mint | Takaslık | EgeHolo · İzmir | [TCGplayer Market (OPTCG API)](https://optcgapi.com/api/sets/card/OP01-121/) | 107,47 $ | 23.11.2026 | 107,47 × 50,6026 = 5.438 ₺ | — (takas değeri 5.500 ₺) | yok |
| One Piece | Portgas.D.Ace – OP02-013 SR Parallel | Paramount War (OP-02) · OP02-013 · 2023 | CGC 9.5 | Satılık | AkdenizTCG · Antalya | [PriceCharting · Grade 9.5](https://www.pricecharting.com/game/one-piece-paramount-war/portgasdace-alternate-art-op02-013) | 101,77 $ | 24.11.2026 | 101,77 × 50,6026 = 5.150 ₺ | 5.250 ₺ | yok |

## Çapraz kontroller ve notlar

- Umbreon VMAX 215/203: TCGplayer Market 2.264,70 $ (15.10.2026) ile PriceCharting Ungraded 1.825,00 $ (24.11.2026) arasında ~%24 fark var; TCGplayer NM'ye özgü olduğu için o kullanıldı.
- Lugia V 186/195: TCGplayer 488,36 $ (15.10.2026), PriceCharting Ungraded 371,41 $.
- Charizard ve Blastoise için ilk tercih Base Set (1999; base1-4, base1-2) idi. Ancak Pokémon TCG API'nin bu iki kart için verdiği görseller *1st Edition* damgalı tarama; fiyat Unlimited baskıya göre olacağından görsel ile ilan uyuşmasın diye damgasız Base Set 2 (2000; base4-4, base4-2) baskısına geçildi (görseller kırpılarak kontrol edildi).
- Charizard Base Set 2 ham: TCGplayer 417,78 $, PriceCharting Ungraded 302,50 $; ilan PSA 8 olduğu için Grade 8 (735,00 $) kullanıldı.
- Pokémon TCG API fiyatları (TCGplayer) 15.10.2026 tarihli, yani ~40 günlük; API kullanımdan kaldırılıyor (Scrydex'e taşındı, anahtarlar 01.03.2027'ye kadar).
- YGOPRODeck `card_sets.set_price` (LOB-001 62,15 $, MFC-000 530,15 $, LOB-124 33,07 $) tarihsiz olduğu için yalnız kıyas amaçlı not edildi.
- One Piece fiyatları OPTCG API'den (TCGplayer market, `date_scraped` 23.11.2026).

## Görsel politikaları

| Oyun | Görsel | Gerekçe |
|---|---|---|
| Magic | Var (`cards.scryfall.io`) | Scryfall API belgesi görsellerin kullanımına izin veriyor; kurallar: telif/sanatçı satırı kırpılmaz, bozulmaz/bulanıklaştırılmaz/renk kaydırılmaz, filigran eklenmez. Uygulamada resmî görselin üstündeki holografik bindirme ve galeri bulanıklığı kapatıldı, `object-fit: contain`. *.scryfall.io için oran sınırı yok. https://scryfall.com/docs/api · https://scryfall.com/docs/api/rate-limits |
| Pokémon | Var (`images.pokemontcg.io`) | Pokémon TCG API (artık Scrydex) görsel URL'lerini döndürür; Scrydex belgesi "sağlanan kart görsellerini uygulamalarınıza ekleyebilirsiniz… doğrudan referans verebilirsiniz", yedek görsel ve hak sahibi atfı öneriyor. https://scrydex.com/docs/getting-started/best-practices#images · https://docs.pokemontcg.io/ |
| Yu-Gi-Oh! | Yok | YGOPRODeck: "Do not continually hotlink images… download and re-host"; depoya indirme bu işte yasak olduğundan görsel konmadı. https://ygoprodeck.com/api-guide/ |
| One Piece | Yok | OPTCG API'de görsel kullanım izni yok; resmî site: "All images, text and data on this website may not be reproduced without permission." https://optcgapi.com/ · https://en.onepiece-cardgame.com/ |
