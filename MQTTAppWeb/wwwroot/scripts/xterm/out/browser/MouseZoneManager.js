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
exports.MouseZoneManager = void 0;
var Lifecycle_1 = require("common/Lifecycle");
var Lifecycle_2 = require("browser/Lifecycle");
var Services_1 = require("browser/services/Services");
var Services_2 = require("common/services/Services");
var MouseZoneManager = (function (_super) {
    __extends(MouseZoneManager, _super);
    function MouseZoneManager(_element, _screenElement, _bufferService, _mouseService, _selectionService, _optionsService) {
        var _this = _super.call(this) || this;
        _this._element = _element;
        _this._screenElement = _screenElement;
        _this._bufferService = _bufferService;
        _this._mouseService = _mouseService;
        _this._selectionService = _selectionService;
        _this._optionsService = _optionsService;
        _this._zones = [];
        _this._areZonesActive = false;
        _this._lastHoverCoords = [undefined, undefined];
        _this._initialSelectionLength = 0;
        _this.register(Lifecycle_2.addDisposableDomListener(_this._element, 'mousedown', function (e) { return _this._onMouseDown(e); }));
        _this._mouseMoveListener = function (e) { return _this._onMouseMove(e); };
        _this._mouseLeaveListener = function (e) { return _this._onMouseLeave(e); };
        _this._clickListener = function (e) { return _this._onClick(e); };
        return _this;
    }
    MouseZoneManager.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._deactivate();
    };
    MouseZoneManager.prototype.add = function (zone) {
        this._zones.push(zone);
        if (this._zones.length === 1) {
            this._activate();
        }
    };
    MouseZoneManager.prototype.clearAll = function (start, end) {
        if (this._zones.length === 0) {
            return;
        }
        if (!start || !end) {
            start = 0;
            end = this._bufferService.rows - 1;
        }
        for (var i = 0; i < this._zones.length; i++) {
            var zone = this._zones[i];
            if ((zone.y1 > start && zone.y1 <= end + 1) ||
                (zone.y2 > start && zone.y2 <= end + 1) ||
                (zone.y1 < start && zone.y2 > end + 1)) {
                if (this._currentZone && this._currentZone === zone) {
                    this._currentZone.leaveCallback();
                    this._currentZone = undefined;
                }
                this._zones.splice(i--, 1);
            }
        }
        if (this._zones.length === 0) {
            this._deactivate();
        }
    };
    MouseZoneManager.prototype._activate = function () {
        if (!this._areZonesActive) {
            this._areZonesActive = true;
            this._element.addEventListener('mousemove', this._mouseMoveListener);
            this._element.addEventListener('mouseleave', this._mouseLeaveListener);
            this._element.addEventListener('click', this._clickListener);
        }
    };
    MouseZoneManager.prototype._deactivate = function () {
        if (this._areZonesActive) {
            this._areZonesActive = false;
            this._element.removeEventListener('mousemove', this._mouseMoveListener);
            this._element.removeEventListener('mouseleave', this._mouseLeaveListener);
            this._element.removeEventListener('click', this._clickListener);
        }
    };
    MouseZoneManager.prototype._onMouseMove = function (e) {
        if (this._lastHoverCoords[0] !== e.pageX || this._lastHoverCoords[1] !== e.pageY) {
            this._onHover(e);
            this._lastHoverCoords = [e.pageX, e.pageY];
        }
    };
    MouseZoneManager.prototype._onHover = function (e) {
        var _this = this;
        var zone = this._findZoneEventAt(e);
        if (zone === this._currentZone) {
            return;
        }
        if (this._currentZone) {
            this._currentZone.leaveCallback();
            this._currentZone = undefined;
            if (this._tooltipTimeout) {
                clearTimeout(this._tooltipTimeout);
            }
        }
        if (!zone) {
            return;
        }
        this._currentZone = zone;
        if (zone.hoverCallback) {
            zone.hoverCallback(e);
        }
        this._tooltipTimeout = window.setTimeout(function () { return _this._onTooltip(e); }, this._optionsService.options.linkTooltipHoverDuration);
    };
    MouseZoneManager.prototype._onTooltip = function (e) {
        this._tooltipTimeout = undefined;
        var zone = this._findZoneEventAt(e);
        zone === null || zone === void 0 ? void 0 : zone.tooltipCallback(e);
    };
    MouseZoneManager.prototype._onMouseDown = function (e) {
        this._initialSelectionLength = this._getSelectionLength();
        if (!this._areZonesActive) {
            return;
        }
        var zone = this._findZoneEventAt(e);
        if (zone === null || zone === void 0 ? void 0 : zone.willLinkActivate(e)) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };
    MouseZoneManager.prototype._onMouseLeave = function (e) {
        if (this._currentZone) {
            this._currentZone.leaveCallback();
            this._currentZone = undefined;
            if (this._tooltipTimeout) {
                clearTimeout(this._tooltipTimeout);
            }
        }
    };
    MouseZoneManager.prototype._onClick = function (e) {
        var zone = this._findZoneEventAt(e);
        var currentSelectionLength = this._getSelectionLength();
        if (zone && currentSelectionLength === this._initialSelectionLength) {
            zone.clickCallback(e);
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };
    MouseZoneManager.prototype._getSelectionLength = function () {
        var selectionText = this._selectionService.selectionText;
        return selectionText ? selectionText.length : 0;
    };
    MouseZoneManager.prototype._findZoneEventAt = function (e) {
        var coords = this._mouseService.getCoords(e, this._screenElement, this._bufferService.cols, this._bufferService.rows);
        if (!coords) {
            return undefined;
        }
        var x = coords[0];
        var y = coords[1];
        for (var i = 0; i < this._zones.length; i++) {
            var zone = this._zones[i];
            if (zone.y1 === zone.y2) {
                if (y === zone.y1 && x >= zone.x1 && x < zone.x2) {
                    return zone;
                }
            }
            else {
                if ((y === zone.y1 && x >= zone.x1) ||
                    (y === zone.y2 && x < zone.x2) ||
                    (y > zone.y1 && y < zone.y2)) {
                    return zone;
                }
            }
        }
        return undefined;
    };
    MouseZoneManager = __decorate([
        __param(2, Services_2.IBufferService),
        __param(3, Services_1.IMouseService),
        __param(4, Services_1.ISelectionService),
        __param(5, Services_2.IOptionsService)
    ], MouseZoneManager);
    return MouseZoneManager;
}(Lifecycle_1.Disposable));
exports.MouseZoneManager = MouseZoneManager;
//# sourceMappingURL=MouseZoneManager.js.map