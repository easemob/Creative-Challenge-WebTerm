"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRenderLayer = void 0;
var Constants_1 = require("common/buffer/Constants");
var Constants_2 = require("browser/renderer/atlas/Constants");
var CharAtlasCache_1 = require("browser/renderer/atlas/CharAtlasCache");
var AttributeData_1 = require("common/buffer/AttributeData");
var RendererUtils_1 = require("browser/renderer/RendererUtils");
var Color_1 = require("browser/Color");
var Dom_1 = require("browser/Dom");
var BaseRenderLayer = (function () {
    function BaseRenderLayer(_container, id, zIndex, _alpha, _colors, _rendererId, _bufferService, _optionsService) {
        this._container = _container;
        this._alpha = _alpha;
        this._colors = _colors;
        this._rendererId = _rendererId;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._scaledCharWidth = 0;
        this._scaledCharHeight = 0;
        this._scaledCellWidth = 0;
        this._scaledCellHeight = 0;
        this._scaledCharLeft = 0;
        this._scaledCharTop = 0;
        this._currentGlyphIdentifier = {
            chars: '',
            code: 0,
            bg: 0,
            fg: 0,
            bold: false,
            dim: false,
            italic: false
        };
        this._canvas = document.createElement('canvas');
        this._canvas.classList.add("xterm-" + id + "-layer");
        this._canvas.style.zIndex = zIndex.toString();
        this._initCanvas();
        this._container.appendChild(this._canvas);
    }
    BaseRenderLayer.prototype.dispose = function () {
        var _a;
        Dom_1.removeElementFromParent(this._canvas);
        (_a = this._charAtlas) === null || _a === void 0 ? void 0 : _a.dispose();
    };
    BaseRenderLayer.prototype._initCanvas = function () {
        this._ctx = RendererUtils_1.throwIfFalsy(this._canvas.getContext('2d', { alpha: this._alpha }));
        if (!this._alpha) {
            this._clearAll();
        }
    };
    BaseRenderLayer.prototype.onOptionsChanged = function () { };
    BaseRenderLayer.prototype.onBlur = function () { };
    BaseRenderLayer.prototype.onFocus = function () { };
    BaseRenderLayer.prototype.onCursorMove = function () { };
    BaseRenderLayer.prototype.onGridChanged = function (startRow, endRow) { };
    BaseRenderLayer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        if (columnSelectMode === void 0) { columnSelectMode = false; }
    };
    BaseRenderLayer.prototype.setColors = function (colorSet) {
        this._refreshCharAtlas(colorSet);
    };
    BaseRenderLayer.prototype._setTransparency = function (alpha) {
        if (alpha === this._alpha) {
            return;
        }
        var oldCanvas = this._canvas;
        this._alpha = alpha;
        this._canvas = this._canvas.cloneNode();
        this._initCanvas();
        this._container.replaceChild(this._canvas, oldCanvas);
        this._refreshCharAtlas(this._colors);
        this.onGridChanged(0, this._bufferService.rows - 1);
    };
    BaseRenderLayer.prototype._refreshCharAtlas = function (colorSet) {
        if (this._scaledCharWidth <= 0 && this._scaledCharHeight <= 0) {
            return;
        }
        this._charAtlas = CharAtlasCache_1.acquireCharAtlas(this._optionsService.options, this._rendererId, colorSet, this._scaledCharWidth, this._scaledCharHeight);
        this._charAtlas.warmUp();
    };
    BaseRenderLayer.prototype.resize = function (dim) {
        this._scaledCellWidth = dim.scaledCellWidth;
        this._scaledCellHeight = dim.scaledCellHeight;
        this._scaledCharWidth = dim.scaledCharWidth;
        this._scaledCharHeight = dim.scaledCharHeight;
        this._scaledCharLeft = dim.scaledCharLeft;
        this._scaledCharTop = dim.scaledCharTop;
        this._canvas.width = dim.scaledCanvasWidth;
        this._canvas.height = dim.scaledCanvasHeight;
        this._canvas.style.width = dim.canvasWidth + "px";
        this._canvas.style.height = dim.canvasHeight + "px";
        if (!this._alpha) {
            this._clearAll();
        }
        this._refreshCharAtlas(this._colors);
    };
    BaseRenderLayer.prototype._fillCells = function (x, y, width, height) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
    };
    BaseRenderLayer.prototype._fillBottomLineAtCells = function (x, y, width) {
        if (width === void 0) { width = 1; }
        this._ctx.fillRect(x * this._scaledCellWidth, (y + 1) * this._scaledCellHeight - window.devicePixelRatio - 1, width * this._scaledCellWidth, window.devicePixelRatio);
    };
    BaseRenderLayer.prototype._fillLeftLineAtCell = function (x, y, width) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, window.devicePixelRatio * width, this._scaledCellHeight);
    };
    BaseRenderLayer.prototype._strokeRectAtCell = function (x, y, width, height) {
        this._ctx.lineWidth = window.devicePixelRatio;
        this._ctx.strokeRect(x * this._scaledCellWidth + window.devicePixelRatio / 2, y * this._scaledCellHeight + (window.devicePixelRatio / 2), width * this._scaledCellWidth - window.devicePixelRatio, (height * this._scaledCellHeight) - window.devicePixelRatio);
    };
    BaseRenderLayer.prototype._clearAll = function () {
        if (this._alpha) {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
    };
    BaseRenderLayer.prototype._clearCells = function (x, y, width, height) {
        if (this._alpha) {
            this._ctx.clearRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
    };
    BaseRenderLayer.prototype._fillCharTrueColor = function (cell, x, y) {
        this._ctx.font = this._getFont(false, false);
        this._ctx.textBaseline = 'ideographic';
        this._clipRow(y);
        this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight);
    };
    BaseRenderLayer.prototype._drawChars = function (cell, x, y) {
        var contrastColor = this._getContrastColor(cell);
        if (contrastColor || cell.isFgRGB() || cell.isBgRGB()) {
            this._drawUncachedChars(cell, x, y, contrastColor);
            return;
        }
        var fg;
        var bg;
        if (cell.isInverse()) {
            fg = (cell.isBgDefault()) ? Constants_2.INVERTED_DEFAULT_COLOR : cell.getBgColor();
            bg = (cell.isFgDefault()) ? Constants_2.INVERTED_DEFAULT_COLOR : cell.getFgColor();
        }
        else {
            bg = (cell.isBgDefault()) ? Constants_1.DEFAULT_COLOR : cell.getBgColor();
            fg = (cell.isFgDefault()) ? Constants_1.DEFAULT_COLOR : cell.getFgColor();
        }
        var drawInBrightColor = this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8;
        fg += drawInBrightColor ? 8 : 0;
        this._currentGlyphIdentifier.chars = cell.getChars() || Constants_1.WHITESPACE_CELL_CHAR;
        this._currentGlyphIdentifier.code = cell.getCode() || Constants_1.WHITESPACE_CELL_CODE;
        this._currentGlyphIdentifier.bg = bg;
        this._currentGlyphIdentifier.fg = fg;
        this._currentGlyphIdentifier.bold = !!cell.isBold();
        this._currentGlyphIdentifier.dim = !!cell.isDim();
        this._currentGlyphIdentifier.italic = !!cell.isItalic();
        var atlasDidDraw = this._charAtlas && this._charAtlas.draw(this._ctx, this._currentGlyphIdentifier, x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop);
        if (!atlasDidDraw) {
            this._drawUncachedChars(cell, x, y);
        }
    };
    BaseRenderLayer.prototype._drawUncachedChars = function (cell, x, y, fgOverride) {
        this._ctx.save();
        this._ctx.font = this._getFont(!!cell.isBold(), !!cell.isItalic());
        this._ctx.textBaseline = 'ideographic';
        if (cell.isInverse()) {
            if (fgOverride) {
                this._ctx.fillStyle = fgOverride.css;
            }
            else if (cell.isBgDefault()) {
                this._ctx.fillStyle = Color_1.color.opaque(this._colors.background).css;
            }
            else if (cell.isBgRGB()) {
                this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
            }
            else {
                var bg = cell.getBgColor();
                if (this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && bg < 8) {
                    bg += 8;
                }
                this._ctx.fillStyle = this._colors.ansi[bg].css;
            }
        }
        else {
            if (fgOverride) {
                this._ctx.fillStyle = fgOverride.css;
            }
            else if (cell.isFgDefault()) {
                this._ctx.fillStyle = this._colors.foreground.css;
            }
            else if (cell.isFgRGB()) {
                this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
            }
            else {
                var fg = cell.getFgColor();
                if (this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                    fg += 8;
                }
                this._ctx.fillStyle = this._colors.ansi[fg].css;
            }
        }
        this._clipRow(y);
        if (cell.isDim()) {
            this._ctx.globalAlpha = Constants_2.DIM_OPACITY;
        }
        this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight);
        this._ctx.restore();
    };
    BaseRenderLayer.prototype._clipRow = function (y) {
        this._ctx.beginPath();
        this._ctx.rect(0, y * this._scaledCellHeight, this._bufferService.cols * this._scaledCellWidth, this._scaledCellHeight);
        this._ctx.clip();
    };
    BaseRenderLayer.prototype._getFont = function (isBold, isItalic) {
        var fontWeight = isBold ? this._optionsService.options.fontWeightBold : this._optionsService.options.fontWeight;
        var fontStyle = isItalic ? 'italic' : '';
        return fontStyle + " " + fontWeight + " " + this._optionsService.options.fontSize * window.devicePixelRatio + "px " + this._optionsService.options.fontFamily;
    };
    BaseRenderLayer.prototype._getContrastColor = function (cell) {
        if (this._optionsService.options.minimumContrastRatio === 1) {
            return undefined;
        }
        var adjustedColor = this._colors.contrastCache.getColor(cell.bg, cell.fg);
        if (adjustedColor !== undefined) {
            return adjustedColor || undefined;
        }
        var fgColor = cell.getFgColor();
        var fgColorMode = cell.getFgColorMode();
        var bgColor = cell.getBgColor();
        var bgColorMode = cell.getBgColorMode();
        var isInverse = !!cell.isInverse();
        var isBold = !!cell.isInverse();
        if (isInverse) {
            var temp = fgColor;
            fgColor = bgColor;
            bgColor = temp;
            var temp2 = fgColorMode;
            fgColorMode = bgColorMode;
            bgColorMode = temp2;
        }
        var bgRgba = this._resolveBackgroundRgba(bgColorMode, bgColor, isInverse);
        var fgRgba = this._resolveForegroundRgba(fgColorMode, fgColor, isInverse, isBold);
        var result = Color_1.rgba.ensureContrastRatio(bgRgba, fgRgba, this._optionsService.options.minimumContrastRatio);
        if (!result) {
            this._colors.contrastCache.setColor(cell.bg, cell.fg, null);
            return undefined;
        }
        var color = {
            css: Color_1.channels.toCss((result >> 24) & 0xFF, (result >> 16) & 0xFF, (result >> 8) & 0xFF),
            rgba: result
        };
        this._colors.contrastCache.setColor(cell.bg, cell.fg, color);
        return color;
    };
    BaseRenderLayer.prototype._resolveBackgroundRgba = function (bgColorMode, bgColor, inverse) {
        switch (bgColorMode) {
            case Constants_1.Attributes.CM_P16:
            case Constants_1.Attributes.CM_P256:
                return this._colors.ansi[bgColor].rgba;
            case Constants_1.Attributes.CM_RGB:
                return bgColor << 8;
            case Constants_1.Attributes.CM_DEFAULT:
            default:
                if (inverse) {
                    return this._colors.foreground.rgba;
                }
                return this._colors.background.rgba;
        }
    };
    BaseRenderLayer.prototype._resolveForegroundRgba = function (fgColorMode, fgColor, inverse, bold) {
        switch (fgColorMode) {
            case Constants_1.Attributes.CM_P16:
            case Constants_1.Attributes.CM_P256:
                if (this._optionsService.options.drawBoldTextInBrightColors && bold && fgColor < 8) {
                    fgColor += 8;
                }
                return this._colors.ansi[fgColor].rgba;
            case Constants_1.Attributes.CM_RGB:
                return fgColor << 8;
            case Constants_1.Attributes.CM_DEFAULT:
            default:
                if (inverse) {
                    return this._colors.background.rgba;
                }
                return this._colors.foreground.rgba;
        }
    };
    return BaseRenderLayer;
}());
exports.BaseRenderLayer = BaseRenderLayer;
//# sourceMappingURL=BaseRenderLayer.js.map