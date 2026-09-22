'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio, Sparkles, Languages } from 'lucide-react';
import { VoiceVisualizerOrb } from './VoiceVisualizerOrb';
import { Persona } from '@/types';
import { AudioVisualizerEngine, playSyntheticAudioTone } from '@/lib/audio-utils';

interface VoiceControllerProps {
  activePersona: Persona;
  onTranscriptReady: (text: string) => void;
  isProcessing: boolean;
  onVoiceStateChange?: (state: { isListening: boolean; isSpeaking: boolean }) => void;
}

function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' [code snippet omitted for voice] ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]+\$/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\|.*?\|/g, ' ') // Strip markdown tables for voice readability
    .replace(/[#*`_\[\]()|>~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Grok-style natural neural voice selection
function selectBestNeuralVoice(
  voices: SpeechSynthesisVoice[],
  isBangla: boolean,
  gender?: 'female' | 'male' | 'neural' | string
) {
  if (!voices || voices.length === 0) return null;

  if (isBangla) {
    // Top Bengali Neural / Natural voices
    return (
      voices.find((v) => v.lang.startsWith('bn-BD')) ||
      voices.find((v) => v.lang.startsWith('bn-IN')) ||
      voices.find((v) => v.lang.startsWith('bn')) ||
      voices.find((v) => v.name.toLowerCase().includes('bangla')) ||
      voices.find((v) => v.name.toLowerCase().includes('bengali')) ||
      voices.find((v) => v.name.toLowerCase().includes('tanisha')) ||
      voices.find((v) => v.name.toLowerCase().includes('bashkar')) ||
      null
    );
  }

  // English Grok-style expressive neural voices (Natural, Neural, Jenny, Guy, Christopher, Aria, Samantha)
  if (gender === 'female') {
    return (
      voices.find((v) => v.name.includes('Natural') && v.lang.startsWith('en') && (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Female'))) ||
      voices.find((v) => v.name.includes('Google US English') || v.name.includes('Google UK English Female')) ||
      voices.find((v) => v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Jenny')) ||
      voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null
    );
  }

  // Male Neural Voice (Grok-like deep, calm, articulate)
  return (
    voices.find((v) => v.name.includes('Natural') && v.lang.startsWith('en') && (v.name.includes('Guy') || v.name.includes('Christopher') || v.name.includes('Ryan') || v.name.includes('Male'))) ||
    voices.find((v) => v.name.includes('Google US English Male') || v.name.includes('Google UK English Male')) ||
    voices.find((v) => v.name.includes('David') || v.name.includes('Guy') || v.name.includes('Daniel')) ||
    voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  activePersona,
  onTranscriptReady,
  isProcessing,
  onVoiceStateChange,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechLang, setSpeechLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [sttSupported, setSttSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const audioEngineRef = useRef<AudioVisualizerEngine | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Load available system voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setAvailableVoices(v);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSttSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          currentInterim += transcript;
        }
      }

      setInterimTranscript(currentInterim);

      if (finalTranscript.trim()) {
        playSyntheticAudioTone(660, 0.1, 'sine');
        onTranscriptReady(finalTranscript.trim());
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
      }
    };

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
  }, [isListening, speechLang, onTranscriptReady]);

  // Audio volume analyzer loop
  const startVolumeAnalysis = useCallback(async () => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new AudioVisualizerEngine();
    }
    const ok = await audioEngineRef.current.initMicrophone();
    if (!ok) return;

    const updateVolume = () => {
      if (audioEngineRef.current) {
        const vol = audioEngineRef.current.getAverageVolume();
        setVolumeLevel(Math.min(100, Math.floor(vol * 1.5)));
      }
      animFrameRef.current = requestAnimationFrame(updateVolume);
    };
    updateVolume();
  }, []);

  const stopVolumeAnalysis = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioEngineRef.current) {
      audioEngineRef.current.disconnect();
    }
    setVolumeLevel(0);
  }, []);

  // Toggle Voice Listening (STT)
  const toggleListening = async () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      stopVolumeAnalysis();
      setIsListening(false);
      playSyntheticAudioTone(330, 0.15, 'sawtooth');
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = speechLang;
          recognitionRef.current.start();
        }
        await startVolumeAnalysis();
        setIsListening(true);
        playSyntheticAudioTone(880, 0.15, 'sine');
      } catch (err) {
        console.warn('Could not start microphone:', err);
      }
    }
  };

  // Speak text with SpeechSynthesis (TTS) - Grok-like conversational delivery
  const speakText = useCallback(
    (text: string) => {
      if (!autoSpeak || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();
      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const isBanglaText = /[\u0980-\u09FF]/.test(cleanText);

      // Grok-style conversational cadence: lively, articulate, natural rate & pitch
      utterance.pitch = isBanglaText ? 1.0 : (activePersona.traits.pitch || 1.02);
      utterance.rate = isBanglaText ? 0.95 : 1.02; // Natural human cadence

      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const bestVoice = selectBestNeuralVoice(voices, isBanglaText, activePersona.voiceGender || 'male');

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      } else {
        utterance.lang = isBanglaText ? 'bn-BD' : 'en-US';
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [autoSpeak, activePersona, availableVoices]
  );

  useEffect(() => {
    if (onVoiceStateChange) {
      onVoiceStateChange({ isListening, isSpeaking });
    }
  }, [isListening, isSpeaking, onVoiceStateChange]);

  // Expose speakText through custom window event for seamless triggers
  useEffect(() => {
    const handleSpeakEvent = (e: CustomEvent<{ text: string }>) => {
      if (e.detail?.text) {
        speakText(e.detail.text);
      }
    };
    window.addEventListener('aetheris-speak' as any, handleSpeakEvent);
    return () => {
      window.removeEventListener('aetheris-speak' as any, handleSpeakEvent);
    };
  }, [speakText]);

  return (
    <div className="glass-panel p-4 flex flex-col items-center justify-between gap-3 relative overflow-hidden">
      {/* Voice Visualizer Orb */}
      <div className="flex flex-col items-center">
        <VoiceVisualizerOrb
          isActive={isListening || isSpeaking || isProcessing}
          isListening={isListening}
          isSpeaking={isSpeaking}
          volumeLevel={volumeLevel}
          color={activePersona.color}
          size={110}
          onClick={toggleListening}
        />

        <div className="flex items-center gap-2 mt-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: isListening ? '#00FFA3' : isSpeaking ? '#00F0FF' : '#64748b',
            }}
          />
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
            {isListening
              ? `Mic Active (${speechLang === 'bn-BD' ? 'বাংলা' : 'English'})`
              : isSpeaking
              ? 'Agent Responding'
              : isProcessing
              ? 'Synthesizing...'
              : 'Voice Idle (Click to Talk)'}
          </span>
        </div>
      </div>

      {/* Live Interim Transcript */}
      {interimTranscript && (
        <div className="w-full text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded px-3 py-1.5 animate-pulse font-mono truncate text-center">
          &quot;{interimTranscript}&quot;
        </div>
      )}

      {/* Voice Controls Toolbar */}
      <div className="flex items-center justify-center gap-2 w-full pt-1 border-t border-slate-800">
        <button
          onClick={toggleListening}
          className={`px-3 py-1.5 text-xs rounded-md font-semibold flex items-center gap-1.5 transition-all ${
            isListening
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30'
          }`}
          title={isListening ? 'Mute Microphone' : 'Start Voice Mode'}
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          <span>{isListening ? 'Stop Mic' : 'Start Voice'}</span>
        </button>

        {/* Language Mode Toggle */}
        <button
          onClick={() => {
            const next = speechLang === 'bn-BD' ? 'en-US' : 'bn-BD';
            setSpeechLang(next);
          }}
          className="px-2.5 py-1.5 text-xs rounded-md font-medium bg-slate-800/80 text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 flex items-center gap-1 transition-all"
          title="Toggle Voice Recognition Language (Bangla / English)"
        >
          <Languages size={13} />
          <span>{speechLang === 'bn-BD' ? 'বাংলা' : 'EN'}</span>
        </button>

        <button
          onClick={() => {
            setAutoSpeak(!autoSpeak);
            if (isSpeaking) window.speechSynthesis.cancel();
          }}
          className={`px-3 py-1.5 text-xs rounded-md font-semibold flex items-center gap-1.5 transition-all ${
            autoSpeak
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
          title="Toggle Text-to-Speech (TTS) Voice Responses"
        >
          {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>{autoSpeak ? 'TTS Active' : 'Muted'}</span>
        </button>

        {!sttSupported && (
          <span className="text-[11px] text-amber-400 flex items-center gap-1">
            <Radio size={12} /> Web Speech STT not supported in this browser
          </span>
        )}
      </div>
    </div>
  );
};

