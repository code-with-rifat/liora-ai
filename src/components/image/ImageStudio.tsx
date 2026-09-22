'use client';

import React, { useRef, useState } from 'react';
import { ArrowUp, Image as ImageIcon, Maximize2, RefreshCw } from 'lucide-react';
import { AspectRatio, ImageGenParams, MediaAsset } from '@/types';
import { CREATOR_NAME } from '@/lib/brand';
import { StorageService } from '@/lib/storage';

interface ImageStudioProps {
  onMediaGenerated: (asset: MediaAsset) => void;
  onSendToVideoStudio?: (imageUrl: string, prompt: string) => void;
}

const ASPECT_RATIOS: Array<{ id: AspectRatio; label: string }> = [
  { id: '1:1', label: '1:1' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '4:3', label: '4:3' },
];

export const ImageStudio: React.FC<ImageStudioProps> = ({ onMediaGenerated }) => {
  const [params, setParams] = useState<ImageGenParams>({
    prompt: '',
    negativePrompt: 'blurry, low quality, watermark, logo, signature, text overlay',
    aspectRatio: '1:1',
    style: 'Photo',
    cfgScale: 7.5,
    steps: 30,
    seed: Math.floor(Math.random() * 1000000),
    enhancePrompt: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const savedUrlRef = useRef<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!params.prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    savedUrlRef.current = null;
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          apiKey: StorageService.getGeminiApiKey() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] gemini-wash flex flex-col items-center px-4 pt-16 pb-10">
      <h1 className="text-[32px] sm:text-[36px] font-normal text-[#1f1f1f] text-center">Create images</h1>
      <p className="text-[15px] text-[#444746] mt-2 mb-8 text-center">
        Describe an idea. Images are generated without a watermark.
      </p>

      <form onSubmit={handleGenerate} className="w-full max-w-[720px]">
        <div className="bg-white rounded-[28px] shadow-sm border border-[#dadce0] px-3 py-3">
          <input
            value={params.prompt}
            onChange={(e) => setParams({ ...params, prompt: e.target.value })}
            placeholder="Describe your image"
            className="w-full px-3 py-2 text-[16px] text-[#1f1f1f] placeholder-[#80868b] focus:outline-none"
          />
          <div className="flex items-center justify-between mt-1 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium">
                <ImageIcon size={14} />
                Images
              </span>
              <select
                value={params.aspectRatio}
                onChange={(e) => setParams({ ...params, aspectRatio: e.target.value as AspectRatio })}
                className="text-xs text-[#444746] bg-transparent px-2 py-1.5 rounded-full hover:bg-[#f1f3f4] focus:outline-none"
              >
                {ASPECT_RATIOS.map((ar) => (
                  <option key={ar.id} value={ar.id}>
                    Aspect {ar.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isGenerating || !params.prompt.trim()}
              className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center disabled:opacity-30"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <ArrowUp size={18} />}
            </button>
          </div>
        </div>
      </form>

      <div className="w-full max-w-[720px] mt-8 min-h-[280px] relative flex items-center justify-center">
        {generatedImage && (
          <div className={`relative w-full flex justify-center ${isGenerating ? 'opacity-0 pointer-events-none absolute' : ''}`}>
            <img
              src={generatedImage}
              alt={params.prompt}
              referrerPolicy="no-referrer"
              className="max-h-[520px] w-auto object-contain rounded-2xl shadow-sm cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              onLoad={() => {
                setIsGenerating(false);
                if (savedUrlRef.current === generatedImage) return;
                savedUrlRef.current = generatedImage;
                onMediaGenerated({
                  id: `img-${Date.now()}`,
                  type: 'image',
                  url: generatedImage,
                  prompt: params.prompt,
                  aspectRatio: params.aspectRatio,
                  createdAt: new Date().toLocaleTimeString(),
                  style: params.style,
                  seed: params.seed,
                  creator: CREATOR_NAME,
                });
              }}
              onError={() => setIsGenerating(false)}
            />
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 border border-[#dadce0]"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        )}
        {isGenerating && (
          <div className="flex flex-col items-center gap-3 text-[#80868b]">
            <RefreshCw className="animate-spin text-[#1a73e8]" size={22} />
            <span className="text-sm">Creating image…</span>
          </div>
        )}
        {!isGenerating && !generatedImage && (
          <p className="text-sm text-[#80868b]">Try a template or describe an idea.</p>
        )}
      </div>

      {lightboxOpen && generatedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setLightboxOpen(false)}
        >
          <img src={generatedImage} alt="" className="max-h-[90vh] max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
};
