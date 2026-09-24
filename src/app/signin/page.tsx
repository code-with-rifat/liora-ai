'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { AI_NAME, CREATOR_NAME } from '@/lib/brand';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const modeQ = q.get('mode');
    if (modeQ === 'register' || modeQ === 'forgot' || modeQ === 'reset') setMode(modeQ);
    const err = q.get('error');
    if (err === 'google-off') {
      setError('Continue with Google is not set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }
    if (err === 'google') setError('Google sign-in did not complete. Try again.');
    if (err === 'disabled') setError('This account has been disabled.');
  }, []);

  const title =
    mode === 'register'
      ? 'Create account'
      : mode === 'forgot'
        ? 'Forgot password'
        : mode === 'reset'
          ? 'Reset password'
          : 'Sign in';

  const subtitle =
    mode === 'register'
      ? `to save your chats in ${AI_NAME}`
      : mode === 'forgot'
        ? 'Enter your email and we will give you a recovery code'
        : mode === 'reset'
          ? 'Enter the 6-digit code and a new password'
          : `to continue to ${AI_NAME}`;

  const goHome = () => {
    window.location.href = '/';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'register' && password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
      if (mode === 'reset' && password !== confirm) {
        setError('Passwords do not match.');
        return;
      }

      if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Could not start recovery');
          return;
        }
        if (data.code) setRecoveryCode(data.code);
        setInfo(data.message || 'Check your email for a code.');
        setMode('reset');
        return;
      }

      const url =
        mode === 'register' ? '/api/auth/register' : mode === 'reset' ? '/api/auth/reset' : '/api/auth/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirm, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not continue');
        return;
      }
      goHome();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    'w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a73e8] bg-white';

  return (
    <div className="min-h-screen gemini-wash flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-[28px] shadow-xl border border-[#e8eaed] p-6 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11.5px] font-medium mb-3">
            <Sparkles size={13} className="text-[#1a73e8]" />
            <span>{AI_NAME} • Created by <strong>{CREATOR_NAME}</strong></span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-normal tracking-tight text-[#1f1f1f]">{title}</h1>
          <p className="text-sm text-[#444746] mt-1">{subtitle}</p>
        </div>

        {(mode === 'login' || mode === 'register') && (
          <>
            <a
              href="/api/auth/google"
              className="mt-8 h-12 w-full rounded-full border border-[#dadce0] bg-white hover:bg-[#f8fafc] text-sm font-medium text-[#1f1f1f] flex items-center justify-center gap-3"
            >
              <GoogleMark />
              Continue with Google
            </a>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#e8eaed]" />
              <span className="text-xs text-[#80868b]">or</span>
              <div className="flex-1 h-px bg-[#e8eaed]" />
            </div>
          </>
        )}

        <form onSubmit={submit} className={(mode === 'login' || mode === 'register') ? 'space-y-3' : 'mt-8 space-y-3'}>
          {mode === 'register' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              className={fieldClass}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className={fieldClass}
          />
          {mode === 'reset' && (
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              required
              inputMode="numeric"
              className={fieldClass}
            />
          )}
          {mode !== 'forgot' && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'reset' ? 'New password' : 'Password'}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className={`${fieldClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80868b]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}
          {(mode === 'register' || mode === 'reset') && (
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              required
              minLength={6}
              className={fieldClass}
            />
          )}

          {recoveryCode && mode === 'reset' && (
            <div className="rounded-2xl bg-[#e8f0fe] px-4 py-3 text-sm text-[#1a73e8]">
              Recovery code: <span className="font-mono font-medium tracking-widest">{recoveryCode}</span>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && !recoveryCode && <p className="text-sm text-[#1a73e8]">{info}</p>}

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setError('');
                setInfo('');
              }}
              className="text-sm font-medium text-[#1a73e8]"
            >
              Forgot password?
            </button>
          )}

          <div className="flex items-center justify-between pt-2 gap-3">
            {mode === 'login' ? (
              <button type="button" onClick={() => setMode('register')} className="text-sm font-medium text-[#1a73e8]">
                Create account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setInfo('');
                  setRecoveryCode('');
                }}
                className="text-sm font-medium text-[#1a73e8]"
              >
                Back to sign in
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="h-10 px-6 rounded-full bg-[#1a73e8] text-white text-sm font-medium disabled:opacity-50"
            >
              {busy ? 'Please wait…' : mode === 'forgot' ? 'Send code' : 'Next'}
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2 text-sm text-[#80868b]">
          <Link href="/" className="text-[#1a73e8] font-medium">
            Continue as guest
          </Link>
          <p className="text-[11px] text-center">
            By continuing you can chat with {AI_NAME}. Signed-in chats stay in your account.
          </p>
          <p className="text-[11.5px] text-center text-zinc-500 font-medium mt-1">
            ✨ Created &amp; Engineered exclusively by <strong className="text-zinc-800 font-semibold">{CREATOR_NAME}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.5 5.6-6.7 7.1l6.3 5.3C37.9 38.3 44 32 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
