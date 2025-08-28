# Sixth Field Tweet Proxy (GitHub + Vercel)

Tiny serverless app that fetches public tweets for selected accounts **without the Twitter API**.
Great for connecting your GPT: consume JSON from `/api/tweets` or `/api/tweets/<handle>`.

Defaults to **Nitter RSS**. Optionally switch to **Apify** if you have a token.

## Features
- No Twitter API.
- Edit handles in `.env.local` (one line).
- Excludes retweets.
- Returns clean JSON: `timestamp_utc, author_handle, tweet_id, tweet_url, tweet_text, media_present`.
- Simple web UI at `/` for manual checks.
- CORS enabled for GET from anywhere (safe read-only).

## One-time setup
1. Click “Use this template” in GitHub or push this folder to your own repo.
2. On Vercel: New Project → Import your repo → set these env vars:
   - `HANDLES` for example: `nicholadrummond,BAESystemsAir,Saab`
   - `DAYS` default `2`
   - `NITTER_HOSTS` default `https://nitter.net,https://nitter.privacydev.net,https://nitter.poast.org,https://nitter.fdn.fr`
   - Optional Apify:
     - `USE_APIFY` set to `true` to switch
     - `APIFY_TOKEN` your token
     - `APIFY_ACTOR` actor id or “user~actor-name” for a public profile-scraper
3. Deploy.

## Local dev
```
npm install
npm run dev
```
Open `http://localhost:3000`.

## API
- `GET /api/tweets` → returns aggregated tweets for all handles in `HANDLES`.
- `GET /api/tweets/<handle>` → returns tweets for a single handle.

Query params:
- `days` override the lookback window (number).

## JSON shape
```json
[
  {
    "timestamp_utc": "2025-08-28T07:41:00Z",
    "author_handle": "nicholadrummond",
    "tweet_id": "1234567890123456789",
    "tweet_url": "https://x.com/nicholadrummond/status/1234567890123456789",
    "tweet_text": "Post text here",
    "media_present": true
  }
]
```

## Notes
- RSS does not reliably expose like/retweet counts, so we omit them for stability.
- If one Nitter host is down, the app tries the next.
- Retweets are filtered best-effort by looking for common RT patterns in titles/descriptions.

— Built for The Sixth Field
