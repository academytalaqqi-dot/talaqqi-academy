import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const referensi = await db.referensi.findFirst();
    
    if (!referensi) {
      return NextResponse.json({
        namaLembaga: '',
        nomorRekening: '',
        namaBank: '',
        namaPemilik: '',
        noWhatsappAdmin: '',
        logo: ''
      });
    }

    return NextResponse.json(referensi);
  } catch (error) {
    console.error('Error fetching referensi:', error);
    return NextResponse.json({ error: 'Failed to fetch referensi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Cek apakah sudah ada data referensi
    const existingReferensi = await db.referensi.findFirst();
    
    let referensi;
    if (existingReferensi) {
      // Update existing
      referensi = await db.referensi.update({
        where: { id: existingReferensi.id },
        data: {
          namaLembaga: data.namaLembaga,
          nomorRekening: data.nomorRekening,
          namaBank: data.namaBank,
          namaPemilik: data.namaPemilik,
          noWhatsappAdmin: data.noWhatsappAdmin,
          logo: data.logo
        }
      });
    } else {
      // Create new
      referensi = await db.referensi.create({
        data: {
          namaLembaga: data.namaLembaga,
          nomorRekening: data.nomorRekening,
          namaBank: data.namaBank,
          namaPemilik: data.namaPemilik,
          noWhatsappAdmin: data.noWhatsappAdmin,
          logo: data.logo
        }
      });
    }

    return NextResponse.json(referensi);
  } catch (error) {
    console.error('Error saving referensi:', error);
    return NextResponse.json({ error: 'Failed to save referensi' }, { status: 500 });
  }
}