import { Persona, AIModelOption } from '@/types';
import { AI_NAME, AI_TAGLINE, CORE_SYSTEM_PROMPT, CREATOR_NAME, CREATOR_ROLE } from './brand';

export { AI_NAME, AI_TAGLINE, CORE_SYSTEM_PROMPT, CREATOR_NAME, CREATOR_ROLE };
export const AI_SYSTEM_NAME = AI_NAME;

export const FREE_AI_MODELS: AIModelOption[] = [
  {
    id: 'auto',
    name: AI_NAME,
    provider: CREATOR_NAME,
    tag: 'Default',
    description: 'A general-purpose assistant that answers in your language.',
    isFree: true,
    bestFor: 'Chat, coding, writing, translation',
  },
];

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'liora',
    name: AI_NAME,
    tagline: AI_TAGLINE,
    avatar: '✦',
    color: '#6D5EF6',
    creator: CREATOR_NAME,
    systemPrompt: CORE_SYSTEM_PROMPT,
    traits: {
      warmth: 80,
      sarcasm: 8,
      technicalRigor: 90,
      creativity: 85,
      verbosity: 55,
      speed: 1,
      pitch: 1,
    },
    voiceGender: 'neural',
  },
];
