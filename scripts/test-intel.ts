import { processChat } from '../src/lib/gemini';
import { findKnowledgeMatch, solveMathExpression } from '../src/lib/knowledge-base';
import { retrieveRAGContext } from '../src/lib/rag-engine';

async function testComprehensiveSystem() {
  console.log('=== 1. Testing RAG Context Retrieval from knowledge_base/ ===');
  const rag1 = retrieveRAGContext('Who is Md. Riazul Islam Rifat and what projects did he build?', 2);
  console.log('RAG Retrieval (Creator Query):\n', rag1, '\n');

  const rag2 = retrieveRAGContext('How does QLoRA and LoRA fine-tuning work in Transformers?', 2);
  console.log('RAG Retrieval (AI & QLoRA):\n', rag2, '\n');

  console.log('=== 2. Math & Formula Solver ===');
  console.log('Quadratic (x^2 - 5x + 6 = 0) =>', solveMathExpression('x^2 - 5x + 6 = 0', 'bn'));
  console.log('18.5% of 1200 =>', solveMathExpression('18.5% of 1200', 'en'));

  console.log('\n=== 3. Conversational Memory & Dynamic RAG Chat Query ===');
  const testChat = [
    {
      id: '1',
      role: 'user' as const,
      content: 'Amar nam Rifat, ami Dhaka theke bolchi. Full-stack developer.',
      timestamp: '10:00 AM',
    },
    {
      id: '2',
      role: 'assistant' as const,
      content: 'Shune valo laglo Rifat! Kono help lagbe?',
      timestamp: '10:01 AM',
    },
    {
      id: '3',
      role: 'user' as const,
      content: 'Amar nam ki ar ami kothay thaki?',
      timestamp: '10:02 AM',
    },
  ];

  const result = await processChat({
    messages: testChat,
    language: 'banglish',
    modelId: 'auto',
  });
  console.log('Memory Query Result:');
  console.log(result.text);
}

testComprehensiveSystem();
