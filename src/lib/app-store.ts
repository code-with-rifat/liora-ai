import fs from 'fs';
import path from 'path';
import mongoose, { Schema } from 'mongoose';
import { Conversation } from '@/types';

export type AppUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  disabled: boolean;
  createdAt: number;
  lastSeen: number;
  resetCodeHash?: string;
  resetExpires?: number;
  googleId?: string;
  picture?: string;
  provider?: 'password' | 'google' | 'both';
};

export type AppSettings = {
  stripWatermark: boolean;
  allowGuestChat: boolean;
  allowSignup: boolean;
  allowImageGen: boolean;
  requireLogin: boolean;
  allowVoice: boolean;
  defaultModel: string;
};

export type StoredConversation = Conversation & { userId: string };

type FileDB = {
  users: AppUser[];
  conversations: StoredConversation[];
  settings: AppSettings;
};

export const DEFAULT_SETTINGS: AppSettings = {
  stripWatermark: true,
  allowGuestChat: true,
  allowSignup: true,
  allowImageGen: true,
  requireLogin: false,
  allowVoice: true,
  defaultModel: 'auto',
};

const globalStore = globalThis as typeof globalThis & {
  _lioraFileDb?: FileDB;
  _mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
  _settingsCache?: { at: number; value: AppSettings };
};

function filePath() {
  const dir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
  return path.join(dir, 'liora.json');
}

function emptyDb(): FileDB {
  return { users: [], conversations: [], settings: { ...DEFAULT_SETTINGS } };
}

function loadFile(): FileDB {
  if (globalStore._lioraFileDb) return globalStore._lioraFileDb;
  try {
    const raw = fs.readFileSync(filePath(), 'utf8');
    const parsed = JSON.parse(raw) as FileDB;
    globalStore._lioraFileDb = {
      users: parsed.users || [],
      conversations: parsed.conversations || [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch {
    globalStore._lioraFileDb = emptyDb();
  }
  return globalStore._lioraFileDb;
}

function saveFile(db: FileDB) {
  globalStore._lioraFileDb = db;
  try {
    const dir = path.dirname(filePath());
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath(), JSON.stringify(db));
  } catch (err) {
    console.warn('Could not persist local store', err);
  }
}

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: String,
    passwordHash: String,
    disabled: { type: Boolean, default: false },
    createdAt: Number,
    lastSeen: Number,
    resetCodeHash: String,
    resetExpires: Number,
    googleId: String,
    picture: String,
    provider: String,
  },
  { collection: 'liora_users' }
);

const ConversationSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    title: String,
    messages: Schema.Types.Mixed,
    language: Schema.Types.Mixed,
    updatedAt: Number,
  },
  { collection: 'liora_conversations' }
);

const SettingsSchema = new Schema(
  {
    key: { type: String, default: 'app' },
    stripWatermark: Boolean,
    allowGuestChat: Boolean,
    allowSignup: Boolean,
    allowImageGen: Boolean,
    requireLogin: Boolean,
    allowVoice: Boolean,
    defaultModel: String,
  },
  { collection: 'liora_settings' }
);

function models() {
  return {
    User: mongoose.models.LioraUser || mongoose.model('LioraUser', UserSchema),
    Conversation:
      mongoose.models.LioraConversation || mongoose.model('LioraConversation', ConversationSchema),
    Settings: mongoose.models.LioraSettings || mongoose.model('LioraSettings', SettingsSchema),
  };
}

async function mongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!globalStore._mongoose) globalStore._mongoose = { conn: null, promise: null };
  if (globalStore._mongoose.conn) return globalStore._mongoose.conn;
  if (!globalStore._mongoose.promise) {
    globalStore._mongoose.promise = mongoose.connect(uri).then((m) => m);
  }
  globalStore._mongoose.conn = await globalStore._mongoose.promise;
  return globalStore._mongoose.conn;
}

export async function getSettings(): Promise<AppSettings> {
  const cached = globalStore._settingsCache;
  if (cached && Date.now() - cached.at < 20_000) return cached.value;

  const conn = await mongo();
  let value: AppSettings;
  if (conn) {
    const { Settings } = models();
    const doc = await Settings.findOne({ key: 'app' }).lean();
    value = doc ? { ...DEFAULT_SETTINGS, ...(doc as unknown as AppSettings) } : { ...DEFAULT_SETTINGS };
  } else {
    value = { ...loadFile().settings };
  }
  globalStore._settingsCache = { at: Date.now(), value };
  return value;
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const next = { ...(await getSettings()), ...patch };
  const conn = await mongo();
  if (conn) {
    const { Settings } = models();
    await Settings.findOneAndUpdate({ key: 'app' }, { key: 'app', ...next }, { upsert: true });
  } else {
    const db = loadFile();
    db.settings = next;
    saveFile(db);
  }
  globalStore._settingsCache = { at: Date.now(), value: next };
  return next;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  googleId?: string;
  picture?: string;
  provider?: AppUser['provider'];
}): Promise<AppUser | { error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes('@')) return { error: 'Enter a valid email.' };
  const conn = await mongo();
  const user: AppUser = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    name: input.name.trim() || email.split('@')[0],
    passwordHash: input.passwordHash,
    disabled: false,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    googleId: input.googleId,
    picture: input.picture,
    provider: input.provider || 'password',
  };
  if (conn) {
    const { User } = models();
    const exists = await User.findOne({ email });
    if (exists) return { error: 'An account with this email already exists.' };
    await User.create(user);
    return user;
  }
  const db = loadFile();
  if (db.users.some((u) => u.email === email)) {
    return { error: 'An account with this email already exists.' };
  }
  db.users.push(user);
  saveFile(db);
  return user;
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const normalized = email.trim().toLowerCase();
  const conn = await mongo();
  if (conn) {
    const { User } = models();
    const doc = await User.findOne({ email: normalized }).lean();
    return (doc as unknown as AppUser) || null;
  }
  return loadFile().users.find((u) => u.email === normalized) || null;
}

