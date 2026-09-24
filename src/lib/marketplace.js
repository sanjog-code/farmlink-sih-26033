// Pure inventory/cart helpers shared by the marketplace and regression tests.
export const MAX_CONSUMER_KG = 50000;

export function cartQuantity(cart, lotId) {
  if (!Array.isArray(cart)) return 0;
  return cart
    .filter(item => item && String(item.id) === String(lotId))
    .reduce((sum, item) => sum + Number(item.quantityKg || 0), 0);
}

export function availableToAdd(lot, cart) {
  if (!lot) return 0;
  const stock = Number(lot.qty ?? lot.quantity_kg ?? 1000);
  return Math.max(0, stock - cartQuantity(cart, lot.id));
}

export function updateQuantity(cart, lots, id, quantity) {
  const safeCart = Array.isArray(cart) ? cart : [];
  const safeLots = Array.isArray(lots) ? lots : [];
  const next = Number(quantity);
  if (!Number.isFinite(next) || next < 0) throw new Error('Enter a valid quantity in kilograms.');
  if (next === 0) return safeCart.filter(item => item && String(item.id) !== String(id));
  const current = safeCart.find(item => item && String(item.id) === String(id));
  const lot = safeLots.find(item => item && String(item.id) === String(id)) || current;
  if (!current) throw new Error('Item not found in cart.');
  const availableStock = Number(lot?.qty ?? lot?.quantity_kg ?? current?.qty ?? current?.quantity_kg ?? 10000);
  if (next > availableStock) throw new Error(`Only ${availableStock} kg is currently available for this lot.`);
  const total = safeCart.filter(item => item && String(item.id) !== String(id)).reduce((sum, item) => sum + Number(item.quantityKg || 0), next);
  if (total > MAX_CONSUMER_KG) throw new Error(`The maximum order quantity is ${MAX_CONSUMER_KG} kg.`);
  const resolvedPrice = Number(lot?.price ?? lot?.price_per_kg ?? current?.price ?? current?.price_per_kg ?? 0);
  return safeCart.map(item => item && String(item.id) === String(id) ? { ...item, ...lot, price: resolvedPrice, price_per_kg: resolvedPrice, quantityKg: Math.round(next * 100) / 100 } : item);
}

export function rankAndFilter(lots, { crop = 'All', grade = 'Any', organic = false, query = '', sort = 'smart', maxPrice = '', maxDistance = '' } = {}) {
  const safeLots = Array.isArray(lots) ? lots.filter(Boolean) : [];
  const search = String(query || '').trim().toLocaleLowerCase();
  const cropMedians = new Map();
  for (const lot of safeLots) {
    const cropKey = String(lot?.crop || '');
    if (!cropKey) continue;
    const prices = cropMedians.get(cropKey) || [];
    const p = Number(lot?.price);
    if (Number.isFinite(p) && p > 0) {
      prices.push(p);
      cropMedians.set(cropKey, prices);
    }
  }
  for (const [key, prices] of cropMedians) {
    prices.sort((a,b) => a-b);
    cropMedians.set(key, prices[Math.floor(prices.length / 2)] || 1);
  }
  const score = lot => {
    if (!lot) return 0;
    const firstChar = String(lot.grade || '').trim().toUpperCase().charAt(0);
    const gradeWeight = { A: 40, B: 25, C: 10 }[firstChar] || 20;
    const ageDays = Number.isFinite(Number(lot.old)) ? Number(lot.old) : 0;
    const ageScore = Math.max(0, 25 - ageDays);
    const medianPrice = cropMedians.get(String(lot.crop || '')) || Math.max(Number(lot.price || 1), 1);
    const lotPrice = Math.max(Number(lot.price || 1), 0.01);
    const priceScore = Math.max(0, Math.min(25, 25 * (medianPrice / lotPrice)));
    const dist = Number(lot.distanceKm);
    const distScore = Number.isFinite(dist) ? Math.max(0, 10 - dist / 10) : 0;
    const total = gradeWeight + ageScore + priceScore + distScore;
    return Number.isFinite(total) ? total : 0;
  };
  return safeLots.filter(lot => {
    if (!lot || Number(lot.qty ?? lot.quantity_kg ?? 0) <= 0) return false;
    const lotCrop = String(lot.crop || '');
    if (crop !== 'All' && lotCrop.toLowerCase() !== crop.toLowerCase()) return false;
    const lotGrade = String(lot.grade || '').toUpperCase();
    if (grade !== 'Any' && !lotGrade.startsWith(grade.toUpperCase())) return false;
    if (organic && lot.organicCertified !== true) return false;
    if (search) {
      const haystack = [lot.crop, lot.category, lot.farmer, lot.warehouse, lot.description]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (maxPrice !== '' && Number(lot.price || 0) > Number(maxPrice)) return false;
    const dist = Number(lot.distanceKm);
    if (maxDistance !== '' && (!Number.isFinite(dist) || dist > Number(maxDistance))) return false;
    return true;
  }).sort((a,b) => {
    let diff = 0;
    if (sort === 'price') {
      diff = Number(a.price || 0) - Number(b.price || 0);
    } else if (sort === 'distance') {
      const distA = Number.isFinite(Number(a.distanceKm)) ? Number(a.distanceKm) : Infinity;
      const distB = Number.isFinite(Number(b.distanceKm)) ? Number(b.distanceKm) : Infinity;
      diff = distA - distB;
    } else {
      diff = score(b) - score(a);
    }
    if (diff !== 0 && !isNaN(diff)) return diff;
    return String(a?.id || '').localeCompare(String(b?.id || ''));
  });
}
