async function run() {
  const key = process.env.SARVAM_API_KEY || '';
  if (!key) throw new Error('Set SARVAM_API_KEY before running this manual provider test.');
  const res = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': key
    },
    body: JSON.stringify({
      inputs: ['नमस्ते, फार्मलिंक में आपका स्वागत है।'],
      target_language_code: 'hi-IN',
      speaker: 'aditya',
      model: 'bulbul:v3'
    })
  });
  console.log('Status:', res.status);
  const data = await res.json();
  if (data.audios) {
    console.log('Success! Audio received, base64 length:', data.audios[0].length);
  } else {
    console.log('Response error:', data);
  }
}
run();
