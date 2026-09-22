'use client';

import React, { useState } from 'react';
import {
  Film,
  Play,
  Pause,
  Download,
  Sparkles,
  Camera,
  Clock,
  Music,
  RefreshCw,
  Layers,
  Wand2,
  Video,
} from 'lucide-react';
import { CameraMotion, MediaAsset, VideoGenParams } from '@/types';
import { renderVideoSynthesis } from '@/lib/video-renderer';
import { CREATOR_NAME } from '@/lib/persona-presets';

interface VideoSynthesisStudioProps {
  initialImage?: string;
  initialPrompt?: string;
  onMediaGenerated: (asset: MediaAsset) => void;
}

const MOTION_MODES: Array<{ id: CameraMotion; label: string; icon: string; desc: string }> = [
  { id: 'cinematic-orbit', label: 'Cinematic Orbit', icon: '🔄', desc: '360° circular orbital parallax rotation' },
  { id: 'drone-flythrough', label: 'Drone Flythrough', icon: '🚁', desc: 'High-speed cinematic forward glide' },
  { id: 'zoom-in-dramatic', label: 'Dramatic Zoom In', icon: '🔍', desc: 'Exponential focal punch & scale' },
  { id: 'pan-horizontal', label: 'Horizontal Pan', icon: '↔️', desc: 'Smooth horizontal landscape sweep' },
  { id: 'tilt-upward', label: 'Vertical Tilt Up', icon: '⬆️', desc: 'Monumental upward reveal motion' },
  { id: 'glitch-hyperlapse', label: 'Glitch Hyperlapse', icon: '⚡', desc: 'High-energy time-dilation & particle pulses' },
];

