'use client';

import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  Code2,
  Globe,
  Layers,
  Play,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { TerminalView } from './TerminalView';
import { EditorView } from './EditorView';
import { BrowserView } from './BrowserView';
import { CREATOR_NAME } from '@/lib/persona-presets';

export type EnvMode = 'split' | 'terminal' | 'editor' | 'browser';

export const MultiEnvironmentWorkspace: React.FC = () => {
  const [activeEnv, setActiveEnv] = useState<EnvMode>('split');
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Initialize Terminal & Install Dependencies', env: 'terminal', desc: 'Running npm install & verifying node runtime' },
    { title: 'Synthesize & Patch Code in Editor', env: 'editor', desc: 'Synthesizing neural pipeline module & compiling' },
    { title: 'Verify Live Rendering in Virtual Browser', env: 'browser', desc: 'Navigating to localhost, verifying DOM & CSS' },
  ];

  const handleRunAutonomousWorkflow = () => {
    if (workflowRunning) return;
    setWorkflowRunning(true);
    setCurrentStep(1);

    setTimeout(() => {
      setCurrentStep(2);
      setTimeout(() => {
        setCurrentStep(3);
        setTimeout(() => {
          setWorkflowRunning(false);
        }, 1500);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4 h-[calc(100vh-85px)]">
      {/* Top Environment Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <TerminalIcon className="text-emerald-400" size={18} />
              Multi-Environment Agent OS
            </h2>
            <span className="badge-tag text-emerald-400 bg-emerald-950/60 border-emerald-500/30">
              Terminal • Editor • Browser
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Orchestration architecture engineered by <strong className="text-emerald-400">{CREATOR_NAME}</strong>
          </p>
        </div>

        {/* Environment View Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveEnv('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeEnv === 'split'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers size={13} />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setActiveEnv('terminal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeEnv === 'terminal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TerminalIcon size={13} />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveEnv('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeEnv === 'editor'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 size={13} />
            <span>Editor</span>
          </button>

          <button
            onClick={() => setActiveEnv('browser')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeEnv === 'browser'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe size={13} />
            <span>Browser</span>
          </button>

          {/* Autonomous Planner Trigger */}
          <button
            onClick={handleRunAutonomousWorkflow}
            disabled={workflowRunning}
            className="btn-neon-cyan text-xs py-1.5 px-3.5 ml-2 flex items-center gap-1.5 font-bold disabled:opacity-50"
          >
            {workflowRunning ? <RefreshCw className="animate-spin" size={13} /> : <Play size={13} />}
            <span>{workflowRunning ? 'Orchestrating...' : 'Trigger Full Autonomous Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Autonomous Workflow Progress Banner */}
      {workflowRunning && (
        <div className="glass-panel border-cyan-500/40 p-3 bg-cyan-950/40 text-xs flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-mono font-bold">
              {currentStep}
            </div>
            <div>
              <strong className="text-white block">
                Executing Step {currentStep}/3: {steps[currentStep - 1]?.title}
              </strong>
              <span className="text-slate-400 text-[11px]">{steps[currentStep - 1]?.desc}</span>
            </div>
          </div>
          <span className="text-cyan-400 font-mono text-[11px] animate-pulse">
            Status: Synchronizing Environments...
          </span>
        </div>
      )}

      {/* Environment Canvas Area */}
      <div className="flex-1 overflow-hidden">
        {activeEnv === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            <div className="h-full overflow-hidden">
              <TerminalView />
            </div>
            <div className="h-full overflow-hidden">
              <EditorView />
            </div>
            <div className="h-full overflow-hidden">
              <BrowserView />
            </div>
          </div>
        ) : activeEnv === 'terminal' ? (
          <div className="h-full">
            <TerminalView />
          </div>
        ) : activeEnv === 'editor' ? (
          <div className="h-full">
            <EditorView />
          </div>
        ) : (
          <div className="h-full">
            <BrowserView />
          </div>
        )}
      </div>
    </div>
  );
};
