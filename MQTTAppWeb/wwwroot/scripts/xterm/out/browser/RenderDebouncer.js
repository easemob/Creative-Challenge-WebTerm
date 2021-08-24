"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderDebouncer = void 0;
var RenderDebouncer = (function () {
    function RenderDebouncer(_renderCallback) {
        this._renderCallback = _renderCallback;
    }
    RenderDebouncer.prototype.dispose = function () {
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    };
    RenderDebouncer.prototype.refresh = function (rowStart, rowEnd, rowCount) {
        var _this = this;
        this._rowCount = rowCount;
        rowStart = rowStart !== undefined ? rowStart : 0;
        rowEnd = rowEnd !== undefined ? rowEnd : this._rowCount - 1;
        this._rowStart = this._rowStart !== undefined ? Math.min(this._rowStart, rowStart) : rowStart;
        this._rowEnd = this._rowEnd !== undefined ? Math.max(this._rowEnd, rowEnd) : rowEnd;
        if (this._animationFrame) {
            return;
        }
        this._animationFrame = window.requestAnimationFrame(function () { return _this._innerRefresh(); });
    };
    RenderDebouncer.prototype._innerRefresh = function () {
        if (this._rowStart === undefined || this._rowEnd === undefined || this._rowCount === undefined) {
            return;
        }
        var start = Math.max(this._rowStart, 0);
        var end = Math.min(this._rowEnd, this._rowCount - 1);
        this._rowStart = undefined;
        this._rowEnd = undefined;
        this._animationFrame = undefined;
        this._renderCallback(start, end);
    };
    return RenderDebouncer;
}());
exports.RenderDebouncer = RenderDebouncer;
//# sourceMappingURL=RenderDebouncer.js.map