import { NextRequest } from 'next/server';
import { generateCleanImage } from '@/lib/image-clean';
import { getSettings } from '@/lib/app-store';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const settings = await getSettings();
    if (!settings.allowImageGen) {
      return new Response('Image generation is disabled', { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get('prompt') || '';
    const width = Math.min(1280, Math.max(256, Number(searchParams.get('width')) || 768));
    const height = Math.min(1280, Math.max(256, Number(searchParams.get('height')) || 768));
    const seed = Number(searchParams.get('seed')) || Math.floor(Math.random() * 1_000_000);

    if (!prompt.trim()) {
      return new Response('A prompt is required', { status: 400 });
    }

    const image = await generateCleanImage(prompt, width, height, seed);
    return new Response(new Uint8Array(image), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    return new Response(error.message || 'Image generation failed', { status: 500 });
  }
}
