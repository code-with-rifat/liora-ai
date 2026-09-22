import fs from 'fs';
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && v.length) envVars[k.trim()] = v.join('=').trim();
}

async function listGroqModels() {
  const key = envVars.GROQ_API_KEY;
  if (!key) return;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    const data = await res.json();
    console.log('GROQ MODELS:', data.data ? data.data.map(m => m.id) : data);
  } catch (e) {
    console.error('Groq list error:', e.message);
  }
}

async function testHuggingFace() {
  const token = envVars.HUGGINGFACE_TOKEN || envVars.HF_TOKEN;
  if (!token) return;
  console.log('Testing HF Token:', token.slice(0, 10));
  const models = [
    'Qwen/Qwen2.5-72B-Instruct',
    'meta-llama/Llama-3.3-70B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3'
  ];
  for (const model of models) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say hi in 3 words' }],
          max_tokens: 30,
        }),
      });
      const data = await res.json();
      console.log(`[HF ${model}]`, res.status, JSON.stringify(data));
    } catch (e) {
      console.log(`[HF ${model}] error:`, e.message);
    }
  }
}

async function run() {
  await listGroqModels();
  await testHuggingFace();
}
run();
