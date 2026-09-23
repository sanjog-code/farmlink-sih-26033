import { runGeminiAgent } from '../src/ai/geminiClient.js';
import * as tools from '../src/ai/agentTools.js';

const key = 'AQ.Ab8RN6KcU5BBNvGVAZvk4UfYKkENTK70eRqkqUpT6L6gRUU2Cg';

async function testFullLoop() {
  console.log('Testing full Gemini ReAct loop with gemini-2.5-flash...');
  const steps = [];
  try {
    const res = await runGeminiAgent({
      apiKey: key,
      model: 'gemini-3.6-flash',
      goal: 'सरसों का मंडी भाव क्या है? क्या मुझे 500 किग्रा बेचना चाहिए या 50% एडवांस लेना चाहिए?',
      userRole: 'farmer',
      language: 'hi',
      runtimeContext: { lots: [] },
      onStep: (step) => {
        console.log(`[${step.type.toUpperCase()}]`, step.tool ? `(${step.tool})` : '', step.content ? step.content.slice(0, 120) : '');
        steps.push(step);
      }
    });
    console.log('\n--- Final Text ---');
    console.log(res.text.slice(0, 300));
    console.log('\nSUCCESS! Total steps:', steps.length);
  } catch (err) {
    console.error('FAILED:', err);
  }
}

testFullLoop();
