# 🚀 Langkah Selanjutnya untuk Deploy ke Cloudflare Pages

## ✅ Sudah Selesai:
- ✅ Install Wrangler CLI
- ✅ Login ke Cloudflare (akun baru)
- ✅ Create D1 Database (ID: `ed56f499-4d58-46be-9756-6682c35de216`)
- ✅ Create `wrangler.toml` dengan D1 binding
- ✅ Create `.env.production`
- ✅ Commit semua file deployment

## 🔄 Langkah Berikutnya:

### 1️⃣ Setup GitHub Repository

Jika belum punya GitHub repository:

```bash
# A. Buat repository baru di https://github.com/new
# B. Pilih nama: talaqqi_academy (atau nama lain)
# C. JANGAN initialize dengan README (karena project sudah ada)

# D. Di terminal, add remote:
git remote add origin https://github.com/YOURUSERNAME/talaqqi_academy.git

# E. Push ke main branch:
git branch -M main
git push -u origin main
```

**PENTING:** Ganti `YOURUSERNAME` dengan username GitHub Anda!

### 2️⃣ Connect ke Cloudflare Pages

1. Go to **https://dash.cloudflare.com** → **Pages**
2. Click **"Connect to Git"**
3. Authorize GitHub
4. Select repository: `talaqqi_academy`
5. Click **"Connect"**
6. Configure build settings:
   - **Framework**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Node.js version**: 18.x atau 20.x

7. Add environment variables:
   - `DATABASE_URL` = `file:./dev.db`
   - `NEXTAUTH_SECRET` = (generate random value)
   - `NEXTAUTH_URL` = `https://yourdomain.cloudflareapages.com`
   - `NODE_ENV` = `production`

8. Click **"Save and Deploy"**

### 3️⃣ Wait for Build

- Build akan mulai otomatis
- Check status di Cloudflare Pages dashboard
- Tunggu ~2-5 menit

### 4️⃣ Test Aplikasi

- Akses URL yang diberikan Cloudflare (format: `https://xxxx.pages.dev`)
- Test fitur:
  - ✅ Landing page
  - ✅ Admin login
  - ✅ Create events
  - ✅ Upload gambar

### 5️⃣ Setup Custom Domain (Optional)

1. Di Cloudflare Pages → Project Settings
2. Go to **Custom domains**
3. Add domain Anda
4. Configure DNS records sesuai petunjuk

---

## 📝 GitHub Push Instructions

```bash
# Setup if not done yet:
git remote add origin https://github.com/YOURUSERNAME/talaqqi_academy.git
git branch -M main

# Push code:
git push -u origin main

# Future pushes:
git push origin main
```

**Automatic Deployments:**
- Setiap kali push ke `main` branch → Cloudflare Pages otomatis deploy
- Build status bisa dilihat di Pages dashboard

---

## 🆘 Troubleshooting

### Build Error: "Cannot find module '@prisma/client'"
- Solution: `npm install` sudah termasuk di Cloudflare build process
- Jika masih error: tambahkan ke environment variables
  - `npm_config_production=false`

### Database Error: "ENOENT: no such file or directory, open 'dev.db'"
- Normal di first deploy
- Database file akan dibuat otomatis
- Check kalau sudah dapat write permission

### Gambar tidak tampil setelah deploy
- Images stored di `/public/uploads/` tetap work
- URL akan: `https://yourdomain.cloudflareapages.com/uploads/filename.jpg`

---

## 🎯 Summary

| Step | Status | Action |
|------|--------|--------|
| Wrangler setup | ✅ Done | - |
| D1 Database | ✅ Done | Database ID: `ed56f499-4d58-46be-9756-6682c35de216` |
| Config files | ✅ Done | `wrangler.toml`, `.env.production` |
| GitHub push | ⏳ Pending | Setup remote + push |
| Cloudflare Pages | ⏳ Pending | Connect GitHub + deploy |

---

**Next: Push ke GitHub dan connect ke Cloudflare Pages!** 🚀
