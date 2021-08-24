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
exports.DomRendererRowFactory = exports.CURSOR_STYLE_UNDERLINE_CLASS = exports.CURSOR_STYLE_BAR_CLASS = exports.CURSOR_STYLE_BLOCK_CLASS = exports.CURSOR_BLINK_CLASS = exports.CURSOR_CLASS = exports.UNDERLINE_CLASS = exports.ITALIC_CLASS = exports.DIM_CLASS = exports.BOLD_CLASS = void 0;
var Constants_1 = require("browser/renderer/atlas/Constants");
var Constants_2 = require("common/buffer/Constants");
var CellData_1 = require("common/buffer/CellData");
var Services_1 = require("common/services/Services");
var Color_1 = require("browser/Color");
var Services_2 = require("browser/services/Services");
var CharacterJoinerService_1 = require("browser/services/CharacterJoinerService");
exports.BOLD_CLASS = 'xterm-bold';
exports.DIM_CLASS = 'xterm-dim';
exports.ITALIC_CLASS = 'xterm-italic';
exports.UNDERLINE_CLASS = 'xterm-underline';
exports.CURSOR_CLASS = 'xterm-cursor';
exports.CURSOR_BLINK_CLASS = 'xterm-cursor-blink';
exports.CURSOR_STYLE_BLOCK_CLASS = 'xterm-cursor-block';
exports.CURSOR_STYLE_BAR_CLASS = 'xterm-cursor-bar';
exports.CURSOR_STYLE_UNDERLINE_CLASS = 'xterm-cursor-underline';
var DomRendererRowFactory = (function () {
    function DomRendererRowFactory(_document, _colors, _characterJoinerService, _optionsService) {
        this._document = _document;
        this._colors = _colors;
        this._characterJoinerService = _characterJoinerService;
        this._optionsService = _optionsService;
        this._workCell = new CellData_1.CellData();
    }
    DomRendererRowFactory.prototype.setColors = function (colors) {
        this._colors = colors;
    };
    DomRendererRowFactory.prototype.createRow = function (lineData, row, isCursorRow, cursorStyle, cursorX, cursorBlink, cellWidth, cols) {
        var fragment = this._document.createDocumentFragment();
        var joinedRanges = this._characterJoinerService.getJoinedCharacters(row);
        var lineLength = 0;
        for (var x = Math.min(lineData.length, cols) - 1; x >= 0; x--) {
            if (lineData.loadCell(x, this._workCell).getCode() !== Constants_2.NULL_CELL_CODE || (isCursorRow && x === cursorX)) {
                lineLength = x + 1;
                break;
            }
        }
        for (var x = 0; x < lineLength; x++) {
            lineData.loadCell(x, this._workCell);
            var width = this._workCell.getWidth();
            if (width === 0) {
                continue;
            }
            var isJoined = false;
            var lastCharX = x;
            var cell = this._workCell;
            if (joinedRanges.length > 0 && x === joinedRanges[0][0]) {
                isJoined = true;
                var range = joinedRanges.shift();
                cell = new CharacterJoinerService_1.JoinedCellData(this._workCell, lineData.translateToString(true, range[0], range[1]), range[1] - range[0]);
                lastCharX = range[1] - 1;
                width = cell.getWidth();
            }
            var charElement = this._document.createElement('span');
            if (width > 1) {
                charElement.style.width = cellWidth * width + "px";
            }
            if (isJoined) {
                charElement.style.display = 'inline';
                if (cursorX >= x && cursorX <= lastCharX) {
                    cursorX = x;
                }
            }
            if (isCursorRow && x === cursorX) {
                charElement.classList.add(exports.CURSOR_CLASS);
                if (cursorBlink) {
                    charElement.classList.add(exports.CURSOR_BLINK_CLASS);
                }
                switch (cursorStyle) {
                    case 'bar':
                        charElement.classList.add(exports.CURSOR_STYLE_BAR_CLASS);
                        break;
                    case 'underline':
                        charElement.classList.add(exports.CURSOR_STYLE_UNDERLINE_CLASS);
                        break;
                    default:
                        charElement.classList.add(exports.CURSOR_STYLE_BLOCK_CLASS);
                        break;
                }
            }
            if (cell.isBold()) {
                charElement.classList.add(exports.BOLD_CLASS);
            }
            if (cell.isItalic()) {
                charElement.classList.add(exports.ITALIC_CLASS);
            }
            if (cell.isDim()) {
                charElement.classList.add(exports.DIM_CLASS);
            }
            if (cell.isUnderline()) {
                charElement.classList.add(exports.UNDERLINE_CLASS);
            }
            if (cell.isInvisible()) {
                charElement.textContent = Constants_2.WHITESPACE_CELL_CHAR;
            }
            else {
                charElement.textContent = cell.getChars() || Constants_2.WHITESPACE_CELL_CHAR;
            }
            var fg = cell.getFgColor();
            var fgColorMode = cell.getFgColorMode();
            var bg = cell.getBgColor();
            var bgColorMode = cell.getBgColorMode();
            var isInverse = !!cell.isInverse();
            if (isInverse) {
                var temp = fg;
                fg = bg;
                bg = temp;
                var temp2 = fgColorMode;
                fgColorMode = bgColorMode;
                bgColorMode = temp2;
            }
            switch (fgColorMode) {
                case Constants_2.Attributes.CM_P16:
                case Constants_2.Attributes.CM_P256:
                    if (cell.isBold() && fg < 8 && this._optionsService.options.drawBoldTextInBrightColors) {
                        fg += 8;
                    }
                    if (!this._applyMinimumContrast(charElement, this._colors.background, this._colors.ansi[fg])) {
                        charElement.classList.add("xterm-fg-" + fg);
                    }
                    break;
                case Constants_2.Attributes.CM_RGB:
                    var color_1 = Color_1.rgba.toColor((fg >> 16) & 0xFF, (fg >> 8) & 0xFF, (fg) & 0xFF);
                    if (!this._applyMinimumContrast(charElement, this._colors.background, color_1)) {
                        this._addStyle(charElement, "color:#" + padStart(fg.toString(16), '0', 6));
                    }
                    break;
                case Constants_2.Attributes.CM_DEFAULT:
                default:
                    if (!this._applyMinimumContrast(charElement, this._colors.background, this._colors.foreground)) {
                        if (isInverse) {
                            charElement.classList.add("xterm-fg-" + Constants_1.INVERTED_DEFAULT_COLOR);
                        }
                    }
            }
            switch (bgColorMode) {
                case Constants_2.Attributes.CM_P16:
                case Constants_2.Attributes.CM_P256:
                    charElement.classList.add("xterm-bg-" + bg);
                    break;
                case Constants_2.Attributes.CM_RGB:
                    this._addStyle(charElement, "background-color:#" + padStart(bg.toString(16), '0', 6));
                    break;
                case Constants_2.Attributes.CM_DEFAULT:
                default:
                    if (isInverse) {
                        charElement.classList.add("xterm-bg-" + Constants_1.INVERTED_DEFAULT_COLOR);
                    }
            }
            fragment.appendChild(charElement);
            x = lastCharX;
        }
        return fragment;
    };
    DomRendererRowFactory.prototype._applyMinimumContrast = function (element, bg, fg) {
        if (this._optionsService.options.minimumContrastRatio === 1) {
            return false;
        }
        var adjustedColor = this._colors.contrastCache.getColor(this._workCell.bg, this._workCell.fg);
        if (adjustedColor === undefined) {
            adjustedColor = Color_1.color.ensureContrastRatio(bg, fg, this._optionsService.options.minimumContrastRatio);
            this._colors.contrastCache.setColor(this._workCell.bg, this._workCell.fg, adjustedColor !== null && adjustedColor !== void 0 ? adjustedColor : null);
        }
        if (adjustedColor) {
            this._addStyle(element, "color:" + adjustedColor.css);
            return true;
        }
        return false;
    };
    DomRendererRowFactory.prototype._addStyle = function (element, style) {
        element.setAttribute('style', "" + (element.getAttribute('style') || '') + style + ";");
    };
    DomRendererRowFactory = __decorate([
        __param(2, Services_2.ICharacterJoinerService),
        __param(3, Services_1.IOptionsService)
    ], DomRendererRowFactory);
    return DomRendererRowFactory;
}());
exports.DomRendererRowFactory = DomRendererRowFactory;
function padStart(text, padChar, length) {
    while (text.length < length) {
        text = padChar + text;
    }
    return text;
}
//# sourceMappingURL=DomRendererRowFactory.js.map