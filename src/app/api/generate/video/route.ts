import { NextRequest, NextResponse } from 'next/server';
import { CREATOR_NAME } from '@/lib/persona-presets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      motion = 'cinematic-orbit',
      durationSeconds = 5,
      fps = 30,
      aspectRatio = '16:9',
      style = 'Cinematic',
      audioTrack = 'cyber-ambient',
      initialImageUrl,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required for video synthesis' },
        { status: 400 }
      );
    }

    const duration = Math.min(Math.max(durationSeconds, 3), 10);

    return NextResponse.json({
      success: true,
      jobId: `vid-${Date.now()}`,
      prompt,
      motion,
      durationSeconds: duration,
      fps,
      aspectRatio,
      style,
      audioTrack,
      initialImageUrl,
      creator: CREATOR_NAME,
      message: `Video synthesis sequence for ${duration}s initialized successfully.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/generate/video error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Video synthesis initialization failed' },
      { status: 500 }
    );
  }
}
