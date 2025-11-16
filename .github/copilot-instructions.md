# Talaqqi Academy - AI Coding Agent Instructions

## Project Overview

**Talaqqi Academy** is a Next.js-based event registration platform for Islamic educational events. It provides admin dashboard for event management, participant registration tracking, and voucher validation. The app uses SQLite with Prisma ORM and Next.js 15 App Router.

### Core Entities & Data Flow

```
Events (admin creates) → Pendaftaran (users register) → Status Validation (admin approves)
        ↓
   Multiple Participation Tiers (e.g., Gratis, Regular, VIP)
   - Each tier: nama, harga, linkGrupWa (WhatsApp group)
        ↓
   Approved registrations → WhatsApp notification sent to participant
```

**Key Insight**: JSON fields store complex data (arrays/objects). Always parse/stringify them: `JSON.parse(event.jenisKepesertaan)` in code, store as `JSON.stringify(data)` in DB.

## Architecture Patterns

### API Route Pattern
- **Location**: `src/app/api/[resource]/route.ts`
- **Pattern**: GET/POST in main route, PATCH/DELETE in `[id]/route.ts`
- **Error Handling**: Wrap in try/catch, return `NextResponse.json()` with status codes
- **Example**: `POST /api/events` creates event, `PATCH /api/events/[id]` updates it

### Database Query Pattern
- **Import**: `import { db } from '@/lib/db'` (Prisma singleton)
- **JSON fields**: Stored as strings, must parse on read: `JSON.parse(event.pemateri || '[]')`
- **Relations**: Use `include: { event: true }` for related data
- **Stats**: Use `_count` aggregation: `_count: { select: { pendaftaran: true } }`
- **Example**: See `src/app/api/events/route.ts` for full pattern

### Component Form Pattern
- **State Management**: useState for form data and nested arrays
- **Validations**: Use Zod or React Hook Form (neither heavily used yet)
- **Rendering Nested Data**: Parse JSON, render badges/lists, provide add/edit/remove UI
- **Dialog Pattern**: Use `Dialog` from shadcn/ui with `open` and `onOpenChange` props
- **Example**: `EventFormDialog` manages complex tier, speaker, and question inputs

## Project-Specific Conventions

### Naming & Structure
- **Events**: Indonesian field names (`kodeEvent`, `namaEvent`, `pemateri`, `tema`)
- **IDs**: Use Prisma CUID (`@default(cuid())`)
- **Statuses**: Exact string values (e.g., "Pendaftaran", "Berjalan", "Selesai", "Approved", "Rejected")
- **File paths**: Use `@/*` alias (configured in `tsconfig.json`) instead of relative imports

### Complex JSON Fields in DB
- **`jenisKepesertaan`**: Array of `{ nama, harga, linkGrupWa, benefit[] }`
- **`pemateri`**: Array of speaker names/objects
- **`waktuEvent`**: Array of `{ hari, tanggal, jam }`
- **`benefit`**: Array of benefit strings
- **`pertanyaanTambahan`**: Array of `{ pertanyaan, tipeJawaban, opsiPilihan[] }`
- **Always**: Parse on read, stringify on write, validate structure before saving

### Authentication Pattern
- **Method**: Token stored in `localStorage` with key `adminToken`
- **Check**: See `src/app/admin/dashboard/page.tsx` line ~40: `checkAuth()` redirects to login if no token
- **Not Built**: Full NextAuth integration exists but not actively used; login route at `src/app/api/admin/login/route.ts`

### WhatsApp Integration
- **Trigger**: When registration approved and tier has `linkGrupWa`
- **Method**: Open in new tab: `window.open('https://wa.me/[number]?text=[message]', '_blank')`
- **Flow**: Parse tier to get WA link, open with pre-filled message (see dashboard line ~115)

### Image Upload Pattern
- **Endpoint**: `POST /api/upload` (exists but minimal implementation)
- **Storage**: `/public/uploads/` directory
- **Validation**: File type (JPEG, PNG, GIF, WebP) and size (5MB max)
- **Pattern**: Used in `EventFormDialog` for flyer images and `ReferensiForm` for logos

### Referensi (Organization Info) Management
- **Component**: `src/components/admin/referensi-form.tsx` - Manages organization contact details, banking info, and social media
- **Model**: Single `Referensi` record per instance (findFirst pattern in API)
- **Fields**: Bank account, WhatsApp admin number, logo upload, social media links (Instagram, Telegram, Facebook, Threads, YouTube, WhatsApp Channel)
- **API**: `GET /api/referensi` (retrieves current referensi or empty object), `POST /api/referensi` (creates or updates single record)
- **UI Pattern**: 3-section form (Informasi Lembaga, Informasi Rekening, Media Sosial & Kontak) with visual section dividers

