# Kelola Referensi - Perbaikan & Peningkatan UI/UX

**Tanggal Update**: 16 November 2025

## Ringkasan Perubahan

Halaman **Kelola Referensi** telah diperbaiki dan ditingkatkan dengan UI yang lebih baik, termasuk perbaikan bug syntax error dan peningkatan organisasi form yang lebih intuitif.

## Bug Fixes ✅

### 1. Syntax Error pada State Initialization
**File**: `src/components/admin/referensi-form.tsx` (line ~23)

**Masalah**: Missing comma setelah `logo: ''` menyebabkan syntax error
```tsx
// SEBELUM (ERROR)
const [formData, setFormData] = useState<Referensi>({
  namaLembaga: '',
  nomorRekening: '',
  namaBank: '',
  namaPemilik: '',
  noWhatsappAdmin: '',
  logo: ''    // ❌ Missing comma
  instagram: '',
  // ...
});

// SESUDAH (FIXED)
const [formData, setFormData] = useState<Referensi>({
  namaLembaga: '',
  nomorRekening: '',
  namaBank: '',
  namaPemilik: '',
  noWhatsappAdmin: '',
  logo: '',   // ✅ Fixed: Added comma
  instagram: '',
  // ...
});
```

**Impact**: Komponen tidak bisa di-compile dengan error TypeScript

---

## UI/UX Improvements 🎨

### 2. Reorganized Form Layout dengan 3 Sections

Form sekarang dibagi menjadi 3 bagian yang jelas untuk lebih mudah dipahami:

#### **Section 1: Informasi Lembaga**
- Nama Lembaga
- No. WhatsApp Admin
- Logo Lembaga (dengan upload functionality)

```tsx
<div>
  <h3 className="text-lg font-semibold mb-4 text-gray-800">Informasi Lembaga</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Fields dalam section ini */}
  </div>
</div>
```

#### **Section 2: Informasi Rekening**
- Nama Bank
- Nomor Rekening
- Nama Pemilik Rekening (full-width field)

```tsx
<div className="border-t pt-6">
  <h3 className="text-lg font-semibold mb-4 text-gray-800">Informasi Rekening</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Fields dalam section ini */}
  </div>
</div>
```

#### **Section 3: Media Sosial & Kontak**
- Instagram
- Telegram  
- WhatsApp Channel
- Facebook
- Threads
- YouTube

```tsx
<div className="border-t pt-6">
  <h3 className="text-lg font-semibold mb-4 text-gray-800">Media Sosial & Kontak</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* 6 social media fields */}
  </div>
</div>
```

**Benefits**:
- ✅ Lebih terstruktur dan mudah dipahami
- ✅ Pembagian jelas antara informasi lembaga, bank, dan sosial media
- ✅ Visual separator (border-top) membuat section terpisah dengan jelas
- ✅ Responsive design: 1 kolom di mobile, 2 kolom di desktop

### 3. Enhanced Field Labels

Semua label field sudah ditingkatkan dengan placeholder yang lebih jelas:

| Field | Placeholder |
|-------|-------------|
| Nama Lembaga | `Talaqqi Academy` |
| No. WhatsApp Admin | `+628123456789` |
| Nama Bank | `Bank Syariah Indonesia` |
| Nomor Rekening | `1234567890` |
| Nama Pemilik Rekening | `Nama sesuai rekening bank` |
| Instagram | `@talaqqi_academy` |
| Telegram | `@talaqqi_academy` |
| WhatsApp Channel | `https://whatsapp.com/channel/...` |
| Facebook | `https://facebook.com/talaqqi_academy` |
| Threads | `@talaqqi_academy` |
| YouTube | `https://youtube.com/@talaqqi_academy` |

### 4. Improved Button Styling & Accessibility

- Button "Simpan Data" tetap menonjol dengan Emerald green color
- Added icons untuk clarity (Building2, Upload, Save)
- Loading state dengan text: "Menyimpan..."
- Disabled state saat proses saving

