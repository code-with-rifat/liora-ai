'use client';

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { AI_NAME } from '@/lib/brand';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthed: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthed }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not continue');
        return;
      }
      onAuthed(data.user);
      onClose();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40">
      <div className="bg-white rounded-[28px] w-full max-w-[440px] p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#80868b] hover:bg-[#f1f3f4] rounded-full">
          <X size={16} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#e8f0fe] flex items-center justify-center mb-4">
            <Sparkles className="text-[#1a73e8]" size={22} />
          </div>
          <h2 className="text-[28px] font-normal tracking-tight text-[#1f1f1f]">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="text-sm text-[#444746] mt-1">
            {mode === 'login' ? `to continue to ${AI_NAME}` : `to save chats in ${AI_NAME}`}
          </p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-3">
          {mode === 'register' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a73e8]"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a73e8]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a73e8]"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-sm font-medium text-[#1a73e8]"
            >
              {mode === 'login' ? 'Create account' : 'Sign in instead'}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="h-10 px-6 rounded-full bg-[#1a73e8] text-white text-sm font-medium disabled:opacity-50"
            >
              {busy ? 'Please wait…' : 'Next'}
            </button>
          </div>
        </form>
        <button type="button" onClick={onClose} className="mt-6 w-full text-center text-sm text-[#80868b]">
          Continue as guest
        </button>
      </div>
    </div>
  );
};
