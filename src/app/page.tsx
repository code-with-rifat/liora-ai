'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { ActiveTab } from '@/components/Header';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ImageStudio } from '@/components/image/ImageStudio';
import { MediaGallery } from '@/components/gallery/MediaGallery';
import { CreatorModal } from '@/components/modals/CreatorModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { AuthUser } from '@/components/modals/AuthModal';
import { ChatMessage, Conversation, MediaAsset } from '@/types';
import { DEFAULT_PERSONAS } from '@/lib/persona-presets';
import { StorageService, conversationTitle, createEmptyConversation } from '@/lib/storage';
import { detectLanguageLock, ReplyLanguage } from '@/lib/language';
import { AIModelId } from '@/lib/models';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<Conversation>(() => createEmptyConversation());
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeModel, setActiveModel] = useState<AIModelId>('auto');
  const conversationRef = useRef(conversation);
  const userRef = useRef(user);
  const processingRef = useRef(false);

  const persona = DEFAULT_PERSONAS[0];
  conversationRef.current = conversation;
  userRef.current = user;

  const loadLocal = () => {
    const list = StorageService.getConversations();
    const activeId = StorageService.getActiveConversationId();
    const active = list.find((c) => c.id === activeId) || list[0];
    setConversations(list);
    setConversation(active || createEmptyConversation());
    setMediaAssets(StorageService.getMediaAssets());
    setActiveModel(StorageService.getActiveModel());
  };

  const applyAccount = async (nextUser: AuthUser | null, migrateGuest = false) => {
    const guestChats = StorageService.getUserScope() === 'guest' ? StorageService.getConversations() : [];
    setUser(nextUser);
    userRef.current = nextUser;
    StorageService.setUserScope(nextUser?.id || null);
    if (nextUser) {
      const remote = await fetch('/api/conversations').then((r) => r.json());
      const serverList: Conversation[] = remote.conversations || [];
      if (serverList.length) {
        StorageService.saveConversations(serverList);
        setConversations(serverList);
        setConversation(serverList[0] || createEmptyConversation());
        setMediaAssets(StorageService.getMediaAssets());
        return;
      }
      if (migrateGuest && guestChats.length) {
        StorageService.saveConversations(guestChats);
        await Promise.all(
          guestChats.map((c) =>
            fetch('/api/conversations', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(c),
            })
          )
        );
        setConversations(guestChats);
        setConversation(guestChats[0] || createEmptyConversation());
        setMediaAssets(StorageService.getMediaAssets());
        return;
      }
    }
    loadLocal();
  };

  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) setSidebarOpen(true);
    (async () => {
      try {
        const me = await fetch('/api/auth/me').then((r) => r.json());
        await applyAccount(me.user || null);
      } catch {
        loadLocal();
      }
      if (!isDesktop) {
        const fresh = createEmptyConversation();
        setConversation(fresh);
        conversationRef.current = fresh;
        setActiveTab('chat');
      }
    })();
  }, []);

  const persist = (next: Conversation, writeList = true) => {
    const stored = next.messages.some((m) => m.role === 'user')
      ? { ...next, title: conversationTitle(next.messages), updatedAt: Date.now() }
      : next;
    setConversation(stored);
    conversationRef.current = stored;
    if (writeList && stored.messages.some((m) => m.role === 'user')) {
      setConversations((prev) => StorageService.upsertConversation(stored, prev));
      if (userRef.current) {
        fetch('/api/conversations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stored),
        }).catch(() => {});
      }
    }
  };

  const handleNewChat = () => {
    const current = conversationRef.current;
    if (current.messages.some((m) => m.role === 'user')) {
      setConversations((prev) => StorageService.upsertConversation(current, prev));
    }
    const fresh = createEmptyConversation();
    StorageService.setActiveConversationId(fresh.id);
    setConversation(fresh);
    conversationRef.current = fresh;
    setActiveTab('chat');
  };

  const handleSelectConversation = (id: string) => {
    const found = conversations.find((c) => c.id === id);
    if (!found) return;
    StorageService.setActiveConversationId(id);
    setConversation(found);
    conversationRef.current = found;
    setActiveTab('chat');
  };

  const handleSendMessage = async (
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ) => {
    if (!text.trim() && !mediaUrl) return;
    if (processingRef.current) return;
    processingRef.current = true;

    const current = conversationRef.current;
    const lock = detectLanguageLock(text) || current.language;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaUrl,
      mediaType,
    };

    const botId = `bot-${Date.now()}`;
    const nextMessages = [...current.messages, userMsg];
    persist({ ...current, messages: nextMessages, language: lock });
    setIsProcessing(true);
    setActiveTab('chat');

    try {
      const apiKey = StorageService.getGeminiApiKey();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          apiKey: apiKey || undefined,
          language: lock,
          modelId: StorageService.getActiveModel(),
        }),
      });

      if (!res.body) throw new Error('No response body');

      persist({
        ...conversationRef.current,
        language: lock,
        messages: [
          ...nextMessages,
          {
            id: botId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            personaId: persona.id,
          },
        ],
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assembled = '';
      let mediaFromStream: { url?: string; type?: 'image' | 'video'; language?: ReplyLanguage } = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.type === 'delta' && payload.text) {
            assembled += payload.text;
            const live = conversationRef.current;
            persist({
              ...live,
              language: lock,
              messages: live.messages.map((m) =>
                m.id === botId ? { ...m, content: assembled } : m
              ),
            }, false);
          }
          if (payload.type === 'done') {
            assembled = payload.text || assembled;
            mediaFromStream = {
              url: payload.mediaUrl,
              type: payload.mediaType,
              language: payload.language,
            };
            const live = conversationRef.current;
            persist({
              ...live,
              language: (payload.language as Conversation['language']) || lock,
              messages: live.messages.map((m) =>
                m.id === botId
                  ? {
                      ...m,
                      content: assembled,
                      modelUsed: payload.modelUsed,
                      mediaUrl: payload.mediaUrl,
                      mediaType: payload.mediaType,
                    }
                  : m
              ),
            });
          }
          if (payload.type === 'error') throw new Error(payload.error);
        }
      }

      if (mediaFromStream.url && mediaFromStream.type === 'image') {
        handleMediaGenerated({
          id: `img-${Date.now()}`,
          type: 'image',
          url: mediaFromStream.url,
          prompt: text,
          aspectRatio: '1:1',
          createdAt: new Date().toLocaleTimeString(),
          creator: persona.creator,
        });
      }
    } catch {
      const live = conversationRef.current;
      const hasBot = live.messages.some((m) => m.id === botId);
      const errorMsg: ChatMessage = {
        id: botId,
        role: 'assistant',
        content:
          'এই মুহূর্তে উত্তর আনতে পারছি না। একটু পরে আবার চেষ্টা করুন। / Could not reach the model. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      persist({
        ...live,
        messages: hasBot
          ? live.messages.map((m) => (m.id === botId ? errorMsg : m))
          : [...live.messages, errorMsg],
      });
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleMediaGenerated = (asset: MediaAsset) => {
    setMediaAssets((prev) => [asset, ...prev]);
    StorageService.saveMediaAsset(asset);
  };

  const recentConversations = conversations.filter((c) =>
    c.messages.some((m) => m.role === 'user')
  );

  return (
    <div className="flex h-screen w-full bg-[#fafafa] text-zinc-900 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewChat={handleNewChat}
        onOpenSettings={() => setSettingsModalOpen(true)}
        conversations={recentConversations}
        activeConversationId={conversation.id}
        onSelectConversation={handleSelectConversation}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafafa]">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenCreatorModal={() => setCreatorModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          activeModel={activeModel}
          onSelectModel={(id) => {
            setActiveModel(id);
            StorageService.setActiveModel(id);
          }}
          user={user}
          onSignOut={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            await applyAccount(null);
          }}
        />

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chat' && (
            <ChatPanel
              messages={conversation.messages}
              onSendMessage={handleSendMessage}
              activePersona={persona}
              isProcessing={isProcessing}
              onSelectTab={setActiveTab}
              activeModel={activeModel}
              onSelectModel={(id) => {
                setActiveModel(id);
                StorageService.setActiveModel(id);
              }}
              userName={user?.name}
            />
          )}
          {activeTab === 'image' && (
            <div className="p-4">
              <ImageStudio onMediaGenerated={handleMediaGenerated} />
            </div>
          )}
          {activeTab === 'gallery' && (
            <div className="p-4">
              <MediaGallery assets={mediaAssets} />
            </div>
          )}
        </div>
      </div>

      <CreatorModal isOpen={creatorModalOpen} onClose={() => setCreatorModalOpen(false)} />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onClearHistory={handleNewChat}
        activeModel={activeModel}
        onSelectModel={(id) => {
          setActiveModel(id);
          StorageService.setActiveModel(id);
        }}
        onOpenCreator={() => {
          setSettingsModalOpen(false);
          setCreatorModalOpen(true);
        }}
      />
    </div>
  );
}
