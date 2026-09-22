export type ReplyLanguage = 'bn' | 'banglish' | 'en' | 'mix' | 'other';

const BANGLISH_HINT =
  /\b(tmi|tumi|ami|apni|apnar|kemon|acho|aso|achen|korba|parba|kivabe|dorkar|lagbe|bujhte|shundor|sundor|bhalo|valo|banate|banai|tumar|tomar|tomake|tmk|amake|kothay|ektu|parina|banaiso|banayche|baniyeche|kotha|aschi|jachhe|keno|naki|lekho|bolo)\b/i;

export function hasBengaliScript(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

export function isMixedLanguage(text: string): boolean {
  return hasBengaliScript(text) && /[a-zA-Z]{3,}/.test(text);
}

export function detectLanguage(text: string): ReplyLanguage {
  if (isMixedLanguage(text)) return 'mix';
  if (hasBengaliScript(text)) return 'bn';
  if (BANGLISH_HINT.test(text)) return 'banglish';
  if (/[a-zA-Z]/.test(text)) return 'en';
  return 'other';
}

export function detectLanguageLock(text: string): ReplyLanguage | null {
  const lower = text.toLowerCase();

  if (
    /banglish/.test(lower) ||
    /বাংলিশ/.test(text)
  ) {
    return 'banglish';
  }

  if (
    /bangla[yi]?\s*(e|te)?\s*(lekho|likho|bolo|bolun|kotha)/i.test(lower) ||
    /write in bangla/i.test(lower) ||
    /speak (in )?bangla/i.test(lower) ||
    /in bengali/i.test(lower) ||
    /বাংলায়\s*(লেখো|লিখো|বলো|কথা)/.test(text) ||
    /বাংলা\s*(তে|য়)\s*(লেখো|লিখো|বলো|কথা)/.test(text)
  ) {
    return 'bn';
  }

  if (
    /english\s*(e|te)?\s*(kotha|lekho|likho|bolo)/i.test(lower) ||
    /in english/i.test(lower) ||
    /speak english/i.test(lower) ||
    /ইংরেজি(তে|য়)?\s*(লেখো|লিখো|বলো|কথা)/.test(text)
  ) {
    return 'en';
  }

  return null;
}

export function resolveReplyLanguage(
  latestText: string,
  locked: ReplyLanguage | null | undefined
): ReplyLanguage {
  const command = detectLanguageLock(latestText);
  if (command) return command;

  const current = detectLanguage(latestText);
  if (current === 'mix') return 'mix';
  if (locked && locked !== 'other') return locked;
  return current;
}

export function speechLangFor(text: string): string {
  const lang = detectLanguage(text);
  if (lang === 'bn' || lang === 'mix') return 'bn-BD';
  return 'en-US';
}

export function isCreatorQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /who (created|made|built|designed|developed) (you|this)/i.test(text) ||
    /who is your (creator|maker|developer|author)/i.test(text) ||
    /your creator/i.test(text) ||
    /\b(tmk|tumar|tomar|tomake|amake)\b.*\b(bani|creator)/i.test(lower) ||
    lower.includes('creator ke') ||
    lower.includes('creator k') ||
    lower.includes('ke banay') ||
    lower.includes('ke banai') ||
    lower.includes('ke baniye') ||
    lower.includes('k banise') ||
    lower.includes('k banaiso') ||
    lower.includes('ke banaiso') ||
    lower.includes('baniyeche') ||
    lower.includes('baniyechhe') ||
    lower.includes('tumar creator') ||
    lower.includes('tomar creator') ||
    lower.includes('কার তৈরি') ||
    lower.includes('কে বানিয়েছে') ||
    lower.includes('কে বানিয়েছে') ||
    lower.includes('কে তৈরি') ||
    lower.includes('সৃষ্টিকর্তা') ||
    lower.includes('তোমার ক্রিয়েটর') ||
    lower.includes('কে তৈরি করেছে')
  );
}

