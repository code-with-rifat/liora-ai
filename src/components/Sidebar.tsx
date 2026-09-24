'use client';

import React from 'react';
import {
  ChevronLeft,
  FolderHeart,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '@/components/Header';
import { Conversation } from '@/types';
import { CREATOR_NAME } from '@/lib/brand';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onSelectTab,
  onNewChat,
  onOpenSettings,
  conversations,
  activeConversationId,
  onSelectConversation,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) onToggle();
  };

  const navBtn = (tab: ActiveTab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => handleTabClick(tab)}
      title={label}
      className={`w-full px-3 py-2.5 rounded-full text-[14px] flex items-center gap-3 transition-colors ${
        activeTab === tab
          ? 'bg-white text-[#1f1f1f] font-medium shadow-sm'
          : 'text-[#444746] hover:bg-white/70'
      } ${!isOpen ? 'justify-center px-0' : ''}`}
    >
      {icon}
      {isOpen && <span>{label}</span>}
    </button>
  );

  return (
    <>
      {isOpen && <div onClick={onToggle} className="fixed inset-0 bg-black/10 z-40 lg:hidden" />}

      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen bg-[#f0f4f9] transition-all duration-300 flex flex-col ${
          isOpen ? 'w-[280px]' : 'w-0 lg:w-[72px] overflow-hidden'
        }`}
      >
        <div className="p-3 flex flex-col gap-2 flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => {
                onNewChat();
                handleTabClick('chat');
              }}
              className={`flex-1 h-12 px-4 rounded-full bg-white hover:bg-[#e9eef6] text-[#1f1f1f] text-[14px] font-medium flex items-center gap-3 shadow-sm ${
                !isOpen ? 'justify-center px-0' : ''
              }`}
            >
              <Plus size={20} strokeWidth={2} className="text-[#444746] shrink-0" />
              {isOpen && <span>New chat</span>}
            </button>
            {isOpen && (
              <button
                onClick={onToggle}
                className="w-10 h-10 rounded-full text-[#444746] hover:bg-white flex items-center justify-center"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          <nav className="space-y-0.5 mt-1">
            {navBtn('chat', <MessageSquare size={18} />, 'Chat')}
            {navBtn('image', <ImageIcon size={18} />, 'Images')}
            {navBtn('gallery', <FolderHeart size={18} />, 'Gallery')}
          </nav>

          {isOpen && conversations.length > 0 && (
            <div className="mt-5 flex-1 overflow-y-auto pr-1">
              <div className="text-[11px] font-medium text-[#80868b] px-3 mb-2 tracking-wide">
                Recent
              </div>
              {conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    onSelectConversation(chat.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-full text-[13px] truncate ${
                    chat.id === activeConversationId
                      ? 'bg-white text-[#1f1f1f]'
                      : 'text-[#444746] hover:bg-white/80'
                  }`}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {isOpen && (
          <div className="px-3 pb-1">
            <div className="p-2.5 rounded-2xl bg-white/70 border border-[#e8eaed] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                R
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-semibold text-zinc-900 truncate">
                    {CREATOR_NAME}
                  </span>
                  <Sparkles size={11} className="text-[#1a73e8] shrink-0" />
                </div>
                <span className="text-[10.5px] text-zinc-500 font-medium truncate">
                  Sole Creator &amp; Architect
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 pt-1">
          <button
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth < 1024) onToggle();
            }}
            className={`w-full p-2 rounded-full text-[#444746] hover:bg-white text-[13px] flex items-center gap-3 ${
              !isOpen ? 'justify-center px-0' : ''
            }`}
          >
            <Settings size={18} />
            {isOpen && <span>Settings &amp; help</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
