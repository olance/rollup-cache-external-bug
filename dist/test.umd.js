(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Test = {}));
}(this, (function (exports) { 'use strict';

    function add(a, b) {
        return a + b;
    }

    function awesomeLib(a, b) {
        return add(a, b)
    }

    exports.awesomeLib = awesomeLib;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
