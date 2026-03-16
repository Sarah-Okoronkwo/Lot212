# NewsStories

A Story-format news viewer built with **Next.js 14 (App Router)** + **Supabase**, inspired by Instagram/WhatsApp Stories. Stories auto-expire 24 hours after publishing.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 App Router, TypeScript |
| Styling | Tailwind CSS, CSS Animations |
| State | Zustand |
| Backend | Supabase (Auth + DB + Storage) |
| Fonts | Syne + DM Mono (Google Fonts) |

---

## Features

### Public Viewer (`/`)
- Fullscreen story cards (image + video)
- Progress bars — auto-advances after 7 seconds per story
- Tap right → next · Tap left → previous
- Hold to pause
- Swipe left/right on mobile
- Keyboard: `→` / `Space` = next, `←` = prev
- "You're all caught up" screen when done
- Desktop: centered card with blurred background

### Admin Dashboard (`/admin`)
- Protected by Supabase Auth (email + password)
- Upload image or video stories
- Category selector (10 categories)
- Live story list with thumbnail, time remaining, and category
- Soft-delete (deactivates stories, keeps data)
- Live stats: active / total / expired

---

## Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 3. Run the database setup

Copy `supabase-setup.sql` and paste it into **Supabase → SQL Editor → New query**, then run it.

This creates:
- `stories` table with auto-expiry (`expires_at` = `created_at + 24h`)
- Row Level Security policies
- `stories` storage bucket with public read + authenticated write

### 4. Create an admin user

In **Supabase → Authentication → Users → Invite user**, create your admin email + password.

Or run in SQL:
```sql
-- Use Supabase Auth UI to invite, or use the Supabase dashboard
```

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in **Supabase → Project Settings → API**.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public story viewer (server)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles + CSS variables
│   ├── admin/
│   │   ├── page.tsx          # Admin dashboard (server, auth-gated)
│   │   ├── layout.tsx        # Admin layout
│   │   └── login/
│   │       └── page.tsx      # Login page
│   └── api/
│       └── stories/
│           └── route.ts      # GET /api/stories
│
├── components/
│   ├── StoryViewer.tsx       # Main viewer wrapper + timer logic
│   ├── StoryCard.tsx         # Individual story card (image/video)
│   ├── ProgressBars.tsx      # Animated segment progress bars
│   ├── TapZones.tsx          # Tap/hold/swipe interaction zones
│   ├── AllCaughtUp.tsx       # End-of-stories screen
│   └── AdminDashboard.tsx    # Full admin UI (client)
│
├── lib/supabase/
│   ├── client.ts             # Browser Supabase client
│   └── server.ts             # Server Supabase client (SSR)
│
├── middleware.ts             # Auth redirect middleware
├── store/storyStore.ts       # Zustand story navigation store
└── types/index.ts            # TypeScript types + category config
```

---

## Database Schema

```sql
stories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url   TEXT NOT NULL,
  media_type  TEXT NOT NULL DEFAULT 'image',  -- 'image' | 'video'
  caption     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'breaking',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ GENERATED ALWAYS AS (created_at + INTERVAL '24 hours') STORED,
  is_active   BOOLEAN DEFAULT TRUE
)
```

**Key design decisions:**
- `expires_at` is a **generated column** — never needs to be set manually
- `is_active = false` is a soft delete — data stays for analytics
- RLS ensures public users only see `is_active = true AND expires_at > now()`

---

## Deployment

```bash
npm run build
```

Deploy to **Vercel** (recommended):
1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## Customization

| Setting | Location | Default |
|---------|----------|---------|
| Story duration | `StoryViewer.tsx` → `STORY_DURATION_MS` | `7000` (7s) |
| Story expiry | `supabase-setup.sql` | 24 hours |
| Max file size | `supabase-setup.sql` | 50MB |
| Categories | `src/types/index.ts` | 10 categories |
