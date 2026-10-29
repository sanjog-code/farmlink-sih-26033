// Vercel Serverless Function: POST /api/saarthi/message
import { defaultSaarthiEngine } from './saarthiEngine.js';

export default async function handler(req, res) {
  // CORS & Methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  if (process.env.FARMLINK_MODE !== 'production') {
    return res.status(503).json({ error: 'Demonstration mode', response: 'This demonstration does not provide AI advice or operational actions. Please verify information with an official source.' });
  }

  try {
    const { sessionId, message, farmerId, farmerName, dataContext } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Input length protection against buffer bloat
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message exceeds maximum length.' });
    }

    const result = await defaultSaarthiEngine.handleTurn({
      sessionId,
      message,
      farmerId: farmerId || 'farmer-self',
      farmerName: farmerName || 'Kisan Bhai',
      dataContext: dataContext || {}
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Saarthi /message error:', err);
    return res.status(500).json({
      error: 'Saarthi engine error',
      response: 'सारथी अभी थोड़ा व्यस्त है। कृपया कुछ क्षण बाद दोबारा बोलें या लिखें।'
    });
  }
}
