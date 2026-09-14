const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the controller and service without requiring a browser DOM.
function createApp(initialStorage = {}) {
  const entries = new Map(Object.entries(initialStorage));
  const registrations = {};
  const module = {
    factory(name, definition) { registrations[name] = definition; return module; },
    controller(name, definition) { registrations[name] = definition; return module; }
  };
  const sandbox = {
    angular: { module: () => module },
    HorseProfiles: require('../../js/profiles.js'),
    HorseMatching: require('../../js/matching.js'),
    $window: { localStorage: {
      getItem: key => entries.has(key) ? entries.get(key) : null,
      setItem: (key, value) => entries.set(key, value)
    } }
  };
  vm.createContext(sandbox);
  for (const name of ['services', 'controllers']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../../js/' + name + '.js'), 'utf8'), sandbox);
  }
  const dependencies = { $window: sandbox.$window };
  function invoke(name, target) {
    const definition = registrations[name];
    return definition.at(-1).apply(target, definition.slice(0, -1).map(name => dependencies[name]));
  }
  dependencies.stable = invoke('stable');
  const controller = {};
  invoke('DiscoverCtrl', controller);
  return { controller, stable: dependencies.stable, storage: entries };
}

module.exports = { createApp };
