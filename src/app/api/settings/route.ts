import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.settings.findFirst();
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        id: 'default',
        themeColor: 'emerald',
        landingPageRedaction: '',
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { themeColor, landingPageRedaction } = await request.json();

    // Check if settings already exist
    const existingSettings = await db.settings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing settings
      const updateData: any = {};
      if (themeColor !== undefined) updateData.themeColor = themeColor;
      if (landingPageRedaction !== undefined) updateData.landingPageRedaction = landingPageRedaction;

      settings = await db.settings.update({
        where: { id: existingSettings.id },
        data: updateData,
      });
    } else {
      // Create new settings
      const createData: any = {};
      if (themeColor !== undefined) createData.themeColor = themeColor;
      if (landingPageRedaction !== undefined) createData.landingPageRedaction = landingPageRedaction;

      settings = await db.settings.create({
        data: createData,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
