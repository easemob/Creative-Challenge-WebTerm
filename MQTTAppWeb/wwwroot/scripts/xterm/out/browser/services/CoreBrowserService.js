"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreBrowserService = void 0;
var CoreBrowserService = (function () {
    function CoreBrowserService(_textarea) {
        this._textarea = _textarea;
    }
    Object.defineProperty(CoreBrowserService.prototype, "isFocused", {
        get: function () {
            var docOrShadowRoot = this._textarea.getRootNode ? this._textarea.getRootNode() : document;
            return docOrShadowRoot.activeElement === this._textarea && document.hasFocus();
        },
        enumerable: false,
        configurable: true
    });
    return CoreBrowserService;
}());
exports.CoreBrowserService = CoreBrowserService;
//# sourceMappingURL=CoreBrowserService.js.map