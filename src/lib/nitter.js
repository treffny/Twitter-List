import { parseStringPromise } from 'xml2js';

const DEFAULT_HOSTS = process.env.NITTER_HOSTS
  ? process.env.NITTER_HOSTS.split(',').map(s => s.trim())
  : [
      'https://nitter.net',
      'https://nitter.privacydev.net',
      'https://nitter.poast.org',
      'https://nitter.fdn.fr',
      'https://nitter.1d4.us',
      'https://nitter.cz',
      'https://nitter.adminforge.de'
    ];

const UA = process.env.FETCH_UA || 'Mozilla/5.0 (compatible; SixthFieldTweetProxy/1.0; +https://vercel.com)';

async function fetchRss(host, handle) {
  const url = `${host.replace(/\\/$/,'')}/${handle}/rss`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/rss+xml,text/xml,application/xml;q=0.9,*/*;q=0.8'
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const xml = await res.text();
  if (!xml || xml.length < 50) throw new Error('Empty XML');
  return xml;
}

export async function fetchFromNitter(handle, days=2, debug=false) {
  const since = Date.now() - days*24*60*60*1000;
  let xml = null;
  let used = null;
  const attempts = [];

  for (const host of DEFAULT_HOSTS) {
    try {
      const rss = await fetchRss(host, handle);
      xml = rss;
      used = host;
      attempts.push({ host, ok: true });
      break;
    } catch (e) {
      attempts.push({ host, ok: false, error: String(e) });
      continue;
    }
  }
  if (!xml) return debug ? { debug: { attempts }, items: [] } : [];

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

    const low = (title + ' ' + description).toLowerCase();
    if (low.startsWith('rt ') || low.includes(' rt @') || low.includes('rt by')) continue; // exclude retweets

    let id = '';
    const m = link.match(/\\/status\\/(\\d+)/);
    if (m) id = m[1];

    const tweetUrl = id ? `https://x.com/${handle}/status/${id}` : link;
    const media = /<img|<video/i.test(encoded || description);

    rows.push({
      timestamp_utc: dt.toISOString(),
      author_handle: handle,
      tweet_id: id,
      tweet_url: tweetUrl,
      tweet_text: title.replace(/\\s+/g,' ').trim(),
      media_present: !!media
    });
  }

  return debug ? { debug: { used, attempts, totalRssItems: items.length, returned: rows.length }, items: rows } : rows;
}
