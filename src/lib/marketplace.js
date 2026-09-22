// Pure inventory/cart helpers shared by the marketplace and regression tests.
export const MAX_CONSUMER_KG = 50;

export function cartQuantity(cart, lotId) {
  return cart.filter(item => item.id === lotId).reduce((sum, item) => sum + Number(item.quantityKg || 0), 0);
}

export function availableToAdd(lot, cart) {
  return Math.max(0, Number(lot.qty || 0) - cartQuantity(cart, lot.id));
}

export function updateQuantity(cart, lots, id, quantity) {
  const next = Number(quantity);
  if (!Number.isFinite(next) || next < 0) throw new Error('Enter a valid quantity in kilograms.');
  if (next === 0) return cart.filter(item => item.id !== id);
  const current = cart.find(item => item.id === id);
  const lot = lots.find(item => item.id === id);
  if (!current || !lot || next > Number(lot.qty)) throw new Error('That quantity is no longer available. Refresh the marketplace or reduce the quantity.');
  const total = cart.filter(item => item.id !== id).reduce((sum, item) => sum + Number(item.quantityKg), next);
  if (total > MAX_CONSUMER_KG) throw new Error('The maximum order quantity is 50 kg.');
  return cart.map(item => item.id === id ? { ...item, ...lot, quantityKg: Math.round(next * 100) / 100 } : item);
}

export function rankAndFilter(lots, { crop = 'All', grade = 'Any', organic = false, query = '', sort = 'smart', maxPrice = '', maxDistance = '' } = {}) {
  const search = query.trim().toLocaleLowerCase();
  const cropMedians = new Map();
  for (const lot of lots) {
    const prices = cropMedians.get(lot.crop) || [];
    prices.push(Number(lot.price));
    cropMedians.set(lot.crop, prices);
  }
  for (const [key, prices] of cropMedians) {
    prices.sort((a,b) => a-b);
    cropMedians.set(key, prices[Math.floor(prices.length / 2)] || 1);
  }
  const score = lot => ({ A: 40, B: 25, C: 10 }[lot.grade] || 0)
    + Math.max(0, 25 - Number(lot.old || 0))
    + Math.max(0, Math.min(25, 25 * (cropMedians.get(lot.crop) / Math.max(Number(lot.price), 0.01))))
    + (Number.isFinite(lot.distanceKm) ? Math.max(0, 10 - lot.distanceKm / 10) : 0);
  return lots.filter(lot => Number(lot.qty) > 0
    && (crop === 'All' || lot.crop === crop)
    && (grade === 'Any' || lot.grade === grade)
    && (!organic || lot.organicCertified === true)
    && (!search || [lot.crop, lot.category, lot.farmer, lot.warehouse, lot.description].join(' ').toLocaleLowerCase().includes(search))
    && (maxPrice === '' || Number(lot.price) <= Number(maxPrice))
    && (maxDistance === '' || (Number.isFinite(lot.distanceKm) && lot.distanceKm <= Number(maxDistance))))
    .sort((a,b) => (sort === 'price' ? a.price - b.price : sort === 'distance'
      ? (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) : score(b) - score(a)) || a.id.localeCompare(b.id));
}
