/* global angular */
angular.module('horseTinderApp')
  .controller('DiscoverCtrl', ['stable', function (stable) {
    'use strict';
    var vm = this;
    vm.view = 'discover';
    vm.preferences = { maxDistance: 50, breed: '' };
    vm.distanceUnit = stable.distanceUnit();
    vm.formatDistance = function (kilometres) {
      var distance = vm.distanceUnit === 'miles' ? kilometres / 1.609344 : kilometres;
      return Math.round(distance * 10) / 10 + ' ' + vm.distanceUnit;
    };

    vm.setDistanceUnit = function (unit) {
      stable.setDistanceUnit(unit);
      vm.distanceUnit = stable.distanceUnit();
      vm.persists = stable.persists();
    };
    vm.breeds = stable.profiles.map(function (profile) { return profile.breed; })
      .filter(function (breed, index, breeds) { return breeds.indexOf(breed) === index; }).sort();
    vm.notice = '';

    vm.refresh = function () {
      vm.profiles = stable.discover(vm.preferences);
      vm.current = vm.profiles[0] || null;
      vm.matches = stable.matches();
      vm.decisionCount = stable.decisionCount();
      vm.persists = stable.persists();
      vm.filtersActive = Number(vm.preferences.maxDistance) !== 50 || vm.preferences.breed !== '';
    };

    vm.clearFilters = function () {
      vm.preferences = { maxDistance: 50, breed: '' };
      vm.notice = 'Discovery filters cleared. Your likes and matches are unchanged.';
      vm.refresh();
    };

    vm.decide = function (decision) {
      if (!vm.current) return;
      var horse = vm.current;
      stable.decide(horse.id, decision);
      vm.notice = decision === 'like' && horse.likesYou
        ? 'It is a match! You and ' + horse.name + ' like each other.'
        : decision === 'like' ? 'You liked ' + horse.name + '.' : 'Passed on ' + horse.name + '.';
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
