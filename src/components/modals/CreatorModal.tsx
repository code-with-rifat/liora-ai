'use client';

import React from 'react';
import { X, Globe, Mail, Phone, ExternalLink, Sparkles, Code2, Award, Briefcase } from 'lucide-react';
import { AI_NAME } from '@/lib/brand';
import { CREATOR_PROFILE } from '@/lib/creator';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const p = CREATOR_PROFILE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f172a]/95 border border-cyan-500/30 rounded-3xl w-full max-w-xl p-7 relative shadow-2xl shadow-cyan-500/10 text-white overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow ambient backgrounds */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 rounded-full border border-slate-700/50 transition-all z-10"
        >
          <X size={18} />
        </button>

        {/* Header with Avatar & Status */}
        <div className="flex items-start gap-4 mb-5 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0b1120] rounded-2xl flex items-center justify-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                R
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0f172a] rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">{p.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-medium flex items-center gap-1">
                <Award size={12} /> Architect
              </span>
            </div>
            <p className="text-sm text-cyan-400 font-medium mt-0.5">{p.title}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              📍 {p.location} • <span className="text-emerald-400 font-medium">{p.status}</span>
            </p>
          </div>
        </div>

        {/* Executive Bio */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-slate-300 text-xs leading-relaxed mb-5 relative z-10">
          <p>{p.about}</p>
        </div>

        {/* Core Technology Stack */}
        <div className="mb-5 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            <Code2 size={14} className="text-cyan-400" /> Core Engineering Stack
          </div>
          <div className="flex flex-wrap gap-2">
            {p.stack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-medium hover:border-cyan-500/40 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Featured Enterprise Projects */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            <Briefcase size={14} className="text-cyan-400" /> Featured Enterprise Productions
          </div>
          <div className="space-y-2">
            {p.projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <span className="w-5 h-5 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{proj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clickable Social & Contact Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 relative z-10">
          <a
            href={p.portfolio}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium transition-all group"
          >
            <Globe size={18} className="mb-1 text-cyan-400 group-hover:scale-110 transition-transform" />
            Portfolio
          </a>

          <a
            href={p.github}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80 text-slate-200 text-xs font-medium transition-all group"
          >
            <svg
              className="w-[18px] h-[18px] mb-1 fill-current text-white group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>

          <a
            href={`mailto:${p.email}`}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-300 text-xs font-medium transition-all group"
          >
            <Mail size={18} className="mb-1 text-blue-400 group-hover:scale-110 transition-transform" />
            Email
          </a>

          <a
            href={`https://wa.me/${p.whatsapp.replace('+', '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-all group"
          >
            <Phone size={18} className="mb-1 text-emerald-400 group-hover:scale-110 transition-transform" />
            WhatsApp
          </a>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-cyan-400" />
          {AI_NAME} was engineered and architected by {p.name}
        </div>
      </div>
    </div>
  );
};

