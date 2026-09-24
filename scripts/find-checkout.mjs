import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('modal === "checkout"') || l.includes('checkout-modal') || l.includes('ConsumerCheckout') || l.includes('placeOrder')) {
    console.log((i + 1) + ': ' + l.slice(0, 140));
  }
});
