'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Image as ImageIcon, Lightbulb, Mic, MicOff, Paperclip, PenLine, Sparkles, X } from 'lucide-react';
import { ChatMessage, Persona } from '@/types';
import { ChatMessageItem } from './ChatMessageItem';
import { AI_NAME, CREATOR_NAME } from '@/lib/brand';
import { speechLangFor } from '@/lib/language';
import { AIModelId } from '@/lib/models';

export type StudioTab = 'chat' | 'image' | 'gallery';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  activePersona: Persona;
  isProcessing: boolean;
  onSelectTab: (tab: StudioTab) => void;
  activeModel: AIModelId;
  onSelectModel: (id: AIModelId) => void;
  userName?: string;
}

const STARTERS = [
  {
    title: 'Write something',
    subtitle: 'Draft a message, post, or email',
    prompt: 'Help me write a short, clear message introducing myself as a developer.',
    icon: PenLine,
  },
  {
    title: 'Explain a topic',
    subtitle: 'Break down an idea simply',
    prompt: 'Explain how the internet works in simple language, then give a Bangla version too.',
    icon: Lightbulb,
  },
  {
    title: 'Create an image',
    subtitle: 'Turn a prompt into a picture',
    prompt: 'Generate an image of a quiet riverside tea stall in Bangladesh at golden hour',
    icon: ImageIcon,
  },
  {
    title: 'বাংলায় কথা বলো',
    subtitle: 'Chat in Bangla or Banglish',
    prompt: 'বাংলায় কথা বলো। তুমি কে আর কী কী সাহায্য করতে পারো?',
    icon: Sparkles,
  },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  activePersona,
  isProcessing,
  onSelectTab,
  activeModel,
  onSelectModel,
  userName,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sendingRef = useRef(false);

  const showHero = messages.filter((m) => m.role === 'user').length === 0;

  const scrollToBottom = (smooth = true) => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end',
        });
      }
    });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isProcessing]);

  useEffect(() => {
    if (!isProcessing) sendingRef.current = false;
  }, [isProcessing]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLangFor(inputText || 'hello');

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else currentInterim += transcript;
      }
      setInterimTranscript(currentInterim);
      if (finalTranscript.trim()) {
        if (!sendingRef.current) {
          sendingRef.current = true;
          onSendMessage(finalTranscript.trim());
        }
        setInterimTranscript('');
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [isListening, onSendMessage, inputText]);

  const toggleListening = async () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = speechLangFor(inputText || 'আমি');
        }
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Microphone error:', err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isProcessing || sendingRef.current) return;
    sendingRef.current = true;
    onSendMessage(inputText.trim(), attachedImage || undefined, attachedImage ? 'image' : undefined);
    setInputText('');
    setAttachedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    scrollToBottom(false);
    setTimeout(() => scrollToBottom(true), 30);
    setTimeout(() => scrollToBottom(true), 120);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const composer = (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-2">
      {attachedImage && (
        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#dadce0] self-start">
          <img src={attachedImage} alt="Attached" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {interimTranscript && (
        <div className="text-xs text-[#1a73e8] bg-[#e8f0fe] rounded-full px-4 py-1.5 text-center">
          {interimTranscript}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-0.5 bg-white border border-[#dadce0] focus-within:border-[#1a73e8] focus-within:shadow-md rounded-full pl-1.5 pr-1.5 py-1 shadow-sm w-full min-w-0"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-[#444746] hover:bg-[#f1f3f4] rounded-full shrink-0"
          title="Add"
        >
          <Paperclip size={18} />
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('image')}
          className="p-2 text-[#1a73e8] hover:bg-[#e8f0fe] rounded-full shrink-0"
          title="Images"
        >
          <ImageIcon size={18} />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={showHero ? `Ask ${AI_NAME}` : `Message ${AI_NAME}…`}
          className="flex-1 min-w-0 bg-transparent text-[15px] text-[#1f1f1f] placeholder-[#80868b] focus:outline-none px-2 py-2 resize-none max-h-36"
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-full shrink-0 ${
            isListening ? 'bg-red-50 text-red-500' : 'text-[#444746] hover:bg-[#f1f3f4]'
          }`}
          title="Voice"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button
          type="submit"
          disabled={(!inputText.trim() && !attachedImage) || isProcessing}
          className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center hover:bg-[#1557b0] disabled:opacity-20 shrink-0"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );

  if (showHero) {
    const first = userName?.trim().split(/\s+/)[0];
    return (
      <div className="min-h-[calc(100vh-56px)] w-full gemini-wash flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-blue-200/80 text-zinc-700 text-[12px] sm:text-[13px] font-medium shadow-xs mb-3 backdrop-blur-xs">
          <Sparkles size={14} className="text-[#1a73e8] animate-pulse shrink-0" />
          <span>Architected &amp; Created by <strong className="text-zinc-950 font-semibold">{CREATOR_NAME}</strong></span>
        </div>
        <h1 className="gemini-hello text-[36px] sm:text-[52px] font-medium tracking-tight mb-2 text-center">
          {first ? `Hello, ${first}` : 'Hello'}
        </h1>
        <p className="text-[16px] sm:text-[22px] text-[#444746] mb-6 text-center">
          How can I help you today?
        </p>
        {composer}
        <div className="mt-6 w-full max-w-[720px] grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {STARTERS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => {
                  if (isProcessing || sendingRef.current) return;
                  sendingRef.current = true;
                  onSendMessage(card.prompt);
                }}
                className="text-left bg-white/80 hover:bg-white border border-[#e8eaed] rounded-2xl sm:rounded-3xl px-4 py-3.5 sm:py-4 shadow-sm transition-all hover:shadow-md"
              >
                <Icon size={18} className="text-[#1a73e8] mb-1.5" />
                <div className="text-[13.5px] sm:text-[14px] font-medium text-[#1f1f1f]">{card.title}</div>
                <div className="text-[11.5px] sm:text-[12px] text-[#80868b] mt-0.5">{card.subtitle}</div>
              </button>
            );
          })}
        </div>
        <p className="text-center text-[11.5px] text-[#80868b] mt-6">
          ✨ Created exclusively by <strong className="text-zinc-700 font-semibold">{CREATOR_NAME}</strong> • {AI_NAME}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] w-full bg-[#fafafa]">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} persona={activePersona} />
          ))}

          {(() => {
            const last = messages[messages.length - 1];
            const waiting =
              isProcessing && (!last || last.role !== 'assistant' || !last.content);
            if (!waiting) return null;
            return (
              <div className="flex items-center gap-2 py-2 text-[#80868b] text-sm">
                <Sparkles className="animate-pulse text-[#1a73e8]" size={16} />
                <span>Thinking…</span>
              </div>
            );
          })()}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-full pb-4 px-4">
        {composer}
        <p className="text-center text-[11.5px] text-[#80868b] mt-2">
          {AI_NAME} can make mistakes • Architect &amp; Creator: <strong className="text-zinc-700 font-semibold">{CREATOR_NAME}</strong>
        </p>
      </div>
    </div>
  );
};
