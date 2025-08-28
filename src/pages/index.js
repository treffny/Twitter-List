import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [handles, setHandles] = useState('');

  useEffect(() => {
    fetch('/api/tweets')
      .then(r => r.json())
      .then(j => {
        setData(j);
        const uniqueHandles = Array.from(new Set(j.map(x => x.author_handle)));
        setHandles(uniqueHandles.join(', '));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{padding: 24, fontFamily: 'sans-serif'}}>
      <h1>Sixth Field Tweet Proxy</h1>
      <p>Handles: <strong>{handles || '(from env HANDLES)'}</strong></p>
      <p>Try the API: <code>/api/tweets</code> or <code>/api/tweets/&lt;handle&gt;</code></p>
      {loading ? <p>Loading…</p> : (
        <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%'}}>
          <thead>
            <tr>
              <th>Time (UTC)</th>
              <th>Handle</th>
              <th>Text</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row,i) => (
              <tr key={i}>
                <td>{row.timestamp_utc}</td>
                <td>@{row.author_handle}</td>
                <td>{row.tweet_text}</td>
                <td><a href={row.tweet_url} target="_blank" rel="noreferrer">Open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
