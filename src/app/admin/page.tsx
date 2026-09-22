'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Home,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import { AI_MODELS } from '@/lib/models';
import { AI_NAME } from '@/lib/brand';

type Settings = {
  stripWatermark: boolean;
  allowGuestChat: boolean;
  allowSignup: boolean;
  allowImageGen: boolean;
  requireLogin: boolean;
  allowVoice: boolean;
  defaultModel: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  disabled: boolean;
  createdAt: number;
  lastSeen: number;
};

type ActivityRow = {
  id: string;
  title: string;
  userName: string;
  userEmail: string;
  updatedAt: number;
  messageCount: number;
};

type Tab = 'home' | 'users' | 'activity' | 'models' | 'images' | 'access' | 'security';

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home size={16} /> },
  { id: 'users', label: 'Users', icon: <Users size={16} /> },
  { id: 'activity', label: 'Activity', icon: <Activity size={16} /> },
  { id: 'models', label: 'Gemini & models', icon: <Sparkles size={16} /> },
  { id: 'images', label: 'Images', icon: <ImageIcon size={16} /> },
  { id: 'access', label: 'Access', icon: <SlidersHorizontal size={16} /> },
  { id: 'security', label: 'Security', icon: <Shield size={16} /> },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-4.5 right-0.5 left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function Row({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#f1f3f4] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1f1f1f]">{title}</p>
        {hint && <p className="text-xs text-[#80868b] mt-0.5 max-w-md">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('home');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState({ users: 0, conversations: 0, mongo: false });

  const load = async () => {
    const overview = await fetch('/api/admin/overview');
    if (overview.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await overview.json();
    setSettings(data.settings);
    setCounts({ users: data.users, conversations: data.conversations, mongo: data.mongo });
    const [userRes, actRes] = await Promise.all([
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/activity').then((r) => r.json()),
    ]);
    setUsers(userRes.users || []);
    setActivity(actRes.activity || []);
    setAuthed(true);
  };

  useEffect(() => {
    load().catch(() => setAuthed(false));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }
    setPassword('');
    await load();
  };

  const saveSettings = async (next: Settings) => {
    setSettings(next);
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
  };

  const toggleUser = async (id: string, disabled: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, disabled }),
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, disabled } : u)));
  };

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
  );

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-sm border border-[#dadce0]">
          <div className="w-12 h-12 rounded-full bg-[#e8f0fe] flex items-center justify-center mb-4">
            <LayoutDashboard className="text-[#1a73e8]" size={22} />
          </div>
          <h1 className="text-[28px] font-normal tracking-tight">Admin console</h1>
          <p className="text-sm text-[#80868b] mt-1 mb-5">Sign in to manage {AI_NAME}.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-[#1a73e8]"
          />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-[#1a73e8] text-white py-2.5 text-sm font-medium">
            Next
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <aside className="w-[240px] bg-[#f0f4f9] p-3 hidden md:flex flex-col">
        <div className="px-3 py-3 mb-2">
          <p className="text-sm font-medium text-[#1f1f1f]">{AI_NAME} Admin</p>
          <p className="text-[11px] text-[#80868b]">Gemini-style console</p>
        </div>
        <nav className="space-y-0.5 flex-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm ${
                tab === item.id ? 'bg-white shadow-sm font-medium' : 'text-[#444746] hover:bg-white/70'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <a href="/" className="px-3 py-2 text-sm text-[#1a73e8]">
          Open {AI_NAME}
        </a>
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-normal">{NAV.find((n) => n.id === tab)?.label}</h1>
            <p className="text-sm text-[#80868b]">
              {counts.users} users · {counts.conversations} chats · {counts.mongo ? 'MongoDB' : 'local store'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="md:hidden flex gap-1 overflow-x-auto">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                    tab === item.id ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-white border border-[#dadce0]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' });
                setAuthed(false);
              }}
              className="px-4 py-2 rounded-full bg-white border border-[#dadce0] text-sm inline-flex items-center gap-1"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {tab === 'home' && (
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Users', value: counts.users },
              { label: 'Conversations', value: counts.conversations },
              { label: 'Storage', value: counts.mongo ? 'MongoDB' : 'Local' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-3xl border border-[#dadce0] p-5">
                <p className="text-xs text-[#80868b]">{card.label}</p>
                <p className="text-2xl font-medium mt-1">{card.value}</p>
              </div>
            ))}
            <div className="sm:col-span-3 bg-white rounded-3xl border border-[#dadce0] p-5">
              <h2 className="font-medium mb-3">Recent activity</h2>
              {activity.slice(0, 6).length === 0 ? (
                <p className="text-sm text-[#80868b]">No chats yet.</p>
              ) : (
                activity.slice(0, 6).map((row) => (
                  <div key={row.id} className="flex justify-between py-2 text-sm border-b border-[#f1f3f4] last:border-0">
                    <span className="truncate mr-3">{row.title}</span>
                    <span className="text-[#80868b] shrink-0">{row.userName}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <section className="bg-white rounded-3xl border border-[#dadce0] p-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users"
              className="w-full max-w-sm border border-[#dadce0] rounded-full px-4 py-2 text-sm mb-4 focus:outline-none focus:border-[#1a73e8]"
            />
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-[#80868b]">No accounts yet.</p>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3 py-3 border-b border-[#f1f3f4] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-[#80868b]">{user.email}</p>
                    <p className="text-[11px] text-[#80868b]">
                      Last seen {user.lastSeen ? new Date(user.lastSeen).toLocaleString() : '—'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleUser(user.id, !user.disabled)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      user.disabled ? 'bg-red-50 text-red-600' : 'bg-[#e8f0fe] text-[#1a73e8]'
                    }`}
                  >
                    {user.disabled ? 'Disabled' : 'Active'}
                  </button>
                </div>
              ))
            )}
          </section>
        )}

        {tab === 'activity' && (
          <section className="bg-white rounded-3xl border border-[#dadce0] p-5">
            {activity.length === 0 ? (
              <p className="text-sm text-[#80868b]">No activity yet.</p>
            ) : (
              activity.map((row) => (
                <div key={row.id} className="py-3 border-b border-[#f1f3f4] last:border-0">
                  <p className="text-sm font-medium truncate">{row.title}</p>
                  <p className="text-xs text-[#80868b]">
                    {row.userName} {row.userEmail ? `· ${row.userEmail}` : ''} · {row.messageCount} messages ·{' '}
                    {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : ''}
                  </p>
                </div>
              ))
            )}
          </section>
        )}

        {settings && tab === 'models' && (
          <section className="bg-white rounded-3xl border border-[#dadce0] p-5">
            <Row title="Default model" hint="Used when a visitor has not picked one yet.">
              <select
                value={settings.defaultModel}
                onChange={(e) => saveSettings({ ...settings, defaultModel: e.target.value })}
                className="border border-[#dadce0] rounded-full px-3 py-1.5 text-sm"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Row>
            <div className="pt-4">
              {AI_MODELS.map((m) => (
                <div key={m.id} className="py-2">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-[#80868b]">{m.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {settings && tab === 'images' && (
          <section className="bg-white rounded-3xl border border-[#dadce0] p-5">
            <Row title="Allow image generation" hint="Turn off Images for every user.">
              <Toggle checked={settings.allowImageGen} onChange={(v) => saveSettings({ ...settings, allowImageGen: v })} />
            </Row>
            <Row title="Strip watermark" hint="Crop the Pollinations logo from generated pictures.">
              <Toggle checked={settings.stripWatermark} onChange={(v) => saveSettings({ ...settings, stripWatermark: v })} />
            </Row>
          </section>
        )}

        {settings && tab === 'access' && (
          <section className="bg-white rounded-3xl border border-[#dadce0] p-5">
            <Row title="Guest chat" hint="Let people talk without an account, like Gemini.">
              <Toggle checked={settings.allowGuestChat} onChange={(v) => saveSettings({ ...settings, allowGuestChat: v })} />
            </Row>
            <Row title="Require sign in" hint="Block guests until they create an account.">
              <Toggle checked={settings.requireLogin} onChange={(v) => saveSettings({ ...settings, requireLogin: v })} />
            </Row>
            <Row title="Allow new sign ups">
              <Toggle checked={settings.allowSignup} onChange={(v) => saveSettings({ ...settings, allowSignup: v })} />
            </Row>
            <Row title="Voice input">
              <Toggle checked={settings.allowVoice} onChange={(v) => saveSettings({ ...settings, allowVoice: v })} />
            </Row>
          </section>
        )}

        {tab === 'security' && (
          <section className="bg-white rounded-3xl border border-[#dadce0] p-5 space-y-4">
            <div className="flex items-start gap-3">
              <KeyRound size={18} className="text-[#1a73e8] mt-0.5" />
              <div>
                <p className="text-sm font-medium">Admin password</p>
                <p className="text-xs text-[#80868b] mt-1">
                  Change <code>ADMIN_PASSWORD</code> and <code>SESSION_SECRET</code> in the host environment before going live.
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">User history</p>
              <p className="text-xs text-[#80868b] mt-1">
                {counts.mongo
                  ? 'MongoDB is connected. Signed-in chats sync across devices.'
                  : 'Add MONGODB_URI so signed-in chats follow users across devices. Until then, history is stored locally per account.'}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
