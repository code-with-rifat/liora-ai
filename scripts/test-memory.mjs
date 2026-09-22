async function testMemoryPrompt() {
  const history = [
    "User: Amar nam Rifat, ami Dhaka te thaki ar full-stack developer.",
    "Assistant: Shune valo laglo Rifat! Ki niye kaj korcho?",
    "User: Amar nam ki ar ami kon shohore thaki? Banglish e bolo."
  ].join("\n");

  const system = "You are Liora, an ultra-intelligent AI assistant with full conversational memory created by Md. Riazul Islam Rifat. Answer accurately in Banglish based on the conversation history.";
  const fullPrompt = `${system}\n\n${history}\n\nAssistant:`;

  try {
    const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai-fast`);
    console.log('GET status:', res.status);
    const text = await res.text();
    console.log('GET text:\n', text);
  } catch (e) {
    console.error('Err:', e);
  }
}

testMemoryPrompt();
