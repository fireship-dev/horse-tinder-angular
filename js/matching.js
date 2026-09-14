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
    var state = { version: 1, decisions: {}, history: [] };
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
      if (Array.isArray(saved.history)) {
        saved.history.forEach(function (id) {
          if (typeof id === 'string' && Object.prototype.hasOwnProperty.call(state.decisions, id) &&
              state.history.indexOf(id) === -1) state.history.push(id);
        });
      }
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
    return { version: 1, decisions: decisions, history: (state.history || []).concat(profileId) };
  }

  function lastDecision(profiles, state) {
    var history = state.history || [];
    var id = history[history.length - 1];
    var profile = profiles.find(function (horse) { return horse.id === id; });
    return profile ? { profile: profile, decision: state.decisions[id] } : null;
  }

  function undo(state) {
    var history = state.history || [];
    if (!history.length) return state;
    var decisions = Object.assign({}, state.decisions);
    delete decisions[history[history.length - 1]];
    return { version: 1, decisions: decisions, history: history.slice(0, -1) };
  }

  function matches(profiles, state) {
    return profiles.filter(function (profile) {
      return state.decisions[profile.id] === 'like' && profile.likesYou === true;
    });
  }

  return { restoreState: restoreState, discover: discover, decide: decide, matches: matches,
    lastDecision: lastDecision, undo: undo };
}));
