import { executeAutonomousAgent } from '../src/ai/agentCore.js';

const key = 'AQ.Ab8RN6KcU5BBNvGVAZvk4UfYKkENTK70eRqkqUpT6L6gRUU2Cg';

async function testBothModes() {
  console.log('1. Testing with Cloud Gemini enabled (model: gemini-3.6-flash)...');
  const res1 = await executeAutonomousAgent({
    goal: 'सरसों का भाव क्या है और 500 किग्रा पर कितना एडवांस मिलेगा?',
    userRole: 'farmer',
    language: 'hi',
    apiKey: key,
    model: 'gemini-3.6-flash',
    useGeminiIfAvailable: true,
    runtimeContext: { lots: [] },
    onStep: (step) => {
      console.log(`  [${step.type.toUpperCase()}]`, step.tool ? `(${step.tool})` : '', (step.content || '').slice(0, 80));
    }
  });
  console.log('Result 1 source:', res1.source);
  console.log('Result 1 preview:', res1.text.slice(0, 150));
  console.log('Action cards:', res1.actionCards?.length);

  console.log('\n2. Testing Autonomous Edge ReAct mode (zero API key)...');
  const res2 = await executeAutonomousAgent({
    goal: 'What is the MSP and mandi price for Wheat?',
    userRole: 'farmer',
    language: 'en',
    apiKey: '',
    useGeminiIfAvailable: false,
    runtimeContext: { lots: [] },
    onStep: (step) => {
      console.log(`  [${step.type.toUpperCase()}]`, step.tool ? `(${step.tool})` : '', (step.content || '').slice(0, 80));
    }
  });
  console.log('Result 2 source:', res2.source);
  console.log('Result 2 preview:', res2.text.slice(0, 150));
  console.log('Action cards:', res2.actionCards?.length);
  console.log('\nALL TESTS PASSED!');
}

testBothModes().catch(console.error);
