import { ChatMessage } from '@/types';
import { ReplyLanguage } from './language';

export interface ExtractedUserContext {
  name?: string;
  location?: string;
  role?: string;
  techStack?: string[];
  currentProject?: string;
  lastTopic?: string;
  lastCodeBlock?: string;
  userPreferences?: Record<string, string>;
  facts?: string[];
}

const QUESTION_WORDS = new Set([
  'ki', 'kya', 'what', 'কী', 'কি', 'কোন', 'kon', 'kar', 'koto', 'keno', 'kivabe',
  'how', 'who', 'where', 'when', 'why', 'kothay', 'kothaye', 'kothai', 'কোথায়', 'কোনখানে',
  'bolchi', 'bolsi', 'achi', 'thaki', 'bolen', 'bolo', 'janen', 'jano'
]);

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractConversationMemory(messages: ChatMessage[]): ExtractedUserContext {
  const context: ExtractedUserContext = {
    techStack: [],
    facts: [],
    userPreferences: {},
  };

  const detectedTech = new Set<string>();

  for (const m of messages) {
    if (m.role === 'user' && m.content) {
      const text = m.content.trim();
      const lower = text.toLowerCase();

      // 1. Extract Name: "Amar nam X", "my name is X", "আমার নাম X", "ami X"
      const nameMatch =
        text.match(/(?:amar\s*nam|my\s*name\s*is|amar\s*name|আমার\s*নাম(?:\s*হলো|\s*হল)?)\s*(?:holo|is)?\s*([A-Za-z\u0980-\u09FF]+)/i) ||
        text.match(/^ami\s+([A-Z][a-z]+)/i) ||
        text.match(/^আমি\s+([A-Za-z\u0980-\u09FF]+)$/);
      if (nameMatch && nameMatch[1]) {
        const candidate = nameMatch[1].trim();
        if (!QUESTION_WORDS.has(candidate.toLowerCase()) && candidate.length > 1) {
          context.name = candidate;
        }
      }

      // 2. Extract Location: "Dhaka theke", "Dhaka te thaki", "I live in Dhaka", "ঢাকায় থাকি", "ঢাকা থেকে"
      const locMatch =
        text.match(/([A-Za-z\u0980-\u09FF]+)\s+theke(?:\s+bolchi|\s+bolsi|\s+kotha)?/i) ||
        text.match(/(?:ami|i\s*live\s*in|from)\s+([A-Za-z\u0980-\u09FF]+)(?:\s*te\s*thaki|\s*thaki|\s*e\s*thaki)/i) ||
        text.match(/([A-Za-z\u0980-\u09FF]+)(?:-এ|ে|\s*তে|\s*এ)\s*(?:থাকি|বসবাস\s*করি)/i) ||
        text.match(/(?:আমি\s*)?([A-Za-z\u0980-\u09FF]+)\s*থেকে(?:\s*বলছি|\s*বলসি)?/i);
      if (locMatch && locMatch[1]) {
        const candidate = locMatch[1].trim();
        if (!QUESTION_WORDS.has(candidate.toLowerCase()) && candidate.toLowerCase() !== 'ami' && candidate.toLowerCase() !== 'আমি') {
          context.location = candidate;
        }
      }

      // 3. Extract Role / Profession
      const roleMatch = text.match(
        /(full-stack\s*software\s*engineer|full-stack\s*developer|web\s*developer|software\s*engineer|frontend\s*developer|backend\s*developer|student|programmer|designer|doctor|teacher|data\s*scientist|ai\s*engineer|ডেভেলপার|প্রোগ্রামার|সফটওয়্যার\s*ইঞ্জিনিয়ার|শিক্ষার্থী|ছাত্র)/i
      );
      if (roleMatch && roleMatch[1]) {
        context.role = roleMatch[1].trim();
      }

      // 4. Detect Tech Mentions
      const techKeywords = [
        'react', 'nextjs', 'next.js', 'vue', 'angular', 'svelte', 'laravel', 'php',
        'python', 'javascript', 'typescript', 'node', 'nodejs', 'express', 'django',
        'fastapi', 'flask', 'tailwind', 'bootstrap', 'mongodb', 'mysql', 'postgresql',
        'postgres', 'redis', 'docker', 'git', 'c++', 'c#', 'java', 'go', 'rust',
        'supabase', 'prisma', 'pytorch', 'tensorflow', 'graphql', 'flutter'
      ];
      for (const tech of techKeywords) {
        if (tech === 'c++' || tech === 'c#') {
          if (lower.includes(tech)) detectedTech.add(tech.toUpperCase());
        } else {
          const regex = new RegExp(`\\b${escapeRegExp(tech)}\\b`, 'i');
          if (regex.test(text)) {
            detectedTech.add(tech);
          }
        }
      }

      // 5. Extract Project Goals
      const projMatch = text.match(/(?:banate\s*chai|making|building|toiri\s*korbo|project\s*holo|বানাচ্ছি|তৈরি\s*করছি)\s+([a-zA-Z0-9\u0980-\u09FF\s-]+)(?:app|website|system|portal|অ্যাপ|ওয়েবসাইট)?/i);
      if (projMatch && projMatch[1] && projMatch[1].length < 40) {
        context.currentProject = projMatch[1].trim();
      }
    }

    if (m.content) {
      // Check for code blocks
      const codeMatch = m.content.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        context.lastCodeBlock = codeMatch[1];
      }
    }
  }

  context.techStack = Array.from(detectedTech);
  return context;
}

