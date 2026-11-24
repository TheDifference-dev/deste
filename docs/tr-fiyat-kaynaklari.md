# Türk kart mağazaları — TL fiyat kaynakları

Okuma tarihi: **24.11.2026**. Veri: `data/tr-fiyatlar.json` (6 mağaza, 93 tek kart, 47 kapalı ürün).

Etiketler: **ÖLÇTÜM** = sayfayı kendim okudum / ham HTML ile doğruladım · **KAYNAK SÖYLÜYOR** = sitenin kendi metni ya da üçüncü taraf bilgisi, ayrıca doğrulanmadı · **TAHMİN** = çıkarım.

## Yöntem

- Alan adları web aramasıyla bulundu (kaynaklar aşağıda). Her sitede önce `robots.txt` ve kullanım koşulları / sözleşme sayfası okundu.
- Yalnız herkese açık kategori ve ürün sayfaları okundu: WebFetch ve tek tek `curl` istekleri (istekler arasında 2–4 sn). Sitemap yalnız Kutugo'da ürün olup olmadığını görmek için okundu. Toplu tarama yapılmadı, görsel indirilmedi, sepete/hesaba/API'ye dokunulmadı.
- Shopify JSON uç noktası (`/products.json`) denemesi izin sisteminde reddedildi; onun yerine yalnız HTML sayfaları kullanıldı.
- **Önemli (ÖLÇTÜM):** WebFetch özeti bir kez yanlış ürünün fiyatını verdi (D20 Pitch Black ürün sayfası için 787,50 TL dedi; ham HTML'de 890,00 TL ve "Stokta" yazıyor; özet "ilgili ürünler" bloğundan okumuş). Bu yüzden kritik fiyatlar ham HTML / JSON-LD ile kontrol edildi: D20 Blazing Dominion booster 336 TL (liste 375), Card House Charizard TG03 2.999 TL, Card House Luffy OP10-118 2.199 TL. Hepsi kayıtla aynı.
- Fiyatlar sayfada görüldüğü gibi yazıldı; indirim varsa indirimli fiyat `fiyatTL`, liste fiyatı ürün adında parantez içinde. Kargo yok.
- Tek kart kayıtlarına şemaya ek olarak `okumaTarihi` alanı kondu (görev bunu istiyor).

## Mağazalar

| Mağaza | Alan adı (nasıl doğrulandı) | robots.txt | Koşullar | Pokémon | Yu-Gi-Oh! | Magic | One Piece |
|---|---|---|---|---|---|---|---|
| Goblin Oyun Kulübü (Kadıköy) | goblin-store.com — Riftbound resmî mağaza bulucusu kaydında site ve e-posta alan adı | Her şey serbest | Md. 7: içerik yazılı izinsiz kullanılamaz/çoğaltılamaz; bot/fiyat maddesi yok | Kapalı | Kapalı | Kapalı | Kategori boş |
| D20 Masaüstü Oyun Kulübü | d20tabletopgames.com — "d20masaustu" alan adı bulunamadı; arama sonucu + Instagram @d20tabletopgames | Yalnız wp-admin, add-to-cart, log klasörleri yasak | Kullanım koşulları sayfası yok (sitemap'te yalnız mağaza/sepet/ödeme/hesap/iletişim) | Kapalı | Kapalı | Kapalı | Kapalı |
| Kutugo | kutugo.com — arama sonucu | /admin, /api, /hesabim, /odeme, /sepet vb. yasak | Mesafeli satış sözleşmesi; kopyalama/bot maddesi yok | Yok | Yok | Yok | Yok |
| Da Vinci Board Game (Ankara) | kutuoyunual.com — linktr.ee/davinciboardgame'deki "Online Satış Sitemiz" bağlantısı; davinciboardgame.com yalnız kafe sitesi | Shopify; herkese açık sayfalar serbest | Shopify şartları; md. 9.14 yalnız spam/virüs vb. | Kapalı (13 ürün, hepsi Tükendi) | Menüde yok | Menüde yok | Menüde yok |
| Card House (ek) | cardhouse.com.tr — web araması | /admin, /cart, /checkout, /account, /_next/data yasak | Kullanıcı Sözleşmesi md. 5.2: telif ihlali yaratan kopyalama yasak; bot/fiyat maddesi yok | **Tek kart** + kapalı + graded | **Tek kart** + kapalı + graded | **Tek kart** + kapalı | **Tek kart** + kapalı |
| Kanka Card (ek aday) | kankacard.com — web araması | Shopify; serbest | **Okunamadı** | Tek kart (menü) | Menüde yok | Kapalı (menü) | Tek kart (menü) |

Ayrıntılar:

- **Goblin (ÖLÇTÜM):** Pokémon 18, Yu-Gi-Oh! 19, Magic 46 ürün listelendi; hepsi kapalı ürün. Tek kart alt kategorisi yok (Pokémon: Özel Ürünler, Booster Pack, Battle Deck, Checklane Blister, 3 Booster Blister, Theme Deck). One Piece kategorisi ve alt kategorileri "Henüz ürün yok". Liste kartında stok yazmıyor; ürün sayfasında "Stokta" var. Filtre sayıları (ör. Pokémon Booster Pack 41) gösterilen ürün sayısından büyük; liste büyük olasılıkla yalnız stoktakileri gösteriyor (TAHMİN). Koşullar içerik kopyalamayı yazılı izne bağladığı için Goblin fiyatları bu belgeden ve sitedeki veriden çıkarıldı.
- **D20 (ÖLÇTÜM):** Pokémon 50, Yu-Gi-Oh! 98, Magic 240, One Piece 9 ürün (sayfa sayaçları). Hiçbir markada tek kart alt kategorisi yok; Yu-Gi-Oh! alt kategorileri Booster Box/Booster Pack/Special Box/Special Edition/Structure Deck/Figür. One Piece'te Japonca booster/box da var. Ürünlerin çoğu indirimde.
- **Kutugo (ÖLÇTÜM):** Kategoriler yalnız Kutu Oyunları, RPG, Kitap & Dergi. `sitemap.xml`'deki 455 URL'de Pokémon/Yu-Gi-Oh!/Magic/One Piece/TCG/booster geçmiyor ("kart" geçenler kutu oyunları: Yüzük Kardeşliği Kart Oyunu vb.). `?q=pokemon` araması yalnız kutu oyunu döndürdü (157 ürünün tamamı gibi; arama parametresi sunucuda uygulanmıyor olabilir — TAHMİN).
- **Da Vinci / Kutu Oyunu Al (ÖLÇTÜM):** Menüde TCG olarak yalnız "Pokemon TCG" ve "Riftbound". Pokémon koleksiyonundaki 13 ürünün hepsi "Tükendi"; fiyatlar "İndirimli fiyat" etiketli ama eski fiyat görünmüyor. Site araması JavaScript ile yüklendiğinden Yu-Gi-Oh!/Magic/One Piece aramaları sonuç göstermedi; bu yüzden o markaların hiç olmadığı kesin değil, yalnız menüde koleksiyonları yok. robots.txt'de yapay zekâ ajanlarına yönelik alışveriş/kurulum yönergeleri var; görevle ilgisiz olduğu için uygulanmadı.
- **Card House (ÖLÇTÜM):** Ankara, Etiler, Göktürk, Suadiye şubeleri ve merkez depo (lokasyon filtresi). Tek kart sayfalarında nadirlik, set/numara, kondisyon (NM/LP/MP/HP), stok adedi ("Son 1 adet") ve fiyat görünüyor. Sayaçlar: Pokémon single 26.797, tüm Pokémon 28.250, Magic single (İngilizce) 4.476. Tek kart kategori adresleri: Pokémon `/single-kartlar`, Magic `/single-kartlar-1`, Yu-Gi-Oh! `/single-kartlar-3`, One Piece `/single-kartlar-7`.
- **Kanka Card (KAYNAK SÖYLÜYOR):** Ana sayfa menüsünde Pokémon (set bazlı: Ascended Heroes, Phantasmal Flames, 151, Perfect Order, Prismatic Evolutions, Destined Rivals, Mega Dream ex) ve One Piece (İngilizce/Japonca) single koleksiyonları, graded kartlar ve Magic kapalı ürün var. Koşullar sayfaları (`/pages/term-of-service`, `/policies/terms-of-service`) için WebFetch izin onayı zamanında yanıtlanmadı; araç yeniden denememeyi istedi, ürün sayfaları da okunmadı. **Fiyat kaydı yok.**

## Toplanan kayıtlar

| Mağaza | Tek kart | Kapalı ürün |
|---|---|---|
| Goblin | 0 | 14 (Pokémon 5, Yu-Gi-Oh! 4, Magic 5) |
| D20 | 0 | 19 (Pokémon 5, Yu-Gi-Oh! 5, Magic 5, One Piece 4) |
| Kutugo | 0 | 0 |
| Da Vinci | 0 | 3 (Pokémon, hepsi tükendi) |
| Card House | 93 (Pokémon 40, Magic 20, One Piece 18, Yu-Gi-Oh! 15) | 11 (Pokémon 3, Yu-Gi-Oh! 4, Magic 2, One Piece 2) |
| Kanka Card | 0 | 0 |

Card House tek kart notları:

- **Sayfalama sorunu (ÖLÇTÜM):** Sunucu `?page=2` gibi parametreleri yok sayıyor; her sayfa aynı ilk 20 kartı döndürüyor (sayfalama tarayıcıda yapılıyor). Bu yüzden marka başına 40'a yalnız Pokémon'da ulaşıldı (single, /pokemon, İngilizce ve Japonca single sayfaları birleştirildi). Magic 20, One Piece 18 (single + /one-piece), Yu-Gi-Oh! 15.
- Kayıtlar site varsayılan sıralamasının ilk sayfasından; rastgele örnek değil. Magic örneği neredeyse tamamen Final Fantasy / TMNT setleri, Pokémon örneğinde Japonca kartlar ağırlıkta.
- **Yu-Gi-Oh!:** Single sayfasındaki 20 kartın hepsi "Tükendi" ve ekranda fiyat yok. 10'unun fiyatı sayfa kaynağındaki JSON-LD'den alındı (`stok` alanında belirtildi); diğer 10'unun fiyatı hiçbir yerde olmadığı için yazılmadı. Stokta olan 5 Yu-Gi-Oh! tek kartın hepsi PSA 10 Japonca kart (/yu-gi-oh- sayfası).
- **Kondisyon:** Bazı kartlarda birden çok kondisyon seçeneği var (ör. Deoxys-EX NM/LP, Odin NM/MP); fiyat varsayılan seçeneğin fiyatı. Üç Yu-Gi-Oh! kartının adında "Lightly Played" yazarken kondisyon etiketi NM; ikisi de `durum` alanına yazıldı.
- Set/numara, kart üzerindeki "numara · set · dönem" satırından ayrıştırıldı. Bazı One Piece ve Yu-Gi-Oh! kartlarında site numara vermiyor; boş bırakıldı. One Piece "29th Anniversary Meat Luffy Promo Card" SEALED (kapalı promo) olarak işaretli.

## Kıyas: aynı ürün, farklı mağaza (ÖLÇTÜM)

| Ürün | D20 | Card House |
|---|---|---|
| Yu-Gi-Oh! Blazing Dominion booster | 336 TL (liste 375) | 349,99 TL |
| Yu-Gi-Oh! Blazing Dominion booster box | 8.064 TL (liste 9.000) | 7.999 TL |
| Yu-Gi-Oh! Chronicles Deck: Spirit Charmers | 1.680 TL (liste 1.865) | — |
| Pokémon Pitch Black booster | 890 TL | — |
| Pokémon 30th Celebration Elite Trainer Box | 19.950 TL (liste 21.000) | — |
| Pokémon Miraidon ex League Battle Deck | 4.200 TL (liste 4.500) | Da Vinci: 2.499 TL (tükendi) |

Booster fiyatları (ÖLÇTÜM, Goblin hariç; tekli booster, kutu/blister/collector hariç): Pokémon 300–990 TL, Yu-Gi-Oh! 336–400 TL, Magic 514–830 TL, One Piece 795–1.090 TL.

## Örnek tek kart fiyatları (Card House, ÖLÇTÜM)

| Kart | Set · no | Durum | Fiyat | Stok |
|---|---|---|---|---|
| Charizard (Trainer Gallery) | Lost Origin Trainer Gallery · TG03 | NM | 2.999 TL | Son 1 adet |
| Pikachu ex | 30th Celebration · 150/128 | NM | 4.999 TL | Son 1 adet |
| Lightning Bolt (Through the Ages foil) | Final Fantasy: Through the Ages · 40 | NM | 261,99 TL | Son 1 adet |
| Monkey.D.Luffy (Alternate Art) | Royal Blood · OP10-118 | NM | 2.199 TL | Son 1 adet |
| Dark Magician Girl (Japonca) | Saikyo Battle Royale · JP002 | PSA 10 | 14.499 TL | Son 1 adet |

## Sorunlar ve sınırlar

- ÖLÇTÜM: Brief'teki dört mağazanın (Goblin, D20, Kutugo, Da Vinci) hiçbiri tek kart satmıyor; tek kart verisi yalnız ek mağaza Card House'tan geliyor.
- ÖLÇTÜM: WebFetch özetleri yanlış ürün fiyatı verebiliyor; önemli fiyatlar ham HTML ile kontrol edildi, ama Goblin ve D20 kapalı ürün listelerinin çoğu yalnız WebFetch özetinden alındı (kontrol edilen 4 fiyat doğru çıktı).
- ÖLÇTÜM: Card House sayfalaması sunucuda çalışmadığından örnekler her kategorinin ilk sayfasıyla sınırlı.
- ÖLÇTÜM: Da Vinci'de Yu-Gi-Oh!/Magic/One Piece yokluğu yalnız menüye dayanıyor; arama JS gerektirdiği için doğrulanamadı.
- KAYNAK SÖYLÜYOR: Kanka Card'ın tek kart sattığı yalnız ana sayfa menüsünden biliniyor; fiyat okunmadı (izin onayı yanıtsız).
- TAHMİN: Goblin kategori listeleri yalnız stoktaki ürünleri gösteriyor olabilir (filtre sayıları daha büyük).
- Not: `docs/fiyat-kaynaklari.md` "TL fiyatlı, tarihli bir Türk satış sayfası bulunamadı" diyor; Card House bu boşluğu kısmen dolduruyor. O dosyaya dokunulmadı.

## Arama kaynakları

- Goblin alan adı: https://locator.riftbound.uvsgames.com/stores/01c3f800-a85c-4be1-ba51-c25a71f23b80
- D20: https://d20tabletopgames.com/magaza/ · https://www.instagram.com/d20tabletopgames/
- Kutugo: https://kutugo.com/
- Da Vinci: https://linktr.ee/davinciboardgame → https://www.kutuoyunual.com
- Card House: https://cardhouse.com.tr/single-kartlar-1 · Kanka Card: https://kankacard.com/collections/pokemon-single-kartlar
