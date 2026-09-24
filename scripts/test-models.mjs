const key = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KcU5BBNvGVAZvk4UfYKkENTK70eRqkqUpT6L6gRUU2Cg';

async function run() {
  for (const m of ['gemini-3.7-flash', 'gemini-2.5-flash']) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Hello, reply with 1 word.' }] }] })
      });
      const data = await r.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || data.error?.message;
      console.log(m, '=> Status:', r.status, 'Response:', txt);
    } catch(e) {
      console.log(m, 'Error:', e.message);
    }
  }
}
run();
