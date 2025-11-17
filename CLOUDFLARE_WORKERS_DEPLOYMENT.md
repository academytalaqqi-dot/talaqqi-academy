# 🌩️ Deploy Talaqqi Academy ke Cloudflare Workers

Cloudflare Workers adalah solusi **PERFECT** untuk full-stack Next.js apps! No size limit, unlimited scale. ✅

## 🎯 Keuntungan Cloudflare Workers:

| Fitur | Status |
|-------|--------|
| **Size Limit** | ✅ UNLIMITED |
| **Database** | ✅ D1 SQLite (sudah setup) |
| **Cost** | ✅ $0.50/million requests |
| **Latency** | ⚡ Global CDN |
| **Auto-scaling** | ✅ Unlimited concurrent |
| **Support Node.js** | ✅ Full Node.js runtime |

---

## 🚀 STEP-BY-STEP DEPLOYMENT:

### Step 1: Login ke Cloudflare

```bash
wrangler login
# Akan open browser untuk OAuth
# Approve dan kembali ke terminal
```

### Step 2: Deploy ke Cloudflare Workers

```bash
# Method A: Direct deploy
wrangler deploy

# Method B: Preview dulu
wrangler dev --local

# Method C: Push ke production
wrangler deploy --env production
```

### Step 3: Verify Live Deployment

```bash
# Check deployment status
wrangler deployments list

# Your app will be live at:
# https://talaqqi-academy.YOUR_ACCOUNT.workers.dev
```

---

## 📋 Configuration

### `wrangler.toml` (Already configured)

```toml
name = "talaqqi-academy"
type = "javascript"
compatibility_date = "2025-11-16"
main = ".next/standalone/server.js"

# D1 Database binding (sudah setup)
[[d1_databases]]
binding = "DB"
database_name = "talaqqi-academy-db"
database_id = "ed56f499-4d58-46be-9756-6682c35de216"

[build]
command = "npm run build"
```

### Environment Variables

Set di Cloudflare Dashboard atau via CLI:

```bash
wrangler secret put DATABASE_URL
# Input: file:./dev.db

wrangler secret put NEXTAUTH_SECRET
# Input: ZlHBE6Es95TXzi7vP9eFQ8o5JUHG94SYbJQBIPFfKw0=

wrangler secret put NEXTAUTH_URL
# Input: https://talaqqi-academy.YOUR_ACCOUNT.workers.dev
```

---

## 🎓 Key Differences: Workers vs Pages

| Aspek | Workers | Pages |
|-------|---------|-------|
| **Build output** | Serve full app | Static only |
| **Runtime** | Node.js full | Limited |
| **Size** | ✅ Unlimited | ❌ 25MB file limit |
| **Database** | ✅ D1 support | ✅ D1 support |
| **API routes** | ✅ Full support | ⚠️ Limited |
| **Startup** | ~100ms | ~50ms |

---

## 🔧 Local Development

```bash
# Run locally with Wrangler
npm run dev

# Or manually
wrangler dev --local

# Access: http://localhost:8787
```

---

## 📊 Pricing

| Usage | Cost |
|-------|------|
| First 100k requests/day | ✅ FREE |
| Additional requests | $0.50 per million |
| D1 Database | ✅ Included |
| R2 Storage (optional) | $0.015/GB |

**Estimate untuk Talaqqi Academy:**
- ~1k requests/day (event registrations, admin dashboard) = ✅ FREE tier
- Atau ~$2-5/month jika high traffic

---

## ⚠️ Troubleshooting

### Error: "Cannot find module 'wrangler'"
```bash
npm install wrangler --save-dev --legacy-peer-deps
```

### Error: "D1 database not found"
```bash
# Check database ID
wrangler d1 list

# Should see: talaqqi-academy-db (ed56f499...)
```

### Error: "Static files not loading"
- Make sure `public/` folder copied to `.next/standalone/`
- Check: `.next/standalone/public/` exists

### Slow startup?
- First request ~1-2s (cold start)
- Subsequent requests <100ms
- Normal for serverless

---

## 🎯 Next Steps

1. **Deploy:**
   ```bash
   wrangler deploy --env production
   ```

2. **Get your live URL:**
   ```bash
   https://talaqqi-academy.[account-id].workers.dev
   ```

3. **Test endpoints:**
   - Landing: https://talaqqi-academy.[account-id].workers.dev
   - Admin login: https://talaqqi-academy.[account-id].workers.dev/admin/login
   - Dashboard: https://talaqqi-academy.[account-id].workers.dev/admin/dashboard

4. **Add custom domain (optional):**
   - Go to Cloudflare Dashboard
   - Add your domain
   - Point DNS to Cloudflare Workers

---

## 🚨 Important Notes

- **Database persistence:** SQLite via D1 = data persisted ✅
- **File uploads:** Store in `/public/uploads/` = stays in deployed app ✅
- **Static assets:** Automatically served from `.next/standalone/static/` ✅
- **API routes:** All Next.js API routes work on Workers ✅

---

## 📞 Support

- Cloudflare docs: https://developers.cloudflare.com/workers/
- Next.js on Cloudflare: https://developers.cloudflare.com/workers/frameworks/nextjs/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/install-and-update/

---

**Ready to deploy?** 🚀

```bash
wrangler deploy --env production
```

Your Talaqqi Academy akan live dalam 30-60 detik!

