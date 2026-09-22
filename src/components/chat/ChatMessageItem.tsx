'use client';

import React, { useState } from 'react';
import { Check, Copy, RefreshCw, Volume2 } from 'lucide-react';
import { ChatMessage, Persona } from '@/types';
import { MarkdownBody } from '@/lib/markdown';
import { speechLangFor } from '@/lib/language';

interface ChatMessageItemProps {
  message: ChatMessage;
  persona: Persona;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content.replace(/[*`#_]/g, ''));
    utterance.lang = speechLangFor(message.content);
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (match) utterance.voice = match;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} py-1`}>
      <div className={`flex flex-col max-w-[90%] md:max-w-[80%] ${isUser ? '' : 'w-full'}`}>
        {isUser ? (
          <div className="bg-zinc-100 text-zinc-900 rounded-3xl rounded-tr-md px-4 py-3 text-[15px] leading-7 whitespace-pre-wrap">
            {message.content}
          </div>
        ) : (
          <MarkdownBody text={message.content} />
        )}

        {message.mediaUrl && (
          <ChatMedia url={message.mediaUrl} type={message.mediaType} />
        )}

        {!isUser && (
          <div className="flex items-center gap-1 mt-2 text-zinc-400">
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-full hover:bg-zinc-100 hover:text-zinc-700"
              title="Listen"
            >
              <Volume2 size={14} />
            </button>
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-full hover:bg-zinc-100 hover:text-zinc-700"
              title="Copy"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function ChatMedia({ url, type }: { url: string; type?: ChatMessage['mediaType'] }) {
  const [loaded, setLoaded] = useState(false);

  if (type === 'video') {
    return (
      <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 max-w-md">
        <video src={url} controls className="w-full h-auto" />
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 max-w-md relative min-h-[180px] bg-zinc-50">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#80868b]">
          <RefreshCw className="animate-spin text-[#1a73e8]" size={18} />
          <span className="text-xs">Creating image…</span>
        </div>
      )}
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        className={`w-full h-auto object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  );
}
