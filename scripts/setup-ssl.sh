#!/usr/bin/env bash
# ==============================================================================
# Instagram AI Bot SaaS — Automated SSL Certificate Setup (Let's Encrypt Certbot)
# ==============================================================================
set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Kullanım: sudo bash scripts/setup-ssl.sh <domain_adiniz> <email_adiniz>"
  echo "Örnek:   sudo bash scripts/setup-ssl.sh panel.orneksite.com admin@orneksite.com"
  exit 1
fi

echo "🔒 $DOMAIN için Let's Encrypt SSL sertifikası talep ediliyor..."

# Ensure certbot directories exist
mkdir -p certbot_etc certbot_var

# Request certificate using Docker Certbot
docker run -it --rm --name certbot \
  -v "$(pwd)/certbot_etc:/etc/letsencrypt" \
  -v "$(pwd)/certbot_var:/var/www/certbot" \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN"

echo "✓ SSL sertifikası başarıyla alındı!"
echo "Nginx servisi yeniden başlatılıyor..."
docker compose restart nginx

echo "✓ Kurulum tamamlandı! https://$DOMAIN adresinden güvenli olarak erişebilirsiniz."
