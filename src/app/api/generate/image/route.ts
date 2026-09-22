import { NextRequest, NextResponse } from 'next/server';
import { CREATOR_NAME } from '@/lib/brand';
import { AspectRatio } from '@/types';
import { publicImagePath } from '@/lib/image-clean';
import { getSettings } from '@/lib/app-store';

function getDimensions(ratio: AspectRatio): { width: number; height: number } {
  switch (ratio) {
    case '16:9':
      return { width: 1024, height: 576 };
    case '9:16':
      return { width: 576, height: 1024 };
    case '4:3':
      return { width: 1024, height: 768 };
    case '3:2':
      return { width: 1024, height: 682 };
    case '1:1':
    default:
      return { width: 768, height: 768 };
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await getSettings();
    if (!settings.allowImageGen) {
      return NextResponse.json({ success: false, error: 'Image generation is disabled' }, { status: 403 });
    }

    const body = await req.json();
    const {
      prompt,
      negativePrompt,
      aspectRatio = '1:1',
      style = 'Photo',
      seed = Math.floor(Math.random() * 1000000),
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'A text prompt is required' }, { status: 400 });
    }

    const { width, height } = getDimensions(aspectRatio);
    const imageUrl = publicImagePath(prompt.trim(), width, height, seed);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      negativePrompt,
      aspectRatio,
      dimensions: { width, height },
      style,
      seed,
      creator: CREATOR_NAME,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  }
}
