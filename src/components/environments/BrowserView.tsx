'use client';

import React, { useState } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Laptop,
  Tablet,
  Smartphone,
  ShieldCheck,
  Search,
  ExternalLink,
  Code,
  Sparkles,
} from 'lucide-react';
import { CREATOR_NAME } from '@/lib/persona-presets';

export const BrowserView: React.FC = () => {
  const [url, setUrl] = useState('https://aetheris.rifat.ai/dashboard');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'dom' | 'console' | 'network'>('preview');

  const handleNavigate = (newUrl?: string) => {
    const target = newUrl || url;
    setIsLoading(true);
    setTimeout(() => {
      setUrl(target);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden border border-slate-800 bg-[#060912]">
      {/* Browser Top Navigation Bar */}
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowLeft size={14} />
          </button>
          <button className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => handleNavigate()}
            className={`p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 ${
              isLoading ? 'animate-spin text-cyan-400' : ''
            }`}
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-2 flex items-center bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1 text-xs">
          <ShieldCheck size={13} className="text-emerald-400 mr-2 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            className="flex-1 bg-transparent text-slate-200 focus:outline-none font-mono text-[11px]"
          />
          <button
            onClick={() => handleNavigate()}
            className="text-slate-400 hover:text-cyan-400 ml-1"
          >
            <Search size={13} />
          </button>
        </div>

        {/* Responsive Viewport Toggles */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`p-1.5 rounded text-xs ${
              viewportMode === 'desktop'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View (100%)"
          >
            <Laptop size={14} />
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            className={`p-1.5 rounded text-xs ${
              viewportMode === 'tablet'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`p-1.5 rounded text-xs ${
              viewportMode === 'mobile'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {/* DevTools Sub-Bar (Preview / DOM Inspector / Console / Network) */}
      <div className="px-3 py-1 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 text-[11px] font-mono">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-2 py-0.5 rounded ${
            activeTab === 'preview' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
          }`}
        >
          Viewport Preview
        </button>
        <button
          onClick={() => setActiveTab('dom')}
          className={`px-2 py-0.5 rounded ${
            activeTab === 'dom' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
          }`}
        >
          DOM Tree
        </button>
        <button
          onClick={() => setActiveTab('console')}
          className={`px-2 py-0.5 rounded ${
            activeTab === 'console' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
          }`}
        >
          Console (0)
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`px-2 py-0.5 rounded ${
            activeTab === 'network' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
          }`}
        >
          Network (200 OK)
        </button>
      </div>

      {/* Viewport Canvas */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-slate-950/60">
        <div
          className={`h-full transition-all duration-300 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col ${
            viewportMode === 'desktop'
              ? 'w-full'
              : viewportMode === 'tablet'
              ? 'w-[768px]'
              : 'w-[375px]'
          }`}
        >
          {activeTab === 'preview' ? (
            <div className="flex-1 p-6 text-white space-y-6 overflow-y-auto">
              {/* Simulated Live Web Page Interface */}
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Aetheris Autonomous Web Suite
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Architected &amp; Engineered by <strong className="text-emerald-400">{CREATOR_NAME}</strong>
                  </p>
                </div>
                <span className="badge-tag text-emerald-400 bg-emerald-950 border-emerald-500/40 text-[10px]">
                  SSL Verified
                </span>
              </div>

              {/* Status Grid in Browser */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Voice Latency</span>
                  <span className="text-lg font-bold text-cyan-400 font-mono">12ms</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Synthesis FPS</span>
                  <span className="text-lg font-bold text-purple-400 font-mono">60 FPS</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Gemini AI Engine</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">2.5 Flash</span>
                </div>
              </div>

              {/* Interactive Sandbox Cards */}
              <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} /> Agent Virtual Browser Inspection
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  This virtual browser environment allows the autonomous agent to verify web UI responsiveness, inspect DOM node hierarchies, and test cross-device layouts in real time.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Verified UI deployment by ${CREATOR_NAME}`)}
                    className="btn-neon-cyan text-xs py-1.5 px-3"
                  >
                    Run UI Verification Test
                  </button>
                  <button
                    onClick={() => handleNavigate('https://github.com')}
                    className="btn-ghost text-xs py-1.5 px-3"
                  >
                    Load External Docs
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'dom' ? (
            <div className="p-4 font-mono text-xs text-cyan-300 space-y-1">
              <div>&lt;!DOCTYPE html&gt;</div>
              <div className="pl-2">&lt;html lang=&quot;en&quot;&gt;</div>
              <div className="pl-4">&lt;head&gt;</div>
              <div className="pl-6">&lt;meta name=&quot;creator&quot; content=&quot;{CREATOR_NAME}&quot;&gt;</div>
              <div className="pl-6">&lt;title&gt;Aetheris Autonomous OS&lt;/title&gt;</div>
              <div className="pl-4">&lt;/head&gt;</div>
              <div className="pl-4">&lt;body class=&quot;cyber-bg&quot;&gt;</div>
              <div className="pl-6">&lt;div id=&quot;neural-root&quot;&gt;...&lt;/div&gt;</div>
              <div className="pl-4">&lt;/body&gt;</div>
              <div className="pl-2">&lt;/html&gt;</div>
            </div>
          ) : (
            <div className="p-4 font-mono text-xs text-slate-400 space-y-1">
              <div className="text-emerald-400">[INFO] DOM Ready in 84ms</div>
              <div className="text-cyan-400">[INFO] Gemini Multimodal WebSocket connected</div>
              <div className="text-slate-400">[HTTP] GET /api/chat 200 OK (210ms)</div>
              <div className="text-slate-400">[HTTP] POST /api/generate/video 200 OK (10.0s clip ready)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
