"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionModel = void 0;
var SelectionModel = (function () {
    function SelectionModel(_bufferService) {
        this._bufferService = _bufferService;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    }
    SelectionModel.prototype.clearSelection = function () {
        this.selectionStart = undefined;
        this.selectionEnd = undefined;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    };
    Object.defineProperty(SelectionModel.prototype, "finalSelectionStart", {
        get: function () {
            if (this.isSelectAllActive) {
                return [0, 0];
            }
            if (!this.selectionEnd || !this.selectionStart) {
                return this.selectionStart;
            }
            return this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionModel.prototype, "finalSelectionEnd", {
        get: function () {
            if (this.isSelectAllActive) {
                return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
            }
            if (!this.selectionStart) {
                return undefined;
            }
            if (!this.selectionEnd || this.areSelectionValuesReversed()) {
                var startPlusLength = this.selectionStart[0] + this.selectionStartLength;
                if (startPlusLength > this._bufferService.cols) {
                    return [startPlusLength % this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols)];
                }
                return [startPlusLength, this.selectionStart[1]];
            }
            if (this.selectionStartLength) {
                if (this.selectionEnd[1] === this.selectionStart[1]) {
                    return [Math.max(this.selectionStart[0] + this.selectionStartLength, this.selectionEnd[0]), this.selectionEnd[1]];
                }
            }
            return this.selectionEnd;
        },
        enumerable: false,
        configurable: true
    });
    SelectionModel.prototype.areSelectionValuesReversed = function () {
        var start = this.selectionStart;
        var end = this.selectionEnd;
        if (!start || !end) {
            return false;
        }
        return start[1] > end[1] || (start[1] === end[1] && start[0] > end[0]);
    };
    SelectionModel.prototype.onTrim = function (amount) {
        if (this.selectionStart) {
            this.selectionStart[1] -= amount;
        }
        if (this.selectionEnd) {
            this.selectionEnd[1] -= amount;
        }
        if (this.selectionEnd && this.selectionEnd[1] < 0) {
            this.clearSelection();
            return true;
        }
        if (this.selectionStart && this.selectionStart[1] < 0) {
            this.selectionStart[1] = 0;
        }
        return false;
    };
    return SelectionModel;
}());
exports.SelectionModel = SelectionModel;
//# sourceMappingURL=SelectionModel.js.map