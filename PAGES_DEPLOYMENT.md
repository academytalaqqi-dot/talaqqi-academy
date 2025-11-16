# Cloudflare Pages Configuration
# This file is used for Cloudflare Pages deployment

## Build and Deploy Settings

The project uses:
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Framework**: Next.js 15 with App Router

## Environment Variables (Cloudflare Dashboard)

Add these in **Pages → Settings → Environment variables**:

### Production Environment
```
DATABASE_URL = file:./dev.db (local) or D1 when available
NEXTAUTH_SECRET = your-secret-here-change-this
NEXTAUTH_URL = https://yourdomain.com
NODE_ENV = production
```

### Preview/Development Environment
```
DATABASE_URL = file:./dev.db
NEXTAUTH_SECRET = dev-secret
NEXTAUTH_URL = http://localhost:3000
NODE_ENV = development
```

## Deployment Steps

1. Connect GitHub repository to Cloudflare Pages
2. Select this repository
3. Build command: `npm run build`
4. Build output: `.next`
5. Framework: Next.js
6. Add environment variables in dashboard
7. Deploy

## GitHub Integration

Once connected, every push to `main` branch will trigger automatic deployment.

To configure:
1. Go to Cloudflare Dashboard → Pages
2. Click "Connect to Git"
3. Authorize and select `talaqqi_academy` repository
4. Configure build settings as above
5. Deploy!
