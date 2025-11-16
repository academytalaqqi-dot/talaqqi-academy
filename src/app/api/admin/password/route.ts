import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Get the first (and only) admin
    const admin = await db.admin.findFirst();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Simple password check (in production, use bcrypt)
    if (admin.password !== currentPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password
    const updatedAdmin = await db.admin.update({
      where: { id: admin.id },
      data: { password: newPassword },
    });

    return NextResponse.json({
      message: 'Password updated successfully',
      email: updatedAdmin.email,
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
