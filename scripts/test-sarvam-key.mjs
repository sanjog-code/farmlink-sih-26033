const key = process.env.SARVAM_API_KEY || '';
if (!key) throw new Error('Set SARVAM_API_KEY before running this manual provider test.');

async function testSarvamTTS() {
  console.log('Testing Sarvam AI Bulbul TTS API with model: bulbul:v2, speaker: aditya...');
  
  try {
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': key.trim()
      },
      body: JSON.stringify({
        inputs: ['नमस्ते किसान भाई, फार्मलिंक एआई में आपका स्वागत है।'],
        target_language_code: 'hi-IN',
        speaker: 'aditya',
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v3'
      })
    });
    
    console.log('Status:', res.status, res.statusText);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log('🎉 SUCCESS! Generated audio base64 length:', data.audios?.[0]?.length);
    } else {
      console.log('Error details:', data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testSarvamTTS();
