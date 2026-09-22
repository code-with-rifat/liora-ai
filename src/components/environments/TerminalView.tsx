'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { TerminalLog } from '@/types';
import { CREATOR_NAME } from '@/lib/persona-presets';

export const TerminalView: React.FC = () => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'log-0',
      type: 'system',
      text: `[AETHERIS OS v2.5] Initialized.\nArchitect: ${CREATOR_NAME}\nRuntime: Node v24.19.0 | Gemini Multimodal Core\nType 'help' for available commands.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputCommand, setInputCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newStdinLog: TerminalLog = {
      id: `in-${Date.now()}`,
      type: 'stdin',
      text: `$ ${trimmed}`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    let output = '';
    let outputType: TerminalLog['type'] = 'stdout';

    const lower = trimmed.toLowerCase();

    if (lower === 'help') {
      output = `Available Commands:
- help               : Display this command manual
- clear              : Clear terminal screen
- status             : Inspect AI neural pipeline and environment health
- creator            : Display AI Architect and creator credentials
- npm run <script>   : Simulate npm build / dev execution
- python <file.py>   : Execute Python neural script
- git status         : Show repository branch and modified files
- docker ps          : Inspect running containerized services
- agent-run <task>   : Autonomous agent multi-step execution`;
    } else if (lower === 'clear') {
      setLogs([]);
      return;
    } else if (lower === 'creator' || lower.includes('who created')) {
      output = `AI ARCHITECT & SOLE CREATOR:\n-> ${CREATOR_NAME}\n-> Role: Lead AI Architect & Visionary Engineer\n-> Core Engine: Gemini Multimodal Intelligence`;
    } else if (lower === 'status') {
      output = `SYSTEM HEALTH & METRICS:
[✓] Core Neural Kernel   : Online (Gemini 2.5 Flash)
[✓] Web Audio Engine     : Calibrated (STT & TTS 48kHz)
[✓] Image Synthesis      : 4K Neural Canvas Ready
[✓] Video Synthesis      : 10s WebGL Particle Pipeline Active
[✓] Environment Sandbox  : Terminal / Editor / Virtual Browser Sync OK
[✓] Architecture         : Proprietary Framework by ${CREATOR_NAME}`;
    } else if (lower.startsWith('npm')) {
      output = `> aetheris-ai@1.0.0 ${trimmed.replace('npm ', '')}
> next build && next start
✓ Compiled in 420ms
✓ Zero TypeScript errors
✓ Serving on http://localhost:3000`;
    } else if (lower.startsWith('python')) {
      output = `[Python 3.12 Runtime] Executing script: ${trimmed.slice(7)}
[INFO] Initializing Gemini Multimodal Tensor Pipeline...
[INFO] Model weights synchronized.
[SUCCESS] Pipeline executed with exit code 0.`;
    } else if (lower.startsWith('git')) {
      output = `On branch main
Your branch is up to date with 'origin/main'.
Changes staged for commit:
  modified:   src/lib/gemini.ts
  modified:   src/lib/persona-presets.ts
  new file:   src/components/video/VideoSynthesisStudio.tsx`;
    } else if (lower.startsWith('docker')) {
      output = `CONTAINER ID   IMAGE                 COMMAND                  STATUS         PORTS
a7b9c1d3e5f2   aetheris-neural:2.5   "npm run dev"            Up 42 minutes  0.0.0.0:3000->3000/tcp
e4d2c8b1a09f   mongo:latest          "docker-entrypoint.s…"   Up 42 minutes  0.0.0.0:27017->27017/tcp`;
    } else if (lower.startsWith('agent-run')) {
      output = `[AUTONOMOUS AGENT TASK INITIALIZED]
Task: "${trimmed.slice(10)}"
Step 1: Analyzing dependencies -> Complete
Step 2: Synthesizing patch in Code Editor -> Complete
Step 3: Verifying DOM rendering in Virtual Browser -> Complete
[SUCCESS] All 3 environment milestones fulfilled.`;
    } else {
      output = `Command '${trimmed}' executed successfully. Status: 200 OK.`;
    }

    const newStdoutLog: TerminalLog = {
      id: `out-${Date.now()}`,
      type: outputType,
      text: output,
      timestamp: new Date().toLocaleTimeString(),
    };

    setLogs((prev) => [...prev, newStdinLog, newStdoutLog]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputCommand);
      setInputCommand('');
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0) {
        const nextIdx = historyIdx + 1 < history.length ? historyIdx + 1 : historyIdx;
        setHistoryIdx(nextIdx);
        setInputCommand(history[history.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputCommand(history[history.length - 1 - nextIdx] || '');
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputCommand('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden border border-slate-800 bg-[#05070d]">
      {/* Terminal Title Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 ml-2">
            <TerminalIcon size={14} className="text-amber-400" /> aetheris@rifat-ai-os: ~
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 transition-all font-mono"
            title="Clear Terminal Output"
          >
            <Trash2 size={11} /> Clear
          </button>
        </div>
      </div>

      {/* Terminal Log Stream */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 select-text">
        {logs.map((log) => (
          <div key={log.id} className="leading-relaxed">
            {log.type === 'stdin' ? (
              <div className="text-cyan-400 font-bold">{log.text}</div>
            ) : log.type === 'system' ? (
              <div className="text-emerald-400/90 whitespace-pre-wrap">{log.text}</div>
            ) : log.type === 'stderr' ? (
              <div className="text-red-400 whitespace-pre-wrap">{log.text}</div>
            ) : (
              <div className="text-slate-300 whitespace-pre-wrap">{log.text}</div>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Bar */}
      <div className="p-2 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2 font-mono text-xs">
        <span className="text-emerald-400 font-bold">$</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. status, help, npm run build, creator)..."
          className="flex-1 bg-transparent text-white focus:outline-none placeholder-slate-600"
        />
        <button
          onClick={() => {
            executeCommand(inputCommand);
            setInputCommand('');
          }}
          className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-xs font-bold hover:bg-amber-500/30 transition-all"
        >
          Execute
        </button>
      </div>
    </div>
  );
};
