import { AI_NAME } from './brand';
import { creatorShortReply, CREATOR_PROFILE } from './creator';
import {
  detectLanguageLock,
  extractImagePrompt,
  isCreatorInfoQuestion,
  isCreatorQuestion,
  isImageRequest,
  languageHint,
  ReplyLanguage,
  resolveReplyLanguage,
} from './language';
import { ChatMessage } from '@/types';
import { AIModelId, isAIModelId, resolveChatModel } from './models';
import { publicImagePath } from './image-clean';
import { findKnowledgeMatch } from './knowledge-base';
import { extractConversationMemory, resolveMemoryQuery } from './memory';
import { retrieveRAGContext } from './rag-engine';

export interface ChatEngineOptions {
  messages: ChatMessage[];
  apiKey?: string;
  language?: ReplyLanguage | null;
  modelId?: AIModelId;
}

export interface ChatEngineResult {
  text: string;
  modelUsed: string;
  language: ReplyLanguage;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

function latestUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user' && messages[i].content.trim()) {
      return messages[i].content.trim();
    }
  }
  return '';
}

function detectOptimalTemperature(query: string): number {
  const q = query.toLowerCase();
  // If math, coding, bug-fixing, system config, or facts -> use low temperature for maximum precision
  if (
    q.includes('code') ||
    q.includes('function') ||
    q.includes('bug') ||
    q.includes('error') ||
    q.includes('react') ||
    q.includes('next') ||
    q.includes('laravel') ||
    q.includes('python') ||
    q.includes('sql') ||
    q.includes('calculate') ||
    q.includes('solve') ||
    q.includes('math') ||
    q.includes('formula') ||
    /[0-9+\-*/=^]/.test(q)
  ) {
    return 0.2;
  }
  return 0.7;
}

