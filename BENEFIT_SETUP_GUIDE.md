# Panduan Setup Benefit untuk Event

## Masalah: Benefit Belum Muncul

Jika benefit tidak muncul di card event dan form pendaftaran, kemungkinan besar data benefit di tier masih kosong.

---

## Langkah Setup Benefit

### 1. Login ke Admin Panel
```
URL: http://localhost:3000/admin
Login dengan credentials admin
```

### 2. Buka Menu "Kelola Event"
```
- Klik "Kelola Event" di sidebar/menu
- Akan muncul daftar event yang sudah dibuat
```

### 3. Edit Event yang Ingin Ditambahkan Benefit
```
- Klik tombol "Edit" pada event
- Modal form akan terbuka
```

### 4. Scroll ke Section "Jenis Kepesertaan"
```
Di sini akan muncul daftar tier yang sudah dibuat, contoh:

┌─────────────────────────────────────────┐
│ [VIP] Rp 100.000                   [×]  │
│ WA: https://wa.me/...                   │
│ ─────────────────────────────────────   │
│ Benefit untuk tier ini:                 │
│ ┌──────────────┬───┐                    │
│ │ Tambah...    │ + │                    │
│ └──────────────┴───┘                    │
│ (belum ada benefit)                     │
└─────────────────────────────────────────┘
```

### 5. Tambahkan Benefit untuk Setiap Tier
```
Untuk tier "VIP":
1. Di section "Benefit untuk tier ini"
2. Input: "E-Certificate"
3. Klik tombol Plus (+)
4. Badge "E-Certificate" muncul

5. Input: "Modul PDF Premium"
6. Klik Plus (+)
7. Badge muncul

8. Ulangi untuk benefit lainnya:
   - "Akses Grup WhatsApp Eksklusif"
   - "1-on-1 Mentoring Session"
   - "Akses Rekaman Selamanya"

Hasil:
┌─────────────────────────────────────────┐
│ Benefit untuk tier ini:                 │
│ ┌──────────────┬───┐                    │
│ │ Tambah...    │ + │                    │
│ └──────────────┴───┘                    │
│                                         │
│ [E-Certificate ×] [Modul PDF ×]         │
│ [Grup WA Eksklusif ×] [Mentoring ×]     │
│ [Rekaman Selamanya ×]                   │
└─────────────────────────────────────────┘
```

### 6. Ulangi untuk Tier Lainnya
```
Tier "Regular":
- E-Certificate
- Modul PDF Premium
- Akses Grup WhatsApp

Tier "Gratis":
- E-Certificate
```

### 7. Simpan Event
```
1. Scroll ke bawah
2. Klik tombol "Simpan"
3. Event akan terupdate dengan benefit
```

---

## Verifikasi

### 1. Buka Halaman Landing (Home)
```
URL: http://localhost:3000
```

### 2. Check Event Card
```
Seharusnya sekarang muncul:

┌────────────────────────────────────────┐
│ Workshop Qur'an                        │
│ [VIP: Rp 100k] [Regular: Rp 50k]      │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Benefit yang didapat:              │ │
│ │ ✓ E-Certificate                    │ │
│ │ ✓ Modul PDF Premium                │ │
│ │ ✓ Grup WhatsApp Eksklusif          │ │
│ │ +2 benefit lainnya                 │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### 3. Check Form Pendaftaran
```
1. Klik "Daftar Sekarang"
2. Pilih dropdown "Jenis Kepesertaan"

Seharusnya muncul:
┌─────────────────────────────┐
│ VIP           Rp 100.000    │
│ ✓ 5 benefit tersedia        │
├─────────────────────────────┤
│ Regular       Rp 50.000     │
│ ✓ 3 benefit tersedia        │
└─────────────────────────────┘
```

### 4. Check After Selection
```
Setelah pilih tier "VIP", muncul box:

┌─────────────────────────────────┐
│ Benefit yang didapat:           │
│ ✓ E-Certificate                 │
│ ✓ Modul PDF Premium             │
│ ✓ Grup WhatsApp Eksklusif       │
│ ✓ 1-on-1 Mentoring              │
│ ✓ Rekaman Selamanya             │
└─────────────────────────────────┘
```

---

## Debug via Console

### Open Browser Console
```
Chrome: F12 → Console tab
Firefox: F12 → Console tab
Safari: Cmd+Opt+C
```

### Check Logs
```javascript
// Saat buka halaman home, akan muncul log:
Tiers list for benefits: [
  {
    nama: "VIP",
    harga: 100000,
    linkGrupWa: "...",
    benefit: ["E-Certificate", "Modul PDF", "..."]  // ← Check this!
  }
]

