#!/usr/bin/env python3
"""
Remote deployment script — runs full VPS setup over SSH using Fabric.
"""
from fabric import Connection
import sys

HOST     = '68.183.92.81'
USER     = 'root'
PASSWORD = 'nosXS@2627x'
APP_DIR  = '/var/www/cryptogod'
REPO     = 'https://github.com/navigatorxm/CryptoGod.git'
PORT_APP = 3000

ENV_LOCAL = """NEXT_PUBLIC_APP_NAME=CryptoGod Dashboard
NEXT_PUBLIC_APP_URL=http://68.183.92.81
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
NEXT_PUBLIC_ETHEREUM_TESTNET_RPC=https://rpc.sepolia.org
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
NEXT_PUBLIC_POLYGON_TESTNET_RPC=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_AVALANCHE_RPC=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_OPTIMISM_RPC=https://mainnet.optimism.io
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_DEVNET_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_ENABLE_MAINNET=true
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_DEMO_MODE=false
"""

NGINX_CONF = """server {
    listen 80;
    server_name 68.183.92.81 _;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
"""

PM2_CONFIG = """module.exports = {
  apps: [{
    name: 'cryptogod',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/cryptogod',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production', PORT: 3000 },
    error_file: '/var/log/pm2/cryptogod-error.log',
    out_file:   '/var/log/pm2/cryptogod-out.log',
    merge_logs: true,
  }],
};
"""

def run(c, cmd, **kwargs):
    print(f'$ {cmd[:80]}{"..." if len(cmd)>80 else ""}')
    return c.run(cmd, warn=True, **kwargs)

def step(msg):
    print(f'\n{"="*60}\n  {msg}\n{"="*60}')

conn = Connection(host=HOST, user=USER, connect_kwargs={'password': PASSWORD},
                  connect_timeout=15)

try:
    step('1/7  Connecting to server')
    result = run(conn, 'lsb_release -d && uname -m && free -h | head -2')
    if result.failed:
        print('Connection failed'); sys.exit(1)

    step('2/7  Installing system packages')
    run(conn, 'apt-get update -y -qq')
    run(conn, 'apt-get install -y -qq curl git nginx ufw')

    step('3/7  Installing Node.js 20')
    run(conn, 'command -v node || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)')
    run(conn, 'node --version && npm --version')
    run(conn, 'npm install -g pm2 --silent')

    step('4/7  Cloning / updating repo')
    run(conn, f'mkdir -p {APP_DIR}')
    result = run(conn, f'[ -d {APP_DIR}/.git ] && echo exists')
    if 'exists' in (result.stdout or ''):
        run(conn, f'cd {APP_DIR} && git pull origin main')
    else:
        run(conn, f'git clone {REPO} {APP_DIR}')

    step('5/7  Writing .env.local')
    env_escaped = ENV_LOCAL.replace("'", "'\\''")
    conn.run(f"cat > {APP_DIR}/.env.local << 'ENVEOF'\n{ENV_LOCAL}\nENVEOF")

    step('6/7  Building app (this takes ~2 min)')
    run(conn, f'cd {APP_DIR} && npm ci --silent')
    build = run(conn, f'cd {APP_DIR} && npm run build')
    if build.failed:
        print('Build failed — check output above'); sys.exit(1)

    # Write PM2 config
    conn.run(f"cat > {APP_DIR}/ecosystem.config.js << 'PMEOF'\n{PM2_CONFIG}\nPMEOF")

    step('7/7  Starting with PM2 + Nginx')
    run(conn, 'pm2 delete cryptogod 2>/dev/null || true')
    run(conn, f'cd {APP_DIR} && pm2 start ecosystem.config.js && pm2 save')
    run(conn, 'pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash 2>/dev/null || true')

    # Nginx
    conn.run(f"cat > /etc/nginx/sites-available/cryptogod << 'NGEOF'\n{NGINX_CONF}\nNGEOF")
    run(conn, 'ln -sf /etc/nginx/sites-available/cryptogod /etc/nginx/sites-enabled/cryptogod')
    run(conn, 'rm -f /etc/nginx/sites-enabled/default')
    run(conn, 'nginx -t && systemctl reload nginx')

    # Firewall
    run(conn, 'ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable')

    print('\n' + '='*60)
    print('  DEPLOYMENT COMPLETE!')
    print(f'  Dashboard: http://68.183.92.81')
    print(f'  PM2 status: pm2 status')
    print(f'  Logs: pm2 logs cryptogod')
    print('='*60)

except Exception as e:
    print(f'\nError: {e}')
    sys.exit(1)
finally:
    conn.close()
