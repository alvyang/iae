(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueBus = factory());
}(this, (function() { 'use strict';

  function VueBus(Vue) {

    var bus = new Vue();

    bus.data = {
        // host: "http://139.129.238.114",
        host: "http://127.0.0.1:5000",
    }

    Object.defineProperty(Vue.prototype, '$bus', {
      get: function() {
        return bus;
      }
    });
  }

  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(VueBus);
  }

  return VueBus;

})));
