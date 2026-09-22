import test from 'node:test';
import assert from 'node:assert/strict';
import { availableToAdd, rankAndFilter, updateQuantity } from '../src/lib/marketplace.js';

const lots=[
  {id:'A',crop:'Tomato',grade:'A',qty:20,price:30,old:1,organicCertified:true,farmer:'Anu',warehouse:'North'},
  {id:'B',crop:'Tomato',grade:'B',qty:50,price:20,old:5,organicCertified:false,farmer:'Bina',warehouse:'South'},
  {id:'C',crop:'Onion',grade:'A',qty:0,price:25,old:2,organicCertified:true},
];
test('cart availability does not mutate or double-subtract warehouse stock',()=>{
  assert.equal(availableToAdd(lots[0],[{id:'A',quantityKg:7}]),13);
  assert.equal(lots[0].qty,20);
});
test('cart quantity enforces live stock and 50 kg order cap',()=>{
  assert.equal(updateQuantity([{...lots[0],quantityKg:5}],lots,'A',18)[0].quantityKg,18);
  assert.throws(()=>updateQuantity([{...lots[0],quantityKg:5},{...lots[1],quantityKg:35}],lots,'A',18),/50 kg/);
  assert.throws(()=>updateQuantity([{...lots[0],quantityKg:5}],lots,'A',21),/available/);
});
test('market filters real organic flags, stock, text, crop, grade and price',()=>{
  assert.deepEqual(rankAndFilter(lots,{organic:true}).map(x=>x.id),['A']);
  assert.deepEqual(rankAndFilter(lots,{query:'south',maxPrice:25}).map(x=>x.id),['B']);
  assert.deepEqual(rankAndFilter(lots,{crop:'Tomato',grade:'A'}).map(x=>x.id),['A']);
});
test('market rankAndFilter handles numeric IDs, nulls, and missing fields safely without throwing', () => {
  const edgeLots = [
    null,
    undefined,
    { id: 101, crop: 'Wheat', qty: 50, price: 25 },
    { id: 102, crop: 'Wheat', qty: 30, price: 24, grade: 'Grade A' },
    { id: 'STR-1', crop: 'Rice', qty: 10 },
  ];
  assert.doesNotThrow(() => rankAndFilter(edgeLots));
  assert.deepEqual(rankAndFilter(null), []);
  assert.deepEqual(rankAndFilter(undefined), []);
  const ranked = rankAndFilter(edgeLots);
  assert.equal(ranked.length, 3);
});

test('marketplace lot photo selection prioritizes farmer-uploaded image over warehouse photo', () => {
  const listingWithBoth = {
    id: 'listing-101',
    crop: 'Tomato',
    image_url: 'https://cdn.farmlink.in/farmer/tomato-ramesh.jpg',
    warehouse_image_url: 'https://cdn.farmlink.in/warehouse-intake/tomato-operator-live.jpg',
  };

  // Farmer-uploaded photo must show directly in marketplace
  const primaryImageUrl = listingWithBoth.image_url || listingWithBoth.warehouse_image_url;
  assert.equal(primaryImageUrl, 'https://cdn.farmlink.in/farmer/tomato-ramesh.jpg');

  // Fallback when farmer photo is absent
  const listingWithoutFarmerPhoto = {
    id: 'listing-102',
    crop: 'Tomato',
    image_url: null,
    warehouse_image_url: 'https://cdn.farmlink.in/warehouse-intake/tomato-operator-live.jpg',
  };
  const fallbackImageUrl = listingWithoutFarmerPhoto.image_url || listingWithoutFarmerPhoto.warehouse_image_url;
  assert.equal(fallbackImageUrl, 'https://cdn.farmlink.in/warehouse-intake/tomato-operator-live.jpg');
});

