/* global angular, HorseProfiles, HorseMatching */
angular.module('horseTinderApp')
  .factory('stable', ['$window', function ($window) {
    'use strict';
    var key = 'horse-tinder:v1';
    var preferencesKey = 'horse-tinder:preferences:v1';
    var serialized = null;
    var storageAvailable = true;
    try { serialized = $window.localStorage.getItem(key); }
    catch (error) { storageAvailable = false; }
    var state = HorseMatching.restoreState(serialized, HorseProfiles);

    function normalizePreferences(value) {
      value = value && typeof value === 'object' ? value : {};
      var distance = typeof value.maxDistance === 'number' || typeof value.maxDistance === 'string'
        ? Number(value.maxDistance) : NaN;
      return {
        maxDistance: Number.isInteger(distance) && distance >= 1 && distance <= 50 ? distance : 50,
        breed: HorseProfiles.some(function (horse) { return horse.breed === value.breed; }) ? value.breed : ''
      };
    }

    function loadPreferences() {
      try { return normalizePreferences(JSON.parse($window.localStorage.getItem(preferencesKey))); }
      catch (error) { return normalizePreferences(null); }
    }

    function save() {
      try {
        $window.localStorage.setItem(key, JSON.stringify(state));
        storageAvailable = true;
      } catch (error) { storageAvailable = false; }
    }

    return {
      profiles: HorseProfiles,
      loadPreferences: loadPreferences,
      savePreferences: function (value) {
        try {
          $window.localStorage.setItem(preferencesKey, JSON.stringify(normalizePreferences(value)));
        } catch (error) { /* Preference writes do not affect decision-state availability. */ }
      },
      discover: function (preferences) { return HorseMatching.discover(HorseProfiles, state, preferences); },
      matches: function () { return HorseMatching.matches(HorseProfiles, state); },
      decisionCount: function () { return Object.keys(state.decisions).length; },
      persists: function () { return storageAvailable; },
      decide: function (profileId, decision) {
        state = HorseMatching.decide(HorseProfiles, state, profileId, decision);
        save();
      },
      reset: function () {
        state = { version: 1, decisions: {} };
        save();
      }
    };
  }]);
