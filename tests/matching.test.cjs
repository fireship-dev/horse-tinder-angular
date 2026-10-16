const test = require('node:test');
const assert = require('node:assert/strict');
const matching = require('../js/matching.js');
const profiles = require('../js/profiles.js');
const fresh = () => matching.restoreState(null, profiles);
const all = { maxDistance: 50, breed: '' };

test('discovery combines distance and breed filters and sorts by distance', () => {
  const found = matching.discover(profiles, fresh(), { maxDistance: 18, breed: 'Quarter Horse' });
  assert.deepEqual(found.map(horse => horse.id), ['buttercup', 'oat-milk']);
  assert.deepEqual(matching.discover(profiles, fresh(), { maxDistance: 2, breed: '' }), []);
});

test('a like creates a match only when it is mutual', () => {
  let state = matching.decide(profiles, fresh(), 'sir-gallops', 'like');
  assert.deepEqual(matching.matches(profiles, state), []);
  state = matching.decide(profiles, state, 'buttercup', 'like');
  assert.deepEqual(matching.matches(profiles, state).map(horse => horse.id), ['buttercup']);
});

test('passing on a horse who likes you never creates a match', () => {
  const state = matching.decide(profiles, fresh(), 'buttercup', 'pass');
  assert.deepEqual(matching.matches(profiles, state), []);
  assert.ok(!matching.discover(profiles, state, all).some(horse => horse.id === 'buttercup'));
});

test('decisions are immutable and cannot be repeated or overwritten', () => {
  const before = fresh();
  const after = matching.decide(profiles, before, 'buttercup', 'like');
  assert.deepEqual(before.decisions, {});
  assert.throws(() => matching.decide(profiles, after, 'buttercup', 'pass'), /already decided/);
  assert.equal(after.decisions.buttercup, 'like');
});

test('invalid swipe inputs are rejected without changing state', () => {
  const state = fresh();
  assert.throws(() => matching.decide(profiles, state, 'unknown', 'like'), /Unknown/);
  assert.throws(() => matching.decide(profiles, state, 'buttercup', 'maybe'), /Choose like, super like, or pass/);
  assert.throws(() => matching.decide(profiles, state, '__proto__', 'like'), /Unknown/);
  assert.deepEqual(state, fresh());
});

test('valid decisions survive persistence and remove already seen profiles', () => {
  const state = matching.decide(profiles, fresh(), 'buttercup', 'like');
  const restored = matching.restoreState(JSON.stringify(state), profiles);
  assert.deepEqual(restored, state);
  assert.equal(matching.discover(profiles, restored, all).length, profiles.length - 1);
  assert.equal(matching.matches(profiles, restored).length, 1);
});

test('corrupt, unsupported, or malformed storage starts fresh', () => {
  for (const saved of ['{broken', 'null', '[]', '42', '{"version":2,"decisions":{}}', '{"version":1,"decisions":[]}']) {
    assert.deepEqual(matching.restoreState(saved, profiles), fresh());
  }
});

test('storage only restores valid decisions for known horses', () => {
  const restored = matching.restoreState('{"version":1,"decisions":{"buttercup":"like","maple":"maybe","unknown":"like","__proto__":"like"}}', profiles);
  assert.deepEqual(restored.decisions, { buttercup: 'like' });
});

test('finishing the deck yields an empty discovery list', () => {
  const state = profiles.reduce((state, horse) => matching.decide(profiles, state, horse.id, 'pass'), fresh());
  assert.deepEqual(matching.discover(profiles, state, all), []);
});
