import { normalizeQuantityToKg, normalizeCropName } from '../api/saarthi/saarthiTools.js';

console.log('dhai quintal ke aas paas ->', normalizeQuantityToKg('dhai quintal ke aas paas'));
console.log('teen kuntal ->', normalizeQuantityToKg('teen kuntal'));
console.log('dedh quintal ->', normalizeQuantityToKg('dedh quintal'));
console.log('500 ->', normalizeQuantityToKg(500));
console.log('4 quintal ->', normalizeQuantityToKg('4 quintal'));
console.log('gehu ->', normalizeCropName('gehu'));
