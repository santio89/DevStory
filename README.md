# DevStory

Turn a public GitHub username into an AI-written narrative timeline: commits as letters, repos as chapters.

**Live:** [yourdevstory.vercel.app](https://yourdevstory.vercel.app)

## Stack

Next.js 16 · TypeScript · Tailwind · OpenRouter · GitHub API · EmailJS · Neon Postgres

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Lookup: `/?u=github-username`.

## Env

See [`.env.example`](.env.example). Minimum for full experience: `GITHUB_TOKEN`, `OPENROUTER_API_KEY`, `EMAILJS_*`, `NEXT_PUBLIC_APP_URL`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Drizzle migrations |
