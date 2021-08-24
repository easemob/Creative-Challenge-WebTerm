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
exports.LinkRenderLayer = void 0;
var BaseRenderLayer_1 = require("./BaseRenderLayer");
var Constants_1 = require("browser/renderer/atlas/Constants");
var CharAtlasUtils_1 = require("browser/renderer/atlas/CharAtlasUtils");
var Services_1 = require("common/services/Services");
var LinkRenderLayer = (function (_super) {
    __extends(LinkRenderLayer, _super);
    function LinkRenderLayer(container, zIndex, colors, rendererId, linkifier, linkifier2, bufferService, optionsService) {
        var _this = _super.call(this, container, 'link', zIndex, true, colors, rendererId, bufferService, optionsService) || this;
        linkifier.onShowLinkUnderline(function (e) { return _this._onShowLinkUnderline(e); });
        linkifier.onHideLinkUnderline(function (e) { return _this._onHideLinkUnderline(e); });
        linkifier2.onShowLinkUnderline(function (e) { return _this._onShowLinkUnderline(e); });
        linkifier2.onHideLinkUnderline(function (e) { return _this._onHideLinkUnderline(e); });
        return _this;
    }
    LinkRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        this._state = undefined;
    };
    LinkRenderLayer.prototype.reset = function () {
        this._clearCurrentLink();
    };
    LinkRenderLayer.prototype._clearCurrentLink = function () {
        if (this._state) {
            this._clearCells(this._state.x1, this._state.y1, this._state.cols - this._state.x1, 1);
            var middleRowCount = this._state.y2 - this._state.y1 - 1;
            if (middleRowCount > 0) {
                this._clearCells(0, this._state.y1 + 1, this._state.cols, middleRowCount);
            }
            this._clearCells(0, this._state.y2, this._state.x2, 1);
            this._state = undefined;
        }
    };
    LinkRenderLayer.prototype._onShowLinkUnderline = function (e) {
        if (e.fg === Constants_1.INVERTED_DEFAULT_COLOR) {
            this._ctx.fillStyle = this._colors.background.css;
        }
        else if (e.fg && CharAtlasUtils_1.is256Color(e.fg)) {
            this._ctx.fillStyle = this._colors.ansi[e.fg].css;
        }
        else {
            this._ctx.fillStyle = this._colors.foreground.css;
        }
        if (e.y1 === e.y2) {
            this._fillBottomLineAtCells(e.x1, e.y1, e.x2 - e.x1);
        }
        else {
            this._fillBottomLineAtCells(e.x1, e.y1, e.cols - e.x1);
            for (var y = e.y1 + 1; y < e.y2; y++) {
                this._fillBottomLineAtCells(0, y, e.cols);
            }
            this._fillBottomLineAtCells(0, e.y2, e.x2);
        }
        this._state = e;
    };
    LinkRenderLayer.prototype._onHideLinkUnderline = function (e) {
        this._clearCurrentLink();
    };
    LinkRenderLayer = __decorate([
        __param(6, Services_1.IBufferService),
        __param(7, Services_1.IOptionsService)
    ], LinkRenderLayer);
    return LinkRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.LinkRenderLayer = LinkRenderLayer;
//# sourceMappingURL=LinkRenderLayer.js.map