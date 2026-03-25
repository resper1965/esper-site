---
description: Deployment command for production releases. Pre-flight checks and deployment execution.
---

# /deploy - Production Deployment (Cloudflare Workers)

$ARGUMENTS

---

## Sub-commands

```
/deploy            - Interactive deployment wizard
/deploy check      - Run pre-deployment checks only
/deploy preview    - Build & run locally with wrangler dev
/deploy production - Deploy to production (Cloudflare Workers)
/deploy rollback   - Rollback via Cloudflare Dashboard
```

---

## Pre-Deployment Checklist

// turbo-all

Before any deployment, run these checks:

### 1. TypeScript Check
```bash
npx tsc --noEmit
```

### 2. Dependency Audit
```bash
npm audit
```

### 3. Secrets Check
```bash
grep -rn "sk-\|AKIA\|ghp_\|password\s*=" src/ --include="*.ts" --include="*.tsx" | grep -v "process.env\|\.env"
```

### 4. Build Test (OpenNext)
```bash
npm run build:cf
```

If all pass, proceed to deploy.

---

## Deploy Commands

### Preview (local Cloudflare emulation)
```bash
npm run preview:cf
```

### Production Deploy (via Wrangler CLI)
```bash
npm run deploy
```
This runs `npx opennextjs-cloudflare && wrangler deploy`.

### Production Deploy (via Git — preferred)
```bash
git add -A && git commit -m "feat: description" && git push origin main
```
Cloudflare Pages auto-deploys from `main` branch when connected via Dashboard.

---

## Environment Variables

Set in **Cloudflare Dashboard → Workers & Pages → esper-site → Settings → Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Auth token signing (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://esper.ws` |
| `ANTHROPIC_API_KEY` | ⚠️ | For AI content generation |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ⚠️ | Gemini API |
| `SUPABASE_URL` | ⚠️ | Database connection |
| `SUPABASE_ANON_KEY` | ⚠️ | Supabase auth |
| `CLOUDFLARE_AI_GATEWAY_ID` | ⚠️ | AI Gateway routing |

---

## Post-Deploy Verification

### Health Check
```bash
curl -s -o /dev/null -w "%{http_code}" https://esper.ws
```
Expected: `200`

### Smoke Test (browser)
1. Open https://esper.ws
2. Check blog loads with posts
3. Check `/sobre` page renders
4. Check `/servicos` page renders
5. Verify language switching (pt/en)

---

## Rollback

Via Cloudflare Dashboard:
1. Go to **Workers & Pages → esper-site → Deployments**
2. Find previous working deployment
3. Click **Rollback to this deployment**

Via CLI (redeploy previous commit):
```bash
git revert HEAD && git push origin main
```

---

## Architecture

```
┌──────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  git push    │────►│  Cloudflare Pages   │────►│  OpenNext       │
│  origin/main │     │  (auto-build)       │     │  Worker         │
└──────────────┘     │  npm run build:cf   │     │  (edge runtime) │
                     └─────────────────────┘     └─────────────────┘
```
