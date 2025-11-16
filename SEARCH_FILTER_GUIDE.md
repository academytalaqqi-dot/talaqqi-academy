# Panduan Filter dan Pencarian Data Pendaftaran

## Fitur yang Ditambahkan

Pada halaman Admin Dashboard, tab "Validasi Pendaftaran" sekarang dilengkapi dengan sistem filter dan pencarian yang komprehensif.

## Komponen Filter

### 1. **Pencarian (Search Bar)**
- **Placeholder**: "Cari: Nama, Kota, WhatsApp, Event..."
- **Fungsi**: Melakukan pencarian across multiple fields:
  - Nama Pendaftar
  - Kota Domisili
  - Nomor WhatsApp
  - Nama Event
- **Case-insensitive**: Pencarian tidak membedakan huruf besar/kecil
- **Real-time**: Hasil update saat user mengetik

### 2. **Filter Status**
- **Opsi**:
  - Semua Status (default)
  - Pending
  - Approved
  - Rejected
- **Fungsi**: Menyaring pendaftar berdasarkan status persetujuan

### 3. **Filter Jenis Kepesertaan**
- **Opsi**:
  - Semua Jenis (default)
  - Gratis
  - Berbayar
- **Fungsi**: Menyaring pendaftar berdasarkan jenis kepesertaan

## Hasil Filter

Di bawah filter controls, terdapat informasi ringkas:
```
Menampilkan X dari Y pendaftar
```
- **X**: Jumlah pendaftar sesuai filter
- **Y**: Total semua pendaftar

## Kombinasi Filter

Filter dapat dikombinasikan untuk hasil yang lebih spesifik:
- Cari nama "Budi" + filter Status "Pending" + Jenis "Gratis"
  → Menampilkan Budi yang mendaftar gratis dan belum disetujui

## Implementasi Teknis

### State Management
```tsx
const [searchQuery, setSearchQuery] = useState('');
const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
const [filterJenis, setFilterJenis] = useState<'All' | 'Gratis' | 'Berbayar'>('All');
```

### Filter Logic
```tsx
const getFilteredPendaftaran = () => {
  return pendaftaran.filter((p) => {
    // Search across multiple fields
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = 
      p.namaPendaftar.toLowerCase().includes(searchLower) ||
      p.kotaDomisili.toLowerCase().includes(searchLower) ||
      p.noWhatsapp.includes(searchLower) ||
      p.event.namaEvent.toLowerCase().includes(searchLower);

    if (!matchSearch) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (filterJenis !== 'All' && p.jenisKepesertaan !== filterJenis) return false;

    return true;
  });
};
```

## Styling

### Filter Container
- Background: Light gray (`bg-gray-50`)
- Padding: Moderate (`p-4`)
- Rounded corners: Standard (`rounded-lg`)

### Grid Layout
- Responsive: 1 kolom di mobile, 3 kolom di desktop
- Gap: Medium spacing (`gap-4`)

### Select Styling
- Border: Standard gray
- Focus state: Emerald ring (`focus:ring-2 focus:ring-emerald-500`)
- Font size: Small (`text-sm`)

### Results Info
- Text color: Medium gray (`text-gray-600`)
- Emphasis: Semi-bold counts (`font-semibold`)

## Keuntungan

1. **Efisiensi Admin**: Menemukan pendaftar spesifik dengan cepat
2. **Fleksibilitas**: Kombinasi multiple filters untuk hasil presisi
3. **Responsif**: Optimal di semua ukuran layar
4. **User-friendly**: Dropdown dan search bar yang intuitif
5. **Real-time**: Update instan saat filter berubah

## Testing Checklist

- [ ] Pencarian dengan nama berhasil memfilter
- [ ] Pencarian dengan kota berhasil memfilter
- [ ] Pencarian dengan nomor WhatsApp berhasil memfilter
- [ ] Pencarian dengan nama event berhasil memfilter
- [ ] Filter status berfungsi dengan benar
- [ ] Filter jenis kepesertaan berfungsi dengan benar
- [ ] Kombinasi filter bekerja sesuai harapan
- [ ] Hasil counter menampilkan jumlah yang tepat
- [ ] Layout responsif di mobile
- [ ] Search case-insensitive

---

**Ditambahkan**: November 15, 2025
**File**: `src/app/admin/dashboard/page.tsx`
**Komponen**: Search bar + 2 Select filters
**Status**: ✅ Production Ready
