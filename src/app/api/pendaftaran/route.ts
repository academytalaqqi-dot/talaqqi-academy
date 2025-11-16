import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const pendaftaran = await db.pendaftaran.findMany({
      include: {
        event: true
      },
      orderBy: {
        waktuPendaftaran: 'desc'
      }
    });

    return NextResponse.json(pendaftaran);
  } catch (error) {
    console.error('Error fetching pendaftaran:', error);
    return NextResponse.json({ error: 'Failed to fetch pendaftaran' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const nominal = typeof data.nominalPembayaran === 'number'
      ? data.nominalPembayaran
      : parseFloat(String(data.nominalPembayaran || 0)) || 0;

    const pendaftaran = await db.pendaftaran.create({
      data: {
        namaPendaftar: data.namaPendaftar,
        kotaDomisili: data.kotaDomisili,
        umur: data.umur,
        noWhatsapp: data.noWhatsapp,
        eventId: data.eventId,
        jenisKepesertaan: data.jenisKepesertaan,
        nominalPembayaran: nominal,
        kodeVoucher: data.kodeVoucher,
        buktiTransfer: data.buktiTransfer,
        jawabanTambahan: data.jawabanTambahan || null,
        // If the final nominal to pay is 0, treat registration as already Approved
        status: nominal === 0 ? 'Approved' : 'Pending'
      },
      include: {
        event: true
      }
    });

    return NextResponse.json(pendaftaran);
  } catch (error) {
    console.error('Error creating pendaftaran:', error);
    return NextResponse.json({ error: 'Failed to create pendaftaran' }, { status: 500 });
  }
}