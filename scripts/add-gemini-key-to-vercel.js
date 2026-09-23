#!/usr/bin/env node
// Run this script ONCE to add the Gemini API key to your Vercel project.
// Usage: agy-node.cmd add-gemini-key-to-vercel.js YOUR_VERCEL_TOKEN
//
// Get your Vercel token at: https://vercel.com/account/tokens

const https = require('https');

const VERCEL_TOKEN = process.argv[2];
if (!VERCEL_TOKEN) {
  console.error('Usage: node add-gemini-key-to-vercel.js <VERCEL_TOKEN>');
  console.error('Get your token at: https://vercel.com/account/tokens');
  process.exit(1);
}

const PROJECT_ID = 'prj_m3TBFZ5M2XhJXDGWmWXfZg8KeOcz';
const TEAM_ID = 'team_o3nhKXu2GILY5fe69vmtSsVG';
const GEMINI_KEY = 'AQ.Ab8RN6KcU5BBNvGVAZvk4UfYKkENTK70eRqkqUpT6L6gRUU2Cg';

const body = JSON.stringify([
  {
    key: 'VITE_GEMINI_API_KEY',
    value: GEMINI_KEY,
    type: 'plain',
    target: ['production', 'preview', 'development']
  }
]);

const options = {
  hostname: 'api.vercel.com',
  path: `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&upsert=true`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('SUCCESS: VITE_GEMINI_API_KEY added to Vercel!');
      console.log('Now redeploy: https://vercel.com/false-6/farmlink/deployments');
    } else {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

req.on('error', err => console.error('Error:', err.message));
req.write(body);
req.end();
