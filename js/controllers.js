/* global angular */
angular.module('horseTinderApp')
  .controller('DiscoverCtrl', ['stable', function (stable) {
    'use strict';
    var vm = this;
    vm.view = 'discover';
    vm.preferences = { maxDistance: 50, breed: '' };
    vm.breeds = stable.profiles.map(function (profile) { return profile.breed; })
      .filter(function (breed, index, breeds) { return breeds.indexOf(breed) === index; }).sort();
    vm.notice = '';

    vm.refresh = function () {
      vm.profiles = stable.discover(vm.preferences);
      vm.current = vm.profiles[0] || null;
      vm.matches = stable.matches();
      vm.decisionCount = stable.decisionCount();
      vm.persists = stable.persists();
      vm.superLikeAvailable = stable.superLikeAvailable();
      vm.filtersActive = Number(vm.preferences.maxDistance) !== 50 || vm.preferences.breed !== '';
    };

    vm.clearFilters = function () {
      vm.preferences = { maxDistance: 50, breed: '' };
      vm.notice = 'Discovery filters cleared. Your likes and matches are unchanged.';
      vm.refresh();
    };

    vm.decide = function (decision) {
      if (!vm.current) return;
      if (decision === 'superlike' && !stable.superLikeAvailable()) {
        vm.notice = 'You have used your super like for today. Come back tomorrow.';
        vm.refresh();
        return;
      }
      var horse = vm.current;
      var liked = decision === 'like' || decision === 'superlike';
      stable.decide(horse.id, decision);
      vm.notice = liked && (horse.likesYou || horse.superLikesYou)
        ? 'It is a match! You and ' + horse.name + ' like each other.'
        : decision === 'superlike' ? 'You super liked ' + horse.name + '.'
        : liked ? 'You liked ' + horse.name + '.' : 'Passed on ' + horse.name + '.';
      vm.refresh();
    };

    vm.show = function (view) {
      vm.view = view;
      vm.notice = '';
    };

    vm.reset = function () {
      stable.reset();
      vm.preferences = { maxDistance: 50, breed: '' };
      vm.view = 'discover';
      vm.notice = 'Discovery reset. Your likes, passes, and matches have been cleared.';
      vm.refresh();
    };

    vm.refresh();
  }]);
