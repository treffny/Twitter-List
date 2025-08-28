import { fetchFromNitter } from '@/lib/nitter';
import { fetchFromApify } from '@/lib/apify';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { handle } = req.query;
  const days = parseInt(req.query.days || process.env.DAYS || '2', 10);
  const useApify = String(process.env.USE_APIFY || 'false').toLowerCase() === 'true';

  try {
    const rows = useApify ? await fetchFromApify(handle, days) : await fetchFromNitter(handle, days);
    rows.sort((a,b) => (a.timestamp_utc < b.timestamp_utc ? 1 : -1));
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
