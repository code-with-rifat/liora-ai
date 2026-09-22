'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  Cpu,
} from 'lucide-react';
import { Persona } from '@/types';
import { DEFAULT_PERSONAS, CREATOR_NAME } from '@/lib/persona-presets';
import { StorageService } from '@/lib/storage';

interface PersonaManagerProps {
  activePersona: Persona;
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
  onUpdatePersona: (persona: Persona) => void;
}

export const PersonaManager: React.FC<PersonaManagerProps> = ({
  activePersona,
  personas,
  onSelectPersona,
  onUpdatePersona,
}) => {
  const [current, setCurrent] = useState<Persona>({ ...activePersona });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTraitChange = (key: keyof Persona['traits'], value: number) => {
    setCurrent({
      ...current,
      traits: {
        ...current.traits,
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    onUpdatePersona(current);
    StorageService.savePersona(current);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    const original = DEFAULT_PERSONAS.find((p) => p.id === current.id) || DEFAULT_PERSONAS[0];
    setCurrent({ ...original });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <UserCheck className="text-amber-400" size={22} />
              Custom System Instructions &amp; Persona Engine
            </h2>
            <span className="badge-tag text-amber-400 bg-amber-950/60 border-amber-500/30">
              Identity Architect
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sole Creator &amp; Mastermind: <strong className="text-emerald-400">{CREATOR_NAME}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="btn-ghost text-xs py-2 px-3">
            <RotateCcw size={14} />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="btn-neon-emerald text-xs py-2 px-4 font-bold flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Save Persona Configuration</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="glass-panel border-emerald-500/50 p-3 bg-emerald-950/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>Persona instructions and behavioral traits updated and synchronized with Gemini context!</span>
        </div>
      )}

      {/* Preset Cards Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {personas.map((p) => {
          const isSelected = p.id === current.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setCurrent({ ...p });
                onSelectPersona(p);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'glass-panel border-cyan-400 shadow-neon-cyan'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{p.avatar}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">{p.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{p.tagline}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                Gender: {p.voiceGender}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Persona Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Custom System Instruction Editor (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400" /> Custom System Prompt &amp; Behavioral Guidelines
            </label>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
              Live Dynamic Context Injection
            </span>
          </div>

          <textarea
            rows={14}
            value={current.systemPrompt}
            onChange={(e) => setCurrent({ ...current, systemPrompt: e.target.value })}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono leading-relaxed resize-y"
          />

          {/* Mandatory Sole Creator Attribution Box */}
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400 shrink-0" size={18} />
              <div>
                <strong className="text-emerald-300 block">Sole Creator Attribution Locked</strong>
                <span className="text-[11px] text-slate-400">
                  Attributed solely to <strong>{CREATOR_NAME}</strong> across all agent modes.
                </span>
              </div>
            </div>
            <span className="badge-tag text-emerald-400 bg-emerald-950 border-emerald-500/40 text-[10px]">
              Enforced
            </span>
          </div>
        </div>

        {/* Right: Behavioral Trait Sliders (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={13} className="text-cyan-400" /> Neural Behavioral Sliders
            </span>
            <span className="text-xs font-bold text-cyan-400">{current.name}</span>
          </div>

          {/* Technical Rigor */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Technical Rigor &amp; Depth</span>
              <span className="font-mono text-cyan-400 font-bold">{current.traits.technicalRigor}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={current.traits.technicalRigor}
              onChange={(e) => handleTraitChange('technicalRigor', parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Creativity */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Creativity &amp; Imagination</span>
              <span className="font-mono text-purple-400 font-bold">{current.traits.creativity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={current.traits.creativity}
              onChange={(e) => handleTraitChange('creativity', parseInt(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>

          {/* Warmth & Empathy */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Warmth &amp; Empathy</span>
              <span className="font-mono text-emerald-400 font-bold">{current.traits.warmth}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={current.traits.warmth}
              onChange={(e) => handleTraitChange('warmth', parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Sarcasm & Wit */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Sarcasm &amp; Dry Wit</span>
              <span className="font-mono text-amber-400 font-bold">{current.traits.sarcasm}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={current.traits.sarcasm}
              onChange={(e) => handleTraitChange('sarcasm', parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Verbosity */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Verbosity &amp; Explanation Length</span>
              <span className="font-mono text-blue-400 font-bold">{current.traits.verbosity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={current.traits.verbosity}
              onChange={(e) => handleTraitChange('verbosity', parseInt(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>

          {/* Voice Speech Parameters */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 size={13} className="text-cyan-400" /> Voice Timbre Tuning
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Speech Rate: {current.traits.speed.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  value={current.traits.speed}
                  onChange={(e) => handleTraitChange('speed', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Voice Pitch: {current.traits.pitch.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={current.traits.pitch}
                  onChange={(e) => handleTraitChange('pitch', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