export function resolveMemoryQuery(
  query: string,
  messages: ChatMessage[],
  lang: ReplyLanguage
): string | null {
  const lower = query.toLowerCase().trim();
  const memory = extractConversationMemory(messages);

  const asksName =
    lower.includes('amar nam ki') ||
    lower.includes('amar name ki') ||
    lower.includes('what is my name') ||
    lower.includes('who am i') ||
    lower.includes('আমার নাম কি') ||
    lower.includes('আমার নাম কী') ||
    lower.includes('আমি কে');

  const asksLocation =
    lower.includes('kothay thaki') ||
    lower.includes('kon shohore') ||
    lower.includes('where do i live') ||
    lower.includes('কোথায় থাকি') ||
    lower.includes('কোন্ শহরে') ||
    lower.includes('আমার বাসা কোথায়');

  const asksRole =
    lower.includes('ami ki kori') ||
    lower.includes('amar profession') ||
    lower.includes('what do i do') ||
    lower.includes('আমি কি করি') ||
    lower.includes('আমার পেশা কি');

  const asksStack =
    lower.includes('amar stack ki') ||
    lower.includes('ami ki ki tech') ||
    lower.includes('what tech do i use') ||
    lower.includes('আমার স্ট্যাক কি') ||
    lower.includes('আমার প্রযুক্তি কি');

  const asksAll =
    lower.includes('amar somporke ki jano') ||
    lower.includes('amar somporke ki ki jano') ||
    lower.includes('what do you know about me') ||
    lower.includes('আমার সম্পর্কে কি জানো') ||
    lower.includes('আমার সম্পর্কে বলো') ||
    lower.includes('amake cheno') ||
    lower.includes('আমাকে চেনো');

  if (asksAll && (memory.name || memory.location || memory.role || (memory.techStack && memory.techStack.length > 0))) {
    const details: string[] = [];
    if (memory.name) details.push(lang === 'bn' || lang === 'mix' ? `নাম: **${memory.name}**` : `Name: **${memory.name}**`);
    if (memory.location) details.push(lang === 'bn' || lang === 'mix' ? `অবস্থান: **${memory.location}**` : `Location: **${memory.location}**`);
    if (memory.role) details.push(lang === 'bn' || lang === 'mix' ? `পেশা: **${memory.role}**` : `Role: **${memory.role}**`);
    if (memory.techStack && memory.techStack.length) {
      details.push(lang === 'bn' || lang === 'mix' ? `টেক স্ট্যাক: **${memory.techStack.join(', ')}**` : `Tech Stack: **${memory.techStack.join(', ')}**`);
    }
    if (memory.currentProject) {
      details.push(lang === 'bn' || lang === 'mix' ? `চলমান প্রোজেক্ট: **${memory.currentProject}**` : `Current Project: **${memory.currentProject}**`);
    }

    if (lang === 'bn' || lang === 'mix') {
      return `আপনার সম্পর্কে আমি যা মনে রেখেছি:\n\n${details.map((d) => `- ${d}`).join('\n')}\n\nবলুন, আর কীভাবে সাহায্য করতে পারি?`;
    }
    if (lang === 'banglish') {
      return `Tomar shomporke ami ja jani:\n\n${details.map((d) => `- ${d}`).join('\n')}\n\nBolo ar ki help lagbe?`;
    }
    return `Here is what I remember about you from our conversation:\n\n${details.map((d) => `- ${d}`).join('\n')}\n\nHow can I help you next?`;
  }

  if (asksName && asksLocation && memory.name && memory.location) {
    if (lang === 'bn' || lang === 'mix') {
      return `আপনার নাম **${memory.name}** এবং আপনি **${memory.location}**-এ থাকেন। ${memory.role ? `আপনি একজন **${memory.role}**।` : ''}`;
    }
    if (lang === 'banglish') {
      return `Tomar nam **${memory.name}** ar tumi **${memory.location}** e thako. ${memory.role ? `Tumi ekjon **${memory.role}**।` : ''}`;
    }
    return `Your name is **${memory.name}** and you live in **${memory.location}**. ${memory.role ? `You are a **${memory.role}**.` : ''}`;
  }

  if (asksName && memory.name) {
    if (lang === 'bn' || lang === 'mix') return `আপনার নাম **${memory.name}**।`;
    if (lang === 'banglish') return `Tomar nam holo **${memory.name}**।`;
    return `Your name is **${memory.name}**.`;
  }

  if (asksLocation && memory.location) {
    if (lang === 'bn' || lang === 'mix') return `আপনি **${memory.location}**-এ থাকেন।`;
    if (lang === 'banglish') return `Tumi **${memory.location}** e thako.`;
    return `You live in **${memory.location}**.`;
  }

  if (asksRole && memory.role) {
    if (lang === 'bn' || lang === 'mix') return `আপনি একজন **${memory.role}**।`;
    if (lang === 'banglish') return `Tumi ekjon **${memory.role}**।`;
    return `You are a **${memory.role}**.`;
  }

  if (asksStack && memory.techStack && memory.techStack.length) {
    if (lang === 'bn' || lang === 'mix') return `আপনি **${memory.techStack.join(', ')}** নিয়ে কাজ করছেন।`;
    if (lang === 'banglish') return `Tumi **${memory.techStack.join(', ')}** niye kaj korcho.`;
    return `You have mentioned working with **${memory.techStack.join(', ')}**.`;
  }

  return null;
}

