#!/bin/bash
# =============================================================
# CryptoGod VPS Setup — Ubuntu 22.04
# Run as root: bash setup-vps.sh
# =============================================================
set -e

APP_DIR="/var/www/cryptogod"
APP_USER="cryptogod"
DOMAIN=""        # set this: e.g. "cryptogod.yourdomain.com"
PORT="3000"
NODE_VERSION="20"

echo "=== CryptoGod VPS Setup ==="

# ── System dependencies ────────────────────────────────────────
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# ── Node.js ───────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "Installing Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
echo "Node: $(node --version)  npm: $(npm --version)"

# ── PM2 ───────────────────────────────────────────────────────
npm install -g pm2 2>/dev/null
pm2 startup systemd -u $APP_USER --hp /home/$APP_USER 2>/dev/null || true

# ── App user ──────────────────────────────────────────────────
if ! id "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$APP_USER"
fi

# ── App directory ─────────────────────────────────────────────
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# ── Firewall ──────────────────────────────────────────────────
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# ── Nginx config ──────────────────────────────────────────────
cat > /etc/nginx/sites-available/cryptogod <<NGINX
server {
    listen 80;
    server_name ${DOMAIN:-_};

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Next.js
    location / {
        proxy_pass         http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Cache Next.js static assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:$PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/cryptogod /etc/nginx/sites-enabled/cryptogod
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── SSL (only if domain is set) ───────────────────────────────
if [ -n "$DOMAIN" ]; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || \
    echo "SSL setup failed — run: certbot --nginx -d $DOMAIN"
fi

echo ""
echo "=== Setup complete! ==="
echo "1. Copy your project to: $APP_DIR"
echo "2. Create .env.local with your API keys"
echo "3. Run: cd $APP_DIR && npm ci && npm run build"
echo "4. Start: pm2 start ecosystem.config.js && pm2 save"
echo ""
[ -n "$DOMAIN" ] && echo "Dashboard: https://$DOMAIN" || echo "Dashboard: http://$(curl -s ifconfig.me)"
