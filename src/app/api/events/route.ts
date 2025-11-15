import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            pendaftaran: true
          }
        }
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const event = await db.event.create({
      data: {
        kodeEvent: data.kodeEvent,
        namaEvent: data.namaEvent,
        pemateri: JSON.stringify(data.pemateri),
        tema: data.tema,
        waktuEvent: JSON.stringify(data.waktuEvent),
        jenisKepesertaan: JSON.stringify(data.jenisKepesertaan),
        benefit: JSON.stringify(data.benefit),
        kodeVoucher: data.kodeVoucher ? JSON.stringify(data.kodeVoucher) : null,
        flyerImage: data.flyerImage,
        statusEvent: data.statusEvent || 'Pendaftaran'
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}