import { resolveSpeechCode, SPEECH_LANG_MAP } from '../src/ai/speechEngine.js';

console.log('Testing Speech Engine language mapping...');
const testLangs = ['hi', 'en', 'bn', 'gu', 'ta', 'te', 'pa', 'mr', 'or'];

for (const l of testLangs) {
  const resolved = resolveSpeechCode(l);
  console.log(`Language ${l.toUpperCase()}:`, resolved);
}

console.log('\nTotal mapped languages:', Object.keys(SPEECH_LANG_MAP).length);
console.log('Test completed successfully!');
