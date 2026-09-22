export type MessageRole = 'user' | 'assistant' | 'system';

export type AIModelId = 'auto' | 'gemini' | 'fast' | 'llama' | 'mistral' | 'qwen';

export interface AIModelOption {
  id: AIModelId;
  name: string;
  provider: string;
  tag: string;
  description: string;
  isFree: boolean;
  bestFor: string;
}

export interface ToolAction {
  id: string;
  type: 'terminal' | 'editor' | 'browser' | 'image_gen' | 'video_gen';
  title: string;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  env: 'terminal' | 'editor' | 'browser';
  action: string;
  target?: string;
  content?: string;
  result?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

export interface WorkflowPlan {
  id: string;
  goal: string;
  steps: WorkflowStep[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStepIndex: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  personaId?: string;
  modelUsed?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  audioBlobUrl?: string;
  tools?: ToolAction[];
  workflowPlan?: WorkflowPlan;
}

export type ConversationLanguage = 'bn' | 'banglish' | 'en' | 'mix' | 'other' | null;

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  language: ConversationLanguage;
  updatedAt: number;
}

export interface PersonaTraits {
  warmth: number;
  sarcasm: number;
  technicalRigor: number;
  creativity: number;
  verbosity: number;
  speed: number;
  pitch: number;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  color: string;
  creator: string;
  systemPrompt: string;
  traits: PersonaTraits;
  voiceGender: 'male' | 'female' | 'neural';
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:2';

export interface ImageGenParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  style: string;
  cfgScale: number;
  steps: number;
  seed: number;
  enhancePrompt?: boolean;
}

export type CameraMotion = 
  | 'cinematic-orbit'
  | 'drone-flythrough'
  | 'zoom-in-dramatic'
  | 'pan-horizontal'
  | 'tilt-upward'
  | 'glitch-hyperlapse'
  | 'dolly-zoom';

export interface VideoGenParams {
  prompt: string;
  motion: CameraMotion;
  durationSeconds: number;
  fps: number;
  aspectRatio: AspectRatio;
  style: string;
  audioTrack: 'cyber-ambient' | 'synthwave-pulse' | 'orchestral-epic' | 'none';
  initialImageUrl?: string;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  createdAt: string;
  duration?: number;
  style?: string;
  motion?: string;
  seed?: number;
  creator: string;
}

export interface TerminalLog {
  id: string;
  type: 'stdin' | 'stdout' | 'stderr' | 'system';
  text: string;
  timestamp: string;
}

export interface EditorFile {
  name: string;
  path: string;
  language: 'typescript' | 'python' | 'html' | 'css' | 'json' | 'markdown';
  content: string;
}
