"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorContrastCache = void 0;
var ColorContrastCache = (function () {
    function ColorContrastCache() {
        this._color = {};
        this._rgba = {};
    }
    ColorContrastCache.prototype.clear = function () {
        this._color = {};
        this._rgba = {};
    };
    ColorContrastCache.prototype.setCss = function (bg, fg, value) {
        if (!this._rgba[bg]) {
            this._rgba[bg] = {};
        }
        this._rgba[bg][fg] = value;
    };
    ColorContrastCache.prototype.getCss = function (bg, fg) {
        return this._rgba[bg] ? this._rgba[bg][fg] : undefined;
    };
    ColorContrastCache.prototype.setColor = function (bg, fg, value) {
        if (!this._color[bg]) {
            this._color[bg] = {};
        }
        this._color[bg][fg] = value;
    };
    ColorContrastCache.prototype.getColor = function (bg, fg) {
        return this._color[bg] ? this._color[bg][fg] : undefined;
    };
    return ColorContrastCache;
}());
exports.ColorContrastCache = ColorContrastCache;
//# sourceMappingURL=ColorContrastCache.js.map