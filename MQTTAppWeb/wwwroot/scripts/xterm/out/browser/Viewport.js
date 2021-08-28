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
exports.Viewport = void 0;
var Lifecycle_1 = require("common/Lifecycle");
var Lifecycle_2 = require("browser/Lifecycle");
var Services_1 = require("browser/services/Services");
var Services_2 = require("common/services/Services");
var FALLBACK_SCROLL_BAR_WIDTH = 15;
var Viewport = (function (_super) {
    __extends(Viewport, _super);
    function Viewport(_scrollLines, _viewportElement, _scrollArea, _bufferService, _optionsService, _charSizeService, _renderService) {
        var _this = _super.call(this) || this;
        _this._scrollLines = _scrollLines;
        _this._viewportElement = _viewportElement;
        _this._scrollArea = _scrollArea;
        _this._bufferService = _bufferService;
        _this._optionsService = _optionsService;
        _this._charSizeService = _charSizeService;
        _this._renderService = _renderService;
        _this.scrollBarWidth = 0;
        _this._currentRowHeight = 0;
        _this._lastRecordedBufferLength = 0;
        _this._lastRecordedViewportHeight = 0;
        _this._lastRecordedBufferHeight = 0;
        _this._lastTouchY = 0;
        _this._lastScrollTop = 0;
        _this._wheelPartialScroll = 0;
        _this._refreshAnimationFrame = null;
        _this._ignoreNextScrollEvent = false;
        _this.scrollBarWidth = (_this._viewportElement.offsetWidth - _this._scrollArea.offsetWidth) || FALLBACK_SCROLL_BAR_WIDTH;
        _this.register((0, Lifecycle_2.addDisposableDomListener)(_this._viewportElement, 'scroll', _this._onScroll.bind(_this)));
        setTimeout(function () { return _this.syncScrollArea(); }, 0);
        return _this;
    }
    Viewport.prototype.onThemeChange = function (colors) {
        this._viewportElement.style.backgroundColor = colors.background.css;
    };
    Viewport.prototype._refresh = function (immediate) {
        var _this = this;
        if (immediate) {
            this._innerRefresh();
            if (this._refreshAnimationFrame !== null) {
                cancelAnimationFrame(this._refreshAnimationFrame);
            }
            return;
        }
        if (this._refreshAnimationFrame === null) {
            this._refreshAnimationFrame = requestAnimationFrame(function () { return _this._innerRefresh(); });
        }
    };
    Viewport.prototype._innerRefresh = function () {
        if (this._charSizeService.height > 0) {
            this._currentRowHeight = this._renderService.dimensions.scaledCellHeight / window.devicePixelRatio;
            this._lastRecordedViewportHeight = this._viewportElement.offsetHeight;
            var newBufferHeight = Math.round(this._currentRowHeight * this._lastRecordedBufferLength) + (this._lastRecordedViewportHeight - this._renderService.dimensions.canvasHeight);
            if (this._lastRecordedBufferHeight !== newBufferHeight) {
                this._lastRecordedBufferHeight = newBufferHeight;
                this._scrollArea.style.height = this._lastRecordedBufferHeight + 'px';
            }
        }
        var scrollTop = this._bufferService.buffer.ydisp * this._currentRowHeight;
        if (this._viewportElement.scrollTop !== scrollTop) {
            this._ignoreNextScrollEvent = true;
            this._viewportElement.scrollTop = scrollTop;
        }
        this._refreshAnimationFrame = null;
    };
    Viewport.prototype.syncScrollArea = function (immediate) {
        if (immediate === void 0) { immediate = false; }
        if (this._lastRecordedBufferLength !== this._bufferService.buffer.lines.length) {
            this._lastRecordedBufferLength = this._bufferService.buffer.lines.length;
            this._refresh(immediate);
            return;
        }
        if (this._lastRecordedViewportHeight !== this._renderService.dimensions.canvasHeight) {
            this._refresh(immediate);
            return;
        }
        var newScrollTop = this._bufferService.buffer.ydisp * this._currentRowHeight;
        if (this._lastScrollTop !== newScrollTop) {
            this._refresh(immediate);
            return;
        }
        if (this._lastScrollTop !== this._viewportElement.scrollTop) {
            this._refresh(immediate);
            return;
        }
        if (this._renderService.dimensions.scaledCellHeight / window.devicePixelRatio !== this._currentRowHeight) {
            this._refresh(immediate);
            return;
        }
    };
    Viewport.prototype._onScroll = function (ev) {
        this._lastScrollTop = this._viewportElement.scrollTop;
        if (!this._viewportElement.offsetParent) {
            return;
        }
        if (this._ignoreNextScrollEvent) {
            this._ignoreNextScrollEvent = false;
            this._scrollLines(0);
            return;
        }
        var newRow = Math.round(this._lastScrollTop / this._currentRowHeight);
        var diff = newRow - this._bufferService.buffer.ydisp;
        this._scrollLines(diff);
    };
    Viewport.prototype._bubbleScroll = function (ev, amount) {
        var scrollPosFromTop = this._viewportElement.scrollTop + this._lastRecordedViewportHeight;
        if ((amount < 0 && this._viewportElement.scrollTop !== 0) ||
            (amount > 0 && scrollPosFromTop < this._lastRecordedBufferHeight)) {
            if (ev.cancelable) {
                ev.preventDefault();
            }
            return false;
        }
        return true;
    };
    Viewport.prototype.onWheel = function (ev) {
        var amount = this._getPixelsScrolled(ev);
        if (amount === 0) {
            return false;
        }
        this._viewportElement.scrollTop += amount;
        return this._bubbleScroll(ev, amount);
    };
    Viewport.prototype._getPixelsScrolled = function (ev) {
        if (ev.deltaY === 0) {
            return 0;
        }
        var amount = this._applyScrollModifier(ev.deltaY, ev);
        if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            amount *= this._currentRowHeight;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            amount *= this._currentRowHeight * this._bufferService.rows;
        }
        return amount;
    };
    Viewport.prototype.getLinesScrolled = function (ev) {
        if (ev.deltaY === 0) {
            return 0;
        }
        var amount = this._applyScrollModifier(ev.deltaY, ev);
        if (ev.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
            amount /= this._currentRowHeight + 0.0;
            this._wheelPartialScroll += amount;
            amount = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1);
            this._wheelPartialScroll %= 1;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            amount *= this._bufferService.rows;
        }
        return amount;
    };
    Viewport.prototype._applyScrollModifier = function (amount, ev) {
        var modifier = this._optionsService.options.fastScrollModifier;
        if ((modifier === 'alt' && ev.altKey) ||
            (modifier === 'ctrl' && ev.ctrlKey) ||
            (modifier === 'shift' && ev.shiftKey)) {
            return amount * this._optionsService.options.fastScrollSensitivity * this._optionsService.options.scrollSensitivity;
        }
        return amount * this._optionsService.options.scrollSensitivity;
    };
    Viewport.prototype.onTouchStart = function (ev) {
        this._lastTouchY = ev.touches[0].pageY;
    };
    Viewport.prototype.onTouchMove = function (ev) {
        var deltaY = this._lastTouchY - ev.touches[0].pageY;
        this._lastTouchY = ev.touches[0].pageY;
        if (deltaY === 0) {
            return false;
        }
        this._viewportElement.scrollTop += deltaY;
        return this._bubbleScroll(ev, deltaY);
    };
    Viewport = __decorate([
        __param(3, Services_2.IBufferService),
        __param(4, Services_2.IOptionsService),
        __param(5, Services_1.ICharSizeService),
        __param(6, Services_1.IRenderService)
    ], Viewport);
    return Viewport;
}(Lifecycle_1.Disposable));
exports.Viewport = Viewport;
//# sourceMappingURL=Viewport.js.map