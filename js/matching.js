(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HorseMatching = factory();
}(this, function () {
  'use strict';

  function isDecision(value) {
    return value === 'like' || value === 'pass';
  }

  function restoreState(serialized, profiles) {
    var state = { version: 1, decisions: {} };
    try {
      var saved = JSON.parse(serialized);
      if (!saved || saved.version !== 1 || !saved.decisions ||
          typeof saved.decisions !== 'object' || Array.isArray(saved.decisions)) return state;
      profiles.forEach(function (profile) {
        if (Object.prototype.hasOwnProperty.call(saved.decisions, profile.id) &&
            isDecision(saved.decisions[profile.id])) {
          state.decisions[profile.id] = saved.decisions[profile.id];
        }
      });
    } catch (error) { /* Missing or corrupt browser storage starts a fresh session. */ }
    return state;
  }

  function discover(profiles, state, preferences) {
    return profiles.filter(function (profile) {
      return !Object.prototype.hasOwnProperty.call(state.decisions, profile.id) &&
        profile.distance <= preferences.maxDistance &&
        (!preferences.breed || profile.breed === preferences.breed);
    }).sort(function (left, right) {
      return left.distance - right.distance || left.id.localeCompare(right.id);
    });
  }

  function decide(profiles, state, profileId, decision) {
    var profile = profiles.find(function (candidate) { return candidate.id === profileId; });
    if (!profile) throw new Error('Unknown horse profile.');
    if (!isDecision(decision)) throw new Error('Choose like or pass.');
    if (Object.prototype.hasOwnProperty.call(state.decisions, profileId)) {
      throw new Error('You have already decided on this profile.');
    }
    var decisions = Object.assign({}, state.decisions);
    decisions[profileId] = decision;
    return { version: 1, decisions: decisions };
  }

  function matches(profiles, state) {
    return profiles.filter(function (profile) {
      return state.decisions[profile.id] === 'like' && profile.likesYou === true;
    });
  }

  return { restoreState: restoreState, discover: discover, decide: decide, matches: matches };
}));