export async function findUserById(id: string): Promise<AppUser | null> {
  const conn = await mongo();
  if (conn) {
    const { User } = models();
    const doc = await User.findOne({ id }).lean();
    return (doc as unknown as AppUser) || null;
  }
  return loadFile().users.find((u) => u.id === id) || null;
}

export async function upsertGoogleUser(input: {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
  passwordHash: string;
}): Promise<AppUser | { error: string }> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    if (existing.disabled) return { error: 'This account has been disabled.' };
    const provider = existing.provider === 'password' ? 'both' : existing.provider || 'google';
    await patchUser(existing.id, {
      googleId: input.googleId,
      picture: input.picture || existing.picture,
      name: existing.name || input.name,
      provider,
      lastSeen: Date.now(),
    });
    return { ...existing, googleId: input.googleId, picture: input.picture || existing.picture, provider };
  }
  return createUser({
    email: input.email,
    name: input.name,
    passwordHash: input.passwordHash,
    googleId: input.googleId,
    picture: input.picture,
    provider: 'google',
  });
}

export async function touchUser(id: string) {
  const conn = await mongo();
  if (conn) {
    const { User } = models();
    await User.updateOne({ id }, { lastSeen: Date.now() });
    return;
  }
  const db = loadFile();
  const user = db.users.find((u) => u.id === id);
  if (user) {
    user.lastSeen = Date.now();
    saveFile(db);
  }
}

export async function listUsers(): Promise<Omit<AppUser, 'passwordHash'>[]> {
  const conn = await mongo();
  if (conn) {
    const { User } = models();
    const docs = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
    return docs as unknown as Omit<AppUser, 'passwordHash'>[];
  }
  return loadFile().users.map(({ passwordHash: _p, ...rest }) => rest);
}

export async function patchUser(id: string, patch: Partial<AppUser>) {
  const conn = await mongo();
  if (conn) {
    const { User } = models();
    await User.updateOne({ id }, { $set: patch });
    return;
  }
  const db = loadFile();
  const user = db.users.find((u) => u.id === id);
  if (user) {
    Object.assign(user, patch);
    saveFile(db);
  }
}

export async function setUserDisabled(id: string, disabled: boolean) {
  await patchUser(id, { disabled });
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  const conn = await mongo();
  if (conn) {
    const { Conversation: Model } = models();
    const docs = await Model.find({ userId }).sort({ updatedAt: -1 }).lean();
    return docs.map((d: any) => ({
      id: d.id,
      title: d.title,
      messages: d.messages || [],
      language: d.language || null,
      updatedAt: d.updatedAt,
    }));
  }
  return loadFile()
    .conversations.filter((c) => c.userId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(({ userId: _u, ...rest }) => rest);
}

export async function upsertUserConversation(userId: string, conversation: Conversation) {
  const stored: StoredConversation = { ...conversation, userId };
  const conn = await mongo();
  if (conn) {
    const { Conversation: Model } = models();
    await Model.findOneAndUpdate({ id: conversation.id, userId }, stored, { upsert: true });
    return;
  }
  const db = loadFile();
  db.conversations = [
    stored,
    ...db.conversations.filter((c) => !(c.id === conversation.id && c.userId === userId)),
  ].slice(0, 400);
  saveFile(db);
}

export async function stats() {
  const conn = await mongo();
  if (conn) {
    const { User, Conversation } = models();
    return {
      users: await User.countDocuments(),
      conversations: await Conversation.countDocuments(),
      mongo: true,
    };
  }
  const db = loadFile();
  return { users: db.users.length, conversations: db.conversations.length, mongo: false };
}

export async function listActivity(limit = 40) {
  const users = await listUsers();
  const byId = new Map(users.map((u) => [u.id, u]));
  const conn = await mongo();
  if (conn) {
    const { Conversation: Model } = models();
    const docs = await Model.find({}).sort({ updatedAt: -1 }).limit(limit).lean();
    return docs.map((d: any) => {
      const owner = byId.get(d.userId);
      return {
        id: d.id,
        title: d.title || 'New chat',
        userId: d.userId,
        userName: owner?.name || 'Unknown',
        userEmail: owner?.email || '',
        updatedAt: d.updatedAt,
        messageCount: Array.isArray(d.messages) ? d.messages.length : 0,
      };
    });
  }
  return loadFile()
    .conversations.sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
    .map((c) => {
      const owner = byId.get(c.userId);
      return {
        id: c.id,
        title: c.title || 'New chat',
        userId: c.userId,
        userName: owner?.name || 'Guest',
        userEmail: owner?.email || '',
        updatedAt: c.updatedAt,
        messageCount: c.messages?.length || 0,
      };
    });
}