## Developer Workflows

### Start Development
```bash
npm install
npm run db:push  # Push Prisma schema
npm run dev      # Starts on port 3000 with hot reload (nodemon watches src/*)
```

### Database Operations
```bash
npm run db:migrate   # Create new migration
npm run db:generate  # Generate Prisma Client types
npm run db:reset     # Reset database (dev only)
npm run db:push      # Push schema without migration file
```

### Build & Production
```bash
npm run build        # Build & copy standalone output
npm run start        # Run production server (logs to server.log)
npm run lint         # Run ESLint
```

### Debugging
- Check `dev.log` for development server output
- Check `server.log` for production server output
- Logs in API routes: `console.error()` appears in terminal and logs
- Database logs enabled in `db.ts`: logs all queries in dev mode

## Integration Points & Dependencies

### External Services
- **NextAuth.js**: Configured but not active in main flow (prepared for auth)
- **WhatsApp**: Integration via direct URL generation (not API)
- **Prisma Studio**: `npx prisma studio` for visual DB browsing

### Key Directories
- **`src/app/admin/`**: Protected admin panel (manual token auth)
- **`src/app/api/`**: All CRUD endpoints (events, registrations, vouchers, referensi)
- **`src/components/admin/`**: Form dialogs and admin-specific components
- **`src/components/ui/`**: shadcn/ui library (don't modify directly)
- **`prisma/`**: Schema, migrations, seed data

### Important Files
- **`prisma/schema.prisma`**: Source of truth for data model
- **`src/lib/types.ts`**: TypeScript interfaces (may be out of sync with schema—update both)
- **`src/lib/db.ts`**: Prisma singleton, no modifications needed
- **`src/app/admin/dashboard/page.tsx`**: Main admin interface, hub of feature interactions

## Common Tasks & Code Locations

| Task | Location | Pattern |
|------|----------|---------|
| Add new event field | `schema.prisma` + `types.ts` + API route | Add to schema, update types, handle JSON stringify/parse |
| Add form field | `EventFormDialog` + API payload | Add state, input UI, add to submission payload |
| Fix JSON parsing | API route or component | Check `JSON.parse(field \|\| '[]')` pattern |
| Add API endpoint | `src/app/api/[resource]/route.ts` | Follow GET/POST/PATCH/DELETE pattern in `events/route.ts` |
| Create new page | `src/app/[path]/page.tsx` | Must be marked `'use client'` for interactivity |
| Update admin UI | `src/app/admin/dashboard/page.tsx` | Check stats calculation and state management patterns |
| Manage organization info | `ReferensiForm` component | Edit bank details, social media, logo; single-record pattern via API |

## Type Safety Notes

- **Breaking Change Alert**: Recent migration (v1.0.0-beta) changed `jenisKepesertaan` from string to array—all existing code must handle array of tier objects
- **Type File**: `src/lib/types.ts` defines interfaces but may lag behind schema—verify both match
- **Interface Examples**: `ParticipationType`, `EventData`, `PendaftaranData` in `types.ts`
- **Validation**: Use TypeScript strict mode; ESLint catches undefined field access

## Best Practices for This Codebase

1. **Always parse JSON fields**: `const parsed = JSON.parse(field || '[]'); // never assume it's a string`
2. **Check for nulls**: Indonesian labels suggest optional fields—use `|| null` or `|| undefined`
3. **Use `@/` imports**: Never use relative paths (`../../..`)
4. **Validate before saving**: Check array structure and required fields before `JSON.stringify()`
5. **Follow status literals**: Use exact strings from schema (e.g., `"Approved"`, not `"approved"`)
6. **Keep components client-side marked**: Add `'use client'` if using hooks (useState, useEffect, etc.)
7. **Error responses**: Always include error message in `NextResponse.json({ error: '...' }, { status: 500 })`

## Red Flags & Common Issues

- ❌ Treating JSON fields as direct objects (must parse first)
- ❌ Using wrong status strings (case-sensitive: "Pending", not "pending")
- ❌ Relative imports crossing multiple directories (use `@/` alias)
- ❌ Forgetting `'use client'` on interactive components
- ❌ Not handling null/undefined JSON fields gracefully
- ❌ Modifying `_count` or relations directly (Prisma handles these)

---

**Last Updated**: 2025-11-16  
**Scaffold Version**: Next.js 15.3.5 + TypeScript 5 + Prisma 6.11.1
**Recent Improvements**: Fixed ReferensiForm syntax error (missing comma), enhanced UI with 3-section layout for better organization information management
