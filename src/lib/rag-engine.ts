import fs from 'fs';
import path from 'path';

export interface RAGChunk {
  id: string;
  source: string;
  content: string;
  tokens: string[];
}

// ==========================================
// PRE-BUNDLED KNOWLEDGE BASE FOR VERCEL SERVERLESS
// (Ensures instant 0ms latency & 0 I/O failures on cloud serverless)
// ==========================================
const BUNDLED_KNOWLEDGE: Array<{ source: string; content: string }> = [
  // 1. Creator & Architecture
  {
    source: 'creator_profile.txt',
    content: `CREATOR AND ARCHITECT PROFILE:
Name: Md. Riazul Islam Rifat
Role: Full-Stack Software Engineer & AI Systems Architect
Location: Dhaka, Bangladesh
Email: hriazul45@gmail.com
Phone / WhatsApp: +880 1770804802
GitHub: https://github.com/code-with-rifat (@code-with-rifat)
Portfolio: https://codewithrifat.free.nf
Expertise: PHP/Laravel 11, React 19, Next.js 15, TypeScript, Python 3.12 (FastAPI, PyTorch), PostgreSQL, MongoDB, Redis, Docker, Vector RAG Systems, QLoRA Fine-Tuning.
Notable Projects: Synera Technologies, Piyavate Hospital BD Portal, MEDICO Application Portal, Aetheris AI Studio.`
  },
  // 2. Full-Stack Web Architecture
  {
    source: 'fullstack_engineering.txt',
    content: `NEXT.JS 15 & REACT 19 ARCHITECTURAL CAPABILITIES:
- React Server Components (RSC): Zero-bundle-size server components rendering HTML with zero client JS overhead.
- Server-Side Rendering (SSR) & Streaming UI: Dynamic HTML generation on demand with Suspense streaming.
- Incremental Static Regeneration (ISR) & SSG: Static caching with on-demand or time-based revalidation.
- Server Actions: Direct secure server mutations without manual REST endpoint boilerplate.
- App Router: Nested layouts, parallel routes, intercepting routes, error boundaries.`
  },
  {
    source: 'fullstack_engineering.txt',
    content: `LARAVEL 11 & PHP 8.3 ARCHITECTURE:
- MVC Architecture: Clean separation of Model, View, Controller.
- Eloquent ORM: Active Record pattern with eager loading, morph relations, and query scopes.
- Service Container & Dependency Injection: Inversion of control (IoC) with auto-wiring.
- Queues & Background Workers: Async jobs powered by Redis/database with Horizon dashboard.
- Enterprise Security: Built-in CSRF protection, SQL Injection prevention via prepared statements, Bcrypt/Argon2 password hashing.`
  },
  // 3. AI, Transformers & RAG
  {
    source: 'ai_transformers_rag.txt',
    content: `TRANSFORMER & LLM ARCHITECTURE:
- Attention Mechanism: Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.
- Multi-Head Attention: Allows models to jointly attend to information across different subspace representations.
- QLoRA (Quantized Low-Rank Adaptation): 4-bit NormalFloat (NF4) base weight quantization with low-rank trainable adapter matrices (rank r=16, alpha=16), allowing fine-tuning large models on single GPUs.`
  },
  {
    source: 'ai_transformers_rag.txt',
    content: `RETRIEVAL-AUGMENTED GENERATION (RAG):
- Semantic Search & Vector Embeddings: Vector representations of text chunks compared using Cosine Similarity or BM25 Lexical Ranking.
- RAG Pipeline: Query -> Embedding -> Top-K Document Retrieval -> System Context Injection -> LLM Generation.
- Solves LLM Hallucinations: Grounds the model strictly in verified enterprise/domain documents.`
  },
  // 4. Bangladesh History & Geography
  {
    source: 'bangladesh_history_geography.txt',
    content: `BANGLADESH 1971 LIBERATION WAR (MUKTIJUDDHO):
- Historical Context: 9-month armed liberation war against Pakistani military forces.
- March 7, 1971: Bangabandhu Sheikh Mujibur Rahman's historic speech at Racecourse Ground ("Ebarer shongram amader muktir shongram, ebarer shongram shadhinotar shongram"), inscribed in UNESCO Memory of the World.
- March 26: National Independence Day.
- December 16: Victory Day (Bijoy Dibos) with unconditional surrender of 93,000 Pakistani troops.
- 7 Bir Sreshtho Heroes: Captain Mohiuddin Jahangir, Lance Naik Munshi Abdur Rouf, Sepoy Hamidur Rahman, Mohammad Ruhul Amin, Flight Lt. Matiur Rahman, Sepoy Mostafa Kamal, Lance Naik Noor Mohammad Sheikh.`
  },
  {
    source: 'bangladesh_history_geography.txt',
    content: `1952 LANGUAGE MOVEMENT & GEOGRAPHY OF BANGLADESH:
- 21 February 1952: Martyrs Salam, Barkat, Rafiq, Jabbar fought for Bengali mother tongue; UNESCO declared February 21 as International Mother Language Day.
- Geography: Capital Dhaka; Currency Taka (BDT); 8 Administrative Divisions; Major rivers: Padma, Meghna, Jamuna, Brahmaputra, Karnaphuli.
- Natural Wonders: Sundarbans (world's largest mangrove forest) and Cox's Bazar (world's longest unbroken natural sea beach, 120km).`
  },
  // 5. Mathematics & Physics
  {
    source: 'mathematics_science.txt',
    content: `MATHEMATICAL MODELS & FORMULAS:
- Quadratic Formula: ax^2 + bx + c = 0 has roots x = (-b +- sqrt(b^2 - 4ac)) / (2a). Discriminant D = b^2 - 4ac.
- Calculus Fundamentals: Derivative d/dx[x^n] = n*x^(n-1); Integration int x^n dx = (x^(n+1))/(n+1) + C; Chain Rule d/dx[f(g(x))] = f'(g(x)) * g'(x).
- Geometry: Circle Area A = pi * r^2, Circumference = 2 * pi * r. Sphere Volume V = (4/3) * pi * r^3.`
  },
  {
    source: 'mathematics_science.txt',
    content: `PHYSICS LAWS & NATURAL SCIENCES:
- Newton's Laws of Motion: 1st Law (Inertia), 2nd Law (F = m * a), 3rd Law (Action = -Reaction).
- Einstein Mass-Energy Equivalence: E = m * c^2 (c ~ 3 * 10^8 m/s).
- Photosynthesis Formula: 6 CO2 + 6 H2O + Light Energy -> C6H12O6 (Glucose) + 6 O2.
- 8 Planets in Solar System: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.`
  }
];

let cachedChunks: RAGChunk[] | null = null;
let idfCache: Map<string, number> | null = null;
let avgDocLength = 0;

// Multilingual Tokenizer (Bengali, Banglish, English, Numbers)
export function tokenizeRAGText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

function buildRAGChunks(): RAGChunk[] {
  if (cachedChunks) return cachedChunks;

  const chunks: RAGChunk[] = [];
  const knowledgeDir = path.join(process.cwd(), 'knowledge_base');

  // 1. First try reading dynamic local files if running on filesystem
  try {
    if (fs.existsSync(knowledgeDir)) {
      const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith('.txt'));
      for (const file of files) {
        const filePath = path.join(knowledgeDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const sections = content.split(/\n\s*\n/);

        sections.forEach((sec, idx) => {
          const trimmed = sec.trim();
          if (trimmed.length > 25) {
            chunks.push({
              id: `file-${file}-${idx}`,
              source: file,
              content: trimmed,
              tokens: tokenizeRAGText(trimmed),
            });
          }
        });
      }
    }
  } catch {
    // Filesystem read skipped in strict serverless/read-only mode
  }

  // 2. Always merge or fall back to bundled high-speed knowledge
  BUNDLED_KNOWLEDGE.forEach((item, idx) => {
    chunks.push({
      id: `bundled-${idx}`,
      source: item.source,
      content: item.content,
      tokens: tokenizeRAGText(item.content),
    });
  });

  // Calculate BM25 corpus statistics
  const totalDocs = chunks.length;
  let totalLength = 0;
  const docFreq = new Map<string, number>();

  for (const chunk of chunks) {
    totalLength += chunk.tokens.length;
    const uniqueTokens = new Set(chunk.tokens);
    for (const t of uniqueTokens) {
      docFreq.set(t, (docFreq.get(t) || 0) + 1);
    }
  }

  avgDocLength = totalDocs > 0 ? totalLength / totalDocs : 1;
  idfCache = new Map<string, number>();

  for (const [term, df] of docFreq.entries()) {
    // BM25 IDF with smoothing: ln(1 + (N - df + 0.5) / (df + 0.5))
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
    idfCache.set(term, Math.max(0.1, idf));
  }

  cachedChunks = chunks;
  return chunks;
}

// ==========================================
// BM25 RANKING RETRIEVAL ALGORITHM (k1=1.5, b=0.75)
// ==========================================
export function retrieveRAGContext(query: string, k = 3): string {
  const chunks = buildRAGChunks();
  if (!chunks.length || !idfCache) return '';

  const queryTokens = tokenizeRAGText(query);
  if (!queryTokens.length) return '';

  const k1 = 1.5;
  const b = 0.75;

  const scored = chunks.map((chunk) => {
    let bm25Score = 0;
    const docLength = chunk.tokens.length;

    // Count term frequency in document
    const termCounts = new Map<string, number>();
    for (const t of chunk.tokens) {
      termCounts.set(t, (termCounts.get(t) || 0) + 1);
    }

    for (const q of queryTokens) {
      const tf = termCounts.get(q) || 0;
      const idf = idfCache?.get(q) || 0.2;

      if (tf > 0) {
        // BM25 formula
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLength / (avgDocLength || 1)));
        bm25Score += idf * (numerator / denominator);
      } else {
        // Partial substring bonus for Bengali agglutination and composite terms
        for (const [docTerm, count] of termCounts.entries()) {
          if (docTerm.includes(q) || q.includes(docTerm)) {
            bm25Score += 0.3 * Math.min(count, 3);
            break;
          }
        }
      }
    }

    return { chunk, score: bm25Score };
  });

  // Filter and sort highest matching documents
  scored.sort((a, b) => b.score - a.score);
  const topDocs = scored.filter((s) => s.score > 0.4).slice(0, k);

  if (!topDocs.length) return '';

  // Return clean deduplicated formatted RAG context
  const seenContent = new Set<string>();
  const results: string[] = [];

  for (const item of topDocs) {
    if (!seenContent.has(item.chunk.content)) {
      seenContent.add(item.chunk.content);
      results.push(`[Knowledge Source: ${item.chunk.source}]\n${item.chunk.content}`);
    }
  }

  return results.join('\n\n---\n\n');
}

