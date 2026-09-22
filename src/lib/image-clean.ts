import { getSettings } from './app-store';

export function sourceImageUrl(prompt: string, width: number, height: number, seed: number) {
  const encoded = encodeURIComponent(
    `${prompt.slice(0, 380)}, no watermark, no logo, no signature, no text overlay`
  );
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: 'true',
    nofeed: 'true',
    private: 'true',
    model: 'turbo',
  });
  const token = process.env.POLLINATIONS_TOKEN;
  if (token) params.set('token', token);
  return `https://image.pollinations.ai/prompt/${encoded}?${params.toString()}`;
}

export function publicImagePath(prompt: string, width: number, height: number, seed: number) {
  const params = new URLSearchParams({
    prompt: prompt.slice(0, 380),
    width: String(width),
    height: String(height),
    seed: String(seed),
  });
  return `/api/image?${params.toString()}`;
}

export async function generateCleanImage(
  prompt: string,
  width: number,
  height: number,
  seed: number
): Promise<Buffer> {
  const settings = await getSettings();
  const url = sourceImageUrl(prompt, width, height, seed);
  const token = process.env.POLLINATIONS_TOKEN;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Image source failed (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!settings.stripWatermark) return buf;

  try {
    const sharp = (await import('sharp')).default;
    const meta = await sharp(buf).metadata();
    const w = meta.width || width;
    const h = meta.height || height;
    const cut = Math.min(h - 8, Math.max(56, Math.round(h * 0.08)));
    return await sharp(buf)
      .extract({ left: 0, top: 0, width: w, height: h - cut })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch (err) {
    console.warn('Watermark crop failed, returning source image', err);
    return buf;
  }
}
