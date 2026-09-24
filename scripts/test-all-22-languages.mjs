import { CONSTITUTIONAL_LANGUAGES, translateText, isRtlLanguage, getLanguageMeta } from '../src/translations/constitutional22.js';

console.log('Total Languages:', CONSTITUTIONAL_LANGUAGES.length);

let totalPassed = 0;
let totalChecked = 0;

for (const lang of CONSTITUTIONAL_LANGUAGES) {
  totalChecked++;
  const translatedHome = translateText('Home', lang.code);
  const translatedMarket = translateText('Marketplace', lang.code);
  const translatedFarmer = translateText('Farmer', lang.code);
  const translatedWarehouse = translateText('Warehouse', lang.code);
  const isRtl = isRtlLanguage(lang.code);

  if (lang.code === 'ur' || lang.code === 'ks' || lang.code === 'sd') {
    if (!isRtl) throw new Error(`Expected RTL for ${lang.code}`);
  }

  if (!translatedHome || !translatedMarket) {
    throw new Error(`Translation failed for ${lang.code}`);
  }

  totalPassed++;
  console.log(`[PASS] ${lang.code.padEnd(4)} (${lang.name.padEnd(10)} - ${lang.nativeName.padEnd(12)}): Home->${translatedHome}, Market->${translatedMarket}, RTL: ${isRtl}`);
}

// Test parameter interpolation
const interpolated = translateText("items · {kg} kg", "hi", { kg: 50 });
console.log('Interpolation test:', interpolated);
if (!interpolated.includes('50 kg')) throw new Error('Interpolation test failed');

console.log(`\nALL ${totalPassed}/${totalChecked} CONSTITUTIONAL LANGUAGES VERIFIED SUCCESSFULLY!`);
