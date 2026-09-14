const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers/app.cjs');

test('search state does not modify mutual matches or saved decisions across navigation', () => {
  const { controller: app, storage } = createApp();
  app.decide('like');
  app.decide('pass');
  app.decide('like');
  const saved = storage.get('horse-tinder:v1');
  app.matchSearch = 'Buttercup';
  app.show('matches');
  app.refresh();
  assert.equal(app.matches.length, 2);
  assert.equal(app.matchSearch, 'Buttercup');
  assert.equal(storage.get('horse-tinder:v1'), saved);
  app.show('discover');
  app.show('matches');
  assert.equal(app.matchSearch, 'Buttercup');
});
