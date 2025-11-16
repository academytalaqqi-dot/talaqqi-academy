import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const event = await db.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            pendaftaran: true
          }
        },
        pendaftaran: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const data = await request.json();
    console.log('=== UPDATING EVENT DATA ===');
    console.log('PertanyaanTambahan:', JSON.stringify(data.pertanyaanTambahan, null, 2));
    console.log('Is Array?', Array.isArray(data.pertanyaanTambahan));
    console.log('Length:', data.pertanyaanTambahan?.length);
    console.log('Sponsor:', JSON.stringify(data.sponsor, null, 2));
    
    // Prepare pertanyaanTambahan
    let pertanyaanTambahanToSave: string | null = null;
    if (data.pertanyaanTambahan && Array.isArray(data.pertanyaanTambahan) && data.pertanyaanTambahan.length > 0) {
      pertanyaanTambahanToSave = JSON.stringify(data.pertanyaanTambahan);
      console.log('PertanyaanTambahan will be saved:', pertanyaanTambahanToSave);
    } else {
      console.log('PertanyaanTambahan will NOT be saved (empty or invalid)');
    }
    
    // Prepare sponsor
    let sponsorToSave: string | null = null;
    if (data.sponsor && Array.isArray(data.sponsor) && data.sponsor.length > 0) {
      sponsorToSave = JSON.stringify(data.sponsor);
      console.log('Sponsor will be saved:', sponsorToSave);
    }
    
    const event = await db.event.update({
      where: { id: params.id },
      data: {
        kodeEvent: data.kodeEvent,
        namaEvent: data.namaEvent,
        pemateri: JSON.stringify(data.pemateri),
        tema: data.tema,
        deskripsi: data.deskripsi || null,
        waktuEvent: JSON.stringify(data.waktuEvent),
        jenisKepesertaan: JSON.stringify(data.jenisKepesertaan),
        benefit: JSON.stringify(data.benefit),
        kodeVoucher: data.kodeVoucher ? JSON.stringify(data.kodeVoucher) : null,
        pertanyaanTambahan: pertanyaanTambahanToSave,
        sponsor: sponsorToSave,
        flyerImage: data.flyerImage,
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