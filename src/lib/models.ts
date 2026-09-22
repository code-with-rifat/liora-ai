export type AIModelId = 'auto' | 'gemini' | 'fast' | 'llama' | 'mistral' | 'qwen';

export interface AIModelOption {
  id: AIModelId;
  name: string;
  tag: string;
  description: string;
  needsKey?: boolean;
}

export const AI_MODELS: AIModelOption[] = [
  {
    id: 'auto',
    name: 'Auto',
    tag: 'Recommended',
    description: 'Uses Gemini when a key is set, otherwise a fast free model.',
  },
  {
    id: 'gemini',
    name: 'Gemini Flash',
    tag: 'Key',
    description: 'Google Gemini — strongest replies if an API key is available.',
    needsKey: true,
  },
  {
    id: 'fast',
    name: 'Fast',
    tag: 'Free',
    description: 'Free public chat model. No key required.',
  },
  {
    id: 'llama',
    name: 'Llama',
    tag: 'Free',
    description: 'Open Llama model via a free endpoint.',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    tag: 'Free',
    description: 'Mistral model via a free endpoint.',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    tag: 'Free',
    description: 'Qwen chat model via a free endpoint.',
  },
];

export const AI_MODEL_IDS: AIModelId[] = AI_MODELS.map((m) => m.id);

export function isAIModelId(value: unknown): value is AIModelId {
  return typeof value === 'string' && AI_MODEL_IDS.includes(value as AIModelId);
}

export function modelLabel(id: AIModelId): string {
  return AI_MODELS.find((m) => m.id === id)?.name || 'Auto';
}

export function resolveChatModel(
  selected: AIModelId,
  hasGeminiKey: boolean
): Exclude<AIModelId, 'auto'> {
  if (selected === 'auto') return hasGeminiKey ? 'gemini' : 'fast';
  if (selected === 'gemini' && !hasGeminiKey) return 'fast';
  return selected;
}
