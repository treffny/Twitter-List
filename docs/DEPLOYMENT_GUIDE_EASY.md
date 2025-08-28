# Sixth Field Tweet Proxy — Easy Deploy Guide

This is a tiny web app that fetches recent public tweets for selected accounts (no Twitter API) and serves clean JSON for your GPT or Make.com flow. It excludes retweets.

## What you need (accounts)
1) **GitHub** (free) — to host the code.
2) **Vercel** (free) — to deploy the app from GitHub.
3) Optional: **Make.com** (free tier) — if you want to auto-generate reply drafts and write them to Google Sheets.
4) Optional: **Google** account — for Google Sheets (if you use Make).
5) Optional: **OpenAI** account — if you use the Make OpenAI module to draft replies.
6) Optional: **Apify** account — only if you want an alternate scraping method (you can ignore this; default uses Nitter RSS).

## One-time setup (10–15 minutes)
1) **Create a GitHub repo**
   - Go to GitHub → New repository → Name it `sixth-field-tweet-proxy` → Create.
   - Upload everything from the `sixth-field-tweet-proxy` folder in this ZIP to your repo.
     - Easiest: Click **Add file → Upload files** and drag the folder contents.

2) **Deploy on Vercel**
   - Go to vercel.com → New Project → Import your GitHub repo.
   - Vercel will auto-detect Next.js. Keep defaults.
   - **Add Environment Variables** (click “Environment Variables”):
     - `HANDLES` → a comma-separated list without @, e.g. `nicholadrummond,BAESystemsAir,Saab`
     - `DAYS` → `2`
     - `NITTER_HOSTS` → `https://nitter.net,https://nitter.privacydev.net,https://nitter.poast.org,https://nitter.fdn.fr`
     - Optional Apify fallback (only if you want it):
       - `USE_APIFY` → `false` (set to `true` if you will use Apify)
       - `APIFY_TOKEN` → your token (only if `USE_APIFY=true`)
       - `APIFY_ACTOR` → your actor id or `user~actor` (only if `USE_APIFY=true`)
   - Click **Deploy**.
   - You’ll get a URL like `https://your-app.vercel.app`.

3) **Test it**
   - Open `https://your-app.vercel.app/api/tweets?days=2` in your browser.
   - You should see JSON with recent tweets from your handles.
   - For a single account: `https://your-app.vercel.app/api/tweets/nicholadrummond?days=2`

## How to update the handles later
- In Vercel → Project → Settings → Environment Variables:
  - Edit `HANDLES` to your new comma-separated list (still no @).
  - Click **Save** and then **Redeploy** (or trigger a new deployment).
- Done. No code changes needed.

## What the JSON looks like
```
[
  {
    "timestamp_utc": "2025-08-28T07:41:00.000Z",
    "author_handle": "nicholadrummond",
    "tweet_id": "1234567890123456789",
    "tweet_url": "https://x.com/nicholadrummond/status/1234567890123456789",
    "tweet_text": "Post text here",
    "media_present": true
  }
]
```

## Use with your GPT
- Your GPT can `GET https://your-app.vercel.app/api/tweets?days=2` and then create replies based on `tweet_text`, `tweet_url`, and `author_handle`.
- A ready-made **system prompt** for reply drafting is in `docs/sixth_field_system_prompt_for_make.txt`.

## Optional: Make.com + Google Sheets chain
- Open `docs/README_Make_on_Vercel_Chain.md` for a step-by-step Make scenario that:
  1) Fetches JSON from `/api/tweets`
  2) Dedupe rows in Google Sheets by `tweet_id`
  3) Calls OpenAI to draft two replies in The Sixth Field style
  4) Writes them back to the Sheet

That’s it. If the endpoint returns empty sometimes, one of the Nitter hosts may be slow. Try again or add more hosts to `NITTER_HOSTS`.