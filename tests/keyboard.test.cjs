const test = require('node:test');
const assert = require('node:assert/strict');
const matching = require('../js/matching.js');
const { createApp } = require('./helpers/app.cjs');

test('left arrow passes and right arrow likes the current horse', () => {
  const { controller: app, stable, keydown } = createApp();
  assert.equal(app.current.id, 'buttercup');
  assert.equal(keydown({ key: 'ArrowRight' }), true);
  assert.equal(app.matches[0].id, 'buttercup');
  const next = app.current.id;
  assert.equal(keydown({ key: 'ArrowLeft' }), true);
  assert.equal(app.notice, 'Passed on ' + stable.profiles.find(horse => horse.id === next).name + '.');
  assert.equal(stable.decisionCount(), 2);
  assert.equal(app.matches.length, 1);
});

test('arrow keys are ignored while typing in form fields', () => {
  const { controller: app, stable, keydown } = createApp();
  for (const target of [{ tagName: 'INPUT' }, { tagName: 'textarea' }, { tagName: 'SELECT' }, { tagName: 'DIV', isContentEditable: true }]) {
    assert.equal(keydown({ key: 'ArrowRight', target }), false);
    assert.equal(keydown({ key: 'ArrowLeft', target }), false);
  }
  assert.equal(stable.decisionCount(), 0);
  assert.equal(app.current.id, 'buttercup');
});

test('held, modified, handled, and other keys do not swipe', () => {
  const { stable, keydown } = createApp();
  assert.equal(keydown({ key: 'ArrowRight', repeat: true }), false);
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
    assert.equal(keydown({ key: 'ArrowLeft', [modifier]: true }), false);
  }
  keydown({ key: 'ArrowRight', defaultPrevented: true });
  for (const key of ['ArrowUp', 'ArrowDown', 'Enter', ' ', 'l', undefined]) assert.equal(keydown({ key }), false);
  assert.equal(stable.decisionCount(), 0);
});

test('arrow keys do nothing on the matches view or an empty deck', () => {
  const { controller: app, stable, keydown } = createApp();
  app.show('matches');
  assert.equal(keydown({ key: 'ArrowRight' }), false);
  assert.equal(stable.decisionCount(), 0);
  app.show('discover');
  while (app.current) keydown({ key: 'ArrowLeft' });
  assert.equal(stable.decisionCount(), 6);
  assert.equal(keydown({ key: 'ArrowRight' }), false);
  assert.equal(stable.decisionCount(), 6);
});

test('the keyboard listener is removed when the controller is destroyed', () => {
  const { stable, keydown, destroy, listeners } = createApp();
  destroy();
  assert.equal(listeners.keydown.size, 0);
  assert.equal(keydown({ key: 'ArrowRight' }), false);
  assert.equal(stable.decisionCount(), 0);
});

test('keyDecision rejects missing or malformed events', () => {
  assert.equal(matching.keyDecision(null), null);
  assert.equal(matching.keyDecision({}), null);
  assert.equal(matching.keyDecision({ key: 'constructor' }), null);
  assert.equal(matching.keyDecision({ key: 'ArrowLeft', target: null }), 'pass');
});
