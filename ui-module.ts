/// <reference path="./node_modules/simpleitjs/dist/module.d.ts" />

let ModuleClass: typeof Module;
declare var require: (...args: any[]) => any;

(function () {
  if (typeof window === "undefined") {
    ModuleClass = require('simpleitjs').Module;
  } else {
    const win: any = window;
    ModuleClass = win.SimpleJS.Module;
  }
})();

class UIModule extends ModuleClass {
  constructor(...args: any[]) {
    console.log('ui module initiated');
    super(...args);
  }
}

declare var module: any;

if (typeof module != "undefined" && typeof module.exports != "undefined") {
  module.exports = UIModule;
} else if (typeof window != "undefined") {
  const win: any = window;
  win.SimpleJS = win.SimpleJS || {};
  win.SimpleJS.UIModule = UIModule;
}
