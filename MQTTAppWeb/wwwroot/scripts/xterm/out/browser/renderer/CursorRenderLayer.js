"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.CursorRenderLayer = void 0;
var BaseRenderLayer_1 = require("browser/renderer/BaseRenderLayer");
var CellData_1 = require("common/buffer/CellData");
var Services_1 = require("common/services/Services");
var Services_2 = require("browser/services/Services");
var BLINK_INTERVAL = 600;
var CursorRenderLayer = (function (_super) {
    __extends(CursorRenderLayer, _super);
    function CursorRenderLayer(container, zIndex, colors, rendererId, _onRequestRedraw, bufferService, optionsService, _coreService, _coreBrowserService) {
        var _this = _super.call(this, container, 'cursor', zIndex, true, colors, rendererId, bufferService, optionsService) || this;
        _this._onRequestRedraw = _onRequestRedraw;
        _this._coreService = _coreService;
        _this._coreBrowserService = _coreBrowserService;
        _this._cell = new CellData_1.CellData();
        _this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
        _this._cursorRenderers = {
            'bar': _this._renderBarCursor.bind(_this),
            'block': _this._renderBlockCursor.bind(_this),
            'underline': _this._renderUnderlineCursor.bind(_this)
        };
        return _this;
    }
    CursorRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
    };
    CursorRenderLayer.prototype.reset = function () {
        this._clearCursor();
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.dispose();
            this._cursorBlinkStateManager = undefined;
            this.onOptionsChanged();
        }
    };
    CursorRenderLayer.prototype.onBlur = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.pause();
        }
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    };
    CursorRenderLayer.prototype.onFocus = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.resume();
        }
        else {
            this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
        }
    };
    CursorRenderLayer.prototype.onOptionsChanged = function () {
        var _this = this;
        var _a;
        if (this._optionsService.options.cursorBlink) {
            if (!this._cursorBlinkStateManager) {
                this._cursorBlinkStateManager = new CursorBlinkStateManager(this._coreBrowserService.isFocused, function () {
                    _this._render(true);
                });
            }
        }
        else {
            (_a = this._cursorBlinkStateManager) === null || _a === void 0 ? void 0 : _a.dispose();
            this._cursorBlinkStateManager = undefined;
        }
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    };
    CursorRenderLayer.prototype.onCursorMove = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.restartBlinkAnimation();
        }
    };
    CursorRenderLayer.prototype.onGridChanged = function (startRow, endRow) {
        if (!this._cursorBlinkStateManager || this._cursorBlinkStateManager.isPaused) {
            this._render(false);
        }
        else {
            this._cursorBlinkStateManager.restartBlinkAnimation();
        }
    };
    CursorRenderLayer.prototype._render = function (triggeredByAnimationFrame) {
        if (!this._coreService.isCursorInitialized || this._coreService.isCursorHidden) {
            this._clearCursor();
            return;
        }
        var cursorY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        var viewportRelativeCursorY = cursorY - this._bufferService.buffer.ydisp;
        if (viewportRelativeCursorY < 0 || viewportRelativeCursorY >= this._bufferService.rows) {
            this._clearCursor();
            return;
        }
        var cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
        this._bufferService.buffer.lines.get(cursorY).loadCell(cursorX, this._cell);
        if (this._cell.content === undefined) {
            return;
        }
        if (!this._coreBrowserService.isFocused) {
            this._clearCursor();
            this._ctx.save();
            this._ctx.fillStyle = this._colors.cursor.css;
            var cursorStyle = this._optionsService.options.cursorStyle;
            if (cursorStyle && cursorStyle !== 'block') {
                this._cursorRenderers[cursorStyle](cursorX, viewportRelativeCursorY, this._cell);
            }
            else {
                this._renderBlurCursor(cursorX, viewportRelativeCursorY, this._cell);
            }
            this._ctx.restore();
            this._state.x = cursorX;
            this._state.y = viewportRelativeCursorY;
            this._state.isFocused = false;
            this._state.style = cursorStyle;
            this._state.width = this._cell.getWidth();
            return;
        }
        if (this._cursorBlinkStateManager && !this._cursorBlinkStateManager.isCursorVisible) {
            this._clearCursor();
            return;
        }
        if (this._state) {
            if (this._state.x === cursorX &&
                this._state.y === viewportRelativeCursorY &&
                this._state.isFocused === this._coreBrowserService.isFocused &&
                this._state.style === this._optionsService.options.cursorStyle &&
                this._state.width === this._cell.getWidth()) {
                return;
            }
            this._clearCursor();
        }
        this._ctx.save();
        this._cursorRenderers[this._optionsService.options.cursorStyle || 'block'](cursorX, viewportRelativeCursorY, this._cell);
        this._ctx.restore();
        this._state.x = cursorX;
        this._state.y = viewportRelativeCursorY;
        this._state.isFocused = false;
        this._state.style = this._optionsService.options.cursorStyle;
        this._state.width = this._cell.getWidth();
    };
    CursorRenderLayer.prototype._clearCursor = function () {
        if (this._state) {
            this._clearCells(this._state.x, this._state.y, this._state.width, 1);
            this._state = {
                x: 0,
                y: 0,
                isFocused: false,
                style: '',
                width: 0
            };
        }
    };
    CursorRenderLayer.prototype._renderBarCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillLeftLineAtCell(x, y, this._optionsService.options.cursorWidth);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderBlockCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillCells(x, y, cell.getWidth(), 1);
        this._ctx.fillStyle = this._colors.cursorAccent.css;
        this._fillCharTrueColor(cell, x, y);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderUnderlineCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillBottomLineAtCells(x, y);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderBlurCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.strokeStyle = this._colors.cursor.css;
        this._strokeRectAtCell(x, y, cell.getWidth(), 1);
        this._ctx.restore();
    };
    CursorRenderLayer = __decorate([
        __param(5, Services_1.IBufferService),
        __param(6, Services_1.IOptionsService),
        __param(7, Services_1.ICoreService),
        __param(8, Services_2.ICoreBrowserService)
    ], CursorRenderLayer);
    return CursorRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.CursorRenderLayer = CursorRenderLayer;