export const VideoSynthesisStudio: React.FC<VideoSynthesisStudioProps> = ({
  initialImage,
  initialPrompt,
  onMediaGenerated,
}) => {
  const [params, setParams] = useState<VideoGenParams>({
    prompt: initialPrompt || 'Futuristic cybernetic city with hovering vehicles, neon holographic billboards, hyper-detailed volumetric atmosphere',
    motion: 'cinematic-orbit',
    durationSeconds: 10,
    fps: 30,
    aspectRatio: '16:9',
    style: 'Cyberpunk',
    audioTrack: 'cyber-ambient',
    initialImageUrl: initialImage || undefined,
  });

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const handleStartSynthesis = async () => {
    if (!params.prompt.trim() || isRendering) return;

    setIsRendering(true);
    setRenderProgress(0);
    setRenderStage('Initializing Neural Video Motion Engine...');

    try {
      const result = await renderVideoSynthesis(params, (progress, stage) => {
        setRenderProgress(progress);
        setRenderStage(stage);
      });

      setRenderedVideoUrl(result.videoUrl);

      const asset: MediaAsset = {
        id: `vid-${Date.now()}`,
        type: 'video',
        url: result.videoUrl,
        prompt: params.prompt,
        aspectRatio: params.aspectRatio,
        createdAt: new Date().toLocaleTimeString(),
        duration: result.duration,
        motion: params.motion,
        style: params.style,
        creator: CREATOR_NAME,
      };

      onMediaGenerated(asset);
    } catch (err: any) {
      console.error('Video rendering error:', err);
      alert('Video synthesis encountered an issue: ' + (err.message || 'Unknown error'));
    } finally {
      setIsRendering(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-6">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Film className="text-purple-400" size={22} />
              10-Second Short-Form Video Synthesis Studio
            </h2>
            <span className="badge-tag text-purple-400 bg-purple-950/60 border-purple-500/30">
              WebGL Motion Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Engineered by <strong className="text-emerald-400">{CREATOR_NAME}</strong> with camera choreography and neural particle synthesis.
          </p>
        </div>

        <button
          onClick={handleStartSynthesis}
          disabled={isRendering || !params.prompt.trim()}
          className="btn-neon-cyan py-2.5 px-6 font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {isRendering ? <RefreshCw className="animate-spin" size={16} /> : <Video size={16} />}
          <span>{isRendering ? `Synthesizing (${renderProgress}%)` : 'Synthesize 10s Video'}</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Motion Choreography Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Prompt & Storyboard Description */}
          <div className="glass-panel p-4 space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-400" /> Video Storyboard &amp; Motion Prompt
            </label>
            <textarea
              rows={3}
              value={params.prompt}
              onChange={(e) => setParams({ ...params, prompt: e.target.value })}
              placeholder="Describe the cinematic scene and lighting for the motion synthesis..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
            />
          </div>

          {/* Initial Image Reference (Image-to-Video) */}
          {params.initialImageUrl && (
            <div className="glass-panel p-3 flex items-center justify-between gap-3 border-cyan-500/40">
              <div className="flex items-center gap-2">
                <img
                  src={params.initialImageUrl}
                  alt="Reference"
                  className="w-12 h-12 object-cover rounded-lg border border-cyan-400"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Image-to-Video Activated</span>
                  <span className="text-[10px] text-cyan-300">Using generative image canvas as motion keyframe</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setParams({ ...params, initialImageUrl: undefined })}
                className="text-xs text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* Camera Motion Choreography */}
          <div className="glass-panel p-4 space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={13} className="text-cyan-400" /> Camera Motion Choreography
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOTION_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setParams({ ...params, motion: m.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    params.motion === m.id
                      ? 'bg-purple-950/80 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & FPS Controls (Up to 10s) */}
          <div className="glass-panel p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-200 font-bold">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-cyan-400" /> Duration &amp; Frame Rate
              </span>
              <span className="text-cyan-400 font-mono text-sm">{params.durationSeconds}s @ {params.fps} FPS</span>
            </div>

            {/* Duration Buttons (3s, 5s, 8s, 10s) */}
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 10].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setParams({ ...params, durationSeconds: sec })}
                  className={`py-2 rounded-lg border text-xs font-bold font-mono transition-all ${
                    params.durationSeconds === sec
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}s Clip
                </button>
              ))}
            </div>

            {/* FPS Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-400">Rendering FPS:</span>
              <div className="flex gap-1.5">
                {[24, 30, 60].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setParams({ ...params, fps: f })}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                      params.fps === f
                        ? 'bg-purple-900 text-purple-200 border border-purple-400'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {f}fps
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Score Soundtrack */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <Music size={12} className="text-pink-400" /> Soundtrack:
              </span>
              <select
                value={params.audioTrack}
                onChange={(e) => setParams({ ...params, audioTrack: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 focus:outline-none"
              >
                <option value="cyber-ambient">Cyber Ambient Synth</option>
                <option value="synthwave-pulse">Synthwave Pulse</option>
                <option value="orchestral-epic">Orchestral Drone</option>
                <option value="none">Mute (No Audio)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Video Playback & Render Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col glass-panel p-4 min-h-[500px] justify-between relative overflow-hidden">
          {/* Top Video Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                10-Second Video Playback Viewport
              </span>
            </div>

            {renderedVideoUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="btn-ghost text-xs py-1 px-3 flex items-center gap-1"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <a
                  href={renderedVideoUrl}
                  download={`aetheris_video_${Date.now()}.webm`}
                  className="btn-neon-emerald text-xs py-1 px-3"
                >
                  <Download size={13} />
                  <span>Download Video</span>
                </a>
              </div>
            )}
          </div>

          {/* Video Viewport Area */}
          <div className="my-auto flex items-center justify-center py-6">
            {isRendering ? (
              <div className="flex flex-col items-center gap-4 text-center max-w-md w-full">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400/20 border-t-purple-400 animate-spin" />
                  <Film className="text-purple-400 animate-pulse" size={28} />
                </div>

                <div className="space-y-2 w-full">
                  <h4 className="text-sm font-bold text-white">Synthesizing 10s Video Clip...</h4>
                  <p className="text-xs text-purple-300 font-mono">{renderStage}</p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{renderProgress}% Synthesized</div>
                </div>
              </div>
            ) : renderedVideoUrl ? (
              <div className="w-full rounded-xl overflow-hidden border border-purple-500/40 shadow-2xl bg-black">
                <video
                  ref={videoRef}
                  src={renderedVideoUrl}
                  controls
                  loop
                  autoPlay
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-auto max-h-[460px] object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center text-slate-500 py-16">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <Film size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-300">Video Synthesis Studio Idle</h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Choose camera choreography, select up to 10 seconds duration, and click Synthesize to render motion video.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Attribution & Details */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              Synthesis Pipeline: <strong className="text-purple-400">MediaRecorder 60FPS Video Canvas</strong>
            </span>
            <span className="font-mono text-[11px]">
              Architect: <strong className="text-emerald-400">{CREATOR_NAME}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
