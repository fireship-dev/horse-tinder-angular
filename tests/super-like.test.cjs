const test = require('node:test');
const assert = require('node:assert/strict');
const matching = require('../js/matching.js');
const profiles = require('../js/profiles.js');
const { createApp } = require('./helpers/app.cjs');
const fresh = () => matching.restoreState(null, profiles);
const all = { maxDistance: 50, breed: '' };

test('a super like counts as a like for mutual matching only', () => {
  let state = matching.decide(profiles, fresh(), 'sir-gallops', 'superlike', '2026-10-16');
  assert.deepEqual(matching.matches(profiles, state), []);
  state = matching.decide(profiles, fresh(), 'buttercup', 'superlike', '2026-10-16');
  assert.deepEqual(matching.matches(profiles, state).map(horse => horse.id), ['buttercup']);
  assert.ok(!matching.discover(profiles, state, all).some(horse => horse.id === 'buttercup'));
});

test('only one super like is allowed per day', () => {
  const state = matching.decide(profiles, fresh(), 'sir-gallops', 'superlike', '2026-10-16');
  assert.equal(state.superLikedOn, '2026-10-16');
  assert.equal(matching.superLikeAvailable(state, '2026-10-16'), false);
  assert.throws(() => matching.decide(profiles, state, 'maple', 'superlike', '2026-10-16'), /already used your super like today/);
  assert.equal(matching.decide(profiles, state, 'maple', 'like', '2026-10-16').superLikedOn, '2026-10-16');
  const tomorrow = matching.decide(profiles, state, 'maple', 'superlike', '2026-10-17');
  assert.equal(tomorrow.decisions.maple, 'superlike');
  assert.equal(tomorrow.superLikedOn, '2026-10-17');
});

test('a super like requires a valid day', () => {
  for (const today of [undefined, '', 'today', '2026-1-1', 20261016]) {
    assert.throws(() => matching.decide(profiles, fresh(), 'maple', 'superlike', today), /current day/);
  }
});

test('super likes and the daily limit survive persistence; invalid days are dropped', () => {
  const state = matching.decide(profiles, fresh(), 'buttercup', 'superlike', '2026-10-16');
  const restored = matching.restoreState(JSON.stringify(state), profiles);
  assert.deepEqual(restored, state);
  assert.equal(matching.superLikeAvailable(restored, '2026-10-16'), false);
  const tampered = matching.restoreState('{"version":1,"decisions":{},"superLikedOn":{"x":1}}', profiles);
  assert.deepEqual(tampered, fresh());
});

test('local days are formatted from the local calendar date', () => {
  assert.equal(matching.localDay(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(matching.localDay(new Date(2026, 11, 31, 0, 0)), '2026-12-31');
});

test('a horse that super liked you is flagged in the deck', () => {
  const flagged = profiles.filter(horse => horse.superLikesYou).map(horse => horse.id);
  assert.deepEqual(flagged, ['maple']);
});

test('the controller super likes once, then disables super like until tomorrow', () => {
  const { controller: app, stable, storage } = createApp();
  assert.equal(app.superLikeAvailable, true);
  app.decide('superlike');
  assert.equal(app.notice, 'It is a match! You and Buttercup like each other.');
  assert.equal(app.superLikeAvailable, false);
  assert.equal(app.matches[0].id, 'buttercup');
  assert.equal(app.current.id, 'sir-gallops');
  app.decide('superlike');
  assert.equal(app.current.id, 'sir-gallops');
  assert.equal(stable.decisionCount(), 1);
  assert.match(app.notice, /used your super like for today/);
  assert.equal(JSON.parse(storage.get('horse-tinder:v1')).decisions.buttercup, 'superlike');
});

test('resetting discovery does not restore a super like used today', () => {
  const { controller: app } = createApp();
  app.decide('superlike');
  app.reset();
  assert.equal(app.decisionCount, 0);
  assert.equal(app.superLikeAvailable, false);
});

test('a super like saved on an earlier day is available again', () => {
  const saved = JSON.stringify({ version: 1, decisions: { buttercup: 'superlike' }, superLikedOn: '2000-01-01' });
  const { controller: app } = createApp({ 'horse-tinder:v1': saved });
  assert.equal(app.superLikeAvailable, true);
  assert.equal(app.matches[0].id, 'buttercup');
});
