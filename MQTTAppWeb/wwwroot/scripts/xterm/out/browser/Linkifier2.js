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
exports.Linkifier2 = void 0;
var Services_1 = require("common/services/Services");
var EventEmitter_1 = require("common/EventEmitter");
var Lifecycle_1 = require("common/Lifecycle");
var Lifecycle_2 = require("browser/Lifecycle");
var Linkifier2 = (function (_super) {
    __extends(Linkifier2, _super);
    function Linkifier2(_bufferService) {
        var _this = _super.call(this) || this;
        _this._bufferService = _bufferService;
        _this._linkProviders = [];
        _this._linkCacheDisposables = [];
        _this._isMouseOut = true;
        _this._activeLine = -1;
        _this._onShowLinkUnderline = _this.register(new EventEmitter_1.EventEmitter());
        _this._onHideLinkUnderline = _this.register(new EventEmitter_1.EventEmitter());
        _this.register((0, Lifecycle_1.getDisposeArrayDisposable)(_this._linkCacheDisposables));
        return _this;
    }
    Object.defineProperty(Linkifier2.prototype, "currentLink", {
        get: function () { return this._currentLink; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Linkifier2.prototype, "onShowLinkUnderline", {
        get: function () { return this._onShowLinkUnderline.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Linkifier2.prototype, "onHideLinkUnderline", {
        get: function () { return this._onHideLinkUnderline.event; },
        enumerable: false,
        configurable: true
    });
    Linkifier2.prototype.registerLinkProvider = function (linkProvider) {
        var _this = this;
        this._linkProviders.push(linkProvider);
        return {
            dispose: function () {
                var providerIndex = _this._linkProviders.indexOf(linkProvider);
                if (providerIndex !== -1) {
                    _this._linkProviders.splice(providerIndex, 1);
                }
            }
        };
    };
    Linkifier2.prototype.attachToDom = function (element, mouseService, renderService) {
        var _this = this;
        this._element = element;
        this._mouseService = mouseService;
        this._renderService = renderService;
        this.register((0, Lifecycle_2.addDisposableDomListener)(this._element, 'mouseleave', function () {
            _this._isMouseOut = true;
            _this._clearCurrentLink();
        }));
        this.register((0, Lifecycle_2.addDisposableDomListener)(this._element, 'mousemove', this._onMouseMove.bind(this)));
        this.register((0, Lifecycle_2.addDisposableDomListener)(this._element, 'click', this._onClick.bind(this)));
    };
    Linkifier2.prototype._onMouseMove = function (event) {
        this._lastMouseEvent = event;
        if (!this._element || !this._mouseService) {
            return;
        }
        var position = this._positionFromMouseEvent(event, this._element, this._mouseService);
        if (!position) {
            return;
        }
        this._isMouseOut = false;
        var composedPath = event.composedPath();
        for (var i = 0; i < composedPath.length; i++) {
            var target = composedPath[i];
            if (target.classList.contains('xterm')) {
                break;
            }
            if (target.classList.contains('xterm-hover')) {
                return;
            }
        }
        if (!this._lastBufferCell || (position.x !== this._lastBufferCell.x || position.y !== this._lastBufferCell.y)) {
            this._onHover(position);
            this._lastBufferCell = position;
        }
    };
    Linkifier2.prototype._onHover = function (position) {
        if (this._activeLine !== position.y) {
            this._clearCurrentLink();
            this._askForLink(position, false);
            return;
        }
        var isCurrentLinkInPosition = this._currentLink && this._linkAtPosition(this._currentLink.link, position);
        if (!isCurrentLinkInPosition) {
            this._clearCurrentLink();
            this._askForLink(position, true);
        }
    };
    Linkifier2.prototype._askForLink = function (position, useLineCache) {
        var _this = this;
        var _a;
        if (!this._activeProviderReplies || !useLineCache) {
            (_a = this._activeProviderReplies) === null || _a === void 0 ? void 0 : _a.forEach(function (reply) {
                reply === null || reply === void 0 ? void 0 : reply.forEach(function (linkWithState) {
                    if (linkWithState.link.dispose) {
                        linkWithState.link.dispose();
                    }
                });
            });
            this._activeProviderReplies = new Map();
            this._activeLine = position.y;
        }
        var linkProvided = false;
        this._linkProviders.forEach(function (linkProvider, i) {
            var _a;
            if (useLineCache) {
                var existingReply = (_a = _this._activeProviderReplies) === null || _a === void 0 ? void 0 : _a.get(i);
                if (existingReply) {
                    linkProvided = _this._checkLinkProviderResult(i, position, linkProvided);
                }
            }
            else {
                linkProvider.provideLinks(position.y, function (links) {
                    var _a, _b;
                    if (_this._isMouseOut) {
                        return;
                    }
                    var linksWithState = links === null || links === void 0 ? void 0 : links.map(function (link) { return ({ link: link }); });
                    (_a = _this._activeProviderReplies) === null || _a === void 0 ? void 0 : _a.set(i, linksWithState);
                    linkProvided = _this._checkLinkProviderResult(i, position, linkProvided);
                    if (((_b = _this._activeProviderReplies) === null || _b === void 0 ? void 0 : _b.size) === _this._linkProviders.length) {
                        _this._removeIntersectingLinks(position.y, _this._activeProviderReplies);
                    }
                });
            }
        });
    };
    Linkifier2.prototype._removeIntersectingLinks = function (y, replies) {
        var occupiedCells = new Set();
        for (var i = 0; i < replies.size; i++) {
            var providerReply = replies.get(i);
            if (!providerReply) {
                continue;
            }
            for (var i_1 = 0; i_1 < providerReply.length; i_1++) {
                var linkWithState = providerReply[i_1];
                var startX = linkWithState.link.range.start.y < y ? 0 : linkWithState.link.range.start.x;
                var endX = linkWithState.link.range.end.y > y ? this._bufferService.cols : linkWithState.link.range.end.x;
                for (var x = startX; x <= endX; x++) {
                    if (occupiedCells.has(x)) {
                        providerReply.splice(i_1--, 1);
                        break;
                    }
                    occupiedCells.add(x);
                }
            }
        }
    };
    Linkifier2.prototype._checkLinkProviderResult = function (index, position, linkProvided) {
        var _this = this;
        var _a;
        if (!this._activeProviderReplies) {
            return linkProvided;
        }
        var links = this._activeProviderReplies.get(index);
        var hasLinkBefore = false;
        for (var j = 0; j < index; j++) {
            if (!this._activeProviderReplies.has(j) || this._activeProviderReplies.get(j)) {
                hasLinkBefore = true;
            }
        }
        if (!hasLinkBefore && links) {
            var linkAtPosition = links.find(function (link) { return _this._linkAtPosition(link.link, position); });
            if (linkAtPosition) {
                linkProvided = true;
                this._handleNewLink(linkAtPosition);
            }
        }
        if (this._activeProviderReplies.size === this._linkProviders.length && !linkProvided) {
            for (var j = 0; j < this._activeProviderReplies.size; j++) {
                var currentLink = (_a = this._activeProviderReplies.get(j)) === null || _a === void 0 ? void 0 : _a.find(function (link) { return _this._linkAtPosition(link.link, position); });
                if (currentLink) {
                    linkProvided = true;
                    this._handleNewLink(currentLink);
                    break;
                }
            }
        }
        return linkProvided;
    };
    Linkifier2.prototype._onClick = function (event) {
        if (!this._element || !this._mouseService || !this._currentLink) {
            return;
        }
        var position = this._positionFromMouseEvent(event, this._element, this._mouseService);
        if (!position) {
            return;
        }
        if (this._linkAtPosition(this._currentLink.link, position)) {
            this._currentLink.link.activate(event, this._currentLink.link.text);
        }
    };
    Linkifier2.prototype._clearCurrentLink = function (startRow, endRow) {
        if (!this._element || !this._currentLink || !this._lastMouseEvent) {
            return;
        }
        if (!startRow || !endRow || (this._currentLink.link.range.start.y >= startRow && this._currentLink.link.range.end.y <= endRow)) {
            this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent);
            this._currentLink = undefined;
            (0, Lifecycle_1.disposeArray)(this._linkCacheDisposables);
        }
    };
    Linkifier2.prototype._handleNewLink = function (linkWithState) {
        var _this = this;
        if (!this._element || !this._lastMouseEvent || !this._mouseService) {
            return;
        }
        var position = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
        if (!position) {
            return;
        }
        if (this._linkAtPosition(linkWithState.link, position)) {
            this._currentLink = linkWithState;
            this._currentLink.state = {
                decorations: {
                    underline: linkWithState.link.decorations === undefined ? true : linkWithState.link.decorations.underline,
                    pointerCursor: linkWithState.link.decorations === undefined ? true : linkWithState.link.decorations.pointerCursor
                },
                isHovered: true
            };
            this._linkHover(this._element, linkWithState.link, this._lastMouseEvent);
            linkWithState.link.decorations = {};
            Object.defineProperties(linkWithState.link.decorations, {
                pointerCursor: {
                    get: function () { var _a, _b; return (_b = (_a = _this._currentLink) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.decorations.pointerCursor; },
                    set: function (v) {
                        var _a, _b;
                        if (((_a = _this._currentLink) === null || _a === void 0 ? void 0 : _a.state) && _this._currentLink.state.decorations.pointerCursor !== v) {
                            _this._currentLink.state.decorations.pointerCursor = v;
                            if (_this._currentLink.state.isHovered) {
                                (_b = _this._element) === null || _b === void 0 ? void 0 : _b.classList.toggle('xterm-cursor-pointer', v);
                            }
                        }
                    }
                },
                underline: {
                    get: function () { var _a, _b; return (_b = (_a = _this._currentLink) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.decorations.underline; },
                    set: function (v) {
                        var _a, _b, _c;
                        if (((_a = _this._currentLink) === null || _a === void 0 ? void 0 : _a.state) && ((_c = (_b = _this._currentLink) === null || _b === void 0 ? void 0 : _b.state) === null || _c === void 0 ? void 0 : _c.decorations.underline) !== v) {
                            _this._currentLink.state.decorations.underline = v;
                            if (_this._currentLink.state.isHovered) {
                                _this._fireUnderlineEvent(linkWithState.link, v);
                            }
                        }
                    }
                }
            });
            if (this._renderService) {
                this._linkCacheDisposables.push(this._renderService.onRenderedBufferChange(function (e) {
                    var start = e.start === 0 ? 0 : e.start + 1 + _this._bufferService.buffer.ydisp;
                    _this._clearCurrentLink(start, e.end + 1 + _this._bufferService.buffer.ydisp);
                }));
            }
        }
    };
    Linkifier2.prototype._linkHover = function (element, link, event) {
        var _a;
        if ((_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) {
            this._currentLink.state.isHovered = true;
            if (this._currentLink.state.decorations.underline) {
                this._fireUnderlineEvent(link, true);
            }
            if (this._currentLink.state.decorations.pointerCursor) {
                element.classList.add('xterm-cursor-pointer');
            }
        }
        if (link.hover) {
            link.hover(event, link.text);
        }
    };
    Linkifier2.prototype._fireUnderlineEvent = function (link, showEvent) {
        var range = link.range;
        var scrollOffset = this._bufferService.buffer.ydisp;
        var event = this._createLinkUnderlineEvent(range.start.x - 1, range.start.y - scrollOffset - 1, range.end.x, range.end.y - scrollOffset - 1, undefined);
        var emitter = showEvent ? this._onShowLinkUnderline : this._onHideLinkUnderline;
        emitter.fire(event);
    };
    Linkifier2.prototype._linkLeave = function (element, link, event) {
        var _a;
        if ((_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) {
            this._currentLink.state.isHovered = false;
            if (this._currentLink.state.decorations.underline) {
                this._fireUnderlineEvent(link, false);
            }
            if (this._currentLink.state.decorations.pointerCursor) {
                element.classList.remove('xterm-cursor-pointer');
            }
        }
        if (link.leave) {
            link.leave(event, link.text);
        }
    };
    Linkifier2.prototype._linkAtPosition = function (link, position) {
        var sameLine = link.range.start.y === link.range.end.y;
        var wrappedFromLeft = link.range.start.y < position.y;
        var wrappedToRight = link.range.end.y > position.y;
        return ((sameLine && link.range.start.x <= position.x && link.range.end.x >= position.x) ||
            (wrappedFromLeft && link.range.end.x >= position.x) ||
            (wrappedToRight && link.range.start.x <= position.x) ||
            (wrappedFromLeft && wrappedToRight)) &&
            link.range.start.y <= position.y &&
            link.range.end.y >= position.y;
    };
    Linkifier2.prototype._positionFromMouseEvent = function (event, element, mouseService) {
        var coords = mouseService.getCoords(event, element, this._bufferService.cols, this._bufferService.rows);
        if (!coords) {
            return;
        }
        return { x: coords[0], y: coords[1] + this._bufferService.buffer.ydisp };
    };
    Linkifier2.prototype._createLinkUnderlineEvent = function (x1, y1, x2, y2, fg) {
        return { x1: x1, y1: y1, x2: x2, y2: y2, cols: this._bufferService.cols, fg: fg };
    };
    Linkifier2 = __decorate([
        __param(0, Services_1.IBufferService)
    ], Linkifier2);
    return Linkifier2;
}(Lifecycle_1.Disposable));
exports.Linkifier2 = Linkifier2;
//# sourceMappingURL=Linkifier2.js.map