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
  [id: string]: any;

  constructor(model: any = {}) {
    for (const key in model) {
      if (model.hasOwnProperty(key)) {
        this[key] = model[key];
      }
    }
  }
}

class UIModuleOpts extends ModuleScope {
  public name?: string;
  public templateHTML?: string;
  public templateURL?: string;
  public templateSelector?: string;
  public templateString?: string;
  public parentSelector?: string;
  public parentElem?: Element;

  public model?: UIModel;

  constructor(config: UIModuleOpts = {}) {
    super();
    this.name = config.name;
    this.templateURL = config.templateURL;
    this.templateSelector = config.templateSelector;
    this.templateString = config.templateString;
    this.parentSelector = config.parentSelector;
    this.parentElem = config.parentElem;
    if (config.model != void 0 && config.model instanceof UIModel) {
      this.model = config.model
    } else if (config.model != void 0 && typeof config.model === "object") {
      this.model = new UIModel(config.model);
    } else {
      this.model = new UIModel();
    }
  }
}

class SuperUI extends UIModuleOpts {
  public view?: Element;

  private Ajax?: Ajax = Module.get('Ajax') as Ajax;
  private alreadyRendered: boolean = false;
  private templateReadyProm: PromisePackage<boolean> = new PromisePackage<boolean>();
  private parentReadyProm: PromisePackage<boolean> = new PromisePackage<boolean>();

  constructor(config: UIModuleOpts = {}) {
    super(config);
  }

  public static invoke(module: SuperUI, ...dependencies: any[]): SuperUI {
    if (module.templateURL) {
      module.Ajax?.get<string>(module.templateURL).then((strTemplate) => {
        module.templateHTML = strTemplate;
        module.templateReadyProm.resolver();
      });
    } else if (module.templateString) {
      module.templateHTML = module.templateString;
      module.templateReadyProm.resolver();
    }

    if (module.parentElem === void 0 && module.parentSelector !== void 0) {
      const elem = document.querySelector(module.parentSelector);
      if (elem != null) {
        module.parentElem = elem;
        module.parentReadyProm.resolver();
      }
    }
    module.renderToElem();
    return module;
  }

  public renderToElem() {
    Promise.all([this.parentReadyProm.promise, this.templateReadyProm.promise]).then(() => {
      if (!this.alreadyRendered) {
        this.alreadyRendered = true;
        // console.log('TODO: Render model', this.model, 'with', this.templateHTML, 'at', this.parentElem);
        if (this.parentElem) {
          this.parentElem.innerHTML = this.parseTemplate();
        }
      }
    });
  }

  private parseTemplate(): string {
    let str = this.templateHTML;
    for (const key in this.model) {
      if (this.model.hasOwnProperty(key) && str) {
        str = str.replace("{{" + key + "}}", this.model[key]);
      }
    }
    return str as string;
  }
}

class UIModule extends ModuleClass {
  constructor(name: string, opts: UIModuleOpts, MainClass: typeof SuperUI = SuperUI, ...dependencies: any[]) {
    const params = [name, ...dependencies, opts, MainClass];
    super(...params);
  }
}

class PromisePackage<T> extends ModuleScope {
  public resolver!: (value?: T | PromiseLike<T> | undefined) => void;
  public rejector!: (reason?: any) => void;
  public promise: Promise<T> = new Promise<T>((res, rej) => {
    this.resolver = res;
    this.rejector = rej;
  });

  public static invoke<T>(module: PromisePackage<T>): typeof PromisePackage {
    return PromisePackage;
  }
}

new ModuleClass('PromisePackage', PromisePackage);

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
