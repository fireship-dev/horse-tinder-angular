(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HorseMatching = factory();
}(this, function () {
  'use strict';

  function isDecision(value) {
    return value === 'like' || value === 'pass' || value === 'superlike';
  }

  function isLike(decision) {
    return decision === 'like' || decision === 'superlike';
  }

  function isDay(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  // Super likes reset at local midnight, so days are keyed by the local calendar date.
  function localDay(date) {
    var pad = function (number) { return (number < 10 ? '0' : '') + number; };
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function emptyState(superLikedOn) {
    var state = { version: 1, decisions: {} };
    if (isDay(superLikedOn)) state.superLikedOn = superLikedOn;
    return state;
  }

  function restoreState(serialized, profiles) {
    var state = emptyState();
    try {
      var saved = JSON.parse(serialized);
      if (!saved || saved.version !== 1 || !saved.decisions ||
          typeof saved.decisions !== 'object' || Array.isArray(saved.decisions)) return state;
      state = emptyState(saved.superLikedOn);
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

  function superLikeAvailable(state, today) {
    return state.superLikedOn !== today;
  }

  function decide(profiles, state, profileId, decision, today) {
    var profile = profiles.find(function (candidate) { return candidate.id === profileId; });
    if (!profile) throw new Error('Unknown horse profile.');
    if (!isDecision(decision)) throw new Error('Choose like, super like, or pass.');
    if (Object.prototype.hasOwnProperty.call(state.decisions, profileId)) {
      throw new Error('You have already decided on this profile.');
    }
    if (decision === 'superlike') {
      if (!isDay(today)) throw new Error('A super like needs the current day.');
      if (!superLikeAvailable(state, today)) throw new Error('You have already used your super like today.');
    }
    var next = emptyState(decision === 'superlike' ? today : state.superLikedOn);
    next.decisions = Object.assign({}, state.decisions);
    next.decisions[profileId] = decision;
    return next;
  }

  function matches(profiles, state) {
    return profiles.filter(function (profile) {
      return isLike(state.decisions[profile.id]) && (profile.likesYou === true || profile.superLikesYou === true);
    });
  }

  return {
    restoreState: restoreState, discover: discover, decide: decide, matches: matches,
    superLikeAvailable: superLikeAvailable, localDay: localDay, emptyState: emptyState
  };
}));
