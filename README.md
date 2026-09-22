# Liora

A general-purpose AI chat app created by **Md. Riazul Islam Rifat**.
Chat in বাংলা, Banglish, and English. Generate images. Switch models, or leave Auto.

## Run locally

```bash
cd scratch/aetheris-ai
npm install
cp .env.example .env.local
# optional: add GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY
npm run dev
```

Open http://localhost:3000

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | No | Stronger chat when Auto / Gemini Flash is selected |
| `GROQ_API_KEY` | No | Extra free Llama fallback |
| `OPENROUTER_API_KEY` | No | Extra free-tier Qwen fallback |
| `ADMIN_PASSWORD` | Yes for admin | Password for `/admin` |
| `SESSION_SECRET` | Yes in production | Signs login cookies |
| `MONGODB_URI` | No | Sync user chats across devices |
| `POLLINATIONS_TOKEN` | No | Extra help skipping the source logo |

Copy `.env.example` to `.env.local` (local) or set the same names on your host (Vercel / any Node host).
Do not commit `.env.local`.

## Accounts

Users can **Sign in** from the sidebar. Each account has its own chat history, like ChatGPT or Gemini.

- Guest chat works until you turn it off in Admin
- Signed-in chats also save to the server
- Add `MONGODB_URI` (free MongoDB Atlas) so history follows the user across devices

## Admin

Open http://localhost:3000/admin

Set `ADMIN_PASSWORD` first. From there you can:

- Strip the Pollinations watermark from generated images
- Allow or block guest chat, sign up, and image generation
- View users and disable accounts

## Models

- **Auto** — Gemini if a key exists, otherwise a free public model
- **Gemini Flash** — needs `GEMINI_API_KEY`
- **Fast / Llama / Mistral / Qwen** — free, no key

Users can change this from the top bar, the chat box, or Settings.

Images use a fast public turbo endpoint with no watermark. The UI keeps a spinner until the picture actually loads.

## Deploy on Vercel

1. Push this folder as a Git repo (or set Root Directory to `scratch/aetheris-ai`).
2. Import the project in [Vercel](https://vercel.com/new).
3. Framework: Next.js. Build: `next build`. Output: default.
4. Add `GEMINI_API_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET` (and optional `MONGODB_URI`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`) in Project → Settings → Environment Variables.
5. Deploy.

```bash
npx vercel --yes
```

## Production build

```bash
npm run build
npm start
```

## License

MIT — Md. Riazul Islam Rifat
