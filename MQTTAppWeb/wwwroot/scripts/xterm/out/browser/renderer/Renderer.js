"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
exports.Renderer = void 0;
var TextRenderLayer_1 = require("browser/renderer/TextRenderLayer");
var SelectionRenderLayer_1 = require("browser/renderer/SelectionRenderLayer");
var CursorRenderLayer_1 = require("browser/renderer/CursorRenderLayer");
var LinkRenderLayer_1 = require("browser/renderer/LinkRenderLayer");
var Lifecycle_1 = require("common/Lifecycle");
var Services_1 = require("browser/services/Services");
var Services_2 = require("common/services/Services");
var CharAtlasCache_1 = require("browser/renderer/atlas/CharAtlasCache");
var EventEmitter_1 = require("common/EventEmitter");
var nextRendererId = 1;
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer(_colors, _screenElement, linkifier, linkifier2, instantiationService, _bufferService, _charSizeService, _optionsService) {
        var _this = _super.call(this) || this;
        _this._colors = _colors;
        _this._screenElement = _screenElement;
        _this._bufferService = _bufferService;
        _this._charSizeService = _charSizeService;
        _this._optionsService = _optionsService;
        _this._id = nextRendererId++;
        _this._onRequestRedraw = new EventEmitter_1.EventEmitter();
        var allowTransparency = _this._optionsService.options.allowTransparency;
        _this._renderLayers = [
            instantiationService.createInstance(TextRenderLayer_1.TextRenderLayer, _this._screenElement, 0, _this._colors, allowTransparency, _this._id),
            instantiationService.createInstance(SelectionRenderLayer_1.SelectionRenderLayer, _this._screenElement, 1, _this._colors, _this._id),
            instantiationService.createInstance(LinkRenderLayer_1.LinkRenderLayer, _this._screenElement, 2, _this._colors, _this._id, linkifier, linkifier2),
            instantiationService.createInstance(CursorRenderLayer_1.CursorRenderLayer, _this._screenElement, 3, _this._colors, _this._id, _this._onRequestRedraw)
        ];
        _this.dimensions = {
            scaledCharWidth: 0,
            scaledCharHeight: 0,
            scaledCellWidth: 0,
            scaledCellHeight: 0,
            scaledCharLeft: 0,
            scaledCharTop: 0,
            scaledCanvasWidth: 0,
            scaledCanvasHeight: 0,
            canvasWidth: 0,
            canvasHeight: 0,
            actualCellWidth: 0,
            actualCellHeight: 0
        };
        _this._devicePixelRatio = window.devicePixelRatio;
        _this._updateDimensions();
        _this.onOptionsChanged();
        return _this;
    }
    Object.defineProperty(Renderer.prototype, "onRequestRedraw", {
        get: function () { return this._onRequestRedraw.event; },
        enumerable: false,
        configurable: true
    });
    Renderer.prototype.dispose = function () {
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            l.dispose();
        }
        _super.prototype.dispose.call(this);
        CharAtlasCache_1.removeTerminalFromCache(this._id);
    };
    Renderer.prototype.onDevicePixelRatioChange = function () {
        if (this._devicePixelRatio !== window.devicePixelRatio) {
            this._devicePixelRatio = window.devicePixelRatio;
            this.onResize(this._bufferService.cols, this._bufferService.rows);
        }
    };
    Renderer.prototype.setColors = function (colors) {
        this._colors = colors;
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            l.setColors(this._colors);
            l.reset();
        }
    };
    Renderer.prototype.onResize = function (cols, rows) {
        this._updateDimensions();
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            l.resize(this.dimensions);
        }
        this._screenElement.style.width = this.dimensions.canvasWidth + "px";
        this._screenElement.style.height = this.dimensions.canvasHeight + "px";
    };
    Renderer.prototype.onCharSizeChanged = function () {
        this.onResize(this._bufferService.cols, this._bufferService.rows);
    };
    Renderer.prototype.onBlur = function () {
        this._runOperation(function (l) { return l.onBlur(); });
    };
    Renderer.prototype.onFocus = function () {
        this._runOperation(function (l) { return l.onFocus(); });
    };
    Renderer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        if (columnSelectMode === void 0) { columnSelectMode = false; }
        this._runOperation(function (l) { return l.onSelectionChanged(start, end, columnSelectMode); });
    };
    Renderer.prototype.onCursorMove = function () {
        this._runOperation(function (l) { return l.onCursorMove(); });
    };
    Renderer.prototype.onOptionsChanged = function () {
        this._runOperation(function (l) { return l.onOptionsChanged(); });
    };
    Renderer.prototype.clear = function () {
        this._runOperation(function (l) { return l.reset(); });
    };
    Renderer.prototype._runOperation = function (operation) {
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            operation(l);
        }
    };
    Renderer.prototype.renderRows = function (start, end) {
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            l.onGridChanged(start, end);
        }
    };
    Renderer.prototype._updateDimensions = function () {
        if (!this._charSizeService.hasValidSize) {
            return;
        }
        this.dimensions.scaledCharWidth = Math.floor(this._charSizeService.width * window.devicePixelRatio);
        this.dimensions.scaledCharHeight = Math.ceil(this._charSizeService.height * window.devicePixelRatio);
        this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._optionsService.options.lineHeight);
        this.dimensions.scaledCharTop = this._optionsService.options.lineHeight === 1 ? 0 : Math.round((this.dimensions.scaledCellHeight - this.dimensions.scaledCharHeight) / 2);
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._optionsService.options.letterSpacing);
        this.dimensions.scaledCharLeft = Math.floor(this._optionsService.options.letterSpacing / 2);
        this.dimensions.scaledCanvasHeight = this._bufferService.rows * this.dimensions.scaledCellHeight;
        this.dimensions.scaledCanvasWidth = this._bufferService.cols * this.dimensions.scaledCellWidth;
        this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / window.devicePixelRatio);
        this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / window.devicePixelRatio);
        this.dimensions.actualCellHeight = this.dimensions.canvasHeight / this._bufferService.rows;
        this.dimensions.actualCellWidth = this.dimensions.canvasWidth / this._bufferService.cols;
    };
    Renderer = __decorate([
        __param(4, Services_2.IInstantiationService),
        __param(5, Services_2.IBufferService),
        __param(6, Services_1.ICharSizeService),
        __param(7, Services_2.IOptionsService)
    ], Renderer);
    return Renderer;
}(Lifecycle_1.Disposable));
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map