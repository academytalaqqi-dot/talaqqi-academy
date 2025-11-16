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
    console.log('=== RECEIVED EVENT DATA ===');
    console.log('PertanyaanTambahan:', JSON.stringify(data.pertanyaanTambahan, null, 2));
    console.log('Is Array?', Array.isArray(data.pertanyaanTambahan));
    console.log('Length:', data.pertanyaanTambahan?.length);
    console.log('Sponsor:', JSON.stringify(data.sponsor, null, 2));
    
    // Prepare pertanyaanTambahan
    let pertanyaanTambahanToSave = null;
    if (data.pertanyaanTambahan && Array.isArray(data.pertanyaanTambahan) && data.pertanyaanTambahan.length > 0) {
      pertanyaanTambahanToSave = JSON.stringify(data.pertanyaanTambahan);
      console.log('PertanyaanTambahan will be saved:', pertanyaanTambahanToSave);
    } else {
      console.log('PertanyaanTambahan will NOT be saved (empty or invalid)');
    }
    
    // Prepare sponsor
    let sponsorToSave = null;
    if (data.sponsor && Array.isArray(data.sponsor) && data.sponsor.length > 0) {
      sponsorToSave = JSON.stringify(data.sponsor);
      console.log('Sponsor will be saved:', sponsorToSave);
    }
    
    const event = await db.event.create({
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
        statusEvent: data.statusEvent || 'Pendaftaran'
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}