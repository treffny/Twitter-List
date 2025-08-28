import { parseStringPromise } from 'xml2js';

const DEFAULT_HOSTS = process.env.NITTER_HOSTS
  ? process.env.NITTER_HOSTS.split(',').map(s => s.trim())
  : ['https://nitter.net','https://nitter.privacydev.net','https://nitter.poast.org','https://nitter.fdn.fr'];

export async function fetchFromNitter(handle, days=2) {
  const since = Date.now() - days*24*60*60*1000;
  let xml = null;
  let used = null;

  for (const host of DEFAULT_HOSTS) {
    try {
      const res = await fetch(`${host}/${handle}/rss`, { next: { revalidate: 60 } });
      if (res.ok) {
        xml = await res.text();
        used = host;
        break;
      }
    } catch (e) {
      // try next
    }
  }
  if (!xml) return [];

  const doc = await parseStringPromise(xml);
  const items = doc?.rss?.channel?.[0]?.item || [];
  const rows = [];

  for (const it of items) {
    const pub = it.pubDate?.[0] || '';
    const dt = new Date(pub);
    if (!dt.getTime() || dt.getTime() < since) continue;

    const link = it.link?.[0] || '';
    const title = (it.title?.[0] || '').trim();
    const description = (it.description?.[0] || '').trim();
    const encoded = it['content:encoded']?.[0] || '';

    // Exclude retweets
    const low = (title + ' ' + description).toLowerCase();
    if (low.startsWith('rt ') || low.includes(' rt @') || low.includes('rt by')) continue;

    // Extract status id
    let id = '';
    const m = link.match(/\/status\/(\d+)/);
    if (m) id = m[1];

    const tweetUrl = id ? `https://x.com/${handle}/status/${id}` : link;
    const media = /<img|<video/i.test(encoded || description);

    rows.push({
      timestamp_utc: dt.toISOString(),
      author_handle: handle,
      tweet_id: id,
      tweet_url: tweetUrl,
      tweet_text: title.replace(/\s+/g,' ').trim(),
      media_present: !!media
    });
  }

  return rows;
}
