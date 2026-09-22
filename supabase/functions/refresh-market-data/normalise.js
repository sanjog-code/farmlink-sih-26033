// AGMARKNET's daily wholesale dataset reports INR/quintal; store INR/kg.
// Keep rice and paddy separate, and never combine different varieties/grades.
const aliases = {
  'paddy(dhan)(common)': 'Paddy (Common)', 'paddy(dhan)(basmati)': 'Paddy (Basmati)',
  paddy: 'Paddy (Common)', rice: 'Rice', soyabean: 'Soybean', soybean: 'Soybean',
  bajra: 'Pearl millet (Bajra)', 'bajra(pearl millet/cumbu)': 'Pearl millet (Bajra)',
  ragi: 'Finger millet (Ragi)', 'ragi (finger millet)': 'Finger millet (Ragi)',
  jowar: 'Sorghum (Jowar)', 'jowar(sorghum)': 'Sorghum (Jowar)',
  moong: 'Green gram (Moong)', 'green gram (moong)(whole)': 'Green gram (Moong)',
  urad: 'Black gram (Urad)', 'black gram (urd beans)(whole)': 'Black gram (Urad)',
  tur: 'Pigeon pea (Arhar/Tur)', 'arhar (tur/red gram)(whole)': 'Pigeon pea (Arhar/Tur)',
  gram: 'Chickpea (Gram)', 'bengal gram(gram)(whole)': 'Chickpea (Gram)',
  lentil: 'Lentil (Masur)', 'lentil (masur)(whole)': 'Lentil (Masur)',
  sesamum: 'Sesame', 'sesamum(sesame,gingelly,til)': 'Sesame',
  'sunflower seed': 'Sunflower',
};
const clean = value => String(value ?? '').trim().replace(/\s+/g, ' ');
const field = (row, ...keys) => keys.map(key => row[key]).find(value => clean(value) !== '');
const number = value => {
  if (clean(value) === '') return null;
  const n = Number(clean(value).replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};
export function sourceDate(value, now = new Date()) {
  let date = clean(value);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) date = date.split('/').reverse().join('-');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) return null;
  const todayIndia = new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
  return date >= '2000-01-01' && date <= todayIndia ? date : null;
}
export function normaliseRecord(row, now = new Date()) {
  const commodity = clean(field(row, 'commodity', 'Commodity'));
  const crop = aliases[commodity.toLowerCase()] || commodity.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  const market = clean(field(row, 'market', 'Market'));
  const state = clean(field(row, 'state', 'State'));
  const district = clean(field(row, 'district', 'District'));
  const variety = clean(field(row, 'variety', 'Variety'));
  const grade = clean(field(row, 'grade', 'Grade'));
  const priceDate = sourceDate(field(row, 'arrival_date', 'Arrival_Date', 'date'), now);
  const min = number(field(row, 'min_price', 'Min Price'));
  const max = number(field(row, 'max_price', 'Max Price'));
  const modal = number(field(row, 'modal_price', 'Modal Price'));
  const unit = clean(field(row, 'price_unit', 'Price Unit', 'unit')).toLowerCase();
  // A changed upstream unit must not silently become a 100x price error.
  if (unit && !['rs/quintal', 'inr/quintal', 'rs./quintal', 'quintal', 'rs./quintal.'].includes(unit)) return null;
  if (!crop || !market || !state || !priceDate || !modal) return null;
  if ((min && min > modal) || (max && max < modal) || (min && max && min > max)) return null;
  return {
    crop, market, state, district, variety, grade, price_date: priceDate,
    min_price_per_kg: min === null ? null : min / 100,
    modal_price_per_kg: modal / 100,
    max_price_per_kg: max === null ? null : max / 100,
    // This resource does not guarantee an arrivals unit. Do not invent tonnes.
    arrivals_tonnes: null, source_name: 'data.gov.in / AGMARKNET',
    source_record: row, fetched_at: now.toISOString(),
  };
}
export const snapshotKey = row => JSON.stringify([row.crop, row.market, row.state, row.district, row.variety, row.grade, row.price_date]);
export function normalisePage(records, now = new Date()) {
  const unique = new Map();
  let rejected = 0;
  for (const record of records) {
    const row = normaliseRecord(record, now);
    if (row) unique.set(snapshotKey(row), row); else rejected++;
  }
  return { rows: [...unique.values()], rejected };
}
export function isOfficialMspUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443') &&
      ['pib.gov.in', 'www.pib.gov.in', 'static.pib.gov.in', 'cacp.da.gov.in', 'agricoop.gov.in', 'www.agricoop.gov.in', 'desagri.gov.in'].includes(url.hostname);
  } catch { return false; }
}
