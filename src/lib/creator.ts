export const CREATOR_NAME = 'Md. Riazul Islam Rifat';
export const CREATOR_SHORT = 'Rifat';

export const CREATOR_PROFILE = {
  name: 'Md. Riazul Islam Rifat',
  title: 'Full-Stack Software Engineer & AI Systems Architect',
  location: 'Dhaka, Bangladesh',
  email: 'hriazul45@gmail.com',
  phone: '+880 1770804802',
  whatsapp: '+8801770804802',
  github: 'https://github.com/code-with-rifat',
  githubHandle: '@code-with-rifat',
  linkedin: 'https://linkedin.com/in/riazul-islam-rifat',
  facebook: 'https://facebook.com/riazul.islam.rifat45',
  instagram: 'https://instagram.com/riazul_islam_rifat_',
  portfolio: 'https://codewithrifat.free.nf',
  blog: 'https://codewithrifat.free.nf',
  status: 'Available for Full-Time Software Engineering & Enterprise Projects',
  stack: [
    'Next.js 15 (App Router, RSC, SSR)',
    'React 19 & TypeScript',
    'PHP 8.3 & Laravel 11',
    'Python 3.12 (FastAPI, PyTorch)',
    'AI Systems & Vector RAG (BM25, ChromaDB)',
    'PostgreSQL & MongoDB',
    'Redis & Docker DevOps',
    'Tailwind CSS',
  ],
  projects: [
    'Synera Technologies — Enterprise corporate software & API ecosystem (syneratech.com)',
    'Piyavate Hospital BD — Healthcare international referral portal (piyavate.com.bd)',
    'MEDICO Application Portal — High-volume student admission & examination portal (web.medico.com.bd)',
    'Aetheris AI Studio — Multimodal autonomous AI platform with Voice, Vision & RAG',
  ],
  about:
    'Md. Riazul Islam Rifat is a distinguished Full-Stack Software Engineer and AI Systems Architect based in Dhaka, Bangladesh. He specializes in designing enterprise web platforms, scalable high-concurrency cloud backends (Laravel, FastAPI), modern reactive user interfaces (React 19, Next.js 15), and cutting-edge autonomous AI & Vector RAG architectures.',
};

export function creatorFactSheet(): string {
  const p = CREATOR_PROFILE;
  return `### CREATOR & ARCHITECT SPECIFICATION SHEET
Name: ${p.name}
Role: ${p.title}
Location: ${p.location}
Bio: ${p.about}
Contact:
- Portfolio: ${p.portfolio}
- GitHub: ${p.github} (${p.githubHandle})
- Email: ${p.email}
- WhatsApp: ${p.phone}
- LinkedIn: ${p.linkedin}
- Availability: ${p.status}

Core Technology Stack:
- ${p.stack.join('\n- ')}

Featured Enterprise Productions:
- ${p.projects.join('\n- ')}
`;
}

export function creatorShortReply(lang: 'bn' | 'banglish' | 'en' | 'mix' | 'other'): string {
  const p = CREATOR_PROFILE;

  if (lang === 'bn' || lang === 'mix') {
    return `আমাকে অত্যন্ত যত্ন ও দক্ষতার সাথে আর্কিটেক্ট ও তৈরি করেছেন **${p.name}**। তিনি একজন প্রফেশনাল **${p.title}**।

---

### 👨‍💻 মোঃ রিয়াজুল ইসলাম রিফাত সম্পর্কে:
- **বিশেষত্ব**: স্কেলেবল ক্লাউড ব্যাকএন্ড (PHP/Laravel 11, FastAPI), আল্ট্রা-ফাস্ট ফ্রন্টএন্ড (React 19, Next.js 15), এবং অ্যাডভান্সড এআই ও ভেক্টর RAG আর্কিটেকচার।
- **উল্লেখযোগ্য প্রজেক্টসমূহ**:
  1. **Synera Technologies** (এন্টারপ্রাইজ সফটওয়্যার প্ল্যাটফর্ম)
  2. **Piyavate Hospital BD** (হেলথকেয়ার পোর্টাল)
  3. **MEDICO Portal** (হাই-ভলিউম স্টুডেন্ট এডমিশন সিস্টেম)
  4. **Aetheris AI Studio** (মাল্টিমোডাল এআই সিস্টেম)

---

### 🌐 যোগাযোগ ও পোর্টফোলিও:
- 🌐 **পোর্টফোলিও**: [${p.portfolio}](${p.portfolio})
- 🐙 **GitHub**: [github.com/code-with-rifat](${p.github})
- 📧 **ইমেইল**: [${p.email}](mailto:${p.email})
- 💬 **WhatsApp**: [${p.phone}](https://wa.me/8801770804802)
- 📌 **স্ট্যাটাস**: ${p.status}`;
  }

  if (lang === 'banglish') {
    return `Amake khub sundor vabe architect o toiri korechen **${p.name}** — tini ekjon professional **${p.title}**।

---

### 👨‍💻 Md. Riazul Islam Rifat Shomporke:
- **Core Expertise**: High-performance Full-Stack Web Development (Next.js 15, React 19, Laravel 11) ebong Intelligent AI & Vector RAG Systems.
- **Notable Projects**:
  1. **Synera Technologies** (Enterprise Platform)
  2. **Piyavate Hospital BD** (Healthcare Portal)
  3. **MEDICO Portal** (Admission & Exam Platform)
  4. **Aetheris AI Studio** (Autonomous AI Studio)

---

### 🌐 Contact & Socials:
- 🌐 **Portfolio**: [${p.portfolio}](${p.portfolio})
- 🐙 **GitHub**: [github.com/code-with-rifat](${p.github})
- 📧 **Email**: ${p.email}
- 💬 **WhatsApp**: ${p.phone}
- 💼 **Status**: ${p.status}`;
  }

  return `I was architected and built with state-of-the-art engineering by **${p.name}**, a renowned **${p.title}** based in Dhaka, Bangladesh.

---

### 👨‍💻 About Md. Riazul Islam Rifat:
- **Technical Mastery**: Enterprise Full-Stack Engineering (React 19, Next.js 15, PHP 8.3/Laravel 11, Python FastAPI), Cloud Microservices, and Next-Gen Vector RAG & Autonomous AI Architectures.
- **Featured Production Systems**:
  1. **Synera Technologies** (Enterprise Cloud Platform)
  2. **Piyavate Hospital BD** (Healthcare International Portal)
  3. **MEDICO Application Portal** (High-Concurrency Admission System)
  4. **Aetheris AI Studio** (Autonomous Multimodal AI Engine)

---

### 🌐 Connect & Portfolio:
- 🌐 **Portfolio**: [${p.portfolio}](${p.portfolio})
- 🐙 **GitHub**: [${p.github}](${p.github})
- 📧 **Email**: [${p.email}](mailto:${p.email})
- 💬 **WhatsApp**: [${p.phone}](https://wa.me/8801770804802)
- 💼 **Status**: ${p.status}`;
}