function buildAgenticRAGSystemPrompt(
  langHint: string,
  messages: ChatMessage[],
  latestQuery: string
): string {
  const memory = extractConversationMemory(messages);
  const memoryLines: string[] = [];
  if (memory.name) memoryLines.push(`- User Name: ${memory.name}`);
  if (memory.location) memoryLines.push(`- User Location: ${memory.location}`);
  if (memory.role) memoryLines.push(`- User Role/Profession: ${memory.role}`);
  if (memory.techStack && memory.techStack.length) memoryLines.push(`- User Tech Stack: ${memory.techStack.join(', ')}`);
  if (memory.currentProject) memoryLines.push(`- Active Project: ${memory.currentProject}`);

  const ragContext = retrieveRAGContext(latestQuery, 3);

  return `You are ${AI_NAME}, an exceptionally intelligent, adaptive, and highly capable AI Assistant engineered with Google Gemini's signature communication style, deep reasoning, and clean multi-lingual formatting.

### 🌟 GEMINI-GRADE SIGNATURE RESPONSE & FORMATTING RULES (STRICT):

1. **Direct Opening (Zero Fluff / No Filler)**:
   - Never start with conversational filler or throat-clearing phrases (e.g. NEVER say "Sure, I can help with that", "Apnar proshner uttor holo", "Here is your answer", "Hey there!").
   - From Sentence 1, dive immediately into the core, actionable, and rich answer.

2. **Clean & High-Hierarchy Formatting**:
   - Beautifully organize every response with clear headings, subheadings, and categorized sections.
   - **Bold Key Terms**: Emphasize important concepts, keywords, or names using **bold**.
   - **Numbered Lists (1, 2, 3)**: Use numbered lists for sequential steps, instructions, rankings, or categorized points.
   - **Bullet Points (- / *)**: Use bullet points for features, details, options, and descriptions.

3. **Smart Markdown Tables**:
   - Whenever comparisons, pros/cons, feature matrices, plans, or structured datasets arise, ALWAYS generate clean Markdown Tables ("| Column 1 | Column 2 | Column 3 |").

4. **Adaptive Tone & Language Matching**:
   - Perfectly match the user's language and style:
     * **Bengali (বাংলা)**: Natural, rich, helpful, and grammatically sound Bangla.
     * **Banglish**: Authentic, conversational, smart, and friendly Banglish.
     * **English**: Clear, structured, articulate, and professional English.
   - Keep the tone intelligent, smart, and warmly friendly.

5. **No Robotic Closes**:
   - NEVER use artificial closing headers or mechanical endings like "In conclusion", "Summary", or "Bottom line".
   - Conclude naturally with a thoughtful finishing sentence, a helpful follow-up offer, or a concise actionable bullet.

6. **Chain-of-Thought & Anti-Hallucination**:
   - For coding, complex logic, and calculations, reason step-by-step.
   - Always format code blocks with explicit language tags (\`\`\`typescript, \`\`\`php, \`\`\`python) and math in LaTeX (\`$x^2$\`, \`$$A = \\pi r^2$$\`).
   - Ground facts strictly in verified knowledge and RAG context; never invent unverified information.

7. **Creator & Architect Attribution**:
   - You were architected and created by **Md. Riazul Islam Rifat** (Full-Stack Software Engineer & AI Systems Architect based in Dhaka, Bangladesh; Portfolio: ${CREATOR_PROFILE.portfolio}, Email: ${CREATOR_PROFILE.email}, GitHub: ${CREATOR_PROFILE.github}).

${memoryLines.length ? `### ACTIVE USER PROFILE & SESSION MEMORY:\n${memoryLines.join('\n')}\n` : ''}
${ragContext ? `### RETRIEVED VERIFIED KNOWLEDGE (RAG CONTEXT):\n${ragContext}\n` : ''}
### TARGET LANGUAGE INSTRUCTION:
${langHint}`;
}

// Convert ChatMessages to OpenAI multi-turn format (keeps up to last 24 messages for full memory)
function formatOpenAIMessages(messages: ChatMessage[], systemPrompt: string) {
  const formatted: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  const recent = messages.filter((m) => m.content && m.content.trim()).slice(-24);
  for (const m of recent) {
    if (m.role === 'user' || m.role === 'assistant') {
      formatted.push({
        role: m.role,
        content: m.content.trim(),
      });
    }
  }
  return formatted;
}

// Build sequential multi-turn transcript for text endpoints
function formatMultiTurnTranscript(messages: ChatMessage[], systemPrompt: string): string {
  const lines: string[] = [systemPrompt, ''];
  const recent = messages.filter((m) => m.content && m.content.trim()).slice(-20);

  for (const m of recent) {
    if (m.role === 'user') {
      lines.push(`User: ${m.content.trim()}`);
    } else if (m.role === 'assistant') {
      lines.push(`Assistant: ${m.content.trim()}`);
    }
  }

  lines.push('Assistant:');
  return lines.join('\n\n');
}

// Convert ChatMessages to Gemini API history format
function formatGeminiContents(messages: ChatMessage[], latestText: string) {
  const recent = messages
    .filter((m) => m.content && m.content.trim())
    .slice(0, -1)
    .slice(-20);

  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const m of recent) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n${m.content}`;
    } else {
      contents.push({ role, parts: [{ text: m.content }] });
    }
  }

  if (contents.length && contents[0].role !== 'user') {
    contents.shift();
  }

  contents.push({ role: 'user', parts: [{ text: latestText }] });
  return contents;
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isUsableText(text: string): boolean {
  if (!text) return false;
  const t = text.trim();
  if (t.length < 1) return false;
  if (t.includes('<!DOCTYPE') || t.includes('<html')) return false;
  if (t.includes('Queue full') || t.includes('"status":429')) return false;
  if (t.startsWith('{"error"') || t.includes('"error":')) return false;
  return true;
}

function imageCaption(lang: ReplyLanguage, prompt: string): string {
  if (lang === 'bn' || lang === 'mix') {
    return `এই নিন — আপনার অনুরোধ অনুযায়ী ছবি:\n\n*${prompt}*`;
  }
  if (lang === 'banglish') {
    return `Ei lo — tomar request onujayi image:\n\n*${prompt}*`;
  }
  return `Here is the image for:\n\n*${prompt}*`;
}

function buildImageUrl(prompt: string): string {
  const seed = Math.floor(Math.random() * 1_000_000);
  return publicImagePath(prompt, 1024, 1024, seed);
}

// 1. Google Gemini Provider with Adaptive Temperature and Free Tier Fallbacks
async function tryGeminiAPI(
  messages: ChatMessage[],
  latestText: string,
  apiKey: string,
  systemPrompt: string
): Promise<string | null> {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  const contents = formatGeminiContents(messages, latestText);
  const temperature = detectOptimalTemperature(latestText);

  for (const model of models) {
    try {
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              maxOutputTokens: 2500,
              temperature,
              topP: 0.95,
            },
          }),
        },
        9000
      );

      if (!res.ok) continue;
      const data = await res.json();
      const text = (data?.candidates?.[0]?.content?.parts || [])
        .map((p: { text?: string }) => p.text || '')
        .join('');
      if (isUsableText(text)) return text.trim();
    } catch {
      // try next model
    }
  }
  return null;
}

