# Changelog - Talaqqi Academy

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-11-15

### Added

#### 🎨 Flexible Participation Tiers System
- **Multiple tier support** - Create unlimited participation types per event
- **Custom pricing** - Set different prices for each tier (e.g., Pelajar, Regular, VIP)
- **Separate WhatsApp groups** - Each tier can have its own WhatsApp group link
- **Dynamic tier management** - Add/remove tiers on the fly in event form
- **Visual tier display** - Badges showing tier name and price in dashboard
- **Comprehensive documentation** - Complete guide in PARTICIPATION_TIERS.md

#### 📤 Image Upload System
- **File upload endpoint** - `/api/upload` for handling image uploads
- **Image validation** - Type checking (JPEG, PNG, GIF, WebP) and size limit (5MB)
- **Live preview** - See uploaded image immediately in form
- **URL fallback** - Option to use external image URLs
- **Secure storage** - Files saved to `/public/uploads/` with unique filenames
- **Upload documentation** - Complete guide in UPLOAD_GUIDE.md

#### 📚 Documentation
- **SETUP.md** - Complete installation and setup guide
- **UPLOAD_GUIDE.md** - Image upload feature documentation
- **PARTICIPATION_TIERS.md** - Comprehensive tiers system guide
- **CHANGELOG.md** - This file

### Changed

#### 🔄 Database Schema Updates
- **BREAKING**: Changed `jenisKepesertaan` from string to JSON array
- **BREAKING**: Removed `nominalInfaq` field (replaced by tier pricing)
- **BREAKING**: Removed `linkGrupWa` field (replaced by tier-specific links)
- **Migration required**: Run `npm run db:push -- --accept-data-loss`

#### 🛠️ API Routes
- Updated `POST /api/events` to handle tier arrays
- Updated `PATCH /api/events/[id]` to handle tier arrays
- Added `GET /api/events/[id]` with full relations
- Fixed `GET /api/events` to include `_count.pendaftaran`
- All tier data properly stringified/parsed as JSON

#### 💻 UI Components
- **EventFormDialog** completely redesigned for tier management
- **Dashboard** updated to display multiple tiers per event
- Added tier badges with price display
- Improved form validation and error handling

#### 🎯 TypeScript Types
- Updated `ParticipationType` from union type to interface
- Added `ParticipationTier` interface with nama, harga, linkGrupWa
- Updated `EventData` interface to use tier arrays
- Improved type safety across components

### Fixed

#### 🐛 Bug Fixes
- **Fixed**: "map is not a function" error when editing events
- **Fixed**: JSON parsing for `jenisKepesertaan` in edit mode
- **Fixed**: "Failed to save event" error on PATCH requests
- **Fixed**: Missing `_count.pendaftaran` causing dashboard crash
- **Fixed**: Deprecated fields causing database errors
- **Fixed**: ESLint warning in `use-toast.ts`

#### 🔧 Configuration
- Removed `ignoreBuildErrors` from `next.config.ts`
- Removed `ignoreDuringBuilds` from ESLint config
- Updated `.gitignore` to exclude uploads and package-lock.json
- Added `.gitkeep` for uploads directory

### Technical Details

#### Migration Steps
1. Backup existing database (if needed)
2. Run: `npm run db:push -- --accept-data-loss`
3. Run: `npx tsx prisma/seed.ts`
4. Restart development server

#### Breaking Changes
- **Database schema changed** - Requires migration
- **Old event data incompatible** - Need to reseed
- **API contracts changed** - Frontend must send tier arrays
- **Fields removed**: `nominalInfaq`, `linkGrupWa`

#### New Data Structure
```json
{
  "jenisKepesertaan": [
    {
      "nama": "Regular",
      "harga": 50000,
      "linkGrupWa": "https://chat.whatsapp.com/xxx"
    },
    {
      "nama": "VIP",
      "harga": 100000,
      "linkGrupWa": "https://chat.whatsapp.com/yyy"
    }
  ]
}
```

### Security

#### ✅ Implemented
- File type validation for uploads
- File size limits (5MB max)
- Secure filename generation with timestamps
- Input validation on API routes
- Type safety with TypeScript

#### 🔒 Recommended for Production
- Implement proper authentication middleware
- Use cloud storage (S3, Cloudinary) for uploads
- Add rate limiting on upload endpoint
- Implement CSRF protection
- Use environment variables for secrets

### Performance

#### ⚡ Optimizations
- Standalone build configuration
- Efficient JSON parsing with memoization
- Optimized database queries with includes
- Image upload with validation before processing

### Dependencies

#### No New Dependencies Added
All features built with existing packages:
- Next.js 15.3.5
- Prisma 6.11.1
- React 19.0.0
- TypeScript 5
- shadcn/ui components

### Commits Summary

```
f6c7f8b Fix: Remove deprecated linkGrupWa and nominalInfaq fields
4c40e36 Fix: Parse jenisKepesertaan JSON when editing event
d1ecd7a Docs: Add comprehensive participation tiers documentation
e5eb214 Feature: Flexible participation tiers with custom pricing and WhatsApp links
4fbd3a9 Docs: Add upload functionality documentation
8358803 Feature: Add image upload functionality for event flyers
126bafa Fix: Add _count.pendaftaran to events API response
f0e208a Add setup documentation and update .gitignore
46adbf3 Initial commit: Setup Talaqqi Academy project
```

### Contributors
- factory-droid[bot]

---

## Future Roadmap

### Planned Features
- [ ] Benefits per tier
- [ ] Quota management per tier
- [ ] Dynamic pricing with deadlines
- [ ] Tier analytics and reports
- [ ] Voucher system per tier
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Export data to Excel/PDF
- [ ] Multi-admin roles
- [ ] Activity logs

### Under Consideration
- Cloud storage integration
- CDN for images
- WhatsApp API integration
- SMS notifications
- Mobile app
- Public event catalog page
- Social media sharing
- SEO optimization

---

**Last Updated**: 2025-11-15  
**Version**: 1.0.0-beta  
**Status**: Development
