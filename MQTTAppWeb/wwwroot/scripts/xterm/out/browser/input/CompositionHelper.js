"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositionHelper = void 0;
var Services_1 = require("browser/services/Services");
var Services_2 = require("common/services/Services");
var CompositionHelper = (function () {
    function CompositionHelper(_textarea, _compositionView, _bufferService, _optionsService, _coreService, _renderService) {
        this._textarea = _textarea;
        this._compositionView = _compositionView;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._coreService = _coreService;
        this._renderService = _renderService;
        this._isComposing = false;
        this._isSendingComposition = false;
        this._compositionPosition = { start: 0, end: 0 };
        this._dataAlreadySent = '';
    }
    Object.defineProperty(CompositionHelper.prototype, "isComposing", {
        get: function () { return this._isComposing; },
        enumerable: false,
        configurable: true
    });
    CompositionHelper.prototype.compositionstart = function () {
        this._isComposing = true;
        this._compositionPosition.start = this._textarea.value.length;
        this._compositionView.textContent = '';
        this._dataAlreadySent = '';
        this._compositionView.classList.add('active');
    };
    CompositionHelper.prototype.compositionupdate = function (ev) {
        var _this = this;
        this._compositionView.textContent = ev.data;
        this.updateCompositionElements();
        setTimeout(function () {
            _this._compositionPosition.end = _this._textarea.value.length;
        }, 0);
    };
    CompositionHelper.prototype.compositionend = function () {
        this._finalizeComposition(true);
    };
    CompositionHelper.prototype.keydown = function (ev) {
        if (this._isComposing || this._isSendingComposition) {
            if (ev.keyCode === 229) {
                return false;
            }
            if (ev.keyCode === 16 || ev.keyCode === 17 || ev.keyCode === 18) {
                return false;
            }
            this._finalizeComposition(false);
        }
        if (ev.keyCode === 229) {
            this._handleAnyTextareaChanges();
            return false;
        }
        return true;
    };
    CompositionHelper.prototype._finalizeComposition = function (waitForPropagation) {
        var _this = this;
        this._compositionView.classList.remove('active');
        this._isComposing = false;
        if (!waitForPropagation) {
            this._isSendingComposition = false;
            var input = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
            this._coreService.triggerDataEvent(input, true);
        }
        else {
            var currentCompositionPosition_1 = {
                start: this._compositionPosition.start,
                end: this._compositionPosition.end
            };
            this._isSendingComposition = true;
            setTimeout(function () {
                if (_this._isSendingComposition) {
                    _this._isSendingComposition = false;
                    var input = void 0;
                    currentCompositionPosition_1.start += _this._dataAlreadySent.length;
                    if (_this._isComposing) {
                        input = _this._textarea.value.substring(currentCompositionPosition_1.start, currentCompositionPosition_1.end);
                    }
                    else {
                        input = _this._textarea.value.substring(currentCompositionPosition_1.start);
                    }
                    if (input.length > 0) {
                        _this._coreService.triggerDataEvent(input, true);
                    }
                }
            }, 0);
        }
    };
    CompositionHelper.prototype._handleAnyTextareaChanges = function () {
        var _this = this;
        var oldValue = this._textarea.value;
        setTimeout(function () {
            if (!_this._isComposing) {
                var newValue = _this._textarea.value;
                var diff = newValue.replace(oldValue, '');
                if (diff.length > 0) {
                    _this._dataAlreadySent = diff;
                    _this._coreService.triggerDataEvent(diff, true);
                }
            }
        }, 0);
    };
    CompositionHelper.prototype.updateCompositionElements = function (dontRecurse) {
        var _this = this;
        if (!this._isComposing) {
            return;
        }
        if (this._bufferService.buffer.isCursorInViewport) {
            var cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
            var cellHeight = this._renderService.dimensions.actualCellHeight;
            var cursorTop = this._bufferService.buffer.y * this._renderService.dimensions.actualCellHeight;
            var cursorLeft = cursorX * this._renderService.dimensions.actualCellWidth;
            this._compositionView.style.left = cursorLeft + 'px';
            this._compositionView.style.top = cursorTop + 'px';
            this._compositionView.style.height = cellHeight + 'px';
            this._compositionView.style.lineHeight = cellHeight + 'px';
            this._compositionView.style.fontFamily = this._optionsService.options.fontFamily;
            this._compositionView.style.fontSize = this._optionsService.options.fontSize + 'px';
            var compositionViewBounds = this._compositionView.getBoundingClientRect();
            this._textarea.style.left = cursorLeft + 'px';
            this._textarea.style.top = cursorTop + 'px';
            this._textarea.style.width = Math.max(compositionViewBounds.width, 1) + 'px';
            this._textarea.style.height = Math.max(compositionViewBounds.height, 1) + 'px';
            this._textarea.style.lineHeight = compositionViewBounds.height + 'px';
        }
        if (!dontRecurse) {
            setTimeout(function () { return _this.updateCompositionElements(true); }, 0);
        }
    };
    CompositionHelper = __decorate([
        __param(2, Services_2.IBufferService),
        __param(3, Services_2.IOptionsService),
        __param(4, Services_2.ICoreService),
        __param(5, Services_1.IRenderService)
    ], CompositionHelper);
    return CompositionHelper;
}());
exports.CompositionHelper = CompositionHelper;
//# sourceMappingURL=CompositionHelper.js.map