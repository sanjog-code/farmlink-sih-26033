import fs from 'fs';

const key = process.env.SARVAM_API_KEY || '';
if (!key) throw new Error('Set SARVAM_API_KEY before running this manual provider test.');

async function test() {
  console.log('Testing Sarvam TTS to generate sample WAV...');
  const ttsRes = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': key
    },
    body: JSON.stringify({
      inputs: ['गेहूं का भाव क्या है'],
      target_language_code: 'hi-IN',
      speaker: 'aditya',
      model: 'bulbul:v3'
    })
  });
  const ttsData = await ttsRes.json();
  const audioBuffer = Buffer.from(ttsData.audios[0], 'base64');
  console.log('Got audio buffer bytes:', audioBuffer.length);

  const form = new FormData();
  form.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'sample.wav');
  form.append('model', 'saaras:v3');
  form.append('language_code', 'hi-IN');

  console.log('Testing Sarvam ASR with generated WAV...');
  const asrRes = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: { 'api-subscription-key': key },
    body: form
  });
  console.log('ASR status:', asrRes.status);
  const asrData = await asrRes.json();
  console.log('ASR Result:', JSON.stringify(asrData, null, 2));
}

test().catch(console.error);
