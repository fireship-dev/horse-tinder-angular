const test = require('node:test');
const assert = require('node:assert/strict');
const matching = require('../js/matching.js');
const profiles = require('../js/profiles.js');
const { createApp } = require('./helpers/app.cjs');
const state = matching.restoreState(null, profiles);

test('age filtering combines with breed, distance, and previously viewed profiles', () => {
  const viewed = matching.decide(profiles, state, 'buttercup', 'pass');
  const found = matching.discover(profiles, viewed, { maxDistance: 20, breed: 'Quarter Horse', ageRange: 'young' });
  assert.deepEqual(found.map(horse => horse.id), ['oat-milk']);
  assert.deepEqual(matching.discover(profiles, viewed, { maxDistance: 15, breed: 'Quarter Horse', ageRange: 'young' }), []);
});

test('age ranges include their exact boundaries and exclude adjacent ages', () => {
  const horses = [5, 6, 10, 11, 20, 21, 35].map(age => ({ id: 'age-' + age, age, distance: 1 }));
  const find = ageRange => matching.discover(horses, state, { maxDistance: 50, ageRange }).map(horse => horse.age).sort((a,b)=>a-b);
  assert.deepEqual(find('young'), [5]);
  assert.deepEqual(find('adult'), [6, 10]);
  assert.deepEqual(find('mature'), [11, 20]);
  assert.deepEqual(find('senior'), [21, 35]);
  assert.deepEqual(find('invalid'), []);
  assert.equal(find('').length, horses.length);
});

test('reset clears the selected age range', () => {
  const { controller } = createApp();
  controller.preferences.ageRange = 'young';
  controller.refresh();
  assert.equal(controller.current.id, 'oat-milk');
  controller.reset();
  assert.equal(controller.preferences.ageRange, '');
  assert.equal(controller.current.id, 'buttercup');
});
