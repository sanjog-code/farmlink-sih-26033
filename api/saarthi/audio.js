// Vercel Serverless Function: POST /api/saarthi/audio
import { defaultSaarthiEngine } from './saarthiEngine.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Allow up to 10MB audio voice clips
    }
  }
};

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
    const { sessionId, audioBase64, mimeType, farmerId, farmerName, dataContext } = req.body || {};

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio base64 data is required.' });
    }

    const result = await defaultSaarthiEngine.handleTurn({
      sessionId,
      audioBase64,
      mimeType: mimeType || 'audio/webm',
      farmerId: farmerId || 'farmer-self',
      farmerName: farmerName || 'Kisan Bhai',
      dataContext: dataContext || {}
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Saarthi /audio error:', err);
    return res.status(500).json({
      error: 'Saarthi audio engine error',
      response: 'आवाज़ साफ़ नहीं आई। कृपया बटन दबाकर दोबारा बोलें।'
    });
  }
}
