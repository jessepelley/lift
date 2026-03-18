# LIFT — Workout Tracker PWA

A minimal, low-friction weightlifting tracker. Upper/Lower split, muscle heatmap, lbs/kg, iOS notifications, optional Supabase backup.

---

## Deploy to GitHub Pages (5 min)

1. Create a new GitHub repo (e.g. `lift-app`)
2. Upload all files keeping this structure:
   ```
   lift-app/
   ├── index.html
   ├── manifest.json
   ├── sw.js
   └── icons/
       ├── icon-192.png
       └── icon-512.png
   ```
3. Go to repo **Settings → Pages → Source: Deploy from branch → main → / (root)**
4. Your app will be live at `https://yourusername.github.io/lift-app/`

> ⚠️ The service worker requires HTTPS — GitHub Pages provides this automatically.

---

## Add to iPhone Home Screen (enables notifications)

1. Open the app URL in **Safari** (not Chrome)
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Open the app from your home screen
5. Go to **Settings → Notifications** and enable reminders
6. iOS will request permission — tap **Allow**

> Notifications only work when installed as a PWA via "Add to Home Screen" on iOS 16.4+

---

## Supabase Setup (optional cloud backup)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run:

```sql
CREATE TABLE workouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  data jsonb NOT NULL,
  synced_at timestamptz DEFAULT now()
);

-- Allow anonymous inserts (no auth required)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert" ON workouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own" ON workouts FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

4. Go to **Settings → API** and copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon / public** key

5. In the LIFT app → Settings → Cloud Backup:
   - Toggle on
   - Paste your URL and anon key
   - Tap **TEST CONNECTION**

That's it. Workouts sync automatically after each session. If offline, they queue and sync when back online.

---

## Local-first philosophy

All data lives in `localStorage` first. Supabase is an optional backup only. If you lose your phone or clear your data, you lose history — but not fitness. The muscle is the save state.

---

## File sizes

| File | Size |
|------|------|
| index.html | ~55kb |
| sw.js | ~2kb |
| manifest.json | ~0.5kb |
| icons | ~4kb |
| **Total** | **~62kb** |

Loads instantly, works offline after first visit.
