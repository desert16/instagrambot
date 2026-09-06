#!/usr/bin/env bash
# ==============================================================================
# Instagram AI Bot SaaS — Automated Debian 11/12 Server Deployment Script
# ==============================================================================
set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}🚀 Instagram AI Bot SaaS — Debian Sunucu Otomatik Kurulumu${NC}"
echo -e "${BLUE}================================================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Lütfen bu scripti root veya sudo yetkisi ile çalıştırın: sudo bash scripts/deploy-debian.sh${NC}"
  exit 1
fi

echo -e "\n${YELLOW}[1/7] Sistem paketleri güncelleniyor ve bağımlılıklar kuruluyor...${NC}"
apt-get update -y
apt-get install -y curl git ufw fail2ban ca-certificates gnupg lsb-release

echo -e "\n${YELLOW}[2/7] Docker ve Docker Compose Engine kontrol ediliyor...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${BLUE}Docker bulunamadı, resmi Docker deposu eklenerek kuruluyor...${NC}"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo -e "${GREEN}✓ Docker başarıyla kuruldu!${NC}"
else
  echo -e "${GREEN}✓ Docker zaten kurulu.${NC}"
fi

echo -e "\n${YELLOW}[3/7] Güvenlik Duvarı (UFW) yapılandırılıyor...${NC}"
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true
echo -e "${GREEN}✓ Portlar (22, 80, 443) aktif edildi.${NC}"

echo -e "\n${YELLOW}[4/7] Ortam değişkenleri (.env) kontrol ediliyor...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️ .env dosyası .env.example üzerinden oluşturuldu.${NC}"
    echo -e "${YELLOW}Lütfen Meta App ID, Secret ve AI API anahtarlarınızı .env içine girmeyi unutmayın!${NC}"
  else
    echo -e "${RED}❌ .env.example bulunamadı!${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✓ .env dosyası mevcut.${NC}"
fi

echo -e "\n${YELLOW}[5/7] Docker servisleri derleniyor ve başlatılıyor...${NC}"
docker compose down || true
docker compose up -d --build

echo -e "\n${YELLOW}[6/7] Veritabanı tabloları oluşturuluyor ve tohumlanıyor...${NC}"
echo -e "${BLUE}PostgreSQL servisinin hazır olması bekleniyor (15 saniye)...${NC}"
sleep 15

# Run Prisma schema push or migrations inside the API container
echo -e "${BLUE}Prisma şeması uygulanıyor...${NC}"
docker compose exec -T api npx prisma db push --schema=packages/database/prisma/schema.prisma || true

# Seed default admin user and sample data
echo -e "${BLUE}Seed çalıştırılıyor...${NC}"
docker compose exec -T api node packages/database/src/seed.js || true

echo -e "\n${YELLOW}[7/7] Servis Sağlık Durumu Kontrol Ediliyor...${NC}"
sleep 5
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health || true)

if [ "$HEALTH_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ Tüm servisler başarıyla ayağa kalktı ve API sağlıklı (HTTP 200)!${NC}"
else
  echo -e "${YELLOW}⚠️ API henüz yanıt vermedi veya başlatılıyor (HTTP $HEALTH_STATUS). Docker loglarını kontrol edebilirsiniz: docker compose logs -f api${NC}"
fi

echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}🎉 KURULUM TAMAMLANDI!${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Web Dashboard:   http://SUNUCU_IP_ADRESINIZ (veya domaininiz)"
echo -e "API Endpoint:    http://SUNUCU_IP_ADRESINIZ:4000"
echo -e "Meta Webhook:    http://SUNUCU_IP_ADRESINIZ/webhooks/instagram"
echo -e "Swagger Docs:    http://SUNUCU_IP_ADRESINIZ:4000/docs"
echo -e "WebSocket URL:   ws://SUNUCU_IP_ADRESINIZ/ws"
echo -e "\nKomutlar:"
echo -e "  Logları izle:    docker compose logs -f"
echo -e "  Durdur:          docker compose down"
echo -e "  Yeniden başlat:  docker compose restart"
echo -e "${BLUE}================================================================${NC}"
