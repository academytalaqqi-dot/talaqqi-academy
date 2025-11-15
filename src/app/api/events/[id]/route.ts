import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const event = await db.event.update({
      where: { id: params.id },
      data: {
        kodeEvent: data.kodeEvent,
        namaEvent: data.namaEvent,
        pemateri: JSON.stringify(data.pemateri),
        tema: data.tema,
        waktuEvent: JSON.stringify(data.waktuEvent),
        jenisKepesertaan: data.jenisKepesertaan,
        nominalInfaq: data.nominalInfaq,
        benefit: JSON.stringify(data.benefit),
        kodeVoucher: data.kodeVoucher ? JSON.stringify(data.kodeVoucher) : null,
        flyerImage: data.flyerImage,
        linkGrupWa: data.linkGrupWa,
        statusEvent: data.statusEvent
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.event.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}