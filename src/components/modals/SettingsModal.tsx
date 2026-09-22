'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Key, Save, Trash2, X } from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { AI_NAME } from '@/lib/brand';
import { AI_MODELS, AIModelId } from '@/lib/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  activeModel: AIModelId;
  onSelectModel: (id: AIModelId) => void;
  onOpenCreator?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearHistory,
  activeModel,
  onSelectModel,
  onOpenCreator,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) setApiKey(StorageService.getGeminiApiKey());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    StorageService.setGeminiApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#80868b] hover:text-[#1f1f1f] rounded-full hover:bg-[#f1f3f4]"
        >
          <X size={16} />
        </button>

        <h2 className="text-lg font-medium text-[#1f1f1f]">Settings</h2>
        <p className="text-sm text-[#80868b] mt-1">Pick a model, or leave Auto.</p>

        <div className="mt-5 space-y-2">
          {AI_MODELS.map((model) => {
            const selected = activeModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onSelectModel(model.id);
                  StorageService.setActiveModel(model.id);
                }}
                className={`w-full text-left p-3 rounded-2xl border ${
                  selected ? 'border-[#1a73e8] bg-[#e8f0fe]' : 'border-[#dadce0] hover:bg-[#f8fafc]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[#1f1f1f]">{model.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#444746] border border-[#dadce0]">
                    {model.tag}
                  </span>
                </div>
                <p className="text-xs text-[#80868b] mt-1">{model.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium text-[#1f1f1f] flex items-center gap-1.5 mb-2">
            <Key size={14} className="text-[#1a73e8]" />
            Gemini API key (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza… or AQ."
              className="flex-1 bg-[#f8fafc] border border-[#dadce0] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#1a73e8]"
            />
            <button
              onClick={handleSaveKey}
              className="px-3 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm flex items-center gap-1"
            >
              <Save size={13} /> Save
            </button>
          </div>
          {saved && (
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
              <CheckCircle2 size={12} /> Saved
            </p>
          )}
          <p className="text-[11px] text-[#80868b] mt-2">
            Auto uses this key when present. Fast, Llama, and Mistral stay free without a key.
          </p>
          <a href="/admin" className="inline-block mt-3 text-xs text-[#1a73e8] mr-4">
            Open admin panel
          </a>
          {onOpenCreator && (
            <button type="button" onClick={onOpenCreator} className="inline-block mt-3 text-xs text-[#1a73e8]">
              About the creator
            </button>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#dadce0] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Clear this chat?')) {
                onClearHistory();
                onClose();
              }
            }}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5"
          >
            <Trash2 size={13} /> Clear chat
          </button>
          <button onClick={onClose} className="px-4 py-1.5 rounded-full bg-[#f1f3f4] text-sm font-medium">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
