async function run() {
  const res = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': 'sk_v9yrxpg0_ZzIdidU18EjUTGEFfkajp7OZ'
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
