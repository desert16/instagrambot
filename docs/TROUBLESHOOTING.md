# Sorun Giderme (Troubleshooting) Rehberi

Bu belge, Instagram AI Bot SaaS sisteminin kurulumu ve işletimi sırasında karşılaşılabilecek olası durumları ve çözüm adımlarını içerir.

---

### 1. "OAuth state geçersiz, süresi dolmuş veya daha önce kullanılmış"
- **Neden**: Redis bağlantısı kesilmiş olabilir veya kullanıcı Meta giriş ekranında 10 dakikadan (TTL süresi) fazla beklemiştir. State CSRF koruması gereği tek kullanımlıktır.
- **Çözüm**: Paneli yenileyin ve "Instagram Hesabı Bağla" butonuna tekrar basarak akışı baştan başlatın. `docker compose ps redis` ile Redis servisinin çalıştığını doğrulayın.

---

### 2. "Yetkilendirilen sayfaya bağlı hiçbir Instagram Profesyonel hesabı bulunamadı"
- **Neden**: Meta kullanıcının kişisel bir Instagram hesabı bağlamaya çalıştığını veya Instagram hesabının bir Facebook sayfasına bağlı olmadığını tespit etmiştir.
- **Çözüm**:
  1. Instagram mobil uygulamasında *Ayarlar -> Hesap Türü -> Profesyonel Hesaba Geç (İşletme/İçerik Üretici)* adımlarını izleyin.
  2. Facebook sayfanızın Ayarlar -> Bağlı Hesaplar kısmında Instagram hesabınızın onaylı olduğunu doğrulayın.

---

### 3. "Geçersiz webhook imzası (401)"
- **Neden**: Meta'nın gönderdiği `X-Hub-Signature-256` değeri ile sunucudaki `META_APP_SECRET` eşleşmiyor.
- **Çözüm**: `.env` dosyasındaki `META_APP_SECRET` değerinin Meta Developer paneli -> Ayarlar -> Temel -> Uygulama Kodu ile birebir aynı olduğundan emin olun.

---

### 4. "Instagram API 24 saatlik yanıt penceresi kapandı (subcode: 2018001)"
- **Neden**: Meta'nın katı mesajlaşma politikası gereği, son gelen müşteri mesajının üzerinden 24 saat geçtikten sonra kullanıcıya standart API ile mesaj gönderilemez.
- **Çözüm**: Bu durum Meta API'nin resmi kuralıdır. Müşteri tekrar yeni bir mesaj gönderdiğinde 24 saatlik pencere sıfırlanır ve AI/temsilci anında yanıt verebilir.

---

### 5. "AI Yanıtı Üretilmiyor veya Boş Dönüyor"
- **Neden**: `GEMINI_API_KEY` eksik veya geçersiz olabilir; ya da AI Bot Asistanı ayarlarında "AI Bot Otonom Yanıtı" kapalıdır.
- **Çözüm**:
  1. `.env` dosyasındaki `GEMINI_API_KEY` anahtarınızı kontrol edin.
  2. Panelde `/ai` sayfasına giderek Instagram hesabınız için botun açık olduğunu doğrulayın.
  3. Konuşmanın insan temsilciye devredilip devredilmediğini (Handoff) kontrol edin.
