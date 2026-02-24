# 🗳️ ViralPoll — Viral-Ready Polling Platform

A beautiful, production-ready polling platform built with Next.js 14, Supabase, and Tailwind CSS. Deploy to Vercel or Netlify in minutes.

## ✨ Features

- ⚡ **Real-time live voting** — votes update instantly via Supabase Realtime
- 🎨 **5 viral templates** — This vs That, Hot Take, Ranked Choice, Emoji Reaction, Standard
- 🔥 **Dynamic OG images** — every poll auto-generates a stunning social card with live vote data
- 🎉 **Confetti on vote** — micro-moments that make voting feel special
- 📱 **Mobile-first** — share drawer with Twitter, WhatsApp, Facebook, Telegram, native share
- 🔍 **SEO-optimized** — SSR, dynamic metadata, JSON-LD structured data per poll
- 🛡️ **Vote fraud prevention** — browser fingerprint + unique DB constraint

---

## 🚀 Quick Deploy

### Option A: Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/viral-polls)

### Option B: Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/viral-polls)

---

## 📋 Step-by-Step Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/viral-polls.git
cd viral-polls
npm install
```

### Step 2: Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Copy your **Project URL** and **anon public key** from Settings → API
3. Also copy your **service_role key** (keep this secret)
4. Go to **SQL Editor** → **New query**
5. Paste the entire contents of `src/lib/supabase/schema.sql` and click **Run**

### Step 3: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → set to your Vercel domain (e.g. `https://yourapp.vercel.app`)
4. Click **Deploy**

> ✅ `vercel.json` is pre-configured with optimal cache headers for OG images and poll pages.

---

## 🌐 Deploying to Netlify

1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → import from Git
3. Build settings are auto-detected from `netlify.toml`
4. Add environment variables in Netlify dashboard → Site settings → Environment variables
5. Click **Deploy site**

> ⚠️ Install the Netlify Next.js plugin if not auto-installed: `npm install @netlify/plugin-nextjs`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── create/page.tsx             # Poll creation (3-step wizard)
│   ├── poll/[slug]/page.tsx        # Poll voting page (SSR + SEO)
│   ├── not-found.tsx               # 404 page
│   └── api/
│       ├── vote/route.ts           # POST vote
│       ├── polls/route.ts          # GET/POST polls
│       ├── polls/[id]/route.ts     # PATCH poll (share count)
│       └── og/[slug]/route.tsx     # Dynamic OG image (Edge)
├── components/
│   ├── polls/
│   │   ├── PollVoteClient.tsx      # Main voting UI
│   │   ├── ResultsBar.tsx          # Animated result bars
│   │   └── ShareDrawer.tsx         # Social sharing bottom sheet
│   └── ui/
│       ├── LiveBadge.tsx           # Pulsing "LIVE" indicator
│       └── AnimatedCounter.tsx     # Smooth vote count animation
├── lib/supabase/
│   ├── client.ts                   # Browser Supabase client
│   ├── server.ts                   # Server Supabase client
│   └── schema.sql                  # ⭐ Run this in Supabase SQL editor
└── types/index.ts                  # TypeScript types
```

---

## 🗄️ Database Schema

Two tables: `polls` and `votes`

Key features:
- Unique constraint prevents duplicate votes per fingerprint
- DB trigger auto-increments `total_votes` on each new vote
- `get_poll_results()` SQL function aggregates votes efficiently
- Supabase Realtime enabled for live updates

---

## 🔧 Customization

### Add a new template
Edit `TEMPLATES` array in `src/app/create/page.tsx`

### Change brand name
Search for `ViralPoll` across the project and replace

### Modify the OG image
Edit `src/app/api/og/[slug]/route.tsx` — it uses Next.js `ImageResponse` (Edge compatible)

### Add auth (optional)
Install `@supabase/auth-ui-react` and wrap pages with Supabase Auth — the schema has a `creator_id` column ready for it

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Confetti | canvas-confetti |
| OG Images | Next.js ImageResponse (Edge) |
| Deployment | Vercel / Netlify |

---

## 📈 SEO Features

- Server-side rendered poll pages (full HTML for crawlers)
- Dynamic `<title>` and `<meta description>` per poll
- Dynamic OG image with live vote data
- JSON-LD structured data (`Question` + `Answer` schema)
- Proper robots meta tags
- Semantic HTML structure

---

## 🔒 Security Notes

- Vote deduplication via browser fingerprint + PostgreSQL unique constraint
- Service role key only used in server-side API routes (never exposed to client)
- RLS policies enabled on both tables
- IP hash recorded per vote for abuse investigation (not exposed)

---

## 📄 License

MIT — use freely for personal or commercial projects.