// Check each tier:
Tier benefit: VIP ["E-Certificate", "Modul PDF", "Grup WA", "Mentoring", "Rekaman"]
Tier benefit: Regular ["E-Certificate", "Modul PDF", "Grup WA"]

// Final collected benefits:
All benefits collected: [
  "E-Certificate",
  "Modul PDF Premium",
  "Grup WhatsApp Eksklusif",
  "1-on-1 Mentoring",
  "Rekaman Selamanya"
]
```

### If No Benefits:
```javascript
// You'll see:
Tier benefit: VIP []  // ← Empty array!
Tier benefit: Regular []
All benefits collected: []
No benefits found, not rendering box
```

**Solution:** Admin belum tambahkan benefit di tier → Follow Step 1-7 above!

---

## Troubleshooting

### Q: Benefit tidak muncul setelah ditambahkan
**A:** 
1. Pastikan sudah klik "Simpan" setelah tambah benefit
2. Refresh halaman home (Ctrl+R / Cmd+R)
3. Clear cache browser
4. Check console untuk error

### Q: Badge benefit tidak bisa dihapus (X tidak berfungsi)
**A:** 
- Ini expected behavior berdasarkan request sebelumnya
- Badge X memang di-disable agar tidak bisa dihapus
- Jika ingin hapus, harus via admin panel

### Q: Benefit muncul di card tapi tidak di dropdown
**A:** 
1. Check console log untuk error
2. Pastikan tier yang dipilih punya benefit
3. Refresh page

### Q: Tier tidak punya section benefit
**A:**
- Tier dibuat sebelum fitur benefit ditambahkan
- Edit event, benefit section akan muncul
- Tambahkan benefit, simpan

---

## Example Data Structure

### Database (jenisKepesertaan field):
```json
[
  {
    "nama": "VIP",
    "harga": 100000,
    "linkGrupWa": "https://chat.whatsapp.com/ABC",
    "benefit": [
      "E-Certificate",
      "Modul PDF Premium",
      "Akses Grup WhatsApp Eksklusif",
      "1-on-1 Mentoring Session",
      "Akses Rekaman Selamanya"
    ]
  },
  {
    "nama": "Regular",
    "harga": 50000,
    "linkGrupWa": "https://chat.whatsapp.com/DEF",
    "benefit": [
      "E-Certificate",
      "Modul PDF Premium",
      "Akses Grup WhatsApp"
    ]
  },
  {
    "nama": "Gratis",
    "harga": 0,
    "linkGrupWa": "https://chat.whatsapp.com/GHI",
    "benefit": [
      "E-Certificate"
    ]
  }
]
```

### What Gets Displayed:

**Event Card (all unique benefits):**
```
✓ E-Certificate
✓ Modul PDF Premium
✓ Akses Grup WhatsApp Eksklusif
+2 benefit lainnya
```

**Dropdown:**
```
VIP           Rp 100.000
✓ 5 benefit tersedia

Regular       Rp 50.000
✓ 3 benefit tersedia

Gratis        Gratis
✓ 1 benefit tersedia
```

**After Selection (VIP):**
```
✓ E-Certificate
✓ Modul PDF Premium
✓ Akses Grup WhatsApp Eksklusif
✓ 1-on-1 Mentoring Session
✓ Akses Rekaman Selamanya
```

---

## Quick Checklist

Admin harus:
- [ ] Login ke admin panel
- [ ] Buka "Kelola Event"
- [ ] Edit event yang ingin ditambah benefit
- [ ] Scroll ke section "Jenis Kepesertaan"
- [ ] Untuk setiap tier, tambahkan benefit via input + Plus button
- [ ] Klik "Simpan"
- [ ] Refresh halaman home untuk verify
- [ ] Check console jika ada masalah

User akan lihat:
- [ ] Benefit preview di event card (home page)
- [ ] Benefit count di dropdown tier selection
- [ ] Full benefit list setelah pilih tier

---

## Support

Jika masih belum muncul setelah follow guide ini:
1. Check browser console untuk error
2. Check database jenisKepesertaan field
3. Pastikan benefit array tidak kosong
4. Clear browser cache
5. Hard refresh (Ctrl+Shift+R)

**Happy setup! 🚀**
