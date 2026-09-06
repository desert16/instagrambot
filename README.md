# 🚀 Instagram AI Bot SaaS — Master Production Platform

[![Meta Graph API v21.0](https://img.shields.io/badge/Meta_Graph_API-v21.0-blue.svg)](https://developers.facebook.com/docs/instagram-platform/)
[![Google Gemini AI](https://img.shields.io/badge/AI_Engine-Gemini_1.5_Flash_%26_Live_v2-purple.svg)](https://ai.google.dev/)
[![Docker & Debian Ready](https://img.shields.io/badge/Deployment-Debian_11%2F12_Automated-green.svg)](#)
[![TypeScript Monorepo](https://img.shields.io/badge/Architecture-TypeScript_Strict_Monorepo-indigo.svg)](#)

Instagram AI Bot SaaS; kurumsal işletmeler ve e-ticaret markaları için tasarlanmış, **Meta resmi Graph API (v21.0+)** standartlarına tam uyumlu, çok kiracılı (multi-tenant), yüksek güvenlikli ve otonom bir yapay zeka müşteri hizmetleri platformudur.

---

## 🌟 Öne Çıkan Temel Özellikler

- **Tek Tıkla Sıfır Teknik Bilgi Entegrasyonu**: Kullanıcıdan token, secret, ID veya webhook URL'si gibi teknik parametreler istenmez. Kullanıcı "Instagram Hesabı Bağla" butonuna basar, Meta'nın resmi ekranından yetki verir; sistem hesabı, profil bilgilerini ve mesajlaşma yeteneklerini otomatik keşfeder.
- **Resmi Meta Graph API (v21.0+)**: Sürüm kod içinde asla hardcode edilmez, merkezi `MetaApiClient` üzerinden yönetilir. Webhook imza doğrulaması (HMAC-SHA256) ve AES-256-GCM token şifreleme içerir.
- **Google Gemini & Gemini Live API (v2 Ready)**: Google Gemini 1.5 Flash/Pro ile hızlı ve düşük maliyetli yanıtlar üretir. v2 sürümü için çift yönlü WebSocket tabanlı gerçek zamanlı sesli DM ve multimodal etkileşim altyapısı bugünden hazırdır.
- **3 Kolonlu Canlı Gelen Kutusu (Omnichannel Inbox)**: Yerleşik WebSocket ağ geçidi ile anlık müşteri mesajlaşması, temsilciye aktarma (Human Handoff), iç notlar ve etiketleme sistemi.
- **Halüsinasyonsuz Kurumsal Bilgi Bankası (FAQ)**: Kargo, iade ve fiyat belgelerini sisteme yükleyin; AI doğrulanmamış bilgi uydurmaz, şüphede kaldığında temsilciye devreder.
- **Görsel Otomasyon Motoru & Canlı Simülatör (Dry-Run)**: Mesajlara göre otomatik etiketleme, önceliklendirme ve temsilci atama kuralları belirleyin; mesaj göndermeden simüle edin.
- **Debian Sunucu Tek Tuşla Kurulum (`scripts/deploy-debian.sh`)**: Debian 11/12 sunucularda Docker, Nginx, Let's Encrypt SSL, PostgreSQL ve Redis servislerini otomatik kurup ayağa kaldıran script.

---

## 🏛️ Monorepo Mimarisi

```
instagrambot/
├── apps/
│   ├── web/                     # Next.js 15 App Router, Tailwind CSS, Lucide, TanStack Query
│   └── api/                     # NestJS Core, WebSocket Gateway, BullMQ Workers, Swagger
├── packages/
│   ├── database/                # Prisma ORM Schema, Postgres Client, Seed Script
│   ├── meta/                    # Centralized MetaApiClient, OAuth, Messaging, Webhook, Encryption
│   ├── ai/                      # AI Engine, Gemini Provider, OpenAI Fallback, Gemini Live v2
│   ├── types/                   # Paylaşılan TypeScript arayüzleri ve domain sözleşmeleri
│   └── config/                  # Zod doğrulamalı merkezi ortam değişkenleri yöneticisi
├── infra/
│   ├── docker/                  # Dockerfile.api, Dockerfile.web, docker-compose.yml
│   └── nginx/                   # Nginx reverse proxy, SSL, WebSocket, Webhook optimize konfigürasyon
├── scripts/
│   ├── deploy-debian.sh         # Debian sunucu otomatik kurulum ve başlatma scripti
│   └── backup-db.sh             # PostgreSQL otomatik yedekleme scripti (7 gün saklama)
└── docs/
    ├── META_SETUP_GUIDE.md      # Meta App & Instagram API resmi adım adım kurulum kılavuzu
    └── TROUBLESHOOTING.md       # Sorun giderme ve hata kodları rehberi
```

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|---|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, TanStack Query | Modern, reaktif ve hızlı SaaS arayüzü |
| **Backend** | Node.js, NestJS, TypeScript, WebSocket (ws) | Modüler, ölçeklenebilir ve güvenli kurumsal mimari |
| **Veritabanı** | PostgreSQL 16 + Prisma ORM | Multi-tenant ilişkisel veri modeli ve migration yönetimi |
| **Arka Plan & Kuyruk**| Redis 7 + BullMQ | Webhook tamponlama, debouncing, dağıtık kilitler (locks) |
| **Yapay Zeka** | Google Gemini 1.5, Gemini Live v2, OpenAI | Akıllı yanıtlar, niyet analizi, prompt injection koruması |
| **Entegrasyon** | Meta Graph API (v21.0) | Resmi OAuth 2.0, Instagram Send API, Webhooks |
| **Altyapı & Proxy** | Docker Compose, Nginx, Let's Encrypt SSL | Üretime hazır, izole konteyner mimarisi |

---

## 🚀 Debian 11/12 Sunucuda Otomatik Kurulum

Debian sunucunuzda terminali açıp tek bir komutla tüm sistemi kurabilirsiniz:

```bash
# 1. Projeyi klonlayın
git clone https://github.com/desert16/instagrambot.git
cd instagrambot

# 2. Otomatik kurulum scriptini çalıştırın
sudo bash scripts/deploy-debian.sh
```

Bu script sırasıyla:
1. Docker Engine, Docker Compose, Git, UFW Güvenlik Duvarı ve fail2ban paketlerini kurar.
2. 22 (SSH), 80 (HTTP) ve 443 (HTTPS) portlarını güvenli şekilde açar.
3. `.env` dosyasını oluşturur ve ortam değişkenlerini hazırlar.
4. Docker Compose ile PostgreSQL, Redis, NestJS API, Next.js Web ve Nginx servislerini ayağa kaldırır.
5. Veritabanı tablolarını otomatik oluşturur ve varsayılan yönetici hesabını tohumlar.
6. Sağlık kontrollerini (`/health`) doğrulayarak sistemi yayına alır.

---

## 💻 Yerel Geliştirme (Local Development)

```bash
# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini hazırlayın
cp .env.example .env

# Veritabanı Prisma şemasını oluşturun
npm run db:generate

# Docker ile Postgres & Redis ayağa kaldırın
docker compose up -d postgres redis

# Veritabanını güncelleyin ve seed verilerini yükleyin
npm run db:push
npm run db:seed

# Hem API hem Web arayüzünü eşzamanlı başlatın
npm run dev
```

- **Web Dashboard**: `http://localhost:3000`
- **API Sunucusu**: `http://localhost:4000`
- **Swagger / OpenAPI**: `http://localhost:4000/docs`
- **WebSocket**: `ws://localhost:4000/ws`
- **Meta Webhook**: `http://localhost:4000/webhooks/instagram`

---

## 🔒 Güvenlik Denetimi Matrisi (Security Audit)

| Soru | Durum | Alınan Önlem |
|---|:---:|---|
| Kullanıcı access token girmek zorunda mı? | ❌ HAYIR | Resmi Meta OAuth akışıyla otomatik keşfedilir. |
| Instagram şifresi isteniyor / saklanıyor mu? | ❌ HAYIR | Asla şifre istenmez, saklanmaz ve loglanmaz. |
| Token frontend'e veya loglara sızıyor mu? | ❌ HAYIR | Tokenlar yalnızca backend'de AES-256-GCM ile şifrelenir. |
| OAuth State güvenli ve tek kullanımlık mı? | ✅ EVET | Redis üzerinde 10 dk TTL ile tek kullanımlık imha edilir. |
| Multi-tenant çalışma alanı izolasyonu var mı? | ✅ EVET | NestJS WorkspaceGuard ile IDOR/BOLA engellenir. |
| Webhook Replay saldırısı ve mükerrer kayıt koruması var mı? | ✅ EVET | HMAC-SHA256 imza denetimi + hash tabanlı idempotency. |
| Meta API sürümü merkezi mi? | ✅ EVET | `META_GRAPH_API_VERSION` üzerinden tek noktadan yönetilir. |
| Prompt Injection koruması var mı? | ✅ EVET | Kullanıcı DM'leri sistem talimatı olarak yorumlanmaz. |

---

## 📚 Dokümantasyon Linkleri

- [Meta & Instagram Graph API Resmi Kurulum Kılavuzu](docs/META_SETUP_GUIDE.md)
- [Sorun Giderme (Troubleshooting) Rehberi](docs/TROUBLESHOOTING.md)
- [Resmi Meta Instagram Platformu Dokümantasyonu](https://developers.facebook.com/docs/instagram-platform/)
- [Google Gemini API Dokümantasyonu](https://ai.google.dev/gemini-api/docs)
