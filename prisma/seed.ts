import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@talaqqi.academy' },
    update: {},
    create: {
      email: 'admin@talaqqi.academy',
      password: hashedPassword,
      name: 'Administrator'
    }
  });
  console.log('Created admin:', admin);

  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      kodeEvent: 'TA001',
      namaEvent: 'Kelas Tajwid Dasar',
      pemateri: JSON.stringify(['Ustadz Ahmad Rahman', 'Ustadzah Fatimah']),
      tema: 'Belajar Tajwid dari Nol untuk Pemula',
      waktuEvent: JSON.stringify(['2024-01-15 19:00', '2024-01-16 19:00']),
      jenisKepesertaan: JSON.stringify([
        { nama: 'Gratis', harga: 0, linkGrupWa: 'https://chat.whatsapp.com/ABC123' }
      ]),
      benefit: JSON.stringify(['Sertifikat', 'Link Rekaman', 'Modul PDF']),
      statusEvent: 'Pendaftaran'
    }
  });
  console.log('Created event 1:', event1);

  const event2 = await prisma.event.create({
    data: {
      kodeEvent: 'TA002',
      namaEvent: 'Workshop Public Speaking',
      pemateri: JSON.stringify(['Dr. Muhammad Hassan']),
      tema: 'Meningkatkan Kemampuan Berbicara di Depan Umum',
      waktuEvent: JSON.stringify(['2024-01-20 09:00', '2024-01-21 09:00']),
      jenisKepesertaan: JSON.stringify([
        { nama: 'Regular', harga: 50000, linkGrupWa: 'https://chat.whatsapp.com/DEF456' },
        { nama: 'VIP', harga: 100000, linkGrupWa: 'https://chat.whatsapp.com/VIP789' }
      ]),
      benefit: JSON.stringify(['Sertifikat', 'Link Rekaman', 'Materi Workshop', 'Video Tutorial']),
      statusEvent: 'Pendaftaran'
    }
  });
  console.log('Created event 2:', event2);

  // Create sample vouchers
  const voucher1 = await prisma.voucher.create({
    data: {
      kodeVoucher: 'DISKON50',
      potongan: 50,
      status: 'Aktif'
    }
  });
  console.log('Created voucher 1:', voucher1);

  // Create referensi
  const referensi = await prisma.referensi.create({
    data: {
      namaLembaga: 'Talaqqi Academy',
      nomorRekening: '1234567890',
      namaBank: 'Bank Syariah Indonesia',
      namaPemilik: 'Talaqqi Academy',
      noWhatsappAdmin: '+628123456789',
      logo: '/logo-placeholder.png'
    }
  });
  console.log('Created referensi:', referensi);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });