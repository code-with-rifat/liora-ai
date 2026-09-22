import { ReplyLanguage } from './language';
import { CREATOR_PROFILE, creatorShortReply } from './creator';
import { AI_NAME } from './brand';

export interface KnowledgeArticle {
  keywords: string[];
  title: string;
  category: 'web-dev' | 'programming' | 'ai-ml' | 'algorithms' | 'math-science' | 'bangladesh' | 'world' | 'productivity';
  bn: string;
  banglish: string;
  en: string;
}

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  // ==========================================
  // 1. WEB DEVELOPMENT & FRAMEWORKS
  // ==========================================
  {
    keywords: ['react', 'what is react', 'react js', 'react ki', 'রিঅ্যাক্ট', 'react hooks'],
    title: 'React.js Ecosystem',
    category: 'web-dev',
    bn: `**React** হলো Meta (Facebook) দ্বারা তৈরি বিশ্বের সর্বাধিক ব্যবহৃত ওপেন-সোর্স জাভাস্ক্রিপ্ট লাইব্রেরি, যা ইন্টারঅ্যাক্টিভ UI ও Single Page Application (SPA) তৈরিতে ব্যবহৃত হয়।

### মূল আর্কিটেকচার:
1. **Component-Based Architecture**: সম্পূর্ণ UI ছোট ছোট রিইউজেবল উপাদানে বিভক্ত।
2. **Virtual DOM & Reconciliation (Fiber Engine)**: সরাসরি ব্রাউজার DOM পরিবর্তন না করে মেমোরিতে Virtual DOM ট্রি কম্পেয়ার করে শুধুমাত্র পরিবর্তিত অংশ দ্রুত রেন্ডার করে।
3. **Declarative State-Driven UI**: স্টেট পরিবর্তন হলে UI স্বয়ংক্রিয়ভাবে সিঙ্ক হয়।
4. **React Hooks**:
   - \`useState\`: লোকাল স্টেট ম্যানেজমেন্ট।
   - \`useEffect\`: সাইড ইফেক্ট ও API কল হ্যান্ডলিং।
   - \`useContext\`: গ্লোবাল স্টেট পাসিং।
   - \`useMemo\` ও \`useCallback\`: অপ্রয়োজনীয় রি-রেন্ডার রোধ ও পারফরম্যান্স অপটিমাইজেশন।
   - \`useRef\`: সরাসরি DOM রেফারেন্স ও মিউটেবল ভ্যালু হোল্ডিং।`,
    banglish: `**React** holo Meta/Facebook er toiri kora world er #1 modern UI library jeta diye dynamic single page web applications banano hoy.

### Core Architecture:
- **Component-Driven**: Reusable UI blocks.
- **Virtual DOM**: Ultra-fast reconciliation engine (Fiber).
- **React Hooks**: \`useState\`, \`useEffect\`, \`useContext\`, \`useMemo\`, \`useCallback\`.
- **Unidirectional Data Flow**: Props er maddhome top-to-bottom data pass hoy.`,
    en: `**React** is an open-source front-end JavaScript library maintained by Meta for building composable, high-performance user interfaces.

### Key Architectural Concepts:
- **Virtual DOM & Fiber Engine**: Efficient diffing algorithm minimizing expensive real-DOM mutations.
- **Declarative Paradigm**: Describe *what* the UI should look like for a given state.
- **React Hooks**: Stateful functional components (\`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`, \`useRef\`).
- **Server Components (RSC)**: Zero-bundle-size components executing purely on the server.`,
  },
  {
    keywords: ['nextjs', 'next.js', 'what is nextjs', 'next js ki', 'নেক্সট জেএস', 'app router', 'ssr', 'ssg'],
    title: 'Next.js 15 Full-Stack Framework',
    category: 'web-dev',
    bn: `**Next.js** হলো Vercel দ্বারা তৈরি একটি ইন্ডাস্ট্রি-স্ট্যান্ডার্ড ফুল-স্ট্যাক React ফ্রেমওয়ার্ক, যা স্কেলেবল এবং সার্চ-ইঞ্জিন অপটিমাইজড (SEO) অ্যাপ্লিকেশনে ব্যবহৃত হয়।

### রেন্ডারিং স্ট্র্যাটেজিস:
- **Server-Side Rendering (SSR)**: প্রতিটি রিকোয়েস্টে সার্ভারে HTML জেনারেট হয় (Dynamic Data)।
- **Static Site Generation (SSG)**: বিল্ড টাইমে প্রি-রেন্ডার হয়ে আল্ট্রা-ফাস্ট CDN থেকে ডেলিভারি হয়।
- **Incremental Static Regeneration (ISR)**: পুরো অ্যাপ রিবিল্ড না করে ব্যাকগ্রাউন্ডে নির্দিষ্ট পেজ রিভ্যালিডেট করা যায়।
- **Client-Side Rendering (CSR)**: ক্লায়েন্ট ব্রাউজারে রেন্ডারিং (\`'use client'\`)।

### App Router ও আধুনিক ফিচার:
- **React Server Components (RSC)**: সার্ভারেই এক্সিকিউট হয়, ক্লায়েন্ট বান্ডল সাইজ জিরো থাকে।
- **Server Actions**: কোনো আলাদা REST API না লিখে সরাসরি সার্ভার ফাংশন কল ও ডাটাবেজ মিউটেশন।
- **Built-in Route Handlers**: \`app/api/.../route.ts\` দিয়ে সার্ভারলেস ব্যাকএন্ড এপিআই হ্যান্ডলিং।
- **Automatic Optimizations**: Image, Font, Metadata এবং Script অটো-অপটিমাইজেশন।`,
    banglish: `**Next.js** holo Vercel er banano enterprise-grade React framework jeta SSR, SSG, ISR ar Server Components provide kore.

### Key features:
- **Rendering modes**: SSR (Dynamic), SSG (Static), ISR (Background Revalidation).
- **App Router & RSC**: Fast streaming and zero-client bundle overhead.
- **Server Actions**: Frontend form theke direct backend database mutation.
- **SEO & Image Optimization**: Built-in fastest web vitals performance.`,
    en: `**Next.js** is the premier production-ready React framework by Vercel for building enterprise-grade full-stack web applications.

### Core Capabilities:
- **Hybrid Rendering Matrix**: SSR (Server-Side Rendering), SSG (Static Generation), ISR (Incremental Static Regeneration), and CSR.
- **App Router**: Nested layouts, streaming UI with Suspense, error boundaries, and React Server Components.
- **Server Actions**: Direct server-side data mutations without boilerplate API endpoints.
- **Built-in Edge Optimizations**: Image, font, and script performance pipelines.`,
  },
  {
    keywords: ['laravel', 'php laravel', 'what is laravel', 'laravel ki', 'লার্যাভেল', 'eloquent orm'],
    title: 'Laravel 11 PHP Framework',
    category: 'web-dev',
    bn: `**Laravel** হলো PHP-র জন্য বিশ্বের সর্বাধিক জনপ্রিয় এবং এলিগ্যান্ট ওপেন-সোর্স ওয়েব অ্যাপ্লিকেশন ফ্রেমওয়ার্ক, যা Taylor Otwell তৈরি করেছেন।

### মূল স্থাপত্য ও বৈশিষ্ট্য:
1. **MVC Architecture**: Model-View-Controller প্যাটার্ন দ্বারা কোড পরিষ্কার ও মেইনটেইনেবল থাকে।
2. **Eloquent ORM**: ডেটাবেজ টেবিলগুলোকে অবজেক্ট হিসেবে হ্যান্ডেল করার বিশ্বমানের Active Record ORM (HasOne, HasMany, BelongsToMany রিলেশনশিপ)।
3. **Artisan CLI**: কন্ট্রোলার, মডেল, মাইগ্রেশন তৈরি ও টেস্ট চালানোর পাওয়ারফুল কমান্ড লাইন ইন্টারফেস।
4. **Dependency Injection & Service Container**: লুজলি-কাপলড আর্কিটেকচার এবং ইনভার্সন অব কন্ট্রোল (IoC)।
5. **Built-in Enterprise Features**: Authentication (Sanctum/Breeze), Queues & Jobs (Redis/SQS), Event Listeners, Notifications, Task Scheduling, এবং CSRF/XSS/SQLi প্রোটেকশন।`,
    banglish: `**Laravel** holo PHP-r sobcheye elegant o powerful MVC framework, jeta diye secure and scalable web apps banano hoy.

### Main strengths:
- **MVC Architecture**: Clean separation of Model, View, Controller.
- **Eloquent ORM**: Database queries khub sohoje object-oriented way te handle kora jay.
- **Artisan CLI**: \`php artisan make:model\`, \`migrate\`, \`queue:work\` ityadi powerful commands.
- **Robust Security**: Built-in CSRF, SQL Injection, password hashing (Bcrypt/Argon2).`,
    en: `**Laravel** is an expressive, architectural PHP framework designed for building robust, scalable web applications using the MVC design pattern.

### Key Architecture:
- **Eloquent ORM**: Active Record ORM providing fluent relationships and query building.
- **Service Container**: Robust dependency injection and IoC container.
- **Artisan CLI**: Command-line tool for migrations, scaffolding, testing, and daemon jobs.
- **Ecosystem**: Queues, Events, WebSockets (Reverb), Auth (Sanctum), and Task Scheduling.`,
  },

  // ==========================================
  // 2. PROGRAMMING LANGUAGES & RUNTIMES
  // ==========================================
  {
    keywords: ['javascript', 'js', 'what is javascript', 'js ki', 'জাভাস্ক্রিপ্ট', 'event loop', 'async await'],
    title: 'JavaScript & Asynchronous Runtime',
    category: 'programming',
    bn: `**JavaScript (JS)** হলো একটি হাই-লেভেল, ডাইনামিক, সিঙ্গেল-থ্রেডেড, প্রোটোটাইপ-ভিত্তিক প্রোগ্রামিং ভাষা যা আধুনিক ওয়েব ও ব্যাকএন্ড (Node.js/Bun) চালিত করে।

### গুরুত্বপূর্ণ কোর কনসেপ্ট:
1. **The Event Loop & Concurrency**:
   - **Call Stack**: সিনক্রোনাস কোড এক্সিকিউট করে (LIFO)।
   - **Web APIs**: ব্রাউজার টাইমার, নেটওয়ার্ক রিকোয়েস্ট ব্যাকগ্রাউন্ডে রান করায়।
   - **Microtask Queue** (Promises, \`queueMicrotask\`) $\rightarrow$ **Macrotask Queue** (\`setTimeout\`, DOM Events)।
2. **Closures**: একটি ফাংশন যখন তার বাইরের লেক্সিক্যাল স্কোপের ভেরিয়েবল অ্যাক্সেস করতে পারে এমনকি বাইরের ফাংশন এক্সিকিউশন শেষ হওয়ার পরেও।
3. **Prototypes & Prototypal Inheritance**: প্রতিটি অবজেক্টের একটি অভ্যন্তরীণ \`[[Prototype]]\` লিংক থাকে।
4. **Async/Await & Promises**: নন-ব্লকিং অ্যাসিনক্রোনাস কোড লেখার আধুনিক স্ট্যান্ডার্ড।`,
    banglish: `**JavaScript** holo modern computing er sobcheye versatile programming language jeta browser o backend (Node.js) e chole.

### Core concepts:
- **Event Loop**: Call Stack, Microtask Queue (Promises), Macrotask Queue (setTimeout).
- **Closures**: Outer function scope retains memory in inner functions.
- **Async/Await**: Clean asynchronous non-blocking programming.
- **ES6+ Features**: Destructuring, Modules, Spread operator, Optional chaining.`,
    en: `**JavaScript** is a multi-paradigm, single-threaded, non-blocking asynchronous language conforming to the ECMAScript specification.

### Key Mechanical Foundations:
- **Event Loop & Concurrency**: Execution Stack, Web APIs, Microtask Queue (Promises), Macrotask Task Queue (\`setTimeout\`, I/O).
- **Closures & Scope Chain**: Lexical scoping retaining variable state in enclosed environments.
- **Prototypal Inheritance**: Object delegation via internal \`[[Prototype]]\` chains.
- **Memory Management**: Mark-and-sweep garbage collection algorithms.`,
  },
  {
    keywords: ['typescript', 'ts', 'what is typescript', 'ts ki', 'টাইপস্ক্রিপ্ট'],
    title: 'TypeScript Type System',
    category: 'programming',
    bn: `**TypeScript** হলো Microsoft দ্বারা তৈরি JavaScript-এর একটি স্ট্রংলি-টাইপড সুপারসেট (Superset), যা কোড লেখার সময় কম্পাইল-টাইম টাইপ চেকিং এবং উন্নত ডেভেলপার এক্সপেরিয়েন্স নিশ্চিত করে।

### মূল ফিচারসমূহ:
- **Static Typing**: ভ্যারিয়েবল, প্যারামিটার ও রিটার্ন টাইপ আগেই নির্দিষ্ট করা যায়।
- **Interfaces & Type Aliases**: কাস্টম ডাটা স্ট্রাকচার ও শেপ ডিফাইন করা।
- **Generics**: রিইউজেবল ও ফ্লেক্সিবল টাইপ-সেফ কোড (যেমন: \`function identity<T>(arg: T): T\`)।
- **Union & Intersection Types**: \`string | number\`, \`TypeA & TypeB\`।
- **Type Narrowing & Guards**: \`typeof\`, \`instanceof\`, \`in\` দিয়ে রানটাইমে টাইপ ভেরিফাই করা।`,
    banglish: `**TypeScript** holo JavaScript er strongly-typed superset jeta compilation er somoy errors dhorie dey ar code scalability baray. Generics, Interfaces, Union types diye robust enterprise software lekha hoy.`,
    en: `**TypeScript** is a typed superset of JavaScript that compiles to plain JavaScript, providing compile-time type safety and enterprise scalability.`,
  },
  {
    keywords: ['python', 'what is python', 'python ki', 'পাইথন', 'fastapi', 'django'],
    title: 'Python & AI/Backend Ecosystem',
    category: 'programming',
    bn: `**Python** হলো একটি ইন্টারপ্রিটেড, হাই-লেভেল, ডাইনামিক প্রোগ্রামিং ভাষা যা এর চমৎকার রিডেবিলিটি ও বিশাল লাইব্রেরি ইকোসিস্টেমের জন্য বিখ্যাত।

### ব্যবহারের ক্ষেত্র:
1. **AI / Machine Learning & Deep Learning**: PyTorch, TensorFlow, Scikit-learn, HuggingFace Transformers, OpenCV।
2. **Data Science & Analytics**: Pandas (DataFrame), NumPy (N-dimensional arrays), SciPy, Matplotlib/Seaborn।
3. **Modern Backend Web Development**:
   - **FastAPI**: অ্যাসিঙ্ক হাই-পারফরম্যান্স REST/GraphQL API ফ্রেমওয়ার্ক (Pydantic ও OpenAPI সাপোর্টেড)।
   - **Django**: "Batteries-included" ফুল-স্ট্যাক ফ্রেমওয়ার্ক (অ্যাডমিন প্যানেল, ORM, সিকিউরিটি)।
4. **Scripting & Automation**: Web scraping (BeautifulSoup, Playwright), Task Automation, DevOps।`,
    banglish: `**Python** holo world er #1 language for Artificial Intelligence, Machine Learning, Data Science, and modern Backend development (FastAPI/Django).`,
    en: `**Python** is a versatile high-level programming language dominant in Artificial Intelligence, Machine Learning, Data Engineering, and Backend Web Development.`,
  },

  // ==========================================
  // 3. ARTIFICIAL INTELLIGENCE & LLMS
  // ==========================================
  {
    keywords: ['llm', 'how llm works', 'transformers', 'attention mechanism', 'chatgpt ki', 'gemini ki', 'ai kivabe kaj kore'],
    title: 'How Large Language Models (LLMs) & Transformers Work',
    category: 'ai-ml',
    bn: `**Large Language Models (LLMs)** (যেমন: Gemini, GPT-4, Llama) হলো ডিপ নিউরাল নেটওয়ার্ক যা বিলিয়ন বিলিয়ন প্যারামিটারের ওপর ট্রেইন হয়ে মানুষের ভাষার প্যাটার্ন বুঝতে ও টেক্সট জেনারেট করতে পারে।

### ট্রান্সফরমার আর্কিটেকচার (Transformer Architecture):
২০১৭ সালে Google-এর গবেষণাপত্র *"Attention Is All You Need"*-এ এটি আবিষ্কৃত হয়।
1. **Tokenization**: টেক্সটকে ছোট ছোট টোকেনে (শব্দ বা সাব-ওয়ার্ড) ভাগ করা হয়।
2. **Embeddings & Positional Encoding**: প্রতিটি টোকেনকে উচ্চ-মাত্রিক ভেক্টর স্পেসে রূপান্তর করা হয় এবং বাক্যে তার অবস্থান যোগ করা হয়।
3. **Self-Attention Mechanism**:
   - প্রতিটি শব্দ বাক্যের অন্যান্য শব্দের সাথে সম্পর্কের গুরুত্ব পরিমাপ করে:
   $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
   - যেখানে $Q$ (Query), $K$ (Key), এবং $V$ (Value) ম্যাট্রিক্স।
4. **Multi-Head Attention**: একসাথে বিভিন্ন দৃষ্টিকোণ থেকে শব্দের অর্থ ও গ্রামার শেখে।
5. **Next-Token Prediction**: সম্ভাব্যতা (Probability distribution) হিসাব করে পরবর্তী সবচেয়ে যুক্তিযুক্ত টোকেনটি প্রেডিক্ট করে।
6. **RLHF / DPO**: মানুষের পছন্দের সাথে সামঞ্জস্য রেখে মডেলকে নিরাপদ ও সহায়ক করার জন্য ফাইন-টিউনিং করা হয়।`,
    banglish: `**LLMs (Large Language Models)** Google er 2017 Transformer Architecture er upor toiri. Self-Attention mechanism diye shob token er context bujhe next-token predict kore answer toiri kore.`,
    en: `**Large Language Models (LLMs)** are foundational neural network models utilizing the Transformer architecture (Vaswani et al., 2017) to process and generate human language via self-attention mechanisms.

### Core Pipeline:
1. **Byte-Pair Tokenization**: Converts text into numerical token IDs.
2. **Vector Embeddings & Positional Encodings**: Maps tokens into multi-dimensional geometric spaces.
3. **Scaled Dot-Product Attention**: $\\text{Attention}(Q,K,V) = \\text{softmax}(QK^T / \\sqrt{d_k})V$.
4. **Feed-Forward Layers & Residual Connections**: Layer normalization and non-linear transformations.
5. **Post-Training Alignment**: RLHF (Reinforcement Learning from Human Feedback) and DPO (Direct Preference Optimization).`,
  },
  {
    keywords: ['rag', 'retrieval augmented generation', 'rag ki', 'vector database'],
    title: 'Retrieval-Augmented Generation (RAG)',
    category: 'ai-ml',
    bn: `**RAG (Retrieval-Augmented Generation)** হলো এমন একটি এআই আর্কিটেকচার যেখানে একটি এলএলএমকে (LLM) সরাসরি উত্তর দেওয়ার আগে একটি বাহ্যিক জ্ঞানভাণ্ডার (যেমন: ডাটাবেজ বা ডকুমেন্ট) থেকে সম্পর্কিত তথ্য খুঁজে এনে প্রম্পটের সাথে যুক্ত করে দেওয়া হয়।

### RAG-এর ৩টি মূল ধাপ:
1. **Indexing (ইনডেক্সিং)**: ডকুমেন্টগুলোকে ছোট চাঙ্কে (Chunk) ভাগ করে Embedding মডেল দিয়ে Vector তৈরি করে Vector Database-এ (যেমন: Pinecone, Qdrant, ChromaDB) সংরক্ষণ করা হয়।
2. **Retrieval (অনুসন্ধান)**: ইউজারের প্রশ্নের ভেক্টর তৈরি করে Cosine Similarity দিয়ে সবচেয়ে প্রাসঙ্গিক চাঙ্কগুলো তুলে আনা হয়।
3. **Generation (উত্তর তৈরি)**: সংগৃহীত তথ্য ও ইউজারের প্রশ্ন একসাথে LLM-কে দিয়ে নিখুঁত ও প্রমাণনির্ভর উত্তর তৈরি করা হয় (Hallucination রোধ করে)।`,
    banglish: `**RAG (Retrieval-Augmented Generation)** holo AI technique jekhane LLM k external data/documents theke search kore context provide kore answer generate korano hoy, jate model hallucinate na kore accurately answer dey.`,
    en: `**RAG (Retrieval-Augmented Generation)** optimizes LLM output by referencing authoritative external knowledge bases before generating a response, drastically mitigating hallucinations and enabling private knowledge access.`,
  },

  // ==========================================
  // 4. DATA STRUCTURES & ALGORITHMS
  // ==========================================
  {
    keywords: ['dsa', 'data structures', 'algorithms', 'binary search', 'big o', 'অ্যালগরিদম', 'ডাটা স্ট্রাকচার'],
    title: 'Core Data Structures & Algorithms',
    category: 'algorithms',
    bn: `**Data Structures & Algorithms (DSA)** হলো কম্পিউটার সায়েন্সের মেরুদণ্ড যা কার্যকর সমস্যা সমাধান ও অপটিমাইজেশনের জন্য অপরিহার্য।

### প্রধান ডাটা স্ট্রাকচার:
- **Array / String**: কনটিগুয়াস মেমোরি ব্লক ($O(1)$ র‍্যান্ডম এক্সেস)।
- **Linked List**: নোড-ভিত্তিক চেইন ($O(1)$ ইনসার্শন/ডিলিশন)।
- **Stack & Queue**: LIFO (Last In First Out) ও FIFO (First In First Out)।
- **Hash Table / Map**: কী-ভ্যালু পেয়ার ($O(1)$ গড় সার্চ/ইনসার্ট টাইম)।
- **Tree & Binary Search Tree (BST)**: হায়ারার্কিকাল স্ট্রাকচার ($O(\\log n)$ সার্চ)।
- **Graph**: নোড (Vertices) ও এজ (Edges) সমন্বিত নেটওয়ার্ক।

### গুরুত্বপূর্ণ অ্যালগরিদম কৌশল:
1. **Binary Search**: সর্টেড অ্যারেতে অর্ধেক অর্ধেক ভাগ করে $O(\\log n)$ সময়ে আইটেম খোঁজা।
2. **Two Pointers & Sliding Window**: অ্যারে/স্ট্রিং সাব-অ্যারে সম্পর্কিত সমস্যা সমাধানে $O(n)$ অপটিমাইজেশন।
3. **BFS & DFS**: গ্রাফ ও ট্রি ট্রাভার্সাল অ্যালগরিদম।
4. **Dynamic Programming (DP)**: সাব-প্রবলেম মেমোরিতে রেখে (Memoization/Tabulation) ওভারল্যাপিং অপটিমাইজেশন।
5. **Sorting**: QuickSort ($O(n \\log n)$), MergeSort ($O(n \\log n)$ Stable)।`,
    banglish: `**DSA** holo programming er foundation. Binary Search ($O(\\log n)$), Hash Maps ($O(1)$), Trees, Graphs (BFS/DFS), Dynamic Programming shikhe complex computational problems solve kora jay.`,
    en: `**Data Structures & Algorithms (DSA)** form the foundational paradigm for efficient computational problem solving and Big-O space-time complexity optimization.`,
  },

  // ==========================================
  // 5. BANGLADESH ENCYCLOPEDIA & HISTORY
  // ==========================================
  {
    keywords: ['bangladesh', 'about bangladesh', 'বাংলাদেশ', 'বাংলাদেশ সম্পর্কে', 'bangladesh details'],
    title: 'People\'s Republic of Bangladesh (গণপ্রজাতন্ত্রী বাংলাদেশ)',
    category: 'bangladesh',
    bn: `**গণপ্রজাতন্ত্রী বাংলাদেশ** দক্ষিণ এশিয়ার একটি সার্বভৌম স্বাধীন রাষ্ট্র।

### সংক্ষিপ্ত রূপরেখা:
- **রাজধানী**: ঢাকা (City of Mosques & Rickshaws)
- **রাষ্ট্রভাষা**: বাংলা (Bengali)
- **স্বাধীনতা দিবস**: ২৬ মার্চ ১৯৭১
- **বিজয় দিবস**: ১৬ ডিসেম্বর ১৯৭১
- **জাতীয় সঙ্গীত**: 'আমার সোনার বাংলা' (রবীন্দ্রনাথ ঠাকুর)
- **জাতীয় কবি**: কাজী নজরুল ইসলাম (বিদ্রোহী কবি)
- **মুদ্রা**: টাকা (BDT / ৳)
- **৮টি প্রশাসনিক বিভাগ**: ঢাকা, চট্টগ্রাম, রাজশাহী, খুলনা, বরিশাল, সিলেট, রংপুর, ময়মনসিংহ (মোট ৬৪টি জেলা)।
- **প্রধান নদীসমূহ**: পদ্মা, মেঘনা, যমুনা, ব্রহ্মপুত্র, কর্ণফুলী, সুরমা।
- **ভৌগোলিক বিশ্বরেকর্ড**:
  - **সুন্দরবন**: বিশ্বের বৃহত্তম ম্যানগ্রোভ বনভূমি ও রয়েল বেঙ্গল টাইগারের আবাসস্থল।
  - **কক্সবাজার**: বিশ্বের দীর্ঘতম অবিচ্ছিন্ন প্রাকৃতিক বালুকাময় সমুদ্র সৈকত (১২০ কিমি)।
  - **সেন্ট মার্টিন**: বাংলাদেশের একমাত্র প্রবাল দ্বীপ।`,
    banglish: `**Bangladesh (গণপ্রজাতন্ত্রী বাংলাদেশ)** holo South Asia-r ekta shundor shadhin desh. Capital: Dhaka, Currency: Taka (BDT), 8 divisions, 64 districts. Shundorbon (Largest mangrove forest) o Cox's Bazar (120km unbroken sea beach) er jonno world famous.`,
    en: `**Bangladesh** (officially the People's Republic of Bangladesh) is a South Asian country situated on the fertile delta of the Ganges-Brahmaputra-Meghna river systems on the Bay of Bengal.`,
  },
  {
    keywords: ['1971', 'liberation war', 'muktijuddho', 'মুক্তিযুদ্ধ', '৭১ এর মুক্তিযুদ্ধ', 'বীরশ্রেষ্ঠ', 'bir sreshtho', '7 march'],
    title: '1971 Liberation War of Bangladesh (মুক্তিযুদ্ধ)',
    category: 'bangladesh',
    bn: `**বাংলাদেশের মুক্তিযুদ্ধ (১৯৭১)** ছিল ৯ মাসব্যাপী রক্তক্ষয়ী সশস্ত্র সংগ্রাম, যার মাধ্যমে ৩০ লক্ষ শহীদের রক্ত এবং ২ লক্ষ মা-বোনের সম্ভ্রমের বিনিময়ে বাংলাদেশ পাকিস্তানের বর্বর শাসন থেকে মুক্ত হয়ে স্বাধীনতা অর্জন করে।

### ঐতিহাসিক টাইমলাইন:
1. **৭ই মার্চের ঐতিহাসিক ভাষণ**: জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমান রেসকোর্স ময়দানে ডাক দেন — *"এবারের সংগ্রাম আমাদের মুক্তির সংগ্রাম, এবারের সংগ্রাম স্বাধীনতার সংগ্রাম।"* (ইউনেস্কোর মেমোরি অব দ্য ওয়ার্ল্ড রেজিস্টারে অন্তর্ভুক্ত)।
2. **২৫শে মার্চ কালরাত**: পাকিস্তানি সামরিক জান্তা নিরীহ বাঙালিদের ওপর চালিয়েছে বর্বরোচিত গণহত্যা — **"Operation Searchlight"**।
3. **২৬শে মার্চ**: বাংলাদেশের স্বাধীনতার আনুষ্ঠানিক ঘোষণা।
4. **মুজিবনগর সরকার**: ১৯৭১ সালের ১০ এপ্রিল অস্থায়ী সরকার গঠিত হয় এবং ১৭ এপ্রিল মেহেরপুরের বৈদ্যনাথতলায় (মুজিবনগর) শপথ গ্রহণ করে।
5. **১১টি যুদ্ধ সেক্টর**: সমগ্র বাংলাদেশকে ১১টি সেক্টরে ভাগ করে মুক্তিবাহিনী পাকিস্তানি হানাদার বাহিনীর বিরুদ্ধে গেরিলা ও সম্মুখ সমর পরিচালনা করে।
6. **বীরশ্রেষ্ঠ (৭ জন বীর শহীদ)**:
   1. শহীদ ক্যাপ্টেন মহিউদ্দীন জাহাঙ্গীর (সেনাবাহিনী)
   2. শহীদ ল্যান্স নায়েক মুন্সী আব্দুর রউফ (ইপিআর)
   3. শহীদ সিপাহী হামিদুর রহমান (সেনাবাহিনী)
   4. শহীদ মোহাম্মদ রুহুল আমিন (নৌবাহিনী)
   5. শহীদ ফ্লাইট লেফটেন্যান্ট মতিউর রহমান (বিমানবাহিনী)
   6. শহীদ সিপাহী মোস্তফা কামাল (সেনাবাহিনী)
   7. শহীদ ল্যান্স নায়েক নূর মোহাম্মদ শেখ (ইপিআর)
7. **১৬ই ডিসেম্বর ১৯৭১**: ঢাকার রেসকোর্স ময়দানে ৯৩,০০০ পাকিস্তানি সৈন্যের নিঃশর্ত আত্মসমর্পণের মাধ্যমে অর্জিত হয় চূড়ান্ত **বিজয়**।`,
    banglish: `**1971 Muktijuddho (Liberation War)** holo Bangladesh er 9 masher shadhinota juddho. 7th March er historic bhashon, 25th March er Operation Searchlight genocide, 11 Sectors, 7 Bir Sreshtho shohid o 16th December Bijoy Dibos amader shobcheye boro gourab.`,
    en: `The **1971 Bangladesh Liberation War** was a 9-month armed conflict culminating in the victory of Bangladesh against Pakistan, supported by the historic 7th March address, Mujibnagar provisional government, 11 military sectors, and the ultimate sacrifice of 7 Bir Sreshtho national heroes.`,
  },
  {
    keywords: ['language movement', 'bhasha andolon', '21 february', 'ekushey february', 'ভাষা আন্দোলন', 'একুশে ফেব্রুয়ারি'],
    title: '1952 Language Movement (ভাষা আন্দোলন)',
    category: 'bangladesh',
    bn: `**১৯৫২ সালের ভাষা আন্দোলন** ছিল মায়ের ভাষা বাংলাকে পাকিস্তানের অন্যতম রাষ্ট্রভাষা হিসেবে স্বীকৃতির দাবিতে গড়ে ওঠা আত্মত্যাগের ইতিহাস।

### গুরুত্বপূর্ণ ঘটনাবলী:
- **২১শে ফেব্রুয়ারি ১৯৫২**: ১৪৪ ধারা ভেঙে ঢাকা বিশ্ববিদ্যালয় আমতলা প্রাঙ্গণ থেকে ছাত্রদের মিছিল বের হলে পুলিশ নৃশংসভাবে গুলি চালায়।
- **শহীদ হন**: সালাম, বরকত, রফিক, জব্বার, শফিউরসহ অনেকে।
- **আন্তর্জাতিক স্বীকৃতি**: ১৯৯৯ সালের ১৭ নভেম্বর ইউনেস্কো (UNESCO) ২১শে ফেব্রুয়ারিকে বিশ্বজুড়ে **আন্তর্জাতিক মাতৃভাষা দিবস (International Mother Language Day)** হিসেবে স্বীকৃতি প্রদান করে।`,
    banglish: `**1952 Language Movement (ভাষা আন্দোলন)** e 21st February Salam, Barkat, Rafiq, Jabbar, Shafiur shohid hon. 1999 sale UNESCO eike International Mother Language Day hishebe world recognition dey.`,
    en: `The **1952 Bengali Language Movement** was a landmark political mobilization in East Bengal asserting Bengali as an official state language. February 21 was designated by UNESCO as **International Mother Language Day** in 1999.`,
  },

  // ==========================================
  // 6. SCIENCE, UNIVERSE & LAWS OF NATURE
  // ==========================================
  {
    keywords: ['physics', 'newtons laws', 'newton laws of motion', 'নিউটনের সূত্র', 'newton er sutro', 'পদার্থবিজ্ঞান'],
    title: 'Newton\'s Fundamental Laws of Motion',
    category: 'math-science',
    bn: `স্যার আইজ্যাক নিউটন ১৬৮৭ সালে তার বিখ্যাত গ্রন্থ *"Philosophiae Naturalis Principia Mathematica"*-তে ক্লাসিক্যাল মেকানিক্সের ৩টি গতিসূত্র প্রদান করেন:

1. **প্রথম সূত্র (জড়তার সূত্র - Law of Inertia)**:
   বাহ্যিক কোনো নিট বল প্রয়োগ না করলে স্থির বস্তু চিরকাল স্থির থাকবে এবং গতিশীল বস্তু সুষম দ্রুতিতে সরলরেখায় চলতে থাকবে।
2. **দ্বিতীয় সূত্র ($F = ma$)**:
   বস্তুর ভরবেগের পরিবর্তনের হার তার ওপর প্রযুক্ত বলের সমানুপাতিক:
   $$\\vec{F} = \\frac{d\\vec{p}}{dt} = m\\vec{a}$$
3. **তৃতীয় সূত্র (Action & Reaction)**:
   প্রত্যেক ক্রিয়ারই একটি সমান ও বিপরীত প্রতিক্রিয়া আছে:
   $$\\vec{F}_{AB} = -\\vec{F}_{BA}$$`,
    banglish: `Sir Isaac Newton er 3 ti motion laws:
1. **Law of Inertia**: External force na thakle object er state change hoy na.
2. **$F = ma$**: Force = Mass $\\times$ Acceleration.
3. **Action & Reaction**: Proti ti kriya-r shoman o biporit protikriya thake.`,
    en: `Sir Isaac Newton's three fundamental laws of classical mechanics:
1. **Inertia**: An object remains at rest or in uniform straight motion unless acted upon by a net external force.
2. **Force**: $\\vec{F} = m\\vec{a}$ (Rate of change of linear momentum).
3. **Action-Reaction**: For every applied action force, there is an equal and opposite reaction force.`,
  },
  {
    keywords: ['photosynthesis', 'what is photosynthesis', 'শালোকসংশ্লেষণ', 'salokshongshleshon', 'উদ্ভিদ খাদ্য'],
    title: 'Photosynthesis (শালোকসংশ্লেষণ)',
    category: 'math-science',
    bn: `**শালোকসংশ্লেষণ (Photosynthesis)** হলো উদ্ভিদের ক্লোরোপ্লাস্টে সূর্যালোক ও ক্লোরোফিলের সাহায্যে কার্বন ডাই অক্সাইড ও পানি থেকে শর্করা (গ্লুকোজ) ও অক্সিজেন তৈরির জৈব-রাসায়নিক প্রক্রিয়া।

### সম্পূর্ণ রাসায়নিক সমীকরণ:
$$6CO_2 + 6H_2O + \\text{সূর্যালোক} \\xrightarrow{\\text{ক্লোরোফিল}} C_6H_{12}O_6 + 6O_2$$

- **আলোক পর্যায় (Light Reaction)**: থাইলাকয়েড মেমব্রেনে ATP এবং NADPH তৈরি হয়, পানি বিশ্লিষ্ট হয়ে $O_2$ নির্গত হয় (Photolysis)।
- **অন্ধকার পর্যায় (Calvin Cycle)**: স্ট্রোমাতে $CO_2$ ফিক্সেশনের মাধ্যমে গ্লুকোজ সংশ্লেষিত হয়।`,
    banglish: `**Photosynthesis** holo shei biological process jekhane plants sunlight and chlorophyll use kore $CO_2$ and $H_2O$ theke Glucose ($C_6H_{12}O_6$) and Oxygen ($O_2$) produce kore.`,
    en: `**Photosynthesis** is the fundamental biochemical process by which green plants and photoautotrophs convert photonic solar energy into chemical energy stored in glucose molecules ($6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$).`,
  },
  {
    keywords: ['solar system', 'planets', 'সৌরজগৎ', 'গ্রহ', 'sourjogot', 'space', 'মহাকাশ'],
    title: 'The Solar System (সৌরজগৎ)',
    category: 'math-science',
    bn: `**সৌরজগৎ** হলো সূর্যকে কেন্দ্র করে ঘূর্ণায়মান ৮টি প্রধান গ্রহ, শত শত উপগ্রহ এবং বিলিয়ন গ্রহাণু-ধূমকেতুর সমন্বয়।

### গ্রহসমূহের তালিকা (সূর্য থেকে দূরত্বের ক্রমানুসারে):
1. **বুধ (Mercury)**: সূর্যের নিকটতম ও ক্ষুদ্রতম পাথুরে গ্রহ।
2. **শুক্র (Venus)**: ঘন $CO_2$ বায়ুমণ্ডলের কারণে সবচেয়ে উষ্ণ গ্রহ ('ভোরের তারা/সন্ধ্যা তারা')।
3. **পৃথিবী (Earth)**: তরল পানি ও প্রাণ ধারণের একমাত্র পরিচিত আবাসস্থল।
4. **মঙ্গল (Mars)**: আয়রন অক্সাইডের জন্য 'লাল গ্রহ' (Red Planet)।
5. **বৃহস্পতি (Jupiter)**: সৌরজগতের বৃহত্তম গ্যাস দানব (Great Red Spot বিশিষ্ট)।
6. **শনি (Saturn)**: দৃষ্টিনন্দন বরফ ও ধূলিকণার বলয়যুক্ত গ্যাস দানব।
7. **ইউরেনাস (Uranus)**: মিথেন গ্যাসের নীলচে শীতল বরফ দানব (Ice Giant)।
8. **নেপচুন (Neptune)**: তীব্র সুপারসনিক ঝড়ের শীতলতম দূরবর্তী গ্রহ।`,
    banglish: `**Solar System (সৌরজগৎ)** e Shurjo o 8 ti main planet ache: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.`,
    en: `The **Solar System** comprises the Sun and 8 gravitationally bound planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune) along with dwarf planets and minor bodies.`,
  },

  // ==========================================
  // 7. PRODUCTIVITY & MENTAL MODELS
  // ==========================================
  {
    keywords: ['feynman technique', 'study technique', 'reading method', 'পড়ার নিয়ম', 'porar tips', 'learning'],
    title: 'The Feynman Learning Technique',
    category: 'productivity',
    bn: `**ফাইনম্যান টেকনিক (Feynman Technique)** নোবেলজয়ী পদার্থবিজ্ঞানী রিচার্ড ফাইনম্যানের আবিষ্কৃত বিশ্ববিখ্যাত দ্রুত ও গভীরভাবে শেখার পদ্ধতি।

### ৪টি কার্যকর ধাপ:
1. **বিষয় নির্বাচন করুন**: আপনি যে কনসেপ্টটি আয়ত্ত করতে চান তা খাতায় লিখুন।
2. **১০ বছরের শিশুকে বোঝানোর মতো করে সহজ ভাষায় ব্যাখ্যা করুন**: কোনো জটিল টেকনিক্যাল জার্গন বা কঠিন শব্দ ব্যবহার না করে একদম সাধারণ ভাষায় লিখুন বা বলুন।
3. **ঘাটতি চিহ্নিত করুন**: যেখানে আপনার ব্যাখ্যা আটকে যাচ্ছে বা স্পষ্ট নয়, মূল বই বা রিসার্চ সোর্স খুলে সেই অংশটি আবার পুঙ্খানুপুঙ্খ বুঝে নিন।
4. **সরলীকরণ ও অ্যানালজি ব্যবহার করুন**: বাস্তব জীবনের সুন্দর উদাহরণ বা রূপক দিয়ে পুরো বিষয়টি চূড়ান্তভাবে রিফাইন করুন।`,
    banglish: `**Feynman Technique**:
1. Topic choose koro.
2. Ekjon 10 bochorer bachake bojhate paro erokom simple language e likho.
3. Gaps identify kore book theke clear hou.
4. Real life analogies diye simplify koro.`,
    en: `The **Feynman Technique** is a four-step mental model for achieving rapid master-level comprehension of complex topics via radical simplification, zero-jargon explanation, targeted gap remediation, and real-world analogies.`,
  },
  {
    keywords: ['pomodoro', 'productivity', 'time management', 'পমোডোরো', 'কাজে মনোযোগ'],
    title: 'The Pomodoro Productivity Method',
    category: 'productivity',
    bn: `**পমোডোরো টেকনিক (Pomodoro Technique)** ফ্রান্সিসকো সিরিলো কর্তৃক উদ্ভাবিত একটি সময় ব্যবস্থাপনা পদ্ধতি যা ক্লান্তিহীন গভীর মনোযোগ (Deep Work) নিশ্চিত করে।

### পদ্ধতি:
- **২৫ মিনিট**: পূর্ণ মনোযোগ দিয়ে নিরবচ্ছিন্ন কাজ (১টি Pomodoro)।
- **৫ মিনিট**: স্বল্প বিরতি (পানি পান, স্ট্রেচিং)।
- ৪টি সেশন শেষ হলে একটি **১৫-৩০ মিনিটের** দীর্ঘ বিরতি।`,
    banglish: `**Pomodoro Technique** e 25 minutes deep focus kaj + 5 minutes short break. 4 cycles por 20-30 minutes long break. It increases focus 10x!`,
    en: `The **Pomodoro Technique** breaks work into 25-minute focused bursts separated by 5-minute restorative intervals, optimizing cognitive endurance and flow state.`,
  },
];

