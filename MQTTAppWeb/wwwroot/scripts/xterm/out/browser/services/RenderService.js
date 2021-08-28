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
exports.RenderService = void 0;
var RenderDebouncer_1 = require("browser/RenderDebouncer");
var EventEmitter_1 = require("common/EventEmitter");
var Lifecycle_1 = require("common/Lifecycle");
var ScreenDprMonitor_1 = require("browser/ScreenDprMonitor");
var Lifecycle_2 = require("browser/Lifecycle");
var Services_1 = require("common/services/Services");
var Services_2 = require("browser/services/Services");
var RenderService = (function (_super) {
    __extends(RenderService, _super);
    function RenderService(_renderer, _rowCount, screenElement, optionsService, _charSizeService, bufferService) {
        var _this = _super.call(this) || this;
        _this._renderer = _renderer;
        _this._rowCount = _rowCount;
        _this._charSizeService = _charSizeService;
        _this._isPaused = false;
        _this._needsFullRefresh = false;
        _this._isNextRenderRedrawOnly = true;
        _this._needsSelectionRefresh = false;
        _this._canvasWidth = 0;
        _this._canvasHeight = 0;
        _this._selectionState = {
            start: undefined,
            end: undefined,
            columnSelectMode: false
        };
        _this._onDimensionsChange = new EventEmitter_1.EventEmitter();
        _this._onRender = new EventEmitter_1.EventEmitter();
        _this._onRefreshRequest = new EventEmitter_1.EventEmitter();
        _this.register({ dispose: function () { return _this._renderer.dispose(); } });
        _this._renderDebouncer = new RenderDebouncer_1.RenderDebouncer(function (start, end) { return _this._renderRows(start, end); });
        _this.register(_this._renderDebouncer);
        _this._screenDprMonitor = new ScreenDprMonitor_1.ScreenDprMonitor();
        _this._screenDprMonitor.setListener(function () { return _this.onDevicePixelRatioChange(); });
        _this.register(_this._screenDprMonitor);
        _this.register(bufferService.onResize(function (e) { return _this._fullRefresh(); }));
        _this.register(optionsService.onOptionChange(function () { return _this._renderer.onOptionsChanged(); }));
        _this.register(_this._charSizeService.onCharSizeChange(function () { return _this.onCharSizeChanged(); }));
        _this._renderer.onRequestRedraw(function (e) { return _this.refreshRows(e.start, e.end, true); });
        _this.register((0, Lifecycle_2.addDisposableDomListener)(window, 'resize', function () { return _this.onDevicePixelRatioChange(); }));
        if ('IntersectionObserver' in window) {
            var observer_1 = new IntersectionObserver(function (e) { return _this._onIntersectionChange(e[e.length - 1]); }, { threshold: 0 });
            observer_1.observe(screenElement);
            _this.register({ dispose: function () { return observer_1.disconnect(); } });
        }
        return _this;
    }
    Object.defineProperty(RenderService.prototype, "onDimensionsChange", {
        get: function () { return this._onDimensionsChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "onRenderedBufferChange", {
        get: function () { return this._onRender.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "onRefreshRequest", {
        get: function () { return this._onRefreshRequest.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "dimensions", {
        get: function () { return this._renderer.dimensions; },
        enumerable: false,
        configurable: true
    });
    RenderService.prototype._onIntersectionChange = function (entry) {
        this._isPaused = entry.isIntersecting === undefined ? (entry.intersectionRatio === 0) : !entry.isIntersecting;
        if (!this._isPaused && !this._charSizeService.hasValidSize) {
            this._charSizeService.measure();
        }
        if (!this._isPaused && this._needsFullRefresh) {
            this.refreshRows(0, this._rowCount - 1);
            this._needsFullRefresh = false;
        }
    };
    RenderService.prototype.refreshRows = function (start, end, isRedrawOnly) {
        if (isRedrawOnly === void 0) { isRedrawOnly = false; }
        if (this._isPaused) {
            this._needsFullRefresh = true;
            return;
        }
        if (!isRedrawOnly) {
            this._isNextRenderRedrawOnly = false;
        }
        this._renderDebouncer.refresh(start, end, this._rowCount);
    };
    RenderService.prototype._renderRows = function (start, end) {
        this._renderer.renderRows(start, end);
        if (this._needsSelectionRefresh) {
            this._renderer.onSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode);
            this._needsSelectionRefresh = false;
        }
        if (!this._isNextRenderRedrawOnly) {
            this._onRender.fire({ start: start, end: end });
        }
        this._isNextRenderRedrawOnly = true;
    };
    RenderService.prototype.resize = function (cols, rows) {
        this._rowCount = rows;
        this._fireOnCanvasResize();
    };
    RenderService.prototype.changeOptions = function () {
        this._renderer.onOptionsChanged();
        this.refreshRows(0, this._rowCount - 1);
        this._fireOnCanvasResize();
    };
    RenderService.prototype._fireOnCanvasResize = function () {
        if (this._renderer.dimensions.canvasWidth === this._canvasWidth && this._renderer.dimensions.canvasHeight === this._canvasHeight) {
            return;
        }
        this._onDimensionsChange.fire(this._renderer.dimensions);
    };
    RenderService.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
    };
    RenderService.prototype.setRenderer = function (renderer) {
        var _this = this;
        this._renderer.dispose();
        this._renderer = renderer;
        this._renderer.onRequestRedraw(function (e) { return _this.refreshRows(e.start, e.end, true); });
        this._needsSelectionRefresh = true;
        this._fullRefresh();
    };
    RenderService.prototype._fullRefresh = function () {
        if (this._isPaused) {
            this._needsFullRefresh = true;
        }
        else {
            this.refreshRows(0, this._rowCount - 1);
        }
    };
    RenderService.prototype.setColors = function (colors) {
        this._renderer.setColors(colors);
        this._fullRefresh();
    };
    RenderService.prototype.onDevicePixelRatioChange = function () {
        this._charSizeService.measure();
        this._renderer.onDevicePixelRatioChange();
        this.refreshRows(0, this._rowCount - 1);
    };
    RenderService.prototype.onResize = function (cols, rows) {
        this._renderer.onResize(cols, rows);
        this._fullRefresh();
    };
    RenderService.prototype.onCharSizeChanged = function () {
        this._renderer.onCharSizeChanged();
    };
    RenderService.prototype.onBlur = function () {
        this._renderer.onBlur();
    };
    RenderService.prototype.onFocus = function () {
        this._renderer.onFocus();
    };
    RenderService.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        this._selectionState.start = start;
        this._selectionState.end = end;
        this._selectionState.columnSelectMode = columnSelectMode;
        this._renderer.onSelectionChanged(start, end, columnSelectMode);
    };
    RenderService.prototype.onCursorMove = function () {
        this._renderer.onCursorMove();
    };
    RenderService.prototype.clear = function () {
        this._renderer.clear();
    };
    RenderService = __decorate([
        __param(3, Services_1.IOptionsService),
        __param(4, Services_2.ICharSizeService),
        __param(5, Services_1.IBufferService)
    ], RenderService);
    return RenderService;
}(Lifecycle_1.Disposable));
exports.RenderService = RenderService;
//# sourceMappingURL=RenderService.js.map