export async function fetchFromApify(handle, days=2) {
  if (!process.env.APIFY_TOKEN || !process.env.APIFY_ACTOR) {
    throw new Error('APIFY_TOKEN and APIFY_ACTOR must be set when USE_APIFY=true');
  }
  const sinceIso = new Date(Date.now() - days*24*60*60*1000).toISOString();
  const startRes = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(process.env.APIFY_ACTOR)}/runs?token=${process.env.APIFY_TOKEN}`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ input: { username: handle, maxItems: 50, includeReplies: true, includeRetweets: false, since: sinceIso }})
  });
  const start = await startRes.json();
  const runId = start?.data?.id;
  if (!runId) throw new Error('Failed to start Apify actor');
  let status='READY', datasetId=null;
  for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,3000));const r=await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${process.env.APIFY_TOKEN}`);const j=await r.json();status=j?.data?.status;datasetId=j?.data?.defaultDatasetId||j?.data?.outputDatasetId;if(status==='SUCCEEDED') break;}
  if(status!=='SUCCEEDED') throw new Error('Apify actor did not finish in time');
  const dataRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true`);
  const items = await dataRes.json();
  const sinceTs = Date.now()-days*24*60*60*1000;
  const out=[];
  for(const it of items){
    const id = it.id||it.tweetId||'';
    const text = it.text||'';
    const created = it.createdAt||it.timeParsed||null;
    const dt = created?new Date(created):null;
    const ts = dt?dt.getTime():0;
    const isRt = it.isRetweet===true||/^rt\b/i.test(text);
    if(!id||isRt) continue;
    if(ts && ts<sinceTs) continue;
    out.push({timestamp_utc:dt?dt.toISOString():new Date().toISOString(),author_handle:handle,tweet_id:id,tweet_url:`https://x.com/${handle}/status/${id}`,tweet_text:text,media_present:!!(it.media&&it.media.length)});
  }
  return out;
}