export function isCreatorInfoQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\bwho is rifat\b/i.test(text) ||
    /\brifat (ke|er|k)\b/i.test(lower) ||
    /creator er (email|mail|number|phone|github|portfolio|contact|linkedin)/i.test(lower) ||
    /tumar (creator|developer) er/i.test(lower) ||
    lower.includes('porthfulio') ||
    lower.includes('portfolio link') ||
    lower.includes('portfolio dao') ||
    /creator (er )?(info|information|details|porichoy)/i.test(lower)
  );
}

export function isSkillQuestion(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    /what can you (do|help)/i.test(text) ||
    /can you (code|write code|help me code|program)/i.test(text) ||
    /\b(tmi|tumi|apni)\s+(ki\s+)?(code|coding)\s+korte\s+(paro|parba|parben|parbi)\b/i.test(lower) ||
    /\b(code|coding)\s+korte\s+(paro|parba|parben|parbi)\b/i.test(lower) ||
    /\bki (kaj|kj) korte (paro|parba|parben)\b/i.test(lower) ||
    /\bkis(u)? korte (paro|parba|parben)\b/i.test(lower) ||
    text.includes('কী করতে পারো') ||
    text.includes('কি করতে পারো') ||
    text.includes('কোড করতে পারো')
  );
}

export function isGreeting(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(hi|hii|hello|hey|yo|salam|assalamu[\s-]?alaikum|assalamualaikum|tmi kemon acho|tumi kemon acho|kemon acho|hello liora|hi liora)[\s!.?]*$/i.test(
    t
  );
}

export function isNameQuestion(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    /what('s| is) your name/i.test(text) ||
    /\bwho are you\b/i.test(text) ||
    /\b(tumar|tomar) nam\b/.test(lower) ||
    /\b(tmi|tumi|apni) ke\b/.test(lower) ||
    text.includes('তোমার নাম') ||
    text.includes('তুমি কে') ||
    text.includes('আপনি কে') ||
    text.includes('নাম কি') ||
    text.includes('নাম কী')
  );
}

export function isImageRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\b(generate|create|draw|make|design)\b.*\b(image|picture|photo|art|illustration)\b/i.test(text) ||
    /\b(image|picture|photo|art) of\b/i.test(text) ||
    lower.includes('chobi') ||
    lower.includes('chobi bana') ||
    lower.includes('image generate') ||
    lower.includes('generate image') ||
    lower.includes('draw me') ||
    lower.includes('ছবি') ||
    lower.includes('ছবি বানা') ||
    lower.includes('ছবি তৈরি')
  );
}

export function extractImagePrompt(text: string): string {
  return text
    .replace(/^(please\s+)?(generate|create|draw|make|design)\s+(an?\s+)?(image|picture|photo|art|illustration)\s+(of\s+)?/i, '')
    .replace(/^(ekta\s+)?(chobi|image)\s+(banao|banate|bana|koro)\s*/i, '')
    .replace(/^(একটা\s+)?ছবি\s+(বানাও|বানা|তৈরি\s+করো)\s*/i, '')
    .trim() || text;
}

export function languageHint(lang: ReplyLanguage): string {
  if (lang === 'bn') {
    return 'CONVERSATION LANGUAGE LOCK: Reply entirely in natural fluent বাংলা for this and later turns, until the user asks to switch. Even if they type some English words, keep answering in বাংলা unless they mixed both scripts in this message.';
  }
  if (lang === 'banglish') {
    return 'CONVERSATION LANGUAGE LOCK: Reply in natural Banglish (Bengali in English letters) until the user asks to switch.';
  }
  if (lang === 'en') {
    return 'CONVERSATION LANGUAGE LOCK: Reply in clear English until the user asks to switch.';
  }
  if (lang === 'mix') {
    return 'The user mixed বাংলা and English in this message. Reply in the same mixed style — keep both languages, do not flatten everything into only English or only Bangla.';
  }
  return 'Reply in the same language and style the user used.';
}
