# Participation Tiers - Talaqqi Academy

## Overview

Fitur Participation Tiers (Jenis Kepesertaan) memungkinkan Anda membuat multiple tier/paket kepesertaan untuk setiap event dengan harga dan link grup WhatsApp yang berbeda.

## Konsep

Setiap event dapat memiliki **satu atau lebih tier kepesertaan**, misalnya:

### Contoh 1: Event Gratis
- **Gratis** - Rp 0 - Link WA: https://chat.whatsapp.com/xxx

### Contoh 2: Event dengan Multiple Tiers
- **Regular** - Rp 50.000 - Link WA: https://chat.whatsapp.com/regular
- **VIP** - Rp 100.000 - Link WA: https://chat.whatsapp.com/vip
- **Early Bird** - Rp 35.000 - Link WA: https://chat.whatsapp.com/early

### Contoh 3: Event dengan Berbagai Kategori
- **Pelajar** - Rp 25.000 - Link WA: https://chat.whatsapp.com/pelajar
- **Mahasiswa** - Rp 40.000 - Link WA: https://chat.whatsapp.com/mahasiswa
- **Umum** - Rp 75.000 - Link WA: https://chat.whatsapp.com/umum

## Cara Menggunakan

### 1. Menambah Tier Saat Create/Edit Event

Pada form "Tambah Event" atau "Edit Event":

1. Scroll ke bagian **"Jenis Kepesertaan"**
2. Isi 3 field:
   - **Nama Tier**: Nama paket (e.g., "VIP", "Regular", "Pelajar")
   - **Harga**: Nominal dalam Rupiah (0 untuk gratis)
   - **Link Grup WA**: URL link invite grup WhatsApp khusus untuk tier ini
3. Klik tombol **+** untuk menambahkan
4. Tier akan muncul dalam list di bawahnya
5. Ulangi untuk menambah tier lainnya

### 2. Menghapus Tier

- Klik tombol **X** pada tier yang ingin dihapus
- Tier akan langsung terhapus dari list

### 3. Edit Tier

Untuk edit tier yang sudah ada:
1. Hapus tier lama dengan tombol X
2. Tambahkan tier baru dengan data yang diupdate

## Struktur Data

### Database Schema

```prisma
model Event {
  jenisKepesertaan  String   // JSON array of participation types
}
```

### JSON Format

```json
[
  {
    "nama": "Regular",
    "harga": 50000,
    "linkGrupWa": "https://chat.whatsapp.com/regular"
  },
  {
    "nama": "VIP",
    "harga": 100000,
    "linkGrupWa": "https://chat.whatsapp.com/vip"
  }
]
```

### TypeScript Interface

```typescript
interface ParticipationTier {
  nama: string;
  harga: number;
  linkGrupWa: string;
}
```

## Display di Dashboard

Di halaman dashboard admin, setiap event akan menampilkan:
- Nama event
- **Badges tier** dengan format: `{Nama}: Rp {Harga}`
- Contoh: `Regular: Rp 50.000` `VIP: Rp 100.000`

## Manfaat Multiple Tiers

### 1. Fleksibilitas Pricing
- Buat berbagai paket sesuai target audience
- Early bird discounts
- Paket bundling dengan benefit berbeda

### 2. Segmentasi Peserta
- Grup WhatsApp terpisah per tier
- Memudahkan koordinasi dan komunikasi
- Benefit eksklusif untuk tier tertentu

### 3. Meningkatkan Revenue
- Opsi premium untuk yang mau lebih
- Tidak kehilangan peserta budget terbatas
- Maksimalkan profit dari setiap event

## Best Practices

### 1. Naming Convention
- Gunakan nama yang jelas dan mudah dipahami
- Contoh BAIK: "Pelajar", "VIP", "Early Bird"
- Contoh BURUK: "Tier1", "Paket X"

### 2. Pricing Strategy
- Buat perbedaan harga yang signifikan (minimal 30%)
- Tier tertinggi biasanya 2-3x tier terendah
- Gratis (Rp 0) untuk open event

### 3. WhatsApp Groups
- Siapkan grup WhatsApp sebelum publish event
- Gunakan link invite yang tidak expired
- Beri nama grup sesuai tier (e.g., "Event X - VIP")

### 4. Minimal Tiers
- Minimal 1 tier harus ditambahkan
- Untuk event sederhana, 1 tier sudah cukup
- Maksimal praktis: 3-4 tiers

## Migration dari Struktur Lama

Jika Anda punya data lama dengan struktur:
```json
{
  "jenisKepesertaan": "Berbayar",
  "nominalInfaq": 50000,
  "linkGrupWa": "https://chat.whatsapp.com/xxx"
}
```

Konversi menjadi:
```json
{
  "jenisKepesertaan": [
    {
      "nama": "Berbayar",
      "harga": 50000,
      "linkGrupWa": "https://chat.whatsapp.com/xxx"
    }
  ]
}
```

## Troubleshooting

### Error: "Belum ada tier kepesertaan"
**Solusi:** Tambahkan minimal 1 tier sebelum menyimpan event

### Tier tidak muncul setelah save
**Solusi:** 
- Pastikan klik tombol + setelah isi form
- Refresh halaman dan edit event lagi

### Link WhatsApp tidak valid
**Solusi:**
- Pastikan format: `https://chat.whatsapp.com/...`
- Cek link di browser terlebih dahulu
- Link bisa dikosongkan jika belum siap

## API Integration

### Create Event dengan Tiers

```javascript
const eventData = {
  kodeEvent: "TA003",
  namaEvent: "Workshop Advanced",
  // ... fields lainnya
  jenisKepesertaan: JSON.stringify([
    { nama: "Regular", harga: 50000, linkGrupWa: "https://..." },
    { nama: "VIP", harga: 100000, linkGrupWa: "https://..." }
  ])
};

await fetch('/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(eventData)
});
```

### Get Event dengan Parse Tiers

```javascript
const event = await fetch('/api/events/[id]').then(r => r.json());
const tiers = JSON.parse(event.jenisKepesertaan);

tiers.forEach(tier => {
  console.log(`${tier.nama}: Rp ${tier.harga}`);
});
```

## Future Enhancements

Rencana pengembangan fitur:

1. **Benefits per Tier**
   - Custom benefits untuk setiap tier
   - Checkbox comparison table

2. **Quota Management**
   - Set maksimal peserta per tier
   - Auto close saat full

3. **Dynamic Pricing**
   - Early bird pricing otomatis
   - Deadline-based pricing

4. **Tier Analytics**
   - Statistik penjualan per tier
   - Conversion rate analysis

---

**Created:** 2025-11-15  
**Version:** 1.0.0
