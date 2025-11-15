import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { kodeVoucher } = await request.json();

    if (!kodeVoucher) {
      return NextResponse.json({ error: 'Kode voucher diperlukan' }, { status: 400 });
    }

    // Find voucher
    const voucher = await db.voucher.findUnique({
      where: { kodeVoucher: kodeVoucher.toUpperCase() }
    });

    if (!voucher) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Kode voucher tidak ditemukan' 
      }, { status: 404 });
    }

    if (voucher.status !== 'Aktif') {
      return NextResponse.json({ 
        valid: false, 
        error: 'Voucher sudah tidak aktif' 
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      voucher: {
        kodeVoucher: voucher.kodeVoucher,
        potongan: voucher.potongan
      }
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json({ error: 'Gagal memvalidasi voucher' }, { status: 500 });
  }
}
