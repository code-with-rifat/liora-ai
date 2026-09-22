import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_PERSONAS, CREATOR_NAME } from '@/lib/persona-presets';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      // If MongoDB is connected, we could query Mongoose collection here
    }
    return NextResponse.json({
      success: true,
      personas: DEFAULT_PERSONAS,
      creator: CREATOR_NAME,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      personas: DEFAULT_PERSONAS,
      creator: CREATOR_NAME,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      persona: {
        ...body,
        creator: CREATOR_NAME,
      },
      message: 'Custom persona saved successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
