# Meta (Facebook) & Instagram Graph API Resmi Kurulum Kılavuzu

Bu belge, **Instagram AI Bot SaaS** platformunun Meta'nın güncel resmi standartlarına uygun olarak Meta Developers paneli üzerinden yapılandırılmasını adım adım açıklar.

---

## 1. Ön Gereksinimler

1. **Meta Developer Hesabı**: [developers.facebook.com](https://developers.facebook.com/) adresinden açılmış onaylı bir geliştirici hesabı.
2. **Instagram Profesyonel Hesabı**: Instagram uygulamasında profilinizin **İşletme (Business)** veya **İçerik Üretici (Creator)** hesabı olması gerekir. Kişisel hesaplar Meta API tarafından desteklenmez.
3. **Facebook Sayfası**: Instagram hesabınızın bağlı olduğu bir Facebook İşletme Sayfası. (Instagram uygulamasında *Ayarlar -> Hesap -> Sayfa Bağla* adımıyla eşleştirilmiş olmalıdır).

---

## 2. Meta Uygulaması (App) Oluşturma

1. [developers.facebook.com](https://developers.facebook.com/) adresine gidin ve **Uygulamalarım (My Apps)** -> **Uygulama Oluştur (Create App)** butonuna tıklayın.
2. Kullanım amacı olarak **Diğer (Other)** veya **İşletme (Business)** seçeneğini işaretleyin.
3. Uygulama türü olarak **İşletme (Business)** seçin.
4. Uygulama adı (Örn: `InstaAI Bot`) ve iletişim e-postanızı girip oluşturun.

---

## 3. Instagram Graph API Ürününü Ekleme

1. Uygulama Kontrol Panelinde (App Dashboard) sol menüdeki **Ürün Ekle (Add Product)** seçeneğine tıklayın.
2. **Instagram Graph API** ve **Facebook Girişi (Facebook Login for Business)** ürünlerini **Kur (Set Up)** butonu ile uygulamanıza ekleyin.

---

## 4. OAuth ve Yönlendirme URL'si (Redirect URI) Yapılandırması

1. Sol menüden **Facebook Girişi (Facebook Login)** -> **Ayarlar (Settings)** sekmesini açın.
2. **İstemci OAuth Ayarları (Client OAuth Settings)** altında:
   - **Web OAuth Girişi**: `Evet`
   - **Geçerli OAuth Yönlendirme URI'leri (Valid OAuth Redirect URIs)**:
     - Yerel geliştirme için: `http://localhost:4000/api/integrations/instagram/callback`
     - Canlı sunucu için: `https://api.domaininiz.com/api/integrations/instagram/callback`
3. Değişiklikleri kaydedin.

---

## 5. Webhook Yapılandırması (Canlı Mesaj Alımı)

1. Sol menüden **Instagram Graph API** -> **Webhooks** veya doğrudan **Webhooks** menüsüne gidin.
2. Nesne türü olarak **Instagram** seçin.
3. **Abonelik Düzenle (Edit Subscription)** butonuna tıklayın:
   - **Geri Çağırma URL'si (Callback URL)**:
     - Yerel test için: ngrok / cloudflare tunnel URL'niz (`https://xxx.ngrok-free.app/webhooks/instagram`)
     - Canlı sunucu için: `https://api.domaininiz.com/webhooks/instagram`
   - **Belirteci Doğrula (Verify Token)**: `.env` dosyanızdaki `META_WEBHOOK_VERIFY_TOKEN` değeri (Örn: `custom_random_secure_verify_token_here`).
4. **Doğrula ve Kaydet (Verify and Save)** butonuna tıklayın. Backend otomatik olarak challenge'ı onaylayacaktır.
5. Abonelik Alanları (Subscription Fields) listesinden şu izinleri aktif edin:
   - `messages` (Kullanıcı DM mesajları)
   - `messaging_postbacks` (Hızlı yanıt butonları)
   - `messaging_optins`
   - `message_deliveries`
   - `message_reads`

---

## 6. Gerekli Meta İzinleri (Permissions & Scopes)

SaaS platformunun sorunsuz çalışması için OAuth sırasında talep edilen resmi izinler:

| İzin Adı | Açıklama | Kullanım Amacı |
|---|---|---|
| `instagram_basic` | Instagram temel profil bilgileri | Kullanıcı adı, profil fotoğrafı ve hesap ID keşfi |
| `instagram_manage_messages` | Instagram DM mesaj yönetimi | Gelen mesajları okuma, yapay zeka ile otomatik yanıtlama |
| `pages_show_list` | Yönetilen Facebook sayfaları listesi | Instagram hesabına bağlı sayfayı otomatik tespit etme |
| `pages_read_engagement` | Sayfa etkileşimlerini okuma | Webhook ve sayfa durumu takibi |
| `pages_manage_metadata` | Sayfa metadatasını yönetme | Sayfayı webhook aboneliğine (`subscribed_apps`) bağlama |

---

## 7. Geliştirme (Development) vs Canlı (Live) Mod

- **Geliştirme Modu (Development Mode)**:
  - Yalnızca Meta panelinde **Roller (Roles)** bölümünde ekli olan yöneticiler, geliştiriciler ve test kullanıcıları giriş yapıp hesap bağlayabilir.
  - Test için kendi hesabınızı uygulamanın Rollerine eklemeniz yeterlidir.
- **Canlı Mod (Live Mode / App Review)**:
  - Dışarıdan herhangi bir kullanıcının panelinize gelip kendi Instagram hesabını bağlayabilmesi için uygulamanızı **App Review (Uygulama İncelemesi)** sürecine göndermeniz ve `instagram_manage_messages` izni için **Gelişmiş Erişim (Advanced Access)** almanız gerekir.
  - İncelemede bir ekran kaydı (video) ile kullanıcının hesabı bağlayıp AI yanıtı aldığını göstermeniz talep edilir.
