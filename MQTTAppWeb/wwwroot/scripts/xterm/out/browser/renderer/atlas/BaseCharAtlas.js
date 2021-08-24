"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCharAtlas = void 0;
var BaseCharAtlas = (function () {
    function BaseCharAtlas() {
        this._didWarmUp = false;
    }
    BaseCharAtlas.prototype.dispose = function () { };
    BaseCharAtlas.prototype.warmUp = function () {
        if (!this._didWarmUp) {
            this._doWarmUp();
            this._didWarmUp = true;
        }
    };
    BaseCharAtlas.prototype._doWarmUp = function () { };
    BaseCharAtlas.prototype.beginFrame = function () { };
    return BaseCharAtlas;
}());
exports.BaseCharAtlas = BaseCharAtlas;
//# sourceMappingURL=BaseCharAtlas.js.map