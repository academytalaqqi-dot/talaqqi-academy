# Deployment Talaqqi Academy ke Cloudflare

## 📍 Storage Saat Ini (Development)

### Database
- **Lokasi**: `dev.db` (SQLite file)
- **Path**: `/Users/40005-c02h83z3q05d/Documents/Source/Github/talaqqi_academy/talaqqi_academy/dev.db`
- **Konfigurasi**: `DATABASE_URL="file:./dev.db"` (di `.env`)
- **Tipe**: File-based SQLite (hanya untuk development)

### Gambar/File Upload
- **Lokasi**: `/public/uploads/` directory
- **Example files**:
  - `1763232289912-Logo-Talaqqi-Academy.jpg`
  - `1763299572485-ORDER-TEKUN-LOGO-2048x2048.png`
  - `1763299744078-Logo-Talaqqi-Academy.jpg`
  - dst...
- **Pola Naming**: `{timestamp}-{originalFilename}`

---

## 🚀 Deployment ke Cloudflare (Recommended)

### Opsi 1: Database di Cloudflare D1 + Gambar di R2 ✅ RECOMMENDED

**Keuntungan:**
- ✅ Database terintegrasi penuh dengan Cloudflare
- ✅ Performance tinggi (edge computing)
- ✅ Automatic backup dan redundancy
- ✅ Mudah scale
- ✅ Gratis untuk tier dasar

**Biaya Estimasi:**
- D1: Gratis sampai 5GB, $0.25 per GB setelahnya
- R2: $0.015 per GB stored
- Workers Pages: Gratis sampai 500 requests/day

---

## 📋 Setup Step-by-Step

### A. Persiapan Awal

```bash
# 1. Install Wrangler CLI (Cloudflare tool)
npm install -g wrangler

# 2. Login ke Cloudflare
wrangler login

# 3. Create wrangler.toml di root project
```

### B. Setup Database (D1)

#### 1. Create D1 Database

```bash
wrangler d1 create talaqqi-academy-db
```

**Output contoh:**
```
✓ Successfully created the D1 database 'talaqqi-academy-db'
Database ID: xxxxx-xxxxx-xxxxx
Binding name: DB
```

#### 2. Update `wrangler.toml`

```toml
name = "talaqqi-academy"
main = "src/index.ts"
compatibility_date = "2025-11-16"

[env.production]
vars = { ENVIRONMENT = "production" }

[[d1_databases]]
binding = "DB"
database_name = "talaqqi-academy-db"
database_id = "xxxxx-xxxxx-xxxxx"  # Dari output di atas
```

#### 3. Migrate Schema ke D1

```bash
# Push Prisma schema ke D1
wrangler d1 execute talaqqi-academy-db --file=./prisma/migrations/[latest]/migration.sql
```

#### 4. Update Connection String

**`.env.production`:**
```
DATABASE_URL="d1://db"
```

### C. Setup Object Storage (R2)

#### 1. Create R2 Bucket

```bash
wrangler r2 bucket create talaqqi-academy-uploads
```

#### 2. Update `wrangler.toml`

```toml
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "talaqqi-academy-uploads"
```

#### 3. API Route untuk Upload ke R2