---

## Technical Details 🔧

### Component Structure

```tsx
ReferensiForm (Client Component)
├── State Management (useState)
│   ├── formData (all 12 referensi fields)
│   ├── isLoading (data fetch)
│   └── isSaving (form submission)
├── Effects (useEffect)
│   └── fetchReferensi() - Load existing data from DB
├── Handlers
│   ├── handleSubmit() - POST/update referensi
│   └── handleFileUpload() - Upload logo to /api/upload
└── Render
    ├── Loading state
    └── Form with 3 sections + submit button
```

### API Integration

**GET `/api/referensi`**
- Retrieves existing referensi or empty object
- Response: `Referensi` object (12 fields)

**POST `/api/referensi`**
- Creates new or updates existing referensi (singleton pattern)
- Checks if referensi exists, then updates or creates
- Request body: Complete `Referensi` object
- Response: Updated `Referensi` object

### File Upload Flow

```
User selects file
    ↓
onChange triggered on hidden input
    ↓
FormData created with file
    ↓
POST to /api/upload
    ↓
Response: { url: "/uploads/[timestamp]-[filename]" }
    ↓
setFormData({ ...formData, logo: uploadedUrl })
    ↓
Image preview shown below input field
```

---

## Testing Checklist ✓

- [x] Syntax error fixed - component compiles without errors
- [x] Form renders with 3 distinct sections
- [x] All 12 fields render correctly
- [x] Load existing referensi data from API
- [x] Submit form data to API (create/update)
- [x] File upload for logo working
- [x] Logo preview displays after upload
- [x] Loading states show during fetch/save
- [x] Success/error messages displayed to user
- [x] Responsive layout: 1-col mobile, 2-col desktop
- [x] Required fields validation works

---

## Usage Guide 📖

### Untuk Admin

1. Buka **Kelola Referensi** tab di Dashboard
2. Isi **Informasi Lembaga**:
   - Nama lembaga Anda
   - Nomor WhatsApp admin
   - Upload atau paste URL logo

3. Isi **Informasi Rekening**:
   - Nama bank tempat rekening
   - Nomor rekening
   - Nama pemilik (sesuai kartu identitas)

4. Isi **Media Sosial & Kontak**:
   - Tautan semua akun social media (opsional)
   - Biarkan kosong jika tidak ada

5. Klik **Simpan Data**

### Untuk Developer

Jika ingin menambah field baru:

1. Update `Referensi` interface di component:
```tsx
interface Referensi {
  // existing fields...
  newField?: string;  // Add here
}
```

2. Add field ke initial state:
```tsx
const [formData, setFormData] = useState<Referensi>({
  // existing...
  newField: ''
});
```

3. Add input field di form:
```tsx
<div>
  <Label htmlFor="newField">Label Text</Label>
  <Input
    id="newField"
    value={formData.newField}
    onChange={(e) => setFormData({...formData, newField: e.target.value})}
    placeholder="Placeholder text"
  />
</div>
```

4. Add to API update payload di `src/app/api/referensi/route.ts`

---

## Dependencies

- React 19
- Next.js 15
- shadcn/ui (Card, Button, Input, Label)
- Lucide Icons (Building2, Upload, Save)
- Prisma (Database)

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (responsive)

---

## Performance Notes

- Form lazy-loads referensi data on mount
- File upload uses FormData API (native browser)
- No external validation library (client-side validation via HTML5)
- API calls are async - UI remains responsive

---

## Future Improvements

1. Add form validation library (Zod/React Hook Form)
2. Add image crop/resize before upload
3. Add validation for social media URLs
4. Add preview of all social links
5. Add bulk import from CSV
6. Add form reset button

---

**Component Location**: `src/components/admin/referensi-form.tsx`  
**API Location**: `src/app/api/referensi/route.ts`  
**Database Model**: `prisma/schema.prisma` (Referensi model)
