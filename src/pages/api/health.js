import { fetchFromNitter } from '@/lib/nitter';

export default async function handler(req, res) {
  const handle = req.query.handle || 'nicholadrummond';
  const days = parseInt(req.query.days || '2', 10);
  const debug = true;
  const result = await fetchFromNitter(handle, days, debug);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(result);
}
