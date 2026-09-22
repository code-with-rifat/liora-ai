async function checkPollinations() {
  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Answer concisely.' },
          { role: 'user', content: 'What is 2 + 2?' }
        ],
        model: 'openai'
      }),
    });
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Response:', data.slice(0, 300));
  } catch (err) {
    console.error('Error:', err);
  }
}

checkPollinations();
