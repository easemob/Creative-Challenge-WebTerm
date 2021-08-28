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
exports.DomRenderer = void 0;
var DomRendererRowFactory_1 = require("browser/renderer/dom/DomRendererRowFactory");
var Constants_1 = require("browser/renderer/atlas/Constants");
var Lifecycle_1 = require("common/Lifecycle");
var Services_1 = require("browser/services/Services");
var Services_2 = require("common/services/Services");
var EventEmitter_1 = require("common/EventEmitter");
var Color_1 = require("browser/Color");
var Dom_1 = require("browser/Dom");
var TERMINAL_CLASS_PREFIX = 'xterm-dom-renderer-owner-';
var ROW_CONTAINER_CLASS = 'xterm-rows';
var FG_CLASS_PREFIX = 'xterm-fg-';
var BG_CLASS_PREFIX = 'xterm-bg-';
var FOCUS_CLASS = 'xterm-focus';
var SELECTION_CLASS = 'xterm-selection';
var nextTerminalId = 1;
var DomRenderer = (function (_super) {
    __extends(DomRenderer, _super);
    function DomRenderer(_colors, _element, _screenElement, _viewportElement, _linkifier, _linkifier2, instantiationService, _charSizeService, _optionsService, _bufferService) {
        var _this = _super.call(this) || this;
        _this._colors = _colors;
        _this._element = _element;
        _this._screenElement = _screenElement;
        _this._viewportElement = _viewportElement;
        _this._linkifier = _linkifier;
        _this._linkifier2 = _linkifier2;
        _this._charSizeService = _charSizeService;
        _this._optionsService = _optionsService;
        _this._bufferService = _bufferService;
        _this._terminalClass = nextTerminalId++;
        _this._rowElements = [];
        _this._rowContainer = document.createElement('div');
        _this._rowContainer.classList.add(ROW_CONTAINER_CLASS);
        _this._rowContainer.style.lineHeight = 'normal';
        _this._rowContainer.setAttribute('aria-hidden', 'true');
        _this._refreshRowElements(_this._bufferService.cols, _this._bufferService.rows);
        _this._selectionContainer = document.createElement('div');
        _this._selectionContainer.classList.add(SELECTION_CLASS);
        _this._selectionContainer.setAttribute('aria-hidden', 'true');
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
        _this._updateDimensions();
        _this._injectCss();
        _this._rowFactory = instantiationService.createInstance(DomRendererRowFactory_1.DomRendererRowFactory, document, _this._colors);
        _this._element.classList.add(TERMINAL_CLASS_PREFIX + _this._terminalClass);
        _this._screenElement.appendChild(_this._rowContainer);
        _this._screenElement.appendChild(_this._selectionContainer);
        _this._linkifier.onShowLinkUnderline(function (e) { return _this._onLinkHover(e); });
        _this._linkifier.onHideLinkUnderline(function (e) { return _this._onLinkLeave(e); });
        _this._linkifier2.onShowLinkUnderline(function (e) { return _this._onLinkHover(e); });
        _this._linkifier2.onHideLinkUnderline(function (e) { return _this._onLinkLeave(e); });
        return _this;
    }
    Object.defineProperty(DomRenderer.prototype, "onRequestRedraw", {
        get: function () { return new EventEmitter_1.EventEmitter().event; },
        enumerable: false,
        configurable: true
    });
    DomRenderer.prototype.dispose = function () {
        this._element.classList.remove(TERMINAL_CLASS_PREFIX + this._terminalClass);
        (0, Dom_1.removeElementFromParent)(this._rowContainer, this._selectionContainer, this._themeStyleElement, this._dimensionsStyleElement);
        _super.prototype.dispose.call(this);
    };
    DomRenderer.prototype._updateDimensions = function () {
        this.dimensions.scaledCharWidth = this._charSizeService.width * window.devicePixelRatio;
        this.dimensions.scaledCharHeight = Math.ceil(this._charSizeService.height * window.devicePixelRatio);
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._optionsService.options.letterSpacing);
        this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._optionsService.options.lineHeight);
        this.dimensions.scaledCharLeft = 0;
        this.dimensions.scaledCharTop = 0;
        this.dimensions.scaledCanvasWidth = this.dimensions.scaledCellWidth * this._bufferService.cols;
        this.dimensions.scaledCanvasHeight = this.dimensions.scaledCellHeight * this._bufferService.rows;
        this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / window.devicePixelRatio);
        this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / window.devicePixelRatio);
        this.dimensions.actualCellWidth = this.dimensions.canvasWidth / this._bufferService.cols;
        this.dimensions.actualCellHeight = this.dimensions.canvasHeight / this._bufferService.rows;
        for (var _i = 0, _a = this._rowElements; _i < _a.length; _i++) {
            var element = _a[_i];
            element.style.width = this.dimensions.canvasWidth + "px";
            element.style.height = this.dimensions.actualCellHeight + "px";
            element.style.lineHeight = this.dimensions.actualCellHeight + "px";
            element.style.overflow = 'hidden';
        }
        if (!this._dimensionsStyleElement) {
            this._dimensionsStyleElement = document.createElement('style');
            this._screenElement.appendChild(this._dimensionsStyleElement);
        }
        var styles = this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " span {" +
            " display: inline-block;" +
            " height: 100%;" +
            " vertical-align: top;" +
            (" width: " + this.dimensions.actualCellWidth + "px") +
            "}";
        this._dimensionsStyleElement.textContent = styles;
        this._selectionContainer.style.height = this._viewportElement.style.height;
        this._screenElement.style.width = this.dimensions.canvasWidth + "px";
        this._screenElement.style.height = this.dimensions.canvasHeight + "px";
    };
    DomRenderer.prototype.setColors = function (colors) {
        this._colors = colors;
        this._injectCss();
    };
    DomRenderer.prototype._injectCss = function () {
        var _this = this;
        if (!this._themeStyleElement) {
            this._themeStyleElement = document.createElement('style');
            this._screenElement.appendChild(this._themeStyleElement);
        }
        var styles = this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " {" +
            (" color: " + this._colors.foreground.css + ";") +
            (" font-family: " + this._optionsService.options.fontFamily + ";") +
            (" font-size: " + this._optionsService.options.fontSize + "px;") +
            "}";
        styles +=
            this._terminalSelector + " span:not(." + DomRendererRowFactory_1.BOLD_CLASS + ") {" +
                (" font-weight: " + this._optionsService.options.fontWeight + ";") +
                "}" +
                (this._terminalSelector + " span." + DomRendererRowFactory_1.BOLD_CLASS + " {") +
                (" font-weight: " + this._optionsService.options.fontWeightBold + ";") +
                "}" +
                (this._terminalSelector + " span." + DomRendererRowFactory_1.ITALIC_CLASS + " {") +
                " font-style: italic;" +
                "}";
        styles +=
            "@keyframes blink_box_shadow" + "_" + this._terminalClass + " {" +
                " 50% {" +
                "  box-shadow: none;" +
                " }" +
                "}";
        styles +=
            "@keyframes blink_block" + "_" + this._terminalClass + " {" +
                " 0% {" +
                ("  background-color: " + this._colors.cursor.css + ";") +
                ("  color: " + this._colors.cursorAccent.css + ";") +
                " }" +
                " 50% {" +
                ("  background-color: " + this._colors.cursorAccent.css + ";") +
                ("  color: " + this._colors.cursor.css + ";") +
                " }" +
                "}";
        styles +=
            this._terminalSelector + " ." + ROW_CONTAINER_CLASS + ":not(." + FOCUS_CLASS + ") ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {" +
                (" outline: 1px solid " + this._colors.cursor.css + ";") +
                " outline-offset: -1px;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_BLINK_CLASS + ":not(." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + ") {") +
                " animation: blink_box_shadow" + "_" + this._terminalClass + " 1s step-end infinite;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_BLINK_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {") +
                " animation: blink_block" + "_" + this._terminalClass + " 1s step-end infinite;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {") +
                (" background-color: " + this._colors.cursor.css + ";") +
                (" color: " + this._colors.cursorAccent.css + ";") +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BAR_CLASS + " {") +
                (" box-shadow: " + this._optionsService.options.cursorWidth + "px 0 0 " + this._colors.cursor.css + " inset;") +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_UNDERLINE_CLASS + " {") +
                (" box-shadow: 0 -1px 0 " + this._colors.cursor.css + " inset;") +
                "}";
        styles +=
            this._terminalSelector + " ." + SELECTION_CLASS + " {" +
                " position: absolute;" +
                " top: 0;" +
                " left: 0;" +
                " z-index: 1;" +
                " pointer-events: none;" +
                "}" +
                (this._terminalSelector + " ." + SELECTION_CLASS + " div {") +
                " position: absolute;" +
                (" background-color: " + this._colors.selectionTransparent.css + ";") +
                "}";
        this._colors.ansi.forEach(function (c, i) {
            styles +=
                _this._terminalSelector + " ." + FG_CLASS_PREFIX + i + " { color: " + c.css + "; }" +
                    (_this._terminalSelector + " ." + BG_CLASS_PREFIX + i + " { background-color: " + c.css + "; }");
        });
        styles +=
            this._terminalSelector + " ." + FG_CLASS_PREFIX + Constants_1.INVERTED_DEFAULT_COLOR + " { color: " + Color_1.color.opaque(this._colors.background).css + "; }" +
                (this._terminalSelector + " ." + BG_CLASS_PREFIX + Constants_1.INVERTED_DEFAULT_COLOR + " { background-color: " + this._colors.foreground.css + "; }");
        this._themeStyleElement.textContent = styles;
    };
    DomRenderer.prototype.onDevicePixelRatioChange = function () {
        this._updateDimensions();
    };
    DomRenderer.prototype._refreshRowElements = function (cols, rows) {
        for (var i = this._rowElements.length; i <= rows; i++) {
            var row = document.createElement('div');
            this._rowContainer.appendChild(row);
            this._rowElements.push(row);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
    };
    DomRenderer.prototype.onResize = function (cols, rows) {
        this._refreshRowElements(cols, rows);
        this._updateDimensions();
    };
    DomRenderer.prototype.onCharSizeChanged = function () {
        this._updateDimensions();
    };
    DomRenderer.prototype.onBlur = function () {
        this._rowContainer.classList.remove(FOCUS_CLASS);
    };
    DomRenderer.prototype.onFocus = function () {
        this._rowContainer.classList.add(FOCUS_CLASS);
    };
    DomRenderer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        while (this._selectionContainer.children.length) {
            this._selectionContainer.removeChild(this._selectionContainer.children[0]);
        }
        if (!start || !end) {
            return;
        }
        var viewportStartRow = start[1] - this._bufferService.buffer.ydisp;
        var viewportEndRow = end[1] - this._bufferService.buffer.ydisp;
        var viewportCappedStartRow = Math.max(viewportStartRow, 0);
        var viewportCappedEndRow = Math.min(viewportEndRow, this._bufferService.rows - 1);
        if (viewportCappedStartRow >= this._bufferService.rows || viewportCappedEndRow < 0) {
            return;
        }
        var documentFragment = document.createDocumentFragment();
        if (columnSelectMode) {
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, start[0], end[0], viewportCappedEndRow - viewportCappedStartRow + 1));
        }
        else {
            var startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
            var endCol = viewportCappedStartRow === viewportEndRow ? end[0] : this._bufferService.cols;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, startCol, endCol));
            var middleRowsCount = viewportCappedEndRow - viewportCappedStartRow - 1;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow + 1, 0, this._bufferService.cols, middleRowsCount));
            if (viewportCappedStartRow !== viewportCappedEndRow) {
                var endCol_1 = viewportEndRow === viewportCappedEndRow ? end[0] : this._bufferService.cols;
                documentFragment.appendChild(this._createSelectionElement(viewportCappedEndRow, 0, endCol_1));
            }
        }
        this._selectionContainer.appendChild(documentFragment);
    };
    DomRenderer.prototype._createSelectionElement = function (row, colStart, colEnd, rowCount) {
        if (rowCount === void 0) { rowCount = 1; }
        var element = document.createElement('div');
        element.style.height = rowCount * this.dimensions.actualCellHeight + "px";
        element.style.top = row * this.dimensions.actualCellHeight + "px";
        element.style.left = colStart * this.dimensions.actualCellWidth + "px";
        element.style.width = this.dimensions.actualCellWidth * (colEnd - colStart) + "px";
        return element;
    };
    DomRenderer.prototype.onCursorMove = function () {
    };
    DomRenderer.prototype.onOptionsChanged = function () {
        this._updateDimensions();
        this._injectCss();
    };
    DomRenderer.prototype.clear = function () {
        for (var _i = 0, _a = this._rowElements; _i < _a.length; _i++) {
            var e = _a[_i];
            e.innerText = '';
        }
    };
    DomRenderer.prototype.renderRows = function (start, end) {
        var cursorAbsoluteY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        var cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
        var cursorBlink = this._optionsService.options.cursorBlink;
        for (var y = start; y <= end; y++) {
            var rowElement = this._rowElements[y];
            rowElement.innerText = '';
            var row = y + this._bufferService.buffer.ydisp;
            var lineData = this._bufferService.buffer.lines.get(row);
            var cursorStyle = this._optionsService.options.cursorStyle;
            rowElement.appendChild(this._rowFactory.createRow(lineData, row, row === cursorAbsoluteY, cursorStyle, cursorX, cursorBlink, this.dimensions.actualCellWidth, this._bufferService.cols));
        }
    };
    Object.defineProperty(DomRenderer.prototype, "_terminalSelector", {
        get: function () {
            return "." + TERMINAL_CLASS_PREFIX + this._terminalClass;
        },
        enumerable: false,
        configurable: true
    });
    DomRenderer.prototype._onLinkHover = function (e) {
        this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, true);
    };
    DomRenderer.prototype._onLinkLeave = function (e) {
        this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, false);
    };
    DomRenderer.prototype._setCellUnderline = function (x, x2, y, y2, cols, enabled) {
        while (x !== x2 || y !== y2) {
            var row = this._rowElements[y];
            if (!row) {
                return;
            }
            var span = row.children[x];
            if (span) {
                span.style.textDecoration = enabled ? 'underline' : 'none';
            }
            if (++x >= cols) {
                x = 0;
                y++;
            }
        }
    };
    DomRenderer = __decorate([
        __param(6, Services_2.IInstantiationService),
        __param(7, Services_1.ICharSizeService),
        __param(8, Services_2.IOptionsService),
        __param(9, Services_2.IBufferService)
    ], DomRenderer);
    return DomRenderer;
}(Lifecycle_1.Disposable));
exports.DomRenderer = DomRenderer;
//# sourceMappingURL=DomRenderer.js.map