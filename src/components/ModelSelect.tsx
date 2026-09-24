'use client';

import React from 'react';
import { AI_MODELS, AIModelId } from '@/lib/models';

interface ModelSelectProps {
  value: AIModelId;
  onChange: (id: AIModelId) => void;
  compact?: boolean;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({ value, onChange, compact }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AIModelId)}
      title="Choose AI model"
      className={
        compact
          ? 'text-[11.5px] sm:text-xs font-medium text-[#444746] bg-transparent px-1.5 sm:px-2 py-1 rounded-full hover:bg-[#f1f3f4] focus:outline-none cursor-pointer max-w-[76px] sm:max-w-[92px] truncate shrink-0'
          : 'w-full bg-white border border-[#dadce0] rounded-xl px-3 py-2 text-sm text-[#1f1f1f] focus:outline-none focus:border-[#1a73e8]'
      }
    >
      {AI_MODELS.map((model) => (
        <option key={model.id} value={model.id}>
          {compact ? model.name : `${model.name}${model.tag ? ` · ${model.tag}` : ''}`}
        </option>
      ))}
    </select>
  );
};
