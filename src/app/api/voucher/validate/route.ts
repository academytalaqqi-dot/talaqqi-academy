import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { kodeVoucher, eventId } = await request.json();

    if (!kodeVoucher) {
      return NextResponse.json({ error: 'Kode voucher diperlukan' }, { status: 400 });
    }

    // First, check if voucher is for specific event
    if (eventId) {
      const event = await db.event.findUnique({
        where: { id: eventId }
      });

      if (event && event.kodeVoucher) {
        try {
          const eventVouchers = JSON.parse(event.kodeVoucher);
          
          // Check if kodeVoucher exists in event vouchers array
          if (Array.isArray(eventVouchers)) {
            const foundVoucher = eventVouchers.find(
              (v: string) => v.toUpperCase() === kodeVoucher.toUpperCase()
            );
            
            if (foundVoucher) {
              // Event-specific voucher found
              // For now, use fixed discount from Voucher table if exists, otherwise default 10%
              const globalVoucher = await db.voucher.findUnique({
                where: { kodeVoucher: kodeVoucher.toUpperCase() }
              });
              
              const discount = globalVoucher?.potongan || 10;
              
              return NextResponse.json({
                valid: true,
                voucher: {
                  kodeVoucher: foundVoucher,
                  potongan: discount
                }
              });
            }
          }
        } catch (parseError) {
          console.error('Error parsing event vouchers:', parseError);
        }
      }
    }

    // If not found in event, check global Voucher table
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
