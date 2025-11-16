import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }
) {
  try {
    const { status } = await request.json();
    
    const pendaftaran = await db.pendaftaran.update({
      where: { id: params.id },
      data: { status },
      include: {
        event: true
      }
    });

    return NextResponse.json(pendaftaran);
  } catch (error) {
    console.error('Error updating pendaftaran:', error);
    return NextResponse.json({ error: 'Failed to update pendaftaran' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }
) {
  try {
    await db.pendaftaran.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Pendaftaran deleted successfully' });
  } catch (error) {
    console.error('Error deleting pendaftaran:', error);
    return NextResponse.json({ error: 'Failed to delete pendaftaran' }, { status: 500 });
  }
}