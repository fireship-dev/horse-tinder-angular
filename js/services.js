/* global angular, HorseProfiles, HorseMatching */
angular.module('horseTinderApp')
  .factory('stable', ['$window', function ($window) {
    'use strict';
    var key = 'horse-tinder:v1';
    var serialized = null;
    var storageAvailable = true;
    try { serialized = $window.localStorage.getItem(key); }
    catch (error) { storageAvailable = false; }
    var state = HorseMatching.restoreState(serialized, HorseProfiles);

    function save() {
      try {
        $window.localStorage.setItem(key, JSON.stringify(state));
        storageAvailable = true;
      } catch (error) { storageAvailable = false; }
    }

    return {
      profiles: HorseProfiles,
      ageRanges: HorseMatching.ageRanges,
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
