# Make.com chain for Sixth Field Tweet Proxy (Vercel)

Goal
Pull JSON from your Vercel endpoint, dedupe in Google Sheets, generate two reply variants with GPT, write them back.

Modules (in order)
1) Scheduler — every 2 hours
2) HTTP — GET https://YOUR_VERCEL_URL/api/tweets?days=2
3) Array aggregator — ensure array payload
4) Iterator — each item
5) Google Sheets — Search Rows (by tweet_id)
6) Router
   A) Not found → Add Row → OpenAI → JSON Parse → Update Row
   B) Found → stop

Field mapping (Sheet must have these columns)
timestamp_utc | author_handle | tweet_id | tweet_url | tweet_text | media_present | like_count | retweet_count | reply_count | suggested_reply_v1 | suggested_reply_v2 | status

Add Row (branch A)
- timestamp_utc: {{4.timestamp_utc}}
- author_handle: {{'@' & 4.author_handle}}  (or leave without @ if you prefer)
- tweet_id: {{4.tweet_id}}
- tweet_url: {{4.tweet_url}}
- tweet_text: {{4.tweet_text}}
- media_present: {{4.media_present}}
- like_count, retweet_count, reply_count: leave blank
- suggested_reply_v1, suggested_reply_v2: leave blank
- status: new

OpenAI (Chat Completions)
- System prompt: paste content of file `sixth_field_system_prompt_for_make.txt`
- User content (JSON string):
  {
    "author_handle": "{{'@' & 4.author_handle}}",
    "tweet_text": "{{4.tweet_text}}",
    "tweet_url": "{{4.tweet_url}}"
  }
- Response: JSON mode ON

JSON Parse
- Parse the model output
- Expect keys: suggested_reply_v1, suggested_reply_v2

Update Row
- suggested_reply_v1: {{parsed.suggested_reply_v1}}
- suggested_reply_v2: {{parsed.suggested_reply_v2}}
- status: queued

Filters you can add
- Only within last 48h: parseDate(4.timestamp_utc; 'YYYY-MM-DDTHH:mm:ss[Z]') > addHours(now; -48)
- Non-empty tweet_id: length(4.tweet_id) > 0

Tip
Change handles by editing the HANDLES env var in Vercel and redeploying. Your Make flow stays the same.