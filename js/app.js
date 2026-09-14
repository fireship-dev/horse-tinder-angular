/* global angular */
angular.module('horseTinderApp', [])
  .config(['$compileProvider', function ($compileProvider) {
    'use strict';
    $compileProvider.debugInfoEnabled(false);
  }]);
