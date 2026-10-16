const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers/app.cjs');

test('the match count updates immediately for mutual likes while discovering', () => {
  const { controller: app } = createApp();
  assert.equal(app.matches.length, 0);

  app.decide('like'); // Buttercup likes you back.
  assert.equal(app.matches.length, 1);
  assert.equal(app.view, 'discover');

  app.decide('like'); // Sir Gallops does not.
  assert.equal(app.matches.length, 1);

  app.decide('pass'); // Passing on Maple does not create a match.
  assert.equal(app.matches.length, 1);

  app.decide('pass'); // Oat Milk.
  app.decide('like'); // Clementine likes you back.
  assert.equal(app.matches.length, 2);

  app.show('matches');
  app.show('discover');
  assert.equal(app.matches.length, 2);
});

test('saved mutual matches restore the count and resetting clears it', () => {
  const { controller: app } = createApp({
    'horse-tinder:v1': JSON.stringify({
      version: 1,
      decisions: { buttercup: 'like', 'sir-gallops': 'like', maple: 'pass', clementine: 'like' }
    })
  });
  assert.equal(app.matches.length, 2);

  app.reset();
  assert.equal(app.matches.length, 0);
});
