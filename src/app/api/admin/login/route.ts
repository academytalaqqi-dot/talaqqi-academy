import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Cari admin berdasarkan email
    const admin = await db.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Buat token sederhana (dalam production, gunakan JWT yang lebih aman)
    const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');

    // Hapus password dari response
    const { password: _, ...adminData } = admin;

    return NextResponse.json({
      message: 'Login berhasil',
      token,
      admin: adminData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}