**File: `src/app/api/upload/route.ts`** (update)

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validasi file
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPEG, PNG, GIF, or WebP' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const buffer = await file.arrayBuffer();

    // Upload ke R2 (via Cloudflare binding)
    const env = process.env as any;
    await env.UPLOADS.put(filename, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return public URL (setup di Cloudflare)
    const publicUrl = `https://uploads.yourdomain.com/${filename}`;
    
    return NextResponse.json({
      url: publicUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

#### 4. Setup R2 Public Domain (di Cloudflare Dashboard)

1. Go to **R2 → buckets → talaqqi-academy-uploads**
2. Click **Settings**
3. **CORS** - Allow your domain
4. **Public access** - Enable custom domain
5. Point to subdomain: `uploads.yourdomain.com`

---

## 🔧 Prisma Adapter untuk D1

### Install Prisma D1 Adapter

```bash
npm install @prisma/adapter-d1
```

### Update `src/lib/db.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Production: Use D1 adapter
  const env = process.env as any;
  const adapter = new PrismaD1(env.DB);
  db = new PrismaClient({ adapter });
} else {
  // Development: Use file-based SQLite
  db = new PrismaClient({
    log: ['query'],
  });
}

export { db };
```

---

## 🌍 Deploy ke Cloudflare Pages

### 1. Setup GitHub Integration

```bash
# 1. Push ke GitHub
git add .
git commit -m "Setup Cloudflare deployment"
git push origin main

# 2. Di Cloudflare Dashboard:
# - Go to Pages
# - Connect to GitHub
# - Select talaqqi_academy repository
# - Build command: npm run build
# - Build output: .next/static
```

### 2. Environment Variables (Cloudflare Dashboard)

Di **Pages → Settings → Environment variables**, tambahkan:

```
DATABASE_URL=d1://db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

### 3. Build Configuration

**`wrangler.toml` (lengkap):**

```toml
name = "talaqqi-academy"
main = "src/index.ts"
compatibility_date = "2025-11-16"
pages_build_output_dir = ".next/static"

[env.production]
vars = { ENVIRONMENT = "production" }

# Database D1
[[d1_databases]]
binding = "DB"
database_name = "talaqqi-academy-db"
database_id = "your-db-id"

# File Storage R2
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "talaqqi-academy-uploads"

# KV Store (optional untuk session/cache)
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-id"
```

---

## 📦 Migrasi Data Existing

### Migrate Database dari SQLite ke D1

```bash
# 1. Export data dari dev.db
npx prisma db push --skip-generate

# 2. Seed data ke D1 (production)
npm run db:seed
```

### Migrate Gambar ke R2

```bash
# 1. Upload semua file dari /public/uploads/
# Script di bawah

#!/bin/bash
for file in public/uploads/*; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    wrangler r2 object put talaqqi-academy-uploads --file="$file" "$filename"
  fi
done

# 2. Update referensi logoUrl di database
# Ubah dari: /uploads/filename.jpg
# Menjadi: https://uploads.yourdomain.com/filename.jpg
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
```
# .env.production (jangan di-commit!)
DATABASE_URL=d1://db
NEXTAUTH_SECRET=use-strong-random-value
R2_BUCKET_NAME=talaqqi-academy-uploads
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=xxxx
R2_SECRET_ACCESS_KEY=xxxx
```

### 2. CORS Policy (R2)

**`wrangler.toml`:**
```toml
[r2.buckets.talaqqi-academy-uploads]
cors = [
  {
    allowed_origins = ["https://yourdomain.com"],
    allowed_methods = ["GET", "PUT", "POST"],
    allowed_headers = ["*"],
    max_age_seconds = 3600
  }
]
```

### 3. File Validation

Sudah ada di `src/app/api/upload/route.ts`:
- ✅ File type validation (JPEG, PNG, GIF, WebP only)
- ✅ File size limit (5MB)
- ✅ Timestamp + filename untuk unique ID

---

## 📊 Struktur Biaya Cloudflare (Estimated)

| Service | Free Tier | Paid | Notes |
|---------|-----------|------|-------|
| **D1 Database** | Gratis (10GB) | $0.25/GB | SQLite managed |
| **R2 Storage** | Gratis (10GB) | $0.015/GB | Object storage |
| **Pages** | 500 requests/day | $20/month | Web hosting |
| **Workers** | 100K requests/day | $0.50/million | Serverless compute |

**Total Estimasi (Monthly):**
- Development: **$0** (free tier cukup)
- Production (1000 events, 10K uploads, 100K requests): **$5-15/month**

---

## ✅ Checklist Deployment

- [ ] Create D1 database di Cloudflare
- [ ] Create R2 bucket di Cloudflare
- [ ] Update `wrangler.toml` dengan IDs
- [ ] Install `@prisma/adapter-d1`
- [ ] Update `src/lib/db.ts` untuk D1 adapter
- [ ] Update `src/app/api/upload/route.ts` untuk R2
- [ ] Setup R2 public domain (`uploads.yourdomain.com`)
- [ ] Migrate existing data (SQLite → D1, local files → R2)
- [ ] Test upload & download di production
- [ ] Setup GitHub integration di Pages
- [ ] Configure environment variables
- [ ] Deploy to Cloudflare Pages

---

## 📞 Support & Resources

- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Prisma D1 Adapter**: https://www.prisma.io/docs/orm/prisma-client/deployment/edge/cloudflare-d1
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/

---

## 🎯 Alternative Options

### Opsi 2: Database di Railway/Vercel + Gambar di R2
- Database: PostgreSQL managed (Railway/Vercel)
- Gambar: R2 Cloudflare
- Pages: Vercel

### Opsi 3: Database di MongoDB Atlas + Gambar di S3
- Database: MongoDB (managed)
- Gambar: AWS S3 atau DigitalOcean Spaces
- Pages: Vercel/Netlify

**Rekomendasi:** Opsi 1 (Cloudflare D1 + R2) untuk **cost-effective** dan **terintegrasi sempurna**.

