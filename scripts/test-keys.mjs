import fs from 'fs';
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && v.length) envVars[k.trim()] = v.join('=').trim();
}
process.env.GROQ_API_KEY = envVars.GROQ_API_KEY || process.env.GROQ_API_KEY;
process.env.OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

async function testGroq() {
  const key = process.env.GROQ_API_KEY;
  console.log('Testing Groq Key:', key ? `${key.slice(0, 8)}...` : 'MISSING');
  if (!key) return;

  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
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
          messages: [{ role: 'user', content: 'Say hello in 5 words' }],
          max_tokens: 50,
        }),
      });
      const data = await res.json();
      const duration = Date.now() - t0;
      if (res.ok) {
        console.log(`[Groq ${model}] SUCCESS in ${duration}ms:`, data.choices[0].message.content);
      } else {
        console.log(`[Groq ${model}] FAILED ${res.status}:`, JSON.stringify(data));
      }
    } catch (e) {
      console.log(`[Groq ${model}] ERROR:`, e.message);
    }
  }
}

async function testOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY;
  console.log('\nTesting OpenRouter Key:', key ? `${key.slice(0, 12)}...` : 'MISSING');
  if (!key) return;

  const models = ['meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2.5-72b-instruct:free', 'google/gemini-2.0-flash-exp:free', 'liquid/lfm-7b:free'];
  for (const model of models) {
    const t0 = Date.now();
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://liora.app',
          'X-Title': 'Liora AI',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say hello in 5 words' }],
          max_tokens: 50,
        }),
      });
      const data = await res.json();
      const duration = Date.now() - t0;
      if (res.ok && data?.choices?.[0]?.message?.content) {
        console.log(`[OpenRouter ${model}] SUCCESS in ${duration}ms:`, data.choices[0].message.content);
      } else {
        console.log(`[OpenRouter ${model}] FAILED:`, JSON.stringify(data));
      }
    } catch (e) {
      console.log(`[OpenRouter ${model}] ERROR:`, e.message);
    }
  }
}

async function run() {
  await testGroq();
  await testOpenRouter();
}
run();
