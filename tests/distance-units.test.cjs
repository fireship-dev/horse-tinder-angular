const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./helpers/app.cjs');
const unitKey = 'horse-tinder:distance-unit';

test('distances default to km and convert to miles with one decimal place', () => {
  const { controller: app } = createApp();
  assert.equal(app.distanceUnit, 'km');
  assert.equal(app.formatDistance(app.current.distance), '3 km');
  assert.equal(app.formatDistance(app.preferences.maxDistance), '50 km');
  app.setDistanceUnit('miles');
  assert.equal(app.formatDistance(app.current.distance), '1.9 miles');
  assert.equal(app.formatDistance(app.preferences.maxDistance), '31.1 miles');
  assert.equal(app.formatDistance(1.609344), '1 miles');
  app.setDistanceUnit('km');
  assert.equal(app.formatDistance(app.current.distance), '3 km');
});

test('switching units preserves the radius, filtered deck, decisions, and matches', () => {
  const { controller: app, storage } = createApp();
  app.decide('like');
  app.decide('pass');
  app.preferences = { maxDistance: 18, breed: 'Quarter Horse' };
  app.refresh();
  const deck = Array.from(app.profiles, horse => horse.id);
  const saved = storage.get('horse-tinder:v1');
  for (const unit of ['miles', 'km', 'miles']) {
    app.setDistanceUnit(unit);
    app.refresh();
    assert.equal(app.preferences.maxDistance, 18);
    assert.equal(app.preferences.breed, 'Quarter Horse');
    assert.deepEqual(Array.from(app.profiles, horse => horse.id), deck);
    assert.equal(app.current.id, 'oat-milk');
    assert.equal(app.decisionCount, 2);
    assert.equal(app.matches[0].id, 'buttercup');
    assert.equal(storage.get('horse-tinder:v1'), saved);
  }
  assert.equal(app.formatDistance(app.matches[0].distance), '1.9 miles');
  app.preferences.maxDistance = 17;
  app.refresh();
  assert.equal(app.current, null);
  app.preferences.maxDistance = 18;
  app.refresh();
  assert.equal(app.current.id, 'oat-milk');
  assert.equal(app.formatDistance(app.preferences.maxDistance), '11.2 miles');
});

test('each unit choice survives a new visit alongside existing decisions', () => {
  const { controller: app, storage } = createApp();
  app.decide('like');
  for (const unit of ['miles', 'km']) {
    app.setDistanceUnit(unit);
    assert.equal(storage.get(unitKey), unit);
    const { controller: restored } = createApp(Object.fromEntries(storage));
    assert.equal(restored.distanceUnit, unit);
    assert.equal(restored.decisionCount, 1);
    assert.equal(restored.matches[0].id, 'buttercup');
  }
});

test('clearing filters and resetting discovery retain the selected unit', () => {
  const { controller: app, storage } = createApp();
  app.setDistanceUnit('miles');
  app.decide('like');
  app.preferences.maxDistance = 2;
  app.refresh();
  app.clearFilters();
  assert.equal(app.distanceUnit, 'miles');
  assert.equal(app.formatDistance(app.preferences.maxDistance), '31.1 miles');
  assert.equal(app.filtersActive, false);
  assert.equal(app.decisionCount, 1);
  app.reset();
  assert.equal(app.distanceUnit, 'miles');
  assert.equal(app.decisionCount, 0);
  assert.equal(storage.get(unitKey), 'miles');
});

test('invalid saved units fall back to km and invalid updates change nothing', () => {
  for (const value of ['', 'mi', 'KM', 'null', '{}']) {
    const { controller: app } = createApp({ [unitKey]: value });
    assert.equal(app.distanceUnit, 'km');
  }
  const { controller: app, storage } = createApp();
  app.setDistanceUnit('miles');
  for (const value of [null, undefined, {}, 'mi', 'feet']) {
    assert.throws(() => app.setDistanceUnit(value), /Choose km or miles/);
    assert.equal(app.distanceUnit, 'miles');
    assert.equal(storage.get(unitKey), 'miles');
  }
});

test('unavailable storage still allows switching units for the current visit', () => {
  const { controller: app } = createApp({}, {
    getItem() { throw new Error('Storage blocked'); },
    setItem() { throw new Error('Storage blocked'); }
  });
  assert.equal(app.distanceUnit, 'km');
  assert.equal(app.persists, false);
  app.setDistanceUnit('miles');
  assert.equal(app.formatDistance(app.current.distance), '1.9 miles');
  assert.equal(app.persists, false);
  app.decide('like');
  assert.equal(app.matches.length, 1);
});
