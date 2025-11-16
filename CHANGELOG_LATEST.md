# Changelog - Talaqqi Academy

## [Unreleased]

### ✨ Features
- Dynamic Logo and Name display on Admin Dashboard
  - **File**: `src/app/admin/dashboard/page.tsx`
  - **Change**: Admin dashboard header now shows dynamic logo and name
  - **Location**: Admin dashboard header (top navbar)
  - **Added**: `logoLembaga` and `namaLembaga` states, `fetchReferensi()` function
  - **API**: Uses existing GET /api/referensi endpoint
  - **Fallback**: Shows default "TA" logo if no image uploaded
  - **Improvement**: Consistent branding across all pages (public, login, admin)
  - **Status**: ✅ Completed

- Dynamic Logo and Name display on Login Page & Website Header
  - **Files**: `src/app/admin/login/page.tsx`, `src/app/page.tsx`
  - **Change**: Logo and name from Referensi API now displayed
  - **Locations**: 
    - Login form header (logo + name)
    - Public website header (logo + name)
  - **Added**: `logoLembaga` state variable, `fetchReferensi()` for login
  - **API**: Uses existing GET /api/referensi endpoint
  - **Fallback**: Shows default "TA" logo if no image uploaded
  - **Improvement**: Professional branding, fully admin-customizable
  - **Status**: ✅ Completed

- Dynamic website header using Nama Lembaga from Kelola Referensi
  - **File**: `src/app/page.tsx`
  - **Change**: Hardcoded "Talaqqi Academy" → Dynamic {namaLembaga}
  - **Locations**: Header title, Hero section welcome text, Footer copyright
  - **Added**: State variable namaLembaga with default fallback
  - **API**: Uses existing GET /api/referensi endpoint
  - **Improvement**: Admin can now customize website name from dashboard
  - **Status**: ✅ Completed

- Redesigned file upload interface for Logo Lembaga
  - **File**: `src/components/admin/referensi-form.tsx`
  - **Change**: "Logo Lembaga" → "Upload File Gambar Logo Lembaga"
  - **Added**: Helper text showing format & size requirements
  - **Improvement**: Full-width layout, disabled input field for clarity
  - **Status**: ✅ Completed

### 🐛 Bug Fixes
- Fixed null value warning in Input component - Added null-coalescing on API fetch data
  - **File**: `src/components/admin/referensi-form.tsx`
  - **Issue**: Console warning "value prop should not be null"
  - **Solution**: Ensure all form fields default to empty string via `||` operator
  - **Severity**: Medium
  - **Status**: ✅ Fixed

- Fixed syntax error in `ReferensiForm` component: missing comma in state initialization (line 23)
  - **File**: `src/components/admin/referensi-form.tsx`
  - **Impact**: Component now compiles without TypeScript errors
  - **Severity**: High

### ✨ Features  
- Enhanced `ReferensiForm` with reorganized 3-section layout
  - **Section 1**: Informasi Lembaga (Nama, WA Admin, Logo)
  - **Section 2**: Informasi Rekening (Bank, No. Rekening, Nama Pemilik)
  - **Section 3**: Media Sosial & Kontak (Instagram, Telegram, FB, Threads, YouTube, WA Channel)
- Improved form visual hierarchy with border-top section dividers
- Enhanced field labels with specific placeholders
- Better responsive design (1-col mobile, 2-col desktop)

### 📚 Documentation
- Updated `.github/copilot-instructions.md` with Referensi management guidelines
- Created `REFERENSI_FORM_UPDATE.md` with detailed technical documentation
- Created `REFERENSI_IMPROVEMENTS_SUMMARY.md` with summary and QA checklist

### 🔧 Technical Changes
- Refactored form rendering to use semantic sections
- Improved placeholder values for all form fields
- Maintained backward compatibility with existing API and database schema

### 🧪 Testing
- All 12 form fields render correctly
- Form load/save functionality verified
- File upload for logo working as expected
- Responsive layout tested on mobile and desktop
- Loading states and error handling working properly

---

## [v1.0.0] - 2025-11-15

### 🎉 Initial Release
- Project scaffolding with Next.js 15 + Prisma + SQLite
- Admin dashboard with event management
- Registration validation system
- Basic referensi management form
- Export to Excel/PDF functionality
- WhatsApp integration for notifications
- Role-based access control (token-based)

### 📦 Core Features
- Event CRUD operations
- Registration tracking and approval workflow  
- Voucher validation system
- Organization information management
- File upload support for event flyers and logos
- Data export in multiple formats

### 📋 Database Models
- Admin
- Event
- Pendaftaran
- Referensi
- Voucher

### 🚀 Deployment
- Production-ready build process
- Database migrations with Prisma
- Error logging and debugging utilities

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| Current (Unreleased) | 2025-11-16 | Bug fixes + UI improvements on Referensi form |
| 1.0.0 | 2025-11-15 | Initial production release |

---

## Roadmap

### Planned Features
- [ ] Full NextAuth.js integration for authentication
- [ ] Image cropping/resizing before upload
- [ ] Form validation with Zod/React Hook Form
- [ ] Batch import registrations from CSV
- [ ] Email notifications alongside WhatsApp
- [ ] Payment gateway integration (for tracking)
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Mobile admin app

### Performance Optimizations
- [ ] Database query optimization with indexes
- [ ] Image CDN integration
- [ ] API response caching
- [ ] Bundle size optimization

### Quality Improvements
- [ ] Unit test coverage (>80%)
- [ ] E2E testing with Playwright
- [ ] API documentation with Swagger
- [ ] Component storybook

---

**Last Updated**: 16 November 2025  
**Maintainer**: Development Team  
**License**: Proprietary - Talaqqi Academy
