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
exports.SelectionService = void 0;
var Browser = require("common/Platform");
var SelectionModel_1 = require("browser/selection/SelectionModel");
var CellData_1 = require("common/buffer/CellData");
var EventEmitter_1 = require("common/EventEmitter");
var Services_1 = require("browser/services/Services");
var Services_2 = require("common/services/Services");
var Mouse_1 = require("browser/input/Mouse");
var MoveToCell_1 = require("browser/input/MoveToCell");
var Lifecycle_1 = require("common/Lifecycle");
var BufferRange_1 = require("common/buffer/BufferRange");
var DRAG_SCROLL_MAX_THRESHOLD = 50;
var DRAG_SCROLL_MAX_SPEED = 15;
var DRAG_SCROLL_INTERVAL = 50;
var ALT_CLICK_MOVE_CURSOR_TIME = 500;
var NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
var ALL_NON_BREAKING_SPACE_REGEX = new RegExp(NON_BREAKING_SPACE_CHAR, 'g');
var SelectionService = (function (_super) {
    __extends(SelectionService, _super);
    function SelectionService(_element, _screenElement, _linkifier, _bufferService, _coreService, _mouseService, _optionsService, _renderService) {
        var _this = _super.call(this) || this;
        _this._element = _element;
        _this._screenElement = _screenElement;
        _this._linkifier = _linkifier;
        _this._bufferService = _bufferService;
        _this._coreService = _coreService;
        _this._mouseService = _mouseService;
        _this._optionsService = _optionsService;
        _this._renderService = _renderService;
        _this._dragScrollAmount = 0;
        _this._enabled = true;
        _this._workCell = new CellData_1.CellData();
        _this._mouseDownTimeStamp = 0;
        _this._oldHasSelection = false;
        _this._oldSelectionStart = undefined;
        _this._oldSelectionEnd = undefined;
        _this._onLinuxMouseSelection = _this.register(new EventEmitter_1.EventEmitter());
        _this._onRedrawRequest = _this.register(new EventEmitter_1.EventEmitter());
        _this._onSelectionChange = _this.register(new EventEmitter_1.EventEmitter());
        _this._onRequestScrollLines = _this.register(new EventEmitter_1.EventEmitter());
        _this._mouseMoveListener = function (event) { return _this._onMouseMove(event); };
        _this._mouseUpListener = function (event) { return _this._onMouseUp(event); };
        _this._coreService.onUserInput(function () {
            if (_this.hasSelection) {
                _this.clearSelection();
            }
        });
        _this._trimListener = _this._bufferService.buffer.lines.onTrim(function (amount) { return _this._onTrim(amount); });
        _this.register(_this._bufferService.buffers.onBufferActivate(function (e) { return _this._onBufferActivate(e); }));
        _this.enable();
        _this._model = new SelectionModel_1.SelectionModel(_this._bufferService);
        _this._activeSelectionMode = 0;
        return _this;
    }
    Object.defineProperty(SelectionService.prototype, "onLinuxMouseSelection", {
        get: function () { return this._onLinuxMouseSelection.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "onRequestRedraw", {
        get: function () { return this._onRedrawRequest.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "onSelectionChange", {
        get: function () { return this._onSelectionChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "onRequestScrollLines", {
        get: function () { return this._onRequestScrollLines.event; },
        enumerable: false,
        configurable: true
    });
    SelectionService.prototype.dispose = function () {
        this._removeMouseDownListeners();
    };
    SelectionService.prototype.reset = function () {
        this.clearSelection();
    };
    SelectionService.prototype.disable = function () {
        this.clearSelection();
        this._enabled = false;
    };
    SelectionService.prototype.enable = function () {
        this._enabled = true;
    };
    Object.defineProperty(SelectionService.prototype, "selectionStart", {
        get: function () { return this._model.finalSelectionStart; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "selectionEnd", {
        get: function () { return this._model.finalSelectionEnd; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "hasSelection", {
        get: function () {
            var start = this._model.finalSelectionStart;
            var end = this._model.finalSelectionEnd;
            if (!start || !end) {
                return false;
            }
            return start[0] !== end[0] || start[1] !== end[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "selectionText", {
        get: function () {
            var start = this._model.finalSelectionStart;
            var end = this._model.finalSelectionEnd;
            if (!start || !end) {
                return '';
            }
            var buffer = this._bufferService.buffer;
            var result = [];
            if (this._activeSelectionMode === 3) {
                if (start[0] === end[0]) {
                    return '';
                }
                for (var i = start[1]; i <= end[1]; i++) {
                    var lineText = buffer.translateBufferLineToString(i, true, start[0], end[0]);
                    result.push(lineText);
                }
            }
            else {
                var startRowEndCol = start[1] === end[1] ? end[0] : undefined;
                result.push(buffer.translateBufferLineToString(start[1], true, start[0], startRowEndCol));
                for (var i = start[1] + 1; i <= end[1] - 1; i++) {
                    var bufferLine = buffer.lines.get(i);
                    var lineText = buffer.translateBufferLineToString(i, true);
                    if (bufferLine && bufferLine.isWrapped) {
                        result[result.length - 1] += lineText;
                    }
                    else {
                        result.push(lineText);
                    }
                }
                if (start[1] !== end[1]) {
                    var bufferLine = buffer.lines.get(end[1]);
                    var lineText = buffer.translateBufferLineToString(end[1], true, 0, end[0]);
                    if (bufferLine && bufferLine.isWrapped) {
                        result[result.length - 1] += lineText;
                    }
                    else {
                        result.push(lineText);
                    }
                }
            }
            var formattedResult = result.map(function (line) {
                return line.replace(ALL_NON_BREAKING_SPACE_REGEX, ' ');
            }).join(Browser.isWindows ? '\r\n' : '\n');
            return formattedResult;
        },
        enumerable: false,
        configurable: true
    });
    SelectionService.prototype.clearSelection = function () {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype.refresh = function (isLinuxMouseSelection) {
        var _this = this;
        if (!this._refreshAnimationFrame) {
            this._refreshAnimationFrame = window.requestAnimationFrame(function () { return _this._refresh(); });
        }
        if (Browser.isLinux && isLinuxMouseSelection) {
            var selectionText = this.selectionText;
            if (selectionText.length) {
                this._onLinuxMouseSelection.fire(this.selectionText);
            }
        }
    };
    SelectionService.prototype._refresh = function () {
        this._refreshAnimationFrame = undefined;
        this._onRedrawRequest.fire({
            start: this._model.finalSelectionStart,
            end: this._model.finalSelectionEnd,
            columnSelectMode: this._activeSelectionMode === 3
        });
    };
    SelectionService.prototype._isClickInSelection = function (event) {
        var coords = this._getMouseBufferCoords(event);
        var start = this._model.finalSelectionStart;
        var end = this._model.finalSelectionEnd;
        if (!start || !end || !coords) {
            return false;
        }
        return this._areCoordsInSelection(coords, start, end);
    };
    SelectionService.prototype._areCoordsInSelection = function (coords, start, end) {
        return (coords[1] > start[1] && coords[1] < end[1]) ||
            (start[1] === end[1] && coords[1] === start[1] && coords[0] >= start[0] && coords[0] < end[0]) ||
            (start[1] < end[1] && coords[1] === end[1] && coords[0] < end[0]) ||
            (start[1] < end[1] && coords[1] === start[1] && coords[0] >= start[0]);
    };
    SelectionService.prototype._selectWordAtCursor = function (event, allowWhitespaceOnlySelection) {
        var _a, _b;
        var range = (_b = (_a = this._linkifier.currentLink) === null || _a === void 0 ? void 0 : _a.link) === null || _b === void 0 ? void 0 : _b.range;
        if (range) {
            this._model.selectionStart = [range.start.x - 1, range.start.y - 1];
            this._model.selectionStartLength = BufferRange_1.getRangeLength(range, this._bufferService.cols);
            this._model.selectionEnd = undefined;
            return true;
        }
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._selectWordAt(coords, allowWhitespaceOnlySelection);
            this._model.selectionEnd = undefined;
            return true;
        }
        return false;
    };
    SelectionService.prototype.selectAll = function () {
        this._model.isSelectAllActive = true;
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype.selectLines = function (start, end) {
        this._model.clearSelection();
        start = Math.max(start, 0);
        end = Math.min(end, this._bufferService.buffer.lines.length - 1);
        this._model.selectionStart = [0, start];
        this._model.selectionEnd = [this._bufferService.cols, end];
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype._onTrim = function (amount) {
        var needsRefresh = this._model.onTrim(amount);
        if (needsRefresh) {
            this.refresh();
        }
    };
    SelectionService.prototype._getMouseBufferCoords = function (event) {
        var coords = this._mouseService.getCoords(event, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
        if (!coords) {
            return undefined;
        }
        coords[0]--;
        coords[1]--;
        coords[1] += this._bufferService.buffer.ydisp;
        return coords;
    };
    SelectionService.prototype._getMouseEventScrollAmount = function (event) {
        var offset = Mouse_1.getCoordsRelativeToElement(event, this._screenElement)[1];
        var terminalHeight = this._renderService.dimensions.canvasHeight;
        if (offset >= 0 && offset <= terminalHeight) {
            return 0;
        }
        if (offset > terminalHeight) {
            offset -= terminalHeight;
        }
        offset = Math.min(Math.max(offset, -DRAG_SCROLL_MAX_THRESHOLD), DRAG_SCROLL_MAX_THRESHOLD);
        offset /= DRAG_SCROLL_MAX_THRESHOLD;
        return (offset / Math.abs(offset)) + Math.round(offset * (DRAG_SCROLL_MAX_SPEED - 1));
    };
    SelectionService.prototype.shouldForceSelection = function (event) {
        if (Browser.isMac) {
            return event.altKey && this._optionsService.options.macOptionClickForcesSelection;
        }
        return event.shiftKey;
    };
    SelectionService.prototype.onMouseDown = function (event) {
        this._mouseDownTimeStamp = event.timeStamp;
        if (event.button === 2 && this.hasSelection) {
            return;
        }
        if (event.button !== 0) {
            return;
        }
        if (!this._enabled) {
            if (!this.shouldForceSelection(event)) {
                return;
            }
            event.stopPropagation();
        }
        event.preventDefault();
        this._dragScrollAmount = 0;
        if (this._enabled && event.shiftKey) {
            this._onIncrementalClick(event);
        }
        else {
            if (event.detail === 1) {
                this._onSingleClick(event);
            }
            else if (event.detail === 2) {
                this._onDoubleClick(event);
            }
            else if (event.detail === 3) {
                this._onTripleClick(event);
            }
        }
        this._addMouseDownListeners();
        this.refresh(true);
    };
    SelectionService.prototype._addMouseDownListeners = function () {
        var _this = this;
        if (this._screenElement.ownerDocument) {
            this._screenElement.ownerDocument.addEventListener('mousemove', this._mouseMoveListener);
            this._screenElement.ownerDocument.addEventListener('mouseup', this._mouseUpListener);
        }
        this._dragScrollIntervalTimer = window.setInterval(function () { return _this._dragScroll(); }, DRAG_SCROLL_INTERVAL);
    };
    SelectionService.prototype._removeMouseDownListeners = function () {
        if (this._screenElement.ownerDocument) {
            this._screenElement.ownerDocument.removeEventListener('mousemove', this._mouseMoveListener);
            this._screenElement.ownerDocument.removeEventListener('mouseup', this._mouseUpListener);
        }
        clearInterval(this._dragScrollIntervalTimer);
        this._dragScrollIntervalTimer = undefined;
    };
    SelectionService.prototype._onIncrementalClick = function (event) {
        if (this._model.selectionStart) {
            this._model.selectionEnd = this._getMouseBufferCoords(event);
        }
    };
    SelectionService.prototype._onSingleClick = function (event) {
        this._model.selectionStartLength = 0;
        this._model.isSelectAllActive = false;
        this._activeSelectionMode = this.shouldColumnSelect(event) ? 3 : 0;
        this._model.selectionStart = this._getMouseBufferCoords(event);
        if (!this._model.selectionStart) {
            return;
        }
        this._model.selectionEnd = undefined;
        var line = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
        if (!line) {
            return;
        }
        if (line.length === this._model.selectionStart[0]) {
            return;
        }
        if (line.hasWidth(this._model.selectionStart[0]) === 0) {
            this._model.selectionStart[0]++;
        }
    };
    SelectionService.prototype._onDoubleClick = function (event) {
        if (this._selectWordAtCursor(event, true)) {
            this._activeSelectionMode = 1;
        }
    };
    SelectionService.prototype._onTripleClick = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._activeSelectionMode = 2;
            this._selectLineAt(coords[1]);
        }
    };
    SelectionService.prototype.shouldColumnSelect = function (event) {
        return event.altKey && !(Browser.isMac && this._optionsService.options.macOptionClickForcesSelection);
    };
    SelectionService.prototype._onMouseMove = function (event) {
        event.stopImmediatePropagation();
        if (!this._model.selectionStart) {
            return;
        }
        var previousSelectionEnd = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
        this._model.selectionEnd = this._getMouseBufferCoords(event);
        if (!this._model.selectionEnd) {
            this.refresh(true);
            return;
        }
        if (this._activeSelectionMode === 2) {
            if (this._model.selectionEnd[1] < this._model.selectionStart[1]) {
                this._model.selectionEnd[0] = 0;
            }
            else {
                this._model.selectionEnd[0] = this._bufferService.cols;
            }
        }
        else if (this._activeSelectionMode === 1) {
            this._selectToWordAt(this._model.selectionEnd);
        }
        this._dragScrollAmount = this._getMouseEventScrollAmount(event);
        if (this._activeSelectionMode !== 3) {
            if (this._dragScrollAmount > 0) {
                this._model.selectionEnd[0] = this._bufferService.cols;
            }
            else if (this._dragScrollAmount < 0) {
                this._model.selectionEnd[0] = 0;
            }
        }
        var buffer = this._bufferService.buffer;
        if (this._model.selectionEnd[1] < buffer.lines.length) {
            var line = buffer.lines.get(this._model.selectionEnd[1]);
            if (line && line.hasWidth(this._model.selectionEnd[0]) === 0) {
                this._model.selectionEnd[0]++;
            }
        }
        if (!previousSelectionEnd ||
            previousSelectionEnd[0] !== this._model.selectionEnd[0] ||
            previousSelectionEnd[1] !== this._model.selectionEnd[1]) {
            this.refresh(true);
        }
    };
    SelectionService.prototype._dragScroll = function () {
        if (!this._model.selectionEnd || !this._model.selectionStart) {
            return;
        }
        if (this._dragScrollAmount) {
            this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
            var buffer = this._bufferService.buffer;
            if (this._dragScrollAmount > 0) {
                if (this._activeSelectionMode !== 3) {
                    this._model.selectionEnd[0] = this._bufferService.cols;
                }
                this._model.selectionEnd[1] = Math.min(buffer.ydisp + this._bufferService.rows, buffer.lines.length - 1);
            }
            else {
                if (this._activeSelectionMode !== 3) {
                    this._model.selectionEnd[0] = 0;
                }
                this._model.selectionEnd[1] = buffer.ydisp;
            }
            this.refresh();
        }
    };
    SelectionService.prototype._onMouseUp = function (event) {
        var timeElapsed = event.timeStamp - this._mouseDownTimeStamp;
        this._removeMouseDownListeners();
        if (this.selectionText.length <= 1 && timeElapsed < ALT_CLICK_MOVE_CURSOR_TIME && event.altKey && this._optionsService.getOption('altClickMovesCursor')) {
            if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
                var coordinates = this._mouseService.getCoords(event, this._element, this._bufferService.cols, this._bufferService.rows, false);
                if (coordinates && coordinates[0] !== undefined && coordinates[1] !== undefined) {
                    var sequence = MoveToCell_1.moveToCellSequence(coordinates[0] - 1, coordinates[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
                    this._coreService.triggerDataEvent(sequence, true);
                }
            }
        }
        else {
            this._fireEventIfSelectionChanged();
        }
    };
    SelectionService.prototype._fireEventIfSelectionChanged = function () {
        var start = this._model.finalSelectionStart;
        var end = this._model.finalSelectionEnd;
        var hasSelection = !!start && !!end && (start[0] !== end[0] || start[1] !== end[1]);
        if (!hasSelection) {
            if (this._oldHasSelection) {
                this._fireOnSelectionChange(start, end, hasSelection);
            }
            return;
        }
        if (!start || !end) {
            return;
        }
        if (!this._oldSelectionStart || !this._oldSelectionEnd || (start[0] !== this._oldSelectionStart[0] || start[1] !== this._oldSelectionStart[1] ||
            end[0] !== this._oldSelectionEnd[0] || end[1] !== this._oldSelectionEnd[1])) {
            this._fireOnSelectionChange(start, end, hasSelection);
        }
    };
    SelectionService.prototype._fireOnSelectionChange = function (start, end, hasSelection) {
        this._oldSelectionStart = start;
        this._oldSelectionEnd = end;
        this._oldHasSelection = hasSelection;
        this._onSelectionChange.fire();
    };
    SelectionService.prototype._onBufferActivate = function (e) {
        var _this = this;
        this.clearSelection();
        this._trimListener.dispose();
        this._trimListener = e.activeBuffer.lines.onTrim(function (amount) { return _this._onTrim(amount); });
    };
    SelectionService.prototype._convertViewportColToCharacterIndex = function (bufferLine, coords) {
        var charIndex = coords[0];
        for (var i = 0; coords[0] >= i; i++) {
            var length_1 = bufferLine.loadCell(i, this._workCell).getChars().length;
            if (this._workCell.getWidth() === 0) {
                charIndex--;
            }
            else if (length_1 > 1 && coords[0] !== i) {
                charIndex += length_1 - 1;
            }
        }
        return charIndex;
    };
    SelectionService.prototype.setSelection = function (col, row, length) {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this._model.selectionStart = [col, row];
        this._model.selectionStartLength = length;
        this.refresh();
    };
    SelectionService.prototype.rightClickSelect = function (ev) {
        if (!this._isClickInSelection(ev)) {
            if (this._selectWordAtCursor(ev, false)) {
                this.refresh(true);
            }
            this._fireEventIfSelectionChanged();
        }
    };
    SelectionService.prototype._getWordAt = function (coords, allowWhitespaceOnlySelection, followWrappedLinesAbove, followWrappedLinesBelow) {
        if (followWrappedLinesAbove === void 0) { followWrappedLinesAbove = true; }
        if (followWrappedLinesBelow === void 0) { followWrappedLinesBelow = true; }
        if (coords[0] >= this._bufferService.cols) {
            return undefined;
        }
        var buffer = this._bufferService.buffer;
        var bufferLine = buffer.lines.get(coords[1]);
        if (!bufferLine) {
            return undefined;
        }
        var line = buffer.translateBufferLineToString(coords[1], false);
        var startIndex = this._convertViewportColToCharacterIndex(bufferLine, coords);
        var endIndex = startIndex;
        var charOffset = coords[0] - startIndex;
        var leftWideCharCount = 0;
        var rightWideCharCount = 0;
        var leftLongCharOffset = 0;
        var rightLongCharOffset = 0;
        if (line.charAt(startIndex) === ' ') {
            while (startIndex > 0 && line.charAt(startIndex - 1) === ' ') {
                startIndex--;
            }
            while (endIndex < line.length && line.charAt(endIndex + 1) === ' ') {
                endIndex++;
            }
        }
        else {
            var startCol = coords[0];
            var endCol = coords[0];
            if (bufferLine.getWidth(startCol) === 0) {
                leftWideCharCount++;
                startCol--;
            }
            if (bufferLine.getWidth(endCol) === 2) {
                rightWideCharCount++;
                endCol++;
            }
            var length_2 = bufferLine.getString(endCol).length;
            if (length_2 > 1) {
                rightLongCharOffset += length_2 - 1;
                endIndex += length_2 - 1;
            }
            while (startCol > 0 && startIndex > 0 && !this._isCharWordSeparator(bufferLine.loadCell(startCol - 1, this._workCell))) {
                bufferLine.loadCell(startCol - 1, this._workCell);
                var length_3 = this._workCell.getChars().length;
                if (this._workCell.getWidth() === 0) {
                    leftWideCharCount++;
                    startCol--;
                }
                else if (length_3 > 1) {
                    leftLongCharOffset += length_3 - 1;
                    startIndex -= length_3 - 1;
                }
                startIndex--;
                startCol--;
            }
            while (endCol < bufferLine.length && endIndex + 1 < line.length && !this._isCharWordSeparator(bufferLine.loadCell(endCol + 1, this._workCell))) {
                bufferLine.loadCell(endCol + 1, this._workCell);
                var length_4 = this._workCell.getChars().length;
                if (this._workCell.getWidth() === 2) {
                    rightWideCharCount++;
                    endCol++;
                }
                else if (length_4 > 1) {
                    rightLongCharOffset += length_4 - 1;
                    endIndex += length_4 - 1;
                }
                endIndex++;
                endCol++;
            }
        }
        endIndex++;
        var start = startIndex
            + charOffset
            - leftWideCharCount
            + leftLongCharOffset;
        var length = Math.min(this._bufferService.cols, endIndex
            - startIndex
            + leftWideCharCount
            + rightWideCharCount
            - leftLongCharOffset
            - rightLongCharOffset);
        if (!allowWhitespaceOnlySelection && line.slice(startIndex, endIndex).trim() === '') {
            return undefined;
        }
        if (followWrappedLinesAbove) {
            if (start === 0 && bufferLine.getCodePoint(0) !== 32) {
                var previousBufferLine = buffer.lines.get(coords[1] - 1);
                if (previousBufferLine && bufferLine.isWrapped && previousBufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
                    var previousLineWordPosition = this._getWordAt([this._bufferService.cols - 1, coords[1] - 1], false, true, false);
                    if (previousLineWordPosition) {
                        var offset = this._bufferService.cols - previousLineWordPosition.start;
                        start -= offset;
                        length += offset;
                    }
                }
            }
        }
        if (followWrappedLinesBelow) {
            if (start + length === this._bufferService.cols && bufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
                var nextBufferLine = buffer.lines.get(coords[1] + 1);
                if (nextBufferLine && nextBufferLine.isWrapped && nextBufferLine.getCodePoint(0) !== 32) {
                    var nextLineWordPosition = this._getWordAt([0, coords[1] + 1], false, false, true);
                    if (nextLineWordPosition) {
                        length += nextLineWordPosition.length;
                    }
                }
            }
        }
        return { start: start, length: length };
    };
    SelectionService.prototype._selectWordAt = function (coords, allowWhitespaceOnlySelection) {
        var wordPosition = this._getWordAt(coords, allowWhitespaceOnlySelection);
        if (wordPosition) {
            while (wordPosition.start < 0) {
                wordPosition.start += this._bufferService.cols;
                coords[1]--;
            }
            this._model.selectionStart = [wordPosition.start, coords[1]];
            this._model.selectionStartLength = wordPosition.length;
        }
    };
    SelectionService.prototype._selectToWordAt = function (coords) {
        var wordPosition = this._getWordAt(coords, true);
        if (wordPosition) {
            var endRow = coords[1];
            while (wordPosition.start < 0) {
                wordPosition.start += this._bufferService.cols;
                endRow--;
            }
            if (!this._model.areSelectionValuesReversed()) {
                while (wordPosition.start + wordPosition.length > this._bufferService.cols) {
                    wordPosition.length -= this._bufferService.cols;
                    endRow++;
                }
            }
            this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? wordPosition.start : wordPosition.start + wordPosition.length, endRow];
        }
    };
    SelectionService.prototype._isCharWordSeparator = function (cell) {
        if (cell.getWidth() === 0) {
            return false;
        }
        return this._optionsService.options.wordSeparator.indexOf(cell.getChars()) >= 0;
    };
    SelectionService.prototype._selectLineAt = function (line) {
        var wrappedRange = this._bufferService.buffer.getWrappedRangeForLine(line);
        this._model.selectionStart = [0, wrappedRange.first];
        this._model.selectionEnd = [this._bufferService.cols, wrappedRange.last];
        this._model.selectionStartLength = 0;
    };
    SelectionService = __decorate([
        __param(3, Services_2.IBufferService),
        __param(4, Services_2.ICoreService),
        __param(5, Services_1.IMouseService),
        __param(6, Services_2.IOptionsService),
        __param(7, Services_1.IRenderService)
    ], SelectionService);
    return SelectionService;
}(Lifecycle_1.Disposable));
exports.SelectionService = SelectionService;
//# sourceMappingURL=SelectionService.js.map