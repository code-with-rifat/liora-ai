import { AIModelId, ChatMessage, Conversation, MediaAsset, Persona } from '@/types';
import { DEFAULT_PERSONAS } from './persona-presets';
import { isAIModelId } from './models';

let userScope = 'guest';

const KEYS = {
  GEMINI_API_KEY: 'liora_gemini_key',
  ACTIVE_MODEL: 'liora_active_model',
};

function scoped(name: string) {
  return `liora_${name}_${userScope}`;
}

function newId() {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function conversationTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user' && m.content.trim());
  if (!first) return 'New chat';
  return first.content.replace(/\s+/g, ' ').trim().slice(0, 48);
}

export const StorageService = {
  setUserScope(userId: string | null) {
    userScope = userId || 'guest';
  },

  getUserScope() {
    return userScope;
  },

  getConversations(): Conversation[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(scoped('conversations'));
      if (data) return JSON.parse(data);

      if (userScope === 'guest') {
        const old = localStorage.getItem('liora_conversations');
        if (old) {
          localStorage.setItem(scoped('conversations'), old);
          localStorage.removeItem('liora_conversations');
          return JSON.parse(old);
        }
        const legacy = localStorage.getItem('liora_messages');
        if (legacy) {
          const messages: ChatMessage[] = JSON.parse(legacy);
          if (messages.length) {
            const migrated: Conversation = {
              id: newId(),
              title: conversationTitle(messages),
              messages,
              language: null,
              updatedAt: Date.now(),
            };
            this.saveConversations([migrated]);
            this.setActiveConversationId(migrated.id);
            localStorage.removeItem('liora_messages');
            return [migrated];
          }
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  saveConversations(list: Conversation[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(scoped('conversations'), JSON.stringify(list.slice(0, 40)));
    } catch (e) {
      console.warn('Failed to persist conversations', e);
    }
  },

  upsertConversation(conversation: Conversation, all: Conversation[]): Conversation[] {
    const next = [conversation, ...all.filter((c) => c.id !== conversation.id)].sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    this.saveConversations(next);
    this.setActiveConversationId(conversation.id);
    return next;
  },

  getActiveConversationId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(scoped('active'));
  },

  setActiveConversationId(id: string | null) {
    if (typeof window === 'undefined') return;
    if (id) localStorage.setItem(scoped('active'), id);
    else localStorage.removeItem(scoped('active'));
  },

  getMessages(): ChatMessage[] {
    const id = this.getActiveConversationId();
    const list = this.getConversations();
    return list.find((c) => c.id === id)?.messages || list[0]?.messages || [];
  },

  saveMessages(_messages: ChatMessage[]) {},

  clearMessages() {},

  getMediaAssets(): MediaAsset[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(scoped('media'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMediaAsset(asset: MediaAsset) {
    if (typeof window === 'undefined') return;
    try {
      const assets = this.getMediaAssets();
      assets.unshift(asset);
      localStorage.setItem(scoped('media'), JSON.stringify(assets.slice(0, 80)));
    } catch (e) {
      console.warn('Failed to save media asset', e);
    }
  },

  getPersonas(): Persona[] {
    return DEFAULT_PERSONAS;
  },

  savePersona(_persona: Persona) {},

  getActivePersonaId(): string {
    return 'liora';
  },

  setActivePersonaId(_id: string) {},

  getActiveModel(): AIModelId {
    if (typeof window === 'undefined') return 'auto';
    const stored = localStorage.getItem(KEYS.ACTIVE_MODEL);
    return isAIModelId(stored) ? stored : 'auto';
  },

  setActiveModel(id: AIModelId) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.ACTIVE_MODEL, id);
  },

  getGeminiApiKey(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(KEYS.GEMINI_API_KEY) || '';
  },

  setGeminiApiKey(key: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.GEMINI_API_KEY, key);
  },
};

export function createEmptyConversation(): Conversation {
  return {
    id: newId(),
    title: 'New chat',
    messages: [],
    language: null,
    updatedAt: Date.now(),
  };
}
