# Video Streaming Platform

A custom video streaming platform built with Next.js, Supabase, and Bunny.net CDN.

## 🚀 Quick Start

### Step 1: Set Up Accounts

1. **Supabase** (Database & Auth): https://supabase.com
2. **Bunny.net** (Video Hosting): https://bunny.net
3. **Vercel** (Web Hosting): https://vercel.com

### Step 2: Configure Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`

### Step 3: Set Up Database

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `database-schema.sql`
3. Paste and run the query

### Step 4: Make Yourself Admin

After creating your first account, run this in Supabase SQL Editor:

```sql
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'YOUR_EMAIL@example.com'
);
```

### Step 5: Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
video-platform/
├── src/
│   ├── app/
│   │   ├── auth/          # Login & signup pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── watch/         # Video player page
│   │   └── api/           # API routes
│   ├── components/
│   │   └── video/         # Video player component
│   ├── lib/
│   │   ├── supabase/      # Database client
│   │   └── bunny/         # Video upload utility
│   └── types/             # TypeScript types
├── database-schema.sql    # Database setup
└── .env.example           # Environment template
```

## 🔑 Features

- ✅ User authentication (sign up, login, logout)
- ✅ Video upload & streaming
- ✅ Admin dashboard
- ✅ Watch progress tracking
- ✅ Watchlist functionality
- ✅ Series organization
- ✅ Responsive design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Video**: Bunny.net CDN, Video.js
- **Hosting**: Vercel

## 📖 Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 💰 Estimated Costs

- **Supabase**: Free tier (up to 500MB)
- **Bunny.net**: ~$0.01-0.02/GB bandwidth
- **Vercel**: Free tier

**Monthly estimate**: $10-50 for small scale
