# DevStory

Turn a public GitHub username into an AI-written narrative timeline: commits as letters, repos as chapters. Generate a story, share it, email it, or chat with the biographer.

**Live:** [yourdevstory.vercel.app](https://yourdevstory.vercel.app)

## Stack

- **Core:** Next.js, TypeScript, Tailwind CSS, Framer Motion
- **Database:** Neon Postgres, Drizzle ORM
- **AI & APIs:** OpenRouter, Vercel AI SDK, Vercel AI Gateway, GitHub API
- **Email:** React Email, EmailJS
- **Deployment:** Vercel

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try `/?u=github-username`.

## Env

See [`.env.example`](.env.example). For the full experience: `GITHUB_TOKEN`, `OPENROUTER_API_KEY`, `DATABASE_URL`, `EMAILJS_*`, `NEXT_PUBLIC_APP_URL`. Optional: `AI_GATEWAY_API_KEY` (AI fallback).

## Scripts

| Command              | Purpose                |
| -------------------- | ---------------------- |
| `npm run dev`        | Dev server             |
| `npm run build`      | Production build       |
| `npm run db:migrate` | Run Drizzle migrations (run after pulling schema changes, and on deploy) |
