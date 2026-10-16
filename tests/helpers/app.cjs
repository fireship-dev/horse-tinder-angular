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
  const listeners = { keydown: new Set(), $destroy: [] };
  const $document = {
    on: (type, handler) => listeners[type].add(handler),
    off: (type, handler) => listeners[type].delete(handler)
  };
  const $scope = {
    $apply: fn => fn(),
    $on: (name, handler) => listeners[name].push(handler)
  };
  const dependencies = { $window: sandbox.$window, $document, $scope };
  function invoke(name, target) {
    const definition = registrations[name];
    return definition.at(-1).apply(target, definition.slice(0, -1).map(name => dependencies[name]));
  }
  dependencies.stable = invoke('stable');
  const controller = {};
  invoke('DiscoverCtrl', controller);
  // Dispatch a keydown like the browser would and report whether it was handled.
  function keydown(init = {}) {
    const event = { key: init.key, target: init.target || { tagName: 'BODY' }, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...init };
    listeners.keydown.forEach(handler => handler(event));
    return event.defaultPrevented;
  }
  const destroy = () => listeners.$destroy.forEach(handler => handler());
  return { controller, stable: dependencies.stable, storage: entries, keydown, destroy, listeners };
}

module.exports = { createApp };
