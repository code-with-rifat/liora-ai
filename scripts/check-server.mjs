async function checkServer() {
  try {
    const res = await fetch('http://localhost:3000');
    console.log('Status:', res.status);
    const html = await res.text();
    const cssMatch = html.match(/href="\/_next\/static\/css\/[^"]+\.css"/g);
    console.log('Found CSS Bundles in HTML:', cssMatch);

    if (cssMatch && cssMatch[0]) {
      const cssPath = cssMatch[0].replace(/href="|"/g, '');
      const cssRes = await fetch(`http://localhost:3000${cssPath}`);
      console.log('CSS File HTTP Status:', cssRes.status);
      const cssText = await cssRes.text();
      console.log('CSS File Size:', cssText.length, 'bytes');
      console.log('Contains Tailwind rules:', cssText.includes('background-color') || cssText.includes('flex'));
    }
  } catch (err) {
    console.error('Error fetching localhost:', err);
  }
}

checkServer();
