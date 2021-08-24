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
exports.MouseZone = exports.Linkifier = void 0;
var EventEmitter_1 = require("common/EventEmitter");
var Services_1 = require("common/services/Services");
var OVERSCAN_CHAR_LIMIT = 2000;
var Linkifier = (function () {
    function Linkifier(_bufferService, _logService, _unicodeService) {
        this._bufferService = _bufferService;
        this._logService = _logService;
        this._unicodeService = _unicodeService;
        this._linkMatchers = [];
        this._nextLinkMatcherId = 0;
        this._onShowLinkUnderline = new EventEmitter_1.EventEmitter();
        this._onHideLinkUnderline = new EventEmitter_1.EventEmitter();
        this._onLinkTooltip = new EventEmitter_1.EventEmitter();
        this._rowsToLinkify = {
            start: undefined,
            end: undefined
        };
    }
    Object.defineProperty(Linkifier.prototype, "onShowLinkUnderline", {
        get: function () { return this._onShowLinkUnderline.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Linkifier.prototype, "onHideLinkUnderline", {
        get: function () { return this._onHideLinkUnderline.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Linkifier.prototype, "onLinkTooltip", {
        get: function () { return this._onLinkTooltip.event; },
        enumerable: false,
        configurable: true
    });
    Linkifier.prototype.attachToDom = function (element, mouseZoneManager) {
        this._element = element;
        this._mouseZoneManager = mouseZoneManager;
    };
    Linkifier.prototype.linkifyRows = function (start, end) {
        var _this = this;
        if (!this._mouseZoneManager) {
            return;
        }
        if (this._rowsToLinkify.start === undefined || this._rowsToLinkify.end === undefined) {
            this._rowsToLinkify.start = start;
            this._rowsToLinkify.end = end;
        }
        else {
            this._rowsToLinkify.start = Math.min(this._rowsToLinkify.start, start);
            this._rowsToLinkify.end = Math.max(this._rowsToLinkify.end, end);
        }
        this._mouseZoneManager.clearAll(start, end);
        if (this._rowsTimeoutId) {
            clearTimeout(this._rowsTimeoutId);
        }
        this._rowsTimeoutId = setTimeout(function () { return _this._linkifyRows(); }, Linkifier._timeBeforeLatency);
    };
    Linkifier.prototype._linkifyRows = function () {
        this._rowsTimeoutId = undefined;
        var buffer = this._bufferService.buffer;
        if (this._rowsToLinkify.start === undefined || this._rowsToLinkify.end === undefined) {
            this._logService.debug('_rowToLinkify was unset before _linkifyRows was called');
            return;
        }
        var absoluteRowIndexStart = buffer.ydisp + this._rowsToLinkify.start;
        if (absoluteRowIndexStart >= buffer.lines.length) {
            return;
        }
        var absoluteRowIndexEnd = buffer.ydisp + Math.min(this._rowsToLinkify.end, this._bufferService.rows) + 1;
        var overscanLineLimit = Math.ceil(OVERSCAN_CHAR_LIMIT / this._bufferService.cols);
        var iterator = this._bufferService.buffer.iterator(false, absoluteRowIndexStart, absoluteRowIndexEnd, overscanLineLimit, overscanLineLimit);
        while (iterator.hasNext()) {
            var lineData = iterator.next();
            for (var i = 0; i < this._linkMatchers.length; i++) {
                this._doLinkifyRow(lineData.range.first, lineData.content, this._linkMatchers[i]);
            }
        }
        this._rowsToLinkify.start = undefined;
        this._rowsToLinkify.end = undefined;
    };
    Linkifier.prototype.registerLinkMatcher = function (regex, handler, options) {
        if (options === void 0) { options = {}; }
        if (!handler) {
            throw new Error('handler must be defined');
        }
        var matcher = {
            id: this._nextLinkMatcherId++,
            regex: regex,
            handler: handler,
            matchIndex: options.matchIndex,
            validationCallback: options.validationCallback,
            hoverTooltipCallback: options.tooltipCallback,
            hoverLeaveCallback: options.leaveCallback,
            willLinkActivate: options.willLinkActivate,
            priority: options.priority || 0
        };
        this._addLinkMatcherToList(matcher);
        return matcher.id;
    };
    Linkifier.prototype._addLinkMatcherToList = function (matcher) {
        if (this._linkMatchers.length === 0) {
            this._linkMatchers.push(matcher);
            return;
        }
        for (var i = this._linkMatchers.length - 1; i >= 0; i--) {
            if (matcher.priority <= this._linkMatchers[i].priority) {
                this._linkMatchers.splice(i + 1, 0, matcher);
                return;
            }
        }
        this._linkMatchers.splice(0, 0, matcher);
    };
    Linkifier.prototype.deregisterLinkMatcher = function (matcherId) {
        for (var i = 0; i < this._linkMatchers.length; i++) {
            if (this._linkMatchers[i].id === matcherId) {
                this._linkMatchers.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Linkifier.prototype._doLinkifyRow = function (rowIndex, text, matcher) {
        var _this = this;
        var rex = new RegExp(matcher.regex.source, (matcher.regex.flags || '') + 'g');
        var match;
        var stringIndex = -1;
        var _loop_1 = function () {
            var uri = match[typeof matcher.matchIndex !== 'number' ? 0 : matcher.matchIndex];
            if (!uri) {
                this_1._logService.debug('match found without corresponding matchIndex', match, matcher);
                return "break";
            }
            stringIndex = text.indexOf(uri, stringIndex + 1);
            rex.lastIndex = stringIndex + uri.length;
            if (stringIndex < 0) {
                return "break";
            }
            var bufferIndex = this_1._bufferService.buffer.stringIndexToBufferIndex(rowIndex, stringIndex);
            if (bufferIndex[0] < 0) {
                return "break";
            }
            var line = this_1._bufferService.buffer.lines.get(bufferIndex[0]);
            if (!line) {
                return "break";
            }
            var attr = line.getFg(bufferIndex[1]);
            var fg = attr ? (attr >> 9) & 0x1ff : undefined;
            if (matcher.validationCallback) {
                matcher.validationCallback(uri, function (isValid) {
                    if (_this._rowsTimeoutId) {
                        return;
                    }
                    if (isValid) {
                        _this._addLink(bufferIndex[1], bufferIndex[0] - _this._bufferService.buffer.ydisp, uri, matcher, fg);
                    }
                });
            }
            else {
                this_1._addLink(bufferIndex[1], bufferIndex[0] - this_1._bufferService.buffer.ydisp, uri, matcher, fg);
            }
        };
        var this_1 = this;
        while ((match = rex.exec(text)) !== null) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
    };
    Linkifier.prototype._addLink = function (x, y, uri, matcher, fg) {
        var _this = this;
        if (!this._mouseZoneManager || !this._element) {
            return;
        }
        var width = this._unicodeService.getStringCellWidth(uri);
        var x1 = x % this._bufferService.cols;
        var y1 = y + Math.floor(x / this._bufferService.cols);
        var x2 = (x1 + width) % this._bufferService.cols;
        var y2 = y1 + Math.floor((x1 + width) / this._bufferService.cols);
        if (x2 === 0) {
            x2 = this._bufferService.cols;
            y2--;
        }
        this._mouseZoneManager.add(new MouseZone(x1 + 1, y1 + 1, x2 + 1, y2 + 1, function (e) {
            if (matcher.handler) {
                return matcher.handler(e, uri);
            }
            var newWindow = window.open();
            if (newWindow) {
                newWindow.opener = null;
                newWindow.location.href = uri;
            }
            else {
                console.warn('Opening link blocked as opener could not be cleared');
            }
        }, function () {
            _this._onShowLinkUnderline.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            _this._element.classList.add('xterm-cursor-pointer');
        }, function (e) {
            _this._onLinkTooltip.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            if (matcher.hoverTooltipCallback) {
                matcher.hoverTooltipCallback(e, uri, { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } });
            }
        }, function () {
            _this._onHideLinkUnderline.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            _this._element.classList.remove('xterm-cursor-pointer');
            if (matcher.hoverLeaveCallback) {
                matcher.hoverLeaveCallback();
            }
        }, function (e) {
            if (matcher.willLinkActivate) {
                return matcher.willLinkActivate(e, uri);
            }
            return true;
        }));
    };
    Linkifier.prototype._createLinkHoverEvent = function (x1, y1, x2, y2, fg) {
        return { x1: x1, y1: y1, x2: x2, y2: y2, cols: this._bufferService.cols, fg: fg };
    };
    Linkifier._timeBeforeLatency = 200;
    Linkifier = __decorate([
        __param(0, Services_1.IBufferService),
        __param(1, Services_1.ILogService),
        __param(2, Services_1.IUnicodeService)
    ], Linkifier);
    return Linkifier;
}());
exports.Linkifier = Linkifier;
var MouseZone = (function () {
    function MouseZone(x1, y1, x2, y2, clickCallback, hoverCallback, tooltipCallback, leaveCallback, willLinkActivate) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.clickCallback = clickCallback;
        this.hoverCallback = hoverCallback;
        this.tooltipCallback = tooltipCallback;
        this.leaveCallback = leaveCallback;
        this.willLinkActivate = willLinkActivate;
    }
    return MouseZone;
}());
exports.MouseZone = MouseZone;
//# sourceMappingURL=Linkifier.js.map