// ==========================================
// ADVANCED MATHEMATICS & EQUATION SOLVER
// ==========================================
export function solveMathExpression(rawText: string, lang: ReplyLanguage): string | null {
  const text = rawText.trim().replace(/[?।!]$/, '').trim();

  // 1. Percentage: e.g. "15% of 850" or "850 er 15%"
  const percMatch1 = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|এর|er)\s*(\d+(?:\.\d+)?)/i);
  const percMatch2 = text.match(/(\d+(?:\.\d+)?)\s*(?:এর|er)\s*(\d+(?:\.\d+)?)\s*%/i);
  if (percMatch1 || percMatch2) {
    const rate = Number(percMatch1 ? percMatch1[1] : percMatch2![2]);
    const total = Number(percMatch1 ? percMatch1[2] : percMatch2![1]);
    const result = (rate / 100) * total;
    if (lang === 'bn' || lang === 'mix') {
      return `**গাণিতিক সমাধান:**\n\n$$${total} \\times ${rate}\\% = \\frac{${total} \\times ${rate}}{100} = \\mathbf{${result}}$$`;
    }
    if (lang === 'banglish') {
      return `**Math Result:**\n\n$${total}$ er $${rate}\\%$ = $\\mathbf{${result}}$`;
    }
    return `**Calculation:**\n\n$${rate}\\%$ of $${total} = \\frac{${rate} \\times ${total}}{100} = \\mathbf{${result}}$`;
  }

  // 2. Quadratic Equation: ax^2 + bx + c = 0
  const quadMatch = text.match(/([+-]?\d*(?:\.\d+)?)\s*x\^?2\s*([+-]\s*\d*(?:\.\d+)?)\s*x\s*([+-]\s*\d*(?:\.\d+)?)\s*=\s*0/i);
  if (quadMatch) {
    let a = parseFloat(quadMatch[1].replace(/\s+/g, '')) || 1;
    let b = parseFloat(quadMatch[2].replace(/\s+/g, '')) || 0;
    let c = parseFloat(quadMatch[3].replace(/\s+/g, '')) || 0;
    if (quadMatch[1] === '-') a = -1;

    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      return `**দ্বিঘাত সমীকরণ সমাধান ($ax^2 + bx + c = 0$):**\n\n- $a = ${a}, b = ${b}, c = ${c}$\n- ডিসক্রিমিন্যান্ট $D = b^2 - 4ac = ${discriminant}$\n\n$$\\mathbf{x_1 = ${x1.toFixed(4)}}, \\quad \\mathbf{x_2 = ${x2.toFixed(4)}}$$`;
    } else {
      const real = (-b / (2 * a)).toFixed(4);
      const imag = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
      return `**জটিল সংখ্যার মূল (Complex Roots):**\n\n$$\\mathbf{x = ${real} \\pm ${imag}i}$$`;
    }
  }

  // 3. Square Root: sqrt(144), sqrt 144, square root of 81, 81 er borgomul
  const sqrtMatch = text.match(/(?:sqrt|\u221A|square\s*root\s*of|বর্গমূল|borgomul)\s*\(?\s*(\d+(?:\.\d+)?)\s*\)?/i);
  if (sqrtMatch) {
    const val = Number(sqrtMatch[1]);
    const res = Math.sqrt(val);
    if (lang === 'bn' || lang === 'mix') return `$\\sqrt{${val}} = \\mathbf{${res}}$`;
    if (lang === 'banglish') return `$\\sqrt{${val}}$ er man holo: **${res}**`;
    return `The square root of $${val}$ is $\\sqrt{${val}} = \\mathbf{${res}}$`;
  }

  // 4. Power / Exponent: 2^8 or 2**8
  const powMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\^|\*\*)\s*(\d+(?:\.\d+)?)/);
  if (powMatch) {
    const base = Number(powMatch[1]);
    const exp = Number(powMatch[2]);
    const res = Math.pow(base, exp);
    return `$${base}^{${exp}} = \\mathbf{${res}}$`;
  }

  // 5. Circle Area: radius r -> pi * r^2
  const circleMatch = text.match(/(?:circle\s*area|britto\s*er\s*khetrofol|বৃত্তের\s*ক্ষেত্রফল)\s*(?:with\s*radius|radius|r)?\s*=?\s*(\d+(?:\.\d+)?)/i);
  if (circleMatch) {
    const r = Number(circleMatch[1]);
    const area = Math.PI * r * r;
    return `**বৃত্তের ক্ষেত্রফল (Area of Circle):**\n\n$$A = \\pi r^2 = 3.14159 \\times (${r})^2 = \\mathbf{${area.toFixed(4)}}$$`;
  }

  // 6. Direct Arithmetic: e.g. "125 * 45", "100 + 250 - 50", "(25 + 5) * 4"
  const cleanArithmetic = text.replace(/×/g, '*').replace(/÷/g, '/');
  if (/^[-+*/().\d\s]+$/.test(cleanArithmetic) && /[-+*/]/.test(cleanArithmetic) && cleanArithmetic.length < 60) {
    try {
      const sanitized = cleanArithmetic.replace(/[^0-9+\-*/().]/g, '');
      const calcResult = Function(`"use strict"; return (${sanitized})`)();
      if (typeof calcResult === 'number' && !isNaN(calcResult) && isFinite(calcResult)) {
        return `**গণনা ফলাফল:**\n\n$$${cleanArithmetic.trim()} = \\mathbf{${calcResult}}$$`;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

// ==========================================
// GENERAL KNOWLEDGE & CURATED MATCH
// ==========================================
export function findKnowledgeMatch(query: string, lang: ReplyLanguage): string | null {
  const lower = query.toLowerCase().trim();

  // Check creator questions first
  if (
    lower.includes('creator') ||
    lower.includes('rifat') ||
    lower.includes('রিফাত') ||
    lower.includes('বানিয়েছে') ||
    lower.includes('কে বানাইছে') ||
    lower.includes('বানাইছে') ||
    lower.includes('বানাইসে') ||
    lower.includes('তৈরি করেছে') ||
    lower.includes('toiri koreche') ||
    lower.includes('who made you') ||
    lower.includes('who created you') ||
    lower.includes('who is your creator') ||
    lower.includes('banaise') ||
    lower.includes('baniyeche')
  ) {
    return creatorShortReply(lang);
  }

  // Math solver check
  const mathResult = solveMathExpression(query, lang);
  if (mathResult) return mathResult;

  // Search curated knowledge base
  for (const article of KNOWLEDGE_BASE) {
    for (const kw of article.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        if (lang === 'bn' || lang === 'mix') return article.bn;
        if (lang === 'banglish') return article.banglish;
        return article.en;
      }
    }
  }

  return null;
}
