# Registration Flow - Talaqqi Academy

Dokumentasi lengkap alur pendaftaran dan approval dengan integrasi WhatsApp.

## Table of Contents
1. [User Registration Flow](#user-registration-flow)
2. [Admin Approval Flow](#admin-approval-flow)
3. [WhatsApp Integration](#whatsapp-integration)
4. [Technical Implementation](#technical-implementation)

---

## User Registration Flow

### 1. Free Tier Registration

**User Steps:**
1. User membuka halaman public (`/`)
2. Melihat event dengan tier gratis
3. Klik "Daftar Sekarang"
4. Mengisi formulir pendaftaran:
   - Nama Lengkap
   - Kota Domisili
   - Usia
   - No. WhatsApp
   - Pilih Tier: "Gratis - Rp 0"
5. Submit formulir

**System Behavior:**
```
Submit → Success Modal → WhatsApp Auto-Open → Auto-Close (3s)
```

**Success Screen:**
- ✅ Icon success (bintang hijau)
- ✅ Pesan: "Terima kasih telah mendaftar! Link grup WhatsApp telah dibuka di tab baru."
- ✅ Info: "Form akan tertutup otomatis dalam beberapa detik..."
- ✅ **WhatsApp tab baru otomatis terbuka**
- ✅ Form tertutup otomatis setelah 3 detik

**Timeline:**
```
0s:  Submit berhasil
0s:  WhatsApp tab terbuka
0s:  Success modal muncul
3s:  Form tertutup otomatis
```

### 2. Paid Tier Registration

**User Steps:**
1. User membuka halaman public (`/`)
2. Melihat event dengan tier berbayar
3. Klik "Daftar Sekarang"
4. Mengisi formulir pendaftaran:
   - Nama Lengkap
   - Kota Domisili
   - Usia
   - No. WhatsApp
   - Pilih Tier: "VIP - Rp 100.000"
   - (Opsional) Kode Voucher
   - Upload Bukti Transfer
5. Submit formulir

**System Behavior:**
```
Submit → Success Modal → Auto-Close (5s)
```

**Success Screen:**
- ✅ Icon success (bintang hijau)
- ✅ Pesan: "Terima kasih telah mendaftar!"
- ⚠️ Warning Box (kuning):
  - "Menunggu Validasi Admin"
  - "Link grup WhatsApp akan dikirimkan via WhatsApp setelah pembayaran Anda disetujui."
- ✅ Info: "Form akan tertutup otomatis dalam beberapa detik..."
- ✅ Form tertutup otomatis setelah 5 detik

**Timeline:**
```
0s:  Submit berhasil
0s:  Success modal muncul
5s:  Form tertutup otomatis
```

---

## Admin Approval Flow

### Dashboard Validation

**Admin Access:**
```
Login → Dashboard → Tab "Validasi Pendaftaran"
```

### Viewing Registrations

**Table Columns:**
- Nama Pendaftar
- Kota
- Usia
- WhatsApp
- Event
- Jenis (Tier name + badge)
- Nominal
- Status (Badge: Pending/Approved/Rejected)
- Aksi (Approve/Reject buttons)

### Approval Process - Paid Tier

**Admin Steps:**
1. Review pendaftaran dengan status "Pending"
2. Cek bukti transfer (jika ada)
3. Klik tombol ✅ (Approve)

**System Behavior:**
```
Click Approve → 
  Parse Tier Data → 
  Generate WhatsApp Message → 
  Open WhatsApp Web → 
  Update Status
```

**What Happens:**
1. ✅ Status berubah menjadi "Approved"
2. ✅ **WhatsApp Web/App otomatis terbuka** di tab baru
3. ✅ Message sudah ter-fill dengan:
   - Greeting dengan nama pendaftar
   - Informasi approval
   - Nama event
   - **Link grup WhatsApp**
   - Closing message
4. ✅ Alert: "Status berhasil diupdate! Link WhatsApp telah dibuka di tab baru untuk dikirim ke peserta."
5. Admin tinggal klik "Send" di WhatsApp

**WhatsApp Message Template:**
```
Halo [Nama Pendaftar]! 🎉

Selamat! Pendaftaran Anda untuk event "[Nama Event]" telah disetujui.

Silakan bergabung ke grup WhatsApp melalui link berikut:
[Link Grup WhatsApp]

Terima kasih telah mendaftar di Talaqqi Academy!
```

### Approval Process - Free Tier

**Admin Note:**
- Free tier sudah auto-approved saat registrasi
- User langsung dapat akses grup WhatsApp
- Admin tidak perlu kirim WhatsApp manual

### Rejection Process

**Admin Steps:**
1. Review pendaftaran dengan status "Pending"
2. Klik tombol ❌ (Reject)
3. Status berubah menjadi "Rejected"
4. Tidak ada WhatsApp notification (admin bisa contact manual jika perlu)

---

## WhatsApp Integration

### URL Format

**WhatsApp Web/App URL:**
```
https://wa.me/[PHONE_NUMBER]?text=[ENCODED_MESSAGE]
```

**Example:**
```
https://wa.me/628123456789?text=Halo%20John%20Doe!...
```

### Phone Number Format

**Input:** Various formats
```
+62 812 3456 789
0812-3456-789
62 812 3456 789
```

**Processed:** Clean digits only
```javascript
registration.noWhatsapp.replace(/\D/g, '')
// Result: 628123456789
```

### Message Encoding

**Raw Message:**
```
Halo John Doe! 🎉

Selamat! Pendaftaran Anda untuk event "Workshop" telah disetujui.
```

**Encoded:**
```javascript
encodeURIComponent(message)
// Result: Halo%20John%20Doe!%20%F0%9F%8E%89%0A%0ASelamat!...
```

### Browser Behavior

**Desktop:**
- Opens WhatsApp Web if logged in
- Opens WhatsApp Desktop app if installed
- Fallback to web.whatsapp.com

**Mobile:**
- Opens WhatsApp app directly
- Pre-fills message ready to send

---

## Technical Implementation

### Frontend - Registration Submit

```typescript
// src/app/page.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Get tier data
  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
  const selectedTierData = tiers.find(t => t.nama === formData.selectedTier);
  
  // Submit registration
  const response = await fetch('/api/pendaftaran', {
    method: 'POST',
    body: JSON.stringify({
      jenisKepesertaan: selectedTierData.nama,
      nominalPembayaran: selectedTierData.harga,
      // ... other fields
    }),
  });
  
  if (response.ok) {
    setRegistrationSuccess(true);
    setRegisteredTier(selectedTierData);
    
    // Auto-behavior based on tier price
    if (selectedTierData.harga === 0) {
      // Free: Open WhatsApp immediately
      window.open(selectedTierData.linkGrupWa, '_blank');
      setTimeout(() => {
        // Close form after 3 seconds
        setSelectedEvent(null);
        setRegistrationSuccess(false);
      }, 3000);
    } else {
      // Paid: Just close after 5 seconds
      setTimeout(() => {
        setSelectedEvent(null);
        setRegistrationSuccess(false);
      }, 5000);
    }
  }
};
```

### Backend - Admin Approval

```typescript
// src/app/admin/dashboard/page.tsx

const handleApproveReject = async (id: string, action: 'approve' | 'reject') => {
  const response = await fetch(`/api/pendaftaran/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ 
      status: action === 'approve' ? 'Approved' : 'Rejected' 
    }),
  });
  
  if (response.ok && action === 'approve') {
    const result = await response.json();
    
    // Only send WhatsApp for paid tiers
    if (result.nominalPembayaran > 0) {
      const registration = pendaftaran.find(p => p.id === id);
      
      // Get tier data for WhatsApp link
      const tiers = JSON.parse(registration.event.jenisKepesertaan);
      const selectedTier = tiers.find(t => t.nama === registration.jenisKepesertaan);
      
      // Generate WhatsApp message
      const message = encodeURIComponent(
        `Halo ${registration.namaPendaftar}! 🎉\n\n` +
        `Selamat! Pendaftaran Anda untuk event "${registration.event.namaEvent}" telah disetujui.\n\n` +
        `Silakan bergabung ke grup WhatsApp melalui link berikut:\n` +
        `${selectedTier.linkGrupWa}\n\n` +
        `Terima kasih telah mendaftar di Talaqqi Academy!`
      );
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/${registration.noWhatsapp.replace(/\D/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      alert('Link WhatsApp telah dibuka untuk dikirim ke peserta.');
    }
  }
};
```

### Data Structure

**Registration Record:**
```json
{
  "id": "abc123",
  "namaPendaftar": "John Doe",
  "noWhatsapp": "0812 3456 789",
  "eventId": "event123",
  "jenisKepesertaan": "VIP",
  "nominalPembayaran": 100000,
  "status": "Pending"
}
```

**Event Tier Data:**
```json
{
  "jenisKepesertaan": [
    {
      "nama": "VIP",
      "harga": 100000,
      "linkGrupWa": "https://chat.whatsapp.com/xxx"
    }
  ]
}
```

---

## Flow Diagrams

### Free Tier Flow
```
User → Register (Free) → Submit
                          ↓
                    Success Modal
                          ↓
                  WhatsApp Opens (0s)
                          ↓
                  Form Auto-Close (3s)
                          ↓
                    User in WA Group
```

### Paid Tier Flow
```
User → Register (Paid) → Upload Bukti → Submit
                                          ↓
                                   Success Modal
                                          ↓
                              "Menunggu Validasi"
                                          ↓
                              Form Auto-Close (5s)
                                          ↓
Admin → Review → Approve → WhatsApp Opens
                    ↓
              Send Message
                    ↓
            User Receives Link
                    ↓
            User Joins Group
```

---

## Best Practices

### For Admins

1. **Quick Approval**
   - Check bukti transfer first
   - Approve immediately if valid
   - WhatsApp will open automatically

2. **WhatsApp Message**
   - Message is pre-filled, just click send
   - Don't modify the message (contains important link)
   - Confirm message sent before closing tab

3. **Follow Up**
   - Check if user joined the group
   - Contact manually if user doesn't respond

### For Development

1. **Phone Number Validation**
   - Accept various formats
   - Clean before sending to WhatsApp
   - Validate Indonesian format (08xx or +62)

2. **Error Handling**
   - Handle WhatsApp popup blockers
   - Provide fallback instructions
   - Log failed message attempts

3. **Testing**
   - Test on different browsers
   - Test with WhatsApp Web and App
   - Test phone number formats

---

## Troubleshooting

### Issue: WhatsApp doesn't open

**Causes:**
- Popup blocker enabled
- WhatsApp not logged in (Web)
- Invalid phone number

**Solutions:**
- Allow popups for the domain
- Login to WhatsApp Web first
- Check phone number format

### Issue: Message not pre-filled

**Causes:**
- Encoding issue
- Special characters problem
- URL too long

**Solutions:**
- Check `encodeURIComponent` usage
- Test with simple message first
- Shorten message if needed

### Issue: Wrong group link sent

**Causes:**
- Tier data not parsed correctly
- Wrong tier selected
- Event data outdated

**Solutions:**
- Verify tier data in database
- Check JSON parsing
- Refresh event data

---

## Future Enhancements

### Planned
- [ ] Auto-send WhatsApp API (no manual click)
- [ ] SMS fallback if WhatsApp fails
- [ ] Email notification with group link
- [ ] Track message delivery status
- [ ] Retry mechanism for failed sends

### Under Consideration
- [ ] WhatsApp Business API integration
- [ ] Bulk approval with batch messages
- [ ] Template message customization
- [ ] Multi-language support
- [ ] Message scheduling

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-15  
**Status:** Production Ready
