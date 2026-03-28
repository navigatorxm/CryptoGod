# GitHub → VPS Auto-Deploy Setup

After every `git push` to `main`, GitHub Actions will SSH into your VPS and deploy automatically.

## 1. Add GitHub Secrets

Go to: https://github.com/navigatorxm/CryptoGod/settings/secrets/actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `VPS_HOST` | `51.195.109.250` |
| `VPS_PASSWORD` | `nosXS@2627x` |
| `NEXT_PUBLIC_ADMIN_WALLET` | `0x85D697bC39a61f25a4075eD834B82b4d2Cc41c40` |
| `NEXT_PUBLIC_ADMIN_WALLET_2` | `0x3724A3179657c0aD23Eb3Fb4F7e2F176f490280e` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | _(your WalletConnect ID)_ |

## 2. How it works

```
You save code in VSCode
       ↓
git commit + git push
       ↓
GitHub Actions runs CI (lint + typecheck + build)
       ↓  (on push to main)
Deploy job SSHs into 51.195.109.250
       ↓
git pull + yarn install + yarn build + pm2 restart
       ↓
https://xmone.xyz is updated ✓
```

## 3. VSCode Git push shortcut

In VSCode terminal:
```bash
git add -A && git commit -m "your message" && git push
```

Or use the VSCode Source Control panel (Ctrl+Shift+G) → Stage All → Commit → Sync.

## 4. Check deploy status

https://github.com/navigatorxm/CryptoGod/actions

Each push shows CI + Deploy results with logs.