var CursorBlinkStateManager = (function () {
    function CursorBlinkStateManager(isFocused, _renderCallback) {
        this._renderCallback = _renderCallback;
        this.isCursorVisible = true;
        if (isFocused) {
            this._restartInterval();
        }
    }
    Object.defineProperty(CursorBlinkStateManager.prototype, "isPaused", {
        get: function () { return !(this._blinkStartTimeout || this._blinkInterval); },
        enumerable: false,
        configurable: true
    });
    CursorBlinkStateManager.prototype.dispose = function () {
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    };
    CursorBlinkStateManager.prototype.restartBlinkAnimation = function () {
        var _this = this;
        if (this.isPaused) {
            return;
        }
        this._animationTimeRestarted = Date.now();
        this.isCursorVisible = true;
        if (!this._animationFrame) {
            this._animationFrame = window.requestAnimationFrame(function () {
                _this._renderCallback();
                _this._animationFrame = undefined;
            });
        }
    };
    CursorBlinkStateManager.prototype._restartInterval = function (timeToStart) {
        var _this = this;
        if (timeToStart === void 0) { timeToStart = BLINK_INTERVAL; }
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
        }
        this._blinkStartTimeout = window.setTimeout(function () {
            if (_this._animationTimeRestarted) {
                var time = BLINK_INTERVAL - (Date.now() - _this._animationTimeRestarted);
                _this._animationTimeRestarted = undefined;
                if (time > 0) {
                    _this._restartInterval(time);
                    return;
                }
            }
            _this.isCursorVisible = false;
            _this._animationFrame = window.requestAnimationFrame(function () {
                _this._renderCallback();
                _this._animationFrame = undefined;
            });
            _this._blinkInterval = window.setInterval(function () {
                if (_this._animationTimeRestarted) {
                    var time = BLINK_INTERVAL - (Date.now() - _this._animationTimeRestarted);
                    _this._animationTimeRestarted = undefined;
                    _this._restartInterval(time);
                    return;
                }
                _this.isCursorVisible = !_this.isCursorVisible;
                _this._animationFrame = window.requestAnimationFrame(function () {
                    _this._renderCallback();
                    _this._animationFrame = undefined;
                });
            }, BLINK_INTERVAL);
        }, timeToStart);
    };
    CursorBlinkStateManager.prototype.pause = function () {
        this.isCursorVisible = true;
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    };
    CursorBlinkStateManager.prototype.resume = function () {
        this.pause();
        this._animationTimeRestarted = undefined;
        this._restartInterval();
        this.restartBlinkAnimation();
    };
    return CursorBlinkStateManager;
}());
//# sourceMappingURL=CursorRenderLayer.js.map