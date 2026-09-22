const t0 = Date.now();
try {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Laravel vs Next.js comparison table banao' }]
    })
  });
  const raw = await res.text();
  const duration = Date.now() - t0;
  console.log(`Live Chat API responded in ${duration}ms:`);
  console.log(raw.slice(0, 500));
} catch (e) {
  console.error('Error:', e.message);
}
