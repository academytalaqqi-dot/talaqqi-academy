# Upload Guide - Talaqqi Academy

## Image Upload Feature

Fitur upload gambar telah ditambahkan untuk flyer event dengan spesifikasi sebagai berikut:

### Spesifikasi Upload

**Format yang Didukung:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Batasan:**
- Ukuran maksimal: 5 MB
- Hanya file gambar yang diperbolehkan

### Cara Menggunakan

#### 1. Upload Gambar dari File Lokal

Saat menambah atau edit event:

1. Klik tombol **"Choose File"** atau area input file
2. Pilih gambar dari komputer Anda
3. Gambar akan otomatis terupload
4. Preview gambar akan muncul setelah upload berhasil
5. Klik tombol **X** untuk menghapus dan upload ulang

#### 2. Menggunakan URL Gambar

Alternatif dari upload file, Anda bisa memasukkan URL gambar langsung:

1. Masukkan URL gambar di field "Atau masukkan URL gambar"
2. Contoh: `https://example.com/image.jpg`
3. Gambar dari URL akan langsung ditampilkan sebagai preview

### Lokasi Penyimpanan

File yang diupload disimpan di:
```
/public/uploads/
```

File akan dinamai dengan format:
```
{timestamp}-{original-filename}
Contoh: 1234567890-flyer-event.jpg
```

### Akses Gambar

Gambar yang sudah diupload dapat diakses melalui URL:
```
http://localhost:3000/uploads/1234567890-flyer-event.jpg
```

### Error Handling

**Error yang Mungkin Muncul:**

1. **"Invalid file type. Only images are allowed."**
   - File yang dipilih bukan gambar
   - Solusi: Pilih file dengan format yang didukung

2. **"File size too large. Maximum 5MB allowed."**
   - Ukuran file melebihi 5 MB
   - Solusi: Kompres atau resize gambar terlebih dahulu

3. **"Failed to upload file"**
   - Error server saat menyimpan file
   - Solusi: Coba lagi atau hubungi admin

### Tips

1. **Ukuran Optimal:** Gunakan gambar dengan ukuran yang sudah dioptimasi (biasanya 800-1200px width)
2. **Format Terbaik:** WebP atau JPEG untuk ukuran file lebih kecil
3. **Nama File:** Gunakan nama file yang deskriptif untuk memudahkan manajemen

### Keamanan

- ✅ Validasi tipe file di server-side
- ✅ Validasi ukuran file maksimal
- ✅ Nama file unik menggunakan timestamp
- ✅ File disimpan di folder terpisah dari source code

### Production Notes

Untuk deployment production:

1. **Storage:** Pertimbangkan menggunakan cloud storage (AWS S3, Cloudinary, etc.)
2. **CDN:** Gunakan CDN untuk performa loading gambar lebih cepat
3. **Backup:** Setup backup regular untuk folder uploads
4. **Cleanup:** Implementasi cleanup untuk file yang tidak terpakai

## API Endpoint

### POST /api/upload

Upload file gambar ke server.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData dengan key `file`

**Response Success (200):**
```json
{
  "success": true,
  "url": "/uploads/1234567890-image.jpg",
  "filename": "1234567890-image.jpg"
}
```

**Response Error (400):**
```json
{
  "error": "Invalid file type. Only images are allowed."
}
```

**Response Error (500):**
```json
{
  "error": "Failed to upload file"
}
```

### Example Usage (JavaScript)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Uploaded file URL:', data.url);
```
