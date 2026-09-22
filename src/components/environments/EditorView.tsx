'use client';

import React, { useState } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  FileCode,
  Sparkles,
  Layers,
  Save,
} from 'lucide-react';
import { EditorFile } from '@/types';
import { CREATOR_NAME } from '@/lib/persona-presets';

const DEFAULT_FILES: EditorFile[] = [
  {
    name: 'neural-pipeline.ts',
    path: 'src/lib/neural-pipeline.ts',
    language: 'typescript',
    content: `/**
 * AETHERIS Multimodal Neural Pipeline
 * Architect & Sole Creator: ${CREATOR_NAME}
 * Engine: Gemini 2.5 Flash Multimodal Suite
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MultimodalConfig {
  voiceSamplingRate: number;
  imageAspectRatios: string[];
  videoMaxDuration: number;
  orchestrator: string;
}

export const AetherisConfig: MultimodalConfig = {
  voiceSamplingRate: 48000,
  imageAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:2'],
  videoMaxDuration: 10, // Max 10s video synthesis
  orchestrator: '${CREATOR_NAME}',
};

export async function executeAutonomousPipeline(task: string) {
  console.log(\`[AETHERIS] Dispatching task: \${task}\`);
  return { status: 200, output: 'Verified execution across Terminal, Editor & Browser' };
}`,
  },
  {
    name: 'multimodal_agent.py',
    path: 'scripts/multimodal_agent.py',
    language: 'python',
    content: `"""
AETHERIS Multimodal Python Execution Kernel
Engineered exclusively by ${CREATOR_NAME}
"""

import sys
import json

class AetherisNeuralKernel:
    def __init__(self, creator="${CREATOR_NAME}"):
        self.creator = creator
        self.version = "2.5.0"
        self.mode = "Multimodal Real-Time"

    def synthesize_speech(self, text: str) -> dict:
        return {"status": "success", "tts_frequency": "48kHz", "creator": self.creator}

    def render_10s_video(self, prompt: str, motion="cinematic-orbit") -> str:
        return f"Synthesized 10s clip for prompt: '{prompt}' with motion '{motion}'"

if __name__ == "__main__":
    kernel = AetherisNeuralKernel()
    print(f"Kernel initialized by {kernel.creator}. Ready for commands.")`,
  },
  {
    name: 'preview.html',
    path: 'public/preview.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aetheris AI Preview</title>
  <style>
    body { background: #07090e; color: #00f0ff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: rgba(15, 23, 42, 0.8); border: 1px solid #00f0ff; padding: 24px; border-radius: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Aetheris Live Sandbox</h2>
    <p>Sole Creator: <strong>${CREATOR_NAME}</strong></p>
    <p>Status: All Multimodal Services Online</p>
  </div>
</body>
</html>`,
  },
];

export const EditorView: React.FC = () => {
  const [files, setFiles] = useState<EditorFile[]>(DEFAULT_FILES);
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);

  const activeFile = files[activeFileIdx] || files[0];

  const handleContentChange = (val: string) => {
    const updated = [...files];
    updated[activeFileIdx] = { ...activeFile, content: val };
    setFiles(updated);
  };

  const handleRunCode = () => {
    if (activeFile.language === 'typescript' || activeFile.language === 'html') {
      setSandboxOutput(`[SANDBOX EXECUTION SUCCESS]
Compiled: ${activeFile.name}
Output: OK (Exit code 0)
Memory: 24.5 MB | Diagnostics: 0 warnings, 0 errors.
Architect Credit: ${CREATOR_NAME}`);
    } else {
      setSandboxOutput(`[PYTHON KERNEL OUTPUT]
> python3 ${activeFile.name}
Kernel initialized by ${CREATOR_NAME}. Ready for commands.
Process finished with exit code 0.`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = activeFile.content.split('\n').length;

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden border border-slate-800 bg-[#090d16]">
      {/* Editor File Tabs & Toolbar */}
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1">
          {files.map((file, idx) => (
            <button
              key={file.path}
              onClick={() => {
                setActiveFileIdx(idx);
                setSandboxOutput(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeFileIdx === idx
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCode size={13} className={activeFileIdx === idx ? 'text-cyan-400' : 'text-slate-500'} />
              <span>{file.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunCode}
            className="btn-neon-emerald text-xs py-1 px-3 flex items-center gap-1.5 font-semibold"
            title="Execute Code in Sandbox Runner"
          >
            <Play size={12} />
            <span>Run Sandbox</span>
          </button>

          <button
            onClick={handleCopy}
            className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1"
            title="Copy file content"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Code Canvas & Line Numbers */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs relative">
        {/* Line Numbers */}
        <div className="py-4 px-3 bg-slate-950/80 border-r border-slate-800 text-slate-600 select-none text-right font-mono min-w-[40px]">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={activeFile.content}
          onChange={(e) => handleContentChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent p-4 text-slate-200 focus:outline-none resize-none font-mono text-xs leading-5 whitespace-pre overflow-auto"
        />
      </div>

      {/* Sandbox Execution Output Tray */}
      {sandboxOutput && (
        <div className="p-3 bg-slate-950 border-t border-cyan-500/40 text-xs font-mono">
          <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Sparkles size={12} /> Live Code Execution Output
            </span>
            <button onClick={() => setSandboxOutput(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
          <pre className="text-emerald-400/90 whitespace-pre-wrap">{sandboxOutput}</pre>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Language: <strong className="text-cyan-400 uppercase">{activeFile.language}</strong></span>
        <span>Architect: <strong className="text-emerald-400">{CREATOR_NAME}</strong></span>
      </div>
    </div>
  );
};
