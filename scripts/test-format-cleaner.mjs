import { cleanSpeechText } from '../src/ai/speechEngine.js';
import { sanitizeAiText, parseBlocks } from '../src/components/common/aiTextCleaner.js';

console.log('=== TEST 1: cleanSpeechText for TTS ===');
const speechInput = '### मंडी भाव\n---\n~# 1. गेहूं का भाव ~₹2,400/क्विंटल (~500 kg) है।\n---';
const speechOutput = cleanSpeechText(speechInput);
console.log('Speech output:', speechOutput);

if (speechOutput.includes('#') || speechOutput.includes('~') || speechOutput.includes('---')) {
  console.error('FAIL: Speech output still contains raw artifacts!');
  process.exit(1);
}
console.log('PASS: Speech output is clean.\n');

console.log('=== TEST 2: sanitizeAiText ===');
const dirtyString = '~# 1. गेहूं का भाव ~₹2,425 प्रति क्विंटल (~500 किलो) #1 ~~पुरानी कीमत~~ ```json test ```';
const cleanedString = sanitizeAiText(dirtyString);
console.log('Original:', dirtyString);
console.log('Cleaned :', cleanedString);

if (cleanedString.includes('~') || cleanedString.includes('#') || cleanedString.includes('`')) {
  console.error('FAIL: sanitizeAiText failed to eliminate all weird symbols!');
  process.exit(1);
}
console.log('PASS: sanitizeAiText eliminated all weird symbols.\n');

console.log('=== TEST 3: parseBlocks ===');
const sampleAiMsg = `
### मुख्य कृषि सलाह
---
नमस्ते किसान भाई! सब बढ़िया।
1. **मंडी भाव जांचें**: आज का भाव ~₹2,425 है।
~# 2. **गोदाम भंडारण**: WDRA गोदाम में फसल रखें।
---
### धन्यवाद!
`;

const blocks = parseBlocks(sampleAiMsg);
console.log('Parsed blocks:', JSON.stringify(blocks, null, 2));

const hasDivider = blocks.some(b => b.type === 'divider');
const hasHeading = blocks.some(b => b.type === 'heading');
const numberedList = blocks.find(b => b.type === 'numbered_list');

if (!hasDivider) {
  console.error('FAIL: Divider was not recognized as block type divider!');
  process.exit(1);
}
if (!hasHeading) {
  console.error('FAIL: Heading was not recognized as block type heading!');
  process.exit(1);
}
if (!numberedList || numberedList.items.length !== 2) {
  console.error('FAIL: Numbered list items not parsed properly!');
  process.exit(1);
}

// Verify no items have raw # or ~
for (const item of numberedList.items) {
  if (item.title.includes('#') || item.title.includes('~') || item.desc.includes('#') || item.desc.includes('~')) {
    console.error('FAIL: Numbered item contains raw # or ~!', item);
    process.exit(1);
  }
}

for (const block of blocks) {
  if (block.type === 'paragraph' && (block.content.includes('#') || block.content.includes('~') || block.content.includes('---'))) {
    console.error('FAIL: Paragraph contains raw #, ~, or ---!', block);
    process.exit(1);
  }
  if (block.type === 'heading' && (block.content.includes('#') || block.content.includes('~'))) {
    console.error('FAIL: Heading contains raw # or ~!', block);
    process.exit(1);
  }
}

console.log('PASS: All blocks parsed with 100% clean formatting and zero raw symbols!\n');
