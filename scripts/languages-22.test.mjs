import test from 'node:test';
import assert from 'node:assert/strict';
import { CONSTITUTIONAL_LANGUAGES, LANGUAGE_DICTIONARIES, translateText } from '../src/translations/constitutional22.js';

test('all 22 constitutional languages plus English are registered', () => {
  assert.equal(CONSTITUTIONAL_LANGUAGES.length, 23, 'Must have 22 Indian constitutional languages + 1 English');
  const expected22 = [
    'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai',
    'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur'
  ];
  for (const code of expected22) {
    const entry = CONSTITUTIONAL_LANGUAGES.find(l => l.code === code);
    assert.ok(entry, `Language ${code} must exist in CONSTITUTIONAL_LANGUAGES`);
    assert.ok(entry.name, `Language ${code} must have a name`);
    assert.ok(entry.nativeName, `Language ${code} must have a nativeName`);
    assert.ok(entry.speechCode, `Language ${code} must have a speechCode`);
  }
});

test('translations work across multiple Indian languages', () => {
  const sampleTerms = ['Marketplace', 'Farmer', 'Warehouse', 'Sign in'];
  const testLangs = ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'or', 'as', 'ur', 'sa', 'kn', 'ml'];
  for (const lang of testLangs) {
    for (const term of sampleTerms) {
      const translated = translateText(term, lang);
      assert.ok(translated, `Translation for ${term} in ${lang} must not be empty`);
      assert.notEqual(translated, '', `Translation for ${term} in ${lang} should exist`);
    }
  }
});

test('lossless behavior: English returns exact string', () => {
  assert.equal(translateText('Marketplace', 'en'), 'Marketplace');
  assert.equal(translateText('Better value for every harvest.', 'en'), 'Better value for every harvest.');
});
