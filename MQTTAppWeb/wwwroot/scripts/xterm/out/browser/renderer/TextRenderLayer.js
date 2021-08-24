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
exports.TextRenderLayer = void 0;
var GridCache_1 = require("browser/renderer/GridCache");
var BaseRenderLayer_1 = require("browser/renderer/BaseRenderLayer");
var AttributeData_1 = require("common/buffer/AttributeData");
var Constants_1 = require("common/buffer/Constants");
var CellData_1 = require("common/buffer/CellData");
var Services_1 = require("common/services/Services");
var Services_2 = require("browser/services/Services");
var CharacterJoinerService_1 = require("browser/services/CharacterJoinerService");
var TextRenderLayer = (function (_super) {
    __extends(TextRenderLayer, _super);
    function TextRenderLayer(container, zIndex, colors, alpha, rendererId, bufferService, optionsService, _characterJoinerService) {
        var _this = _super.call(this, container, 'text', zIndex, alpha, colors, rendererId, bufferService, optionsService) || this;
        _this._characterJoinerService = _characterJoinerService;
        _this._characterWidth = 0;
        _this._characterFont = '';
        _this._characterOverlapCache = {};
        _this._workCell = new CellData_1.CellData();
        _this._state = new GridCache_1.GridCache();
        return _this;
    }
    TextRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        var terminalFont = this._getFont(false, false);
        if (this._characterWidth !== dim.scaledCharWidth || this._characterFont !== terminalFont) {
            this._characterWidth = dim.scaledCharWidth;
            this._characterFont = terminalFont;
            this._characterOverlapCache = {};
        }
        this._state.clear();
        this._state.resize(this._bufferService.cols, this._bufferService.rows);
    };
    TextRenderLayer.prototype.reset = function () {
        this._state.clear();
        this._clearAll();
    };
    TextRenderLayer.prototype._forEachCell = function (firstRow, lastRow, callback) {
        for (var y = firstRow; y <= lastRow; y++) {
            var row = y + this._bufferService.buffer.ydisp;
            var line = this._bufferService.buffer.lines.get(row);
            var joinedRanges = this._characterJoinerService.getJoinedCharacters(row);
            for (var x = 0; x < this._bufferService.cols; x++) {
                line.loadCell(x, this._workCell);
                var cell = this._workCell;
                var isJoined = false;
                var lastCharX = x;
                if (cell.getWidth() === 0) {
                    continue;
                }
                if (joinedRanges.length > 0 && x === joinedRanges[0][0]) {
                    isJoined = true;
                    var range = joinedRanges.shift();
                    cell = new CharacterJoinerService_1.JoinedCellData(this._workCell, line.translateToString(true, range[0], range[1]), range[1] - range[0]);
                    lastCharX = range[1] - 1;
                }
                if (!isJoined && this._isOverlapping(cell)) {
                    if (lastCharX < line.length - 1 && line.getCodePoint(lastCharX + 1) === Constants_1.NULL_CELL_CODE) {
                        cell.content &= ~Constants_1.Content.WIDTH_MASK;
                        cell.content |= 2 << Constants_1.Content.WIDTH_SHIFT;
                    }
                }
                callback(cell, x, y);
                x = lastCharX;
            }
        }
    };
    TextRenderLayer.prototype._drawBackground = function (firstRow, lastRow) {
        var _this = this;
        var ctx = this._ctx;
        var cols = this._bufferService.cols;
        var startX = 0;
        var startY = 0;
        var prevFillStyle = null;
        ctx.save();
        this._forEachCell(firstRow, lastRow, function (cell, x, y) {
            var nextFillStyle = null;
            if (cell.isInverse()) {
                if (cell.isFgDefault()) {
                    nextFillStyle = _this._colors.foreground.css;
                }
                else if (cell.isFgRGB()) {
                    nextFillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
                }
                else {
                    nextFillStyle = _this._colors.ansi[cell.getFgColor()].css;
                }
            }
            else if (cell.isBgRGB()) {
                nextFillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
            }
            else if (cell.isBgPalette()) {
                nextFillStyle = _this._colors.ansi[cell.getBgColor()].css;
            }
            if (prevFillStyle === null) {
                startX = x;
                startY = y;
            }
            if (y !== startY) {
                ctx.fillStyle = prevFillStyle || '';
                _this._fillCells(startX, startY, cols - startX, 1);
                startX = x;
                startY = y;
            }
            else if (prevFillStyle !== nextFillStyle) {
                ctx.fillStyle = prevFillStyle || '';
                _this._fillCells(startX, startY, x - startX, 1);
                startX = x;
                startY = y;
            }
            prevFillStyle = nextFillStyle;
        });
        if (prevFillStyle !== null) {
            ctx.fillStyle = prevFillStyle;
            this._fillCells(startX, startY, cols - startX, 1);
        }
        ctx.restore();
    };
    TextRenderLayer.prototype._drawForeground = function (firstRow, lastRow) {
        var _this = this;
        this._forEachCell(firstRow, lastRow, function (cell, x, y) {
            if (cell.isInvisible()) {
                return;
            }
            _this._drawChars(cell, x, y);
            if (cell.isUnderline()) {
                _this._ctx.save();
                if (cell.isInverse()) {
                    if (cell.isBgDefault()) {
                        _this._ctx.fillStyle = _this._colors.background.css;
                    }
                    else if (cell.isBgRGB()) {
                        _this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
                    }
                    else {
                        var bg = cell.getBgColor();
                        if (_this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && bg < 8) {
                            bg += 8;
                        }
                        _this._ctx.fillStyle = _this._colors.ansi[bg].css;
                    }
                }
                else {
                    if (cell.isFgDefault()) {
                        _this._ctx.fillStyle = _this._colors.foreground.css;
                    }
                    else if (cell.isFgRGB()) {
                        _this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
                    }
                    else {
                        var fg = cell.getFgColor();
                        if (_this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                            fg += 8;
                        }
                        _this._ctx.fillStyle = _this._colors.ansi[fg].css;
                    }
                }
                _this._fillBottomLineAtCells(x, y, cell.getWidth());
                _this._ctx.restore();
            }
        });
    };
    TextRenderLayer.prototype.onGridChanged = function (firstRow, lastRow) {
        if (this._state.cache.length === 0) {
            return;
        }
        if (this._charAtlas) {
            this._charAtlas.beginFrame();
        }
        this._clearCells(0, firstRow, this._bufferService.cols, lastRow - firstRow + 1);
        this._drawBackground(firstRow, lastRow);
        this._drawForeground(firstRow, lastRow);
    };
    TextRenderLayer.prototype.onOptionsChanged = function () {
        this._setTransparency(this._optionsService.options.allowTransparency);
    };
    TextRenderLayer.prototype._isOverlapping = function (cell) {
        if (cell.getWidth() !== 1) {
            return false;
        }
        if (cell.getCode() < 256) {
            return false;
        }
        var chars = cell.getChars();
        if (this._characterOverlapCache.hasOwnProperty(chars)) {
            return this._characterOverlapCache[chars];
        }
        this._ctx.save();
        this._ctx.font = this._characterFont;
        var overlaps = Math.floor(this._ctx.measureText(chars).width) > this._characterWidth;
        this._ctx.restore();
        this._characterOverlapCache[chars] = overlaps;
        return overlaps;
    };
    TextRenderLayer = __decorate([
        __param(5, Services_1.IBufferService),
        __param(6, Services_1.IOptionsService),
        __param(7, Services_2.ICharacterJoinerService)
    ], TextRenderLayer);
    return TextRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.TextRenderLayer = TextRenderLayer;
//# sourceMappingURL=TextRenderLayer.js.map