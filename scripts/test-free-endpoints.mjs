async function testEndpoints() {
  // 1. Test Pollinations GET with seed & referrer
  try {
    const prompt = encodeURIComponent('Hello, who are you? Reply in one short sentence.');
    const res = await fetch(`https://text.pollinations.ai/${prompt}?model=mistral&seed=${Date.now()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://pollinations.ai/',
      }
    });
    console.log('Pollinations GET status:', res.status);
    const text = await res.text();
    console.log('Pollinations GET result:', text.slice(0, 150));
  } catch (e) {
    console.log('Pollinations GET err:', e);
  }

  // 2. Test DuckDuckGo AI Chat
  try {
    const statusRes = await fetch('https://duckduckgo.com/duckchat/v1/status', {
      headers: { 'x-vqd-accept': '1', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log('DDG status:', statusRes.status, 'x-vqd-4:', statusRes.headers.get('x-vqd-4'));
    const vqd = statusRes.headers.get('x-vqd-4');
    if (vqd) {
      const chatRes = await fetch('https://duckduckgo.com/duckchat/v1/chat', {
        method: 'POST',
        headers: {
          'x-vqd-4': vqd,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say hello in 5 words' }]
        })
      });
      console.log('DDG chat status:', chatRes.status);
      const text = await chatRes.text();
      console.log('DDG chat text:', text.slice(0, 200));
    }
  } catch (e) {
    console.log('DDG err:', e);
  }
}

testEndpoints();
