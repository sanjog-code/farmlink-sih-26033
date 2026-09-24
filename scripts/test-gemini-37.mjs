import https from 'https';

const API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KcU5BBNvGVAZvk4UfYKkENTK70eRqkqUpT6L6gRUU2Cg';

async function testGemini37() {
  console.log('Testing gemini-3.7-flash with direct REST API...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Respond strictly in JSON with {"status": "ok", "model": "gemini-3.7-flash", "greeting": "Namaste"}' }]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('Status code:', res.status, res.statusText);
  const data = await res.json();
  console.log('Response data:', JSON.stringify(data, null, 2).slice(0, 500));
}

testGemini37().catch(console.error);
