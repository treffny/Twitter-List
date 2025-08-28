import { fetchFromNitter } from '@/lib/nitter';
import { fetchFromApify } from '@/lib/apify';

function getHandles() {
  const env = process.env.HANDLES || 'nicholadrummond';
  return env.split(',').map(s => s.trim()).filter(Boolean);
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const days = parseInt(req.query.days || process.env.DAYS || '2', 10);
  const handles = getHandles();
  const useApify = String(process.env.USE_APIFY || 'false').toLowerCase() === 'true';

  try {
    const results = [];
    for (const h of handles) {
      const rows = useApify ? await fetchFromApify(h, days) : await fetchFromNitter(h, days);
      results.push(...rows);
      // Tiny delay to be gentle with hosts
      await new Promise(r => setTimeout(r, 200));
    }
    // Sort newest first
    results.sort((a,b) => (a.timestamp_utc < b.timestamp_utc ? 1 : -1));
    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
