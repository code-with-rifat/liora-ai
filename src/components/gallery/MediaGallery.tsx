'use client';

import React, { useState } from 'react';
import { Download, Maximize2 } from 'lucide-react';
import { MediaAsset } from '@/types';

interface MediaGalleryProps {
  assets: MediaAsset[];
  onSelectAsset?: (asset: MediaAsset) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ assets }) => {
  const [activeMedia, setActiveMedia] = useState<MediaAsset | null>(null);
  const images = assets.filter((a) => a.type === 'image');

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Gallery</h2>
        <p className="text-sm text-zinc-500 mt-1">{images.length} images</p>
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-500">
          No images yet. Generate one from chat or the Images tab.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setActiveMedia(asset)}
              className="rounded-2xl overflow-hidden border border-zinc-200 bg-white text-left group"
            >
              <div className="aspect-square overflow-hidden relative">
                <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <Maximize2 className="text-white" size={20} />
                </div>
              </div>
              <p className="p-2 text-xs text-zinc-600 line-clamp-2">{asset.prompt}</p>
            </button>
          ))}
        </div>
      )}

      {activeMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setActiveMedia(null)}
        >
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={activeMedia.url} alt={activeMedia.prompt} className="w-full max-h-[75vh] object-contain rounded-xl" />
            <div className="mt-3 flex items-center justify-between text-white text-sm">
              <p className="line-clamp-2 pr-4">{activeMedia.prompt}</p>
              <a href={activeMedia.url} download={`liora_${activeMedia.id}.jpg`} className="flex items-center gap-1 shrink-0">
                <Download size={14} /> Save
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
