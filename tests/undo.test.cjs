const test = require('node:test');
const assert = require('node:assert/strict');
const matching = require('../js/matching.js');
const profiles = require('../js/profiles.js');
const { createApp } = require('./helpers/app.cjs');
const fresh = () => matching.restoreState(null, profiles);

test('undoing a mutual like removes the match and restores the horse to discovery', () => {
  const before = matching.decide(profiles, fresh(), 'buttercup', 'like');
  const after = matching.undo(before);
  assert.equal(matching.matches(profiles, before).length, 1);
  assert.equal(matching.matches(profiles, after).length, 0);
  assert.equal(matching.discover(profiles, after, { maxDistance: 50 })[0].id, 'buttercup');
  assert.equal(before.decisions.buttercup, 'like');
});

test('undo follows actual decision order even after reload and filtered discovery', () => {
  let state = matching.decide(profiles, fresh(), 'maple', 'like');
  state = matching.decide(profiles, state, 'buttercup', 'pass');
  state = matching.restoreState(JSON.stringify(state), profiles);
  assert.equal(matching.lastDecision(profiles, state).profile.id, 'buttercup');
  state = matching.undo(state);
  assert.equal(state.decisions.maple, 'like');
  assert.equal(matching.lastDecision(profiles, state).profile.id, 'maple');
  state = matching.undo(state);
  assert.equal(matching.lastDecision(profiles, state), null);
  assert.deepEqual(state, fresh());
});

test('legacy saved decisions are preserved without inventing an undo order', () => {
  let state = matching.restoreState('{"version":1,"decisions":{"buttercup":"like"}}', profiles);
  assert.equal(matching.lastDecision(profiles, state), null);
  assert.equal(matching.undo(state).decisions.buttercup, 'like');
  state = matching.decide(profiles, state, 'maple', 'pass');
  state = matching.undo(state);
  assert.equal(state.decisions.buttercup, 'like');
  assert.equal(state.decisions.maple, undefined);
});

test('restore discards unknown, duplicate, and invalid history entries', () => {
  const state = matching.restoreState('{"version":1,"decisions":{"buttercup":"like","maple":"invalid"},"history":["unknown",null,"buttercup","buttercup","maple","__proto__"]}', profiles);
  assert.deepEqual(state.history, ['buttercup']);
});

test('undo persists through the service and reset clears undo history', () => {
  const app = createApp();
  app.controller.decide('like');
  app.controller.undo();
  const reloaded = createApp(Object.fromEntries(app.storage));
  assert.equal(reloaded.controller.current.id, 'buttercup');
  assert.equal(reloaded.controller.matches.length, 0);
  assert.equal(reloaded.controller.lastDecision, null);
  reloaded.controller.decide('pass');
  reloaded.controller.reset();
  assert.equal(reloaded.controller.lastDecision, null);
});
