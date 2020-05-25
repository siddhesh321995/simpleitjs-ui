/// <reference path="./node_modules/simpleitjs/dist/module.d.ts" />
/// <reference path="./node_modules/simpleitjs/dist/ajax.d.ts" />

let ModuleClass: typeof Module;
declare var require: (...args: any[]) => any;

(function () {
  if (typeof window === "undefined") {
    ModuleClass = require('simpleitjs').Module;
    require('simpleitjs').Ajax;
  } else {
    const win: any = window;
    ModuleClass = win.SimpleJS.Module;
  }
})();

let id = 0;
const generateNxtId = () => {
  return id++;
};

class UIModel {
  public _id: number = generateNxtId();
}

class UIModuleOpts extends ModuleScope {
  public name?: string;
  public templateHTML?: string;
  public templateURL?: string;
  public templateSelector?: string;

  public model?: UIModel;

  constructor(config: UIModuleOpts = {}) {
    super();
    this.name = config.name;
    this.templateURL = config.templateURL;
    this.templateSelector = config.templateSelector;
    this.model = config.model || new UIModel();
  }
}

class SuperUI extends UIModuleOpts {
  public Ajax?: Ajax = Module.get('Ajax') as Ajax;

  constructor(config: UIModuleOpts = {}) {
    super(config);
  }

  public static invoke(model: SuperUI, ...dependencies: any[]): SuperUI {
    console.log('Super class invoked');
    if (model.templateURL) {
      model.Ajax?.get<string>(model.templateURL).then((strTemplate) => {
        model.templateHTML = strTemplate;
      });
    }
    return model;
  }
}

class UIModule extends ModuleClass {
  constructor(name: string, opts: UIModuleOpts, ...dependencies: any[]) {
    console.log('ui module initiated');
    // const inst = new SuperUI(opts);
    const params = [name, ...dependencies, opts, SuperUI];
    super(...params);
  }
}

declare var module: any;

if (typeof module != "undefined" && typeof module.exports != "undefined") {
  module.exports = {
    UIModule,
    SuperUI,
    UIModel
  };
} else if (typeof window != "undefined") {
  const win: any = window;
  win.SimpleJS = win.SimpleJS || {};
  win.SimpleJS.UI = {
    UIModule,
    SuperUI,
    UIModel
  };
}
