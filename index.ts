(function () {
  let UIModule: UIModule;

  if (typeof window === "undefined") {
    UIModule = require('./ui-module');
    if (typeof module != "undefined" && typeof module.exports != "undefined") {
      module.exports = UIModule;
    }
  }
})();