const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers/app.cjs');
const key = 'horse-tinder:preferences:v1';

test('distance and breed preferences survive a reload independently of decisions', () => {
  const first = createApp();
  first.controller.decide('like');
  const saved = first.storage.get('horse-tinder:v1');
  first.controller.preferences = { maxDistance: 15, breed: 'Arabian' };
  first.controller.updatePreferences();
  const next = createApp(Object.fromEntries(first.storage));
  assert.equal(next.controller.preferences.maxDistance, 15);
  assert.equal(next.controller.preferences.breed, 'Arabian');
  assert.equal(next.controller.current.id, 'maple');
  assert.equal(next.controller.matches[0].id, 'buttercup');
  assert.equal(first.storage.get('horse-tinder:v1'), saved);
});

test('invalid saved preferences fall back to usable defaults', () => {
  for (const value of ['{broken', 'null', '[]', '{"maxDistance":-1,"breed":"unlisted"}', '{"maxDistance":"invalid","breed":{}}', '{"maxDistance":true}', '{"maxDistance":[15]}']) {
    const { controller } = createApp({ [key]: value });
    assert.equal(controller.preferences.maxDistance, 50);
    assert.equal(controller.preferences.breed, '');
    assert.equal(controller.current.id, 'buttercup');
  }
});

test('the AngularJS range input string value is saved as a numeric distance', () => {
  const app = createApp();
  app.controller.preferences = { maxDistance: '15', breed: 'Arabian' };
  app.controller.updatePreferences();
  const next = createApp(Object.fromEntries(app.storage));
  assert.equal(next.controller.preferences.maxDistance, 15);
  assert.equal(next.controller.current.id, 'maple');
});

test('valid individual preference fields are retained when another is invalid', () => {
  const { controller } = createApp({ [key]: '{"maxDistance":1000,"breed":"Arabian"}' });
  assert.equal(controller.preferences.maxDistance, 50);
  assert.equal(controller.preferences.breed, 'Arabian');
});

test('reset restores default preferences in storage as well as the current UI', () => {
  const app = createApp({ [key]: '{"maxDistance":15,"breed":"Arabian"}' });
  app.controller.decide('like');
  app.controller.reset();
  const reloaded = createApp(Object.fromEntries(app.storage));
  assert.equal(reloaded.controller.preferences.maxDistance, 50);
  assert.equal(reloaded.controller.preferences.breed, '');
  assert.equal(reloaded.controller.decisionCount, 0);
});

test('storage failures preserve usable in-memory filters and report persistence loss', () => {
  const app = createApp();
  app.storage.set = () => { throw new Error('Storage full'); };
  app.controller.preferences = { maxDistance: 15, breed: 'Arabian' };
  app.controller.updatePreferences();
  assert.equal(app.controller.current.id, 'maple');
  assert.equal(app.controller.persists, false);
});
