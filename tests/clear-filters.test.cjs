const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers/app.cjs');

test('the range input default string value does not count as an active filter', () => {
  const { controller } = createApp();
  controller.preferences.maxDistance = '50';
  controller.refresh();
  assert.equal(controller.filtersActive, false);
});

test('clearing discovery filters preserves likes, passes, matches, and saved decisions', () => {
  const { controller: app, stable, storage } = createApp();
  app.decide('like');
  app.decide('pass');
  const saved = storage.get('horse-tinder:v1');
  app.preferences = { maxDistance: 2, breed: 'Arabian' };
  app.refresh();
  assert.equal(app.current, null);
  assert.equal(app.filtersActive, true);
  app.clearFilters();
  assert.equal(app.preferences.maxDistance, 50);
  assert.equal(app.preferences.breed, '');
  assert.equal(app.current.id, 'maple');
  assert.equal(app.filtersActive, false);
  assert.equal(stable.decisionCount(), 2);
  assert.equal(app.matches[0].id, 'buttercup');
  assert.equal(storage.get('horse-tinder:v1'), saved);
});

test('clearing filters does not bring back profiles from an exhausted deck', () => {
  const { controller: app } = createApp();
  while (app.current) app.decide('pass');
  app.preferences.breed = 'Arabian';
  app.refresh();
  app.clearFilters();
  assert.equal(app.current, null);
  assert.equal(app.decisionCount, 6);
});
