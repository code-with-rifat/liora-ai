import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

async function testJinaAndOthers() {
  console.log('--- 1. Testing Jina AI Search (s.jina.ai) ---');
  try {
    const res = await fetch('https://s.jina.ai/latest+news+bangladesh', {
      headers: {
        'Accept': 'application/json',
        'X-No-Cache': 'true'
      }
    });
    console.log('Jina status:', res.status);
    const data = await res.json();
    console.log('Jina results count:', data.data?.length);
    if (data.data && data.data[0]) {
      console.log('Top result title:', data.data[0].title);
      console.log('Top result url:', data.data[0].url);
      console.log('Top result snippet:', data.data[0].description?.slice(0, 150));
    }
  } catch (e) {
    console.error('Jina error:', e.message);
  }

  console.log('\n--- 2. Testing Wikipedia REST Search ---');
  try {
    const res = await fetch('https://en.wikipedia.org/w/rest.php/v1/search/page?q=' + encodeURIComponent('Google Gemini') + '&limit=3', {
      headers: {
        'User-Agent': 'AetherisAI/1.0 (https://liora.app; contact@liora.app)'
      }
    });
    console.log('Wiki REST status:', res.status);
    const data = await res.json();
    console.log('Wiki pages:', data.pages?.map(p => ({ title: p.title, url: 'https://en.wikipedia.org/wiki/' + p.key, desc: p.description })));
  } catch (e) {
    console.error('Wiki error:', e.message);
  }
}

testJinaAndOthers();