// 2. Pollinations Neural AI with Multi-Turn Memory & RAG Context
async function tryPollinationsMultiTurn(
  messages: ChatMessage[],
  systemPrompt: string,
  modelName = 'openai-fast'
): Promise<string | null> {
  // Method A: Fast GET with full multi-turn conversational transcript
  try {
    const fullTranscript = formatMultiTurnTranscript(messages, systemPrompt);
    const encoded = encodeURIComponent(fullTranscript);
    const getRes = await fetchWithTimeout(
      `https://text.pollinations.ai/${encoded}?model=${encodeURIComponent(modelName)}&seed=${Date.now()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/plain, text/markdown',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      },
      18000
    );

    if (getRes.ok) {
      const raw = await getRes.text();
      if (isUsableText(raw)) return raw.trim();
    }
  } catch {
    // fallback to POST
  }

  // Method B: OpenAI endpoint format
  try {
    const formatted = formatOpenAIMessages(messages, systemPrompt);
    const postRes = await fetchWithTimeout(
      'https://text.pollinations.ai/openai',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain',
        },
        body: JSON.stringify({
          model: modelName,
          messages: formatted,
          temperature: 0.7,
        }),
      },
      12000
    );

    if (postRes.ok) {
      const raw = await postRes.text();
      try {
        const data = JSON.parse(raw);
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text === 'string' && isUsableText(text)) return text.trim();
      } catch {
        if (isUsableText(raw)) return raw.trim();
      }
    }
  } catch {
    // fallback
  }

  return null;
}

// 3. Groq Provider (Ultra-Fast LPU Inference with Verified Active Models)
async function tryGroq(messages: ChatMessage[], systemPrompt: string, userText: string): Promise<{ text: string; modelUsed: string } | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  // Active verified models on user's Groq account
  const groqModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'allam-2-7b',
  ];

  const temperature = detectOptimalTemperature(userText);
  const formatted = formatOpenAIMessages(messages, systemPrompt);

  for (const model of groqModels) {
    try {
      const res = await fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: formatted,
            temperature,
            max_tokens: 3500,
          }),
        },
        9000
      );

      if (!res.ok) continue;
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string' && isUsableText(content)) {
        const friendlyName = model.includes('120b')
          ? 'Groq GPT-OSS 120B'
          : model.includes('20b')
            ? 'Groq GPT-OSS 20B'
            : model.includes('qwen')
              ? 'Groq Qwen 27B'
              : `Groq (${model})`;
        return { text: content.trim(), modelUsed: friendlyName };
      }
    } catch {
      // try next groq model
    }
  }

  return null;
}

// 4. OpenRouter Provider (Multi-Model Hub with 200+ Free & Paid Models)
async function tryOpenRouter(messages: ChatMessage[], systemPrompt: string): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const openRouterModels = [
    'liquid/lfm-2.5-2.6b:free',
    'qwen/qwen3.8-27b:free',
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'z-ai/glm-5.2:free',
    'nex-agi/nex-n2.5-pro:free',
    'google/gemini-2.0-flash-exp:free',
  ];

  const formatted = formatOpenAIMessages(messages, systemPrompt);

  for (const model of openRouterModels) {
    try {
      const res = await fetchWithTimeout(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://liora.app',
            'X-Title': 'Liora AI',
          },
          body: JSON.stringify({
            model,
            messages: formatted,
          }),
        },
        8000
      );

      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === 'string' && isUsableText(text)) return text.trim();
    } catch {
      // try next model
    }
  }

  return null;
}

function firstTruthy<T>(jobs: Array<Promise<T | null | undefined>>): Promise<T | null> {
  return new Promise((resolve) => {
    let left = jobs.length;
    if (!left) {
      resolve(null);
      return;
    }
    let done = false;
    for (const job of jobs) {
      job
        .then((value) => {
          if (done) return;
          if (value) {
            done = true;
            resolve(value);
            return;
          }
          left -= 1;
          if (left === 0) resolve(null);
        })
        .catch(() => {
          if (done) return;
          left -= 1;
          if (left === 0) resolve(null);
        });
    }
  });
}

function resolvedLang(messages: ChatMessage[], locked?: ReplyLanguage | null): ReplyLanguage {
  const userText = latestUserText(messages);
  return resolveReplyLanguage(userText, locked || null);
}

export async function processChatStream(
  options: ChatEngineOptions,
  onDelta: (chunk: string) => void
): Promise<ChatEngineResult> {
  const { messages, apiKey, language } = options;
  const modelId = isAIModelId(options.modelId) ? options.modelId : 'auto';
  const userText = latestUserText(messages);
  const lang = resolvedLang(messages, language);
  const hint = languageHint(lang);
  const systemPrompt = buildAgenticRAGSystemPrompt(hint, messages, userText);
  const geminiKey = apiKey || process.env.GEMINI_API_KEY || '';
  const resolved = resolveChatModel(modelId, Boolean(geminiKey));

  // 1. Direct Creator Question Handling
  if (isCreatorQuestion(userText) || isCreatorInfoQuestion(userText)) {
    const text = creatorShortReply(lang);
    onDelta(text);
    return { text, modelUsed: AI_NAME, language: lang };
  }

  // 2. Direct Conversational Memory Query (e.g. "amar nam ki", "kothay thaki", "amar stack ki", etc.)
  const directMemory = resolveMemoryQuery(userText, messages, lang);
  if (directMemory) {
    onDelta(directMemory);
    return { text: directMemory, modelUsed: `${AI_NAME} Memory`, language: lang };
  }

  // 3. Image Generation Intent Handling
  if (isImageRequest(userText)) {
    const prompt = extractImagePrompt(userText);
    const text = imageCaption(lang, prompt);
    onDelta(text);
    return {
      text,
      modelUsed: `${AI_NAME} Image`,
      language: lang,
      mediaUrl: buildImageUrl(prompt),
      mediaType: 'image',
    };
  }

  // 4. Parallel Resilient AI Execution Pipeline with Full Memory & RAG
  const jobs: Array<Promise<{ text: string; modelUsed: string } | null>> = [
    // Gemini API
    geminiKey
      ? tryGeminiAPI(messages, userText, geminiKey, systemPrompt).then((text) =>
          text ? { text, modelUsed: 'Gemini 2.0 Flash' } : null
        )
      : Promise.resolve(null),

    // Groq LPU (Ultra-Fast 120B / 27B / 70B Models)
    tryGroq(messages, systemPrompt, userText),

    // OpenRouter (Qwen 2.5)
    tryOpenRouter(messages, systemPrompt).then((text) =>
      text ? { text, modelUsed: 'Qwen 2.5' } : null
    ),

    // Pollinations Neural AI (openai-fast with full multi-turn memory and RAG context)
    tryPollinationsMultiTurn(messages, systemPrompt, 'openai-fast').then((text) =>
      text ? { text, modelUsed: 'Neural AI' } : null
    ),
  ];

  const winner = await firstTruthy(jobs);
  if (winner) {
    onDelta(winner.text);
    return { ...winner, language: lang };
  }

  // 5. Offline / Edge Knowledge Base & Math Calculation Solver
  const knowledgeMatch = findKnowledgeMatch(userText, lang);
  if (knowledgeMatch) {
    onDelta(knowledgeMatch);
    return { text: knowledgeMatch, modelUsed: `${AI_NAME} Knowledge Engine`, language: lang };
  }

  // 6. Intelligent Graceful Fallback
  const fallback =
    lang === 'bn' || lang === 'mix'
      ? `আমি **${AI_NAME}** — আপনার সব প্রশ্নের উত্তর, গণিত ও কোডিং সমাধান দিতে প্রস্তুত। অনুগ্রহ করে প্রশ্নটি আবার লিখুন, আমি দ্রুত বিস্তারিত উত্তর দিচ্ছি!`
      : lang === 'banglish'
        ? `Ami **${AI_NAME}** — tomar sob question er answer, math ar coding solution dite ready. Question ta abar likho ami complete answer dichhi!`
        : `I am **${AI_NAME}**, ready to assist with all your questions, programming, mathematics, and learning. Please resend your query and I will provide the complete answer immediately!`;

  onDelta(fallback);
  return { text: fallback, modelUsed: AI_NAME, language: lang };
}

export async function processChat(options: ChatEngineOptions): Promise<ChatEngineResult> {
  return processChatStream(options, () => {});
}

export { detectLanguageLock };
