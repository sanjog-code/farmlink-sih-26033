// Vercel Serverless Function: POST /api/saarthi/confirm
import { defaultSaarthiEngine, getOrCreateSession } from './saarthiEngine.js';

// Idempotency cache to prevent duplicate listings on double-tap
const executedActions = new Set();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { sessionId, confirmed, idempotencyKey, farmerId, farmerName, dataContext } = req.body || {};

    if (idempotencyKey && executedActions.has(idempotencyKey)) {
      return res.status(200).json({
        duplicate: true,
        response: 'यह कार्रवाई पहले ही पूरी हो चुकी है।'
      });
    }

    if (idempotencyKey) {
      executedActions.add(idempotencyKey);
      // Auto cleanup idempotency key after 5 minutes
      setTimeout(() => executedActions.delete(idempotencyKey), 5 * 60 * 1000);
    }

    const message = confirmed ? 'हाँ, पक्का करें' : 'नहीं, रोकें';
    const result = await defaultSaarthiEngine.handleTurn({
      sessionId,
      message,
      farmerId,
      farmerName,
      dataContext: dataContext || {}
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Saarthi /confirm error:', err);
    return res.status(500).json({
      error: 'Confirmation error',
      response: 'कार्रवाई की पुष्टि नहीं हो सकी। कृपया दोबारा प्रयास करें।'
    });
  }
}
