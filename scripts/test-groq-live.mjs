import fs from 'fs';
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && v.length) envVars[k.trim()] = v.join('=').trim();
}

async function testWorkingGroq() {
  const key = envVars.GROQ_API_KEY;
  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  for (const model of models) {
    const t0 = Date.now();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are Liora AI. Answer in direct Gemini style.' },
            { role: 'user', content: 'React vs Vue er tulona ekta table e dao' }
          ],
          max_tokens: 300,
        }),
      });
      const data = await res.json();
      const duration = Date.now() - t0;
      if (res.ok) {
        console.log(`\n=== GROQ MODEL: ${model} (Time: ${duration}ms) ===`);
        console.log(data.choices[0].message.content);
      } else {
        console.log(`[Groq ${model}] FAILED ${res.status}:`, JSON.stringify(data));
      }
    } catch (e) {
      console.log(`[Groq ${model}] Error:`, e.message);
    }
  }
}
testWorkingGroq();
