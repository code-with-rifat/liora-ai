async function checkModels() {
  try {
    const res = await fetch('https://text.pollinations.ai/models');
    console.log('Pollinations models status:', res.status);
    const data = await res.json();
    console.log('Pollinations models:', data);
  } catch (e) {
    console.error('Models err:', e);
  }

  // Also test basic GET without model param
  try {
    const prompt = encodeURIComponent('Explain photosynthesis in 2 sentences in Bangla');
    const res2 = await fetch(`https://text.pollinations.ai/${prompt}`);
    console.log('Default GET status:', res2.status);
    const text2 = await res2.text();
    console.log('Default GET text:', text2.slice(0, 200));
  } catch (e) {
    console.log('Default GET err:', e);
  }
}

checkModels();
