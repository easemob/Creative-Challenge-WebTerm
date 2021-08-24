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
exports.MouseService = void 0;
var Services_1 = require("./Services");
var Mouse_1 = require("browser/input/Mouse");
var MouseService = (function () {
    function MouseService(_renderService, _charSizeService) {
        this._renderService = _renderService;
        this._charSizeService = _charSizeService;
    }
    MouseService.prototype.getCoords = function (event, element, colCount, rowCount, isSelection) {
        return Mouse_1.getCoords(event, element, colCount, rowCount, this._charSizeService.hasValidSize, this._renderService.dimensions.actualCellWidth, this._renderService.dimensions.actualCellHeight, isSelection);
    };
    MouseService.prototype.getRawByteCoords = function (event, element, colCount, rowCount) {
        var coords = this.getCoords(event, element, colCount, rowCount);
        return Mouse_1.getRawByteCoords(coords);
    };
    MouseService = __decorate([
        __param(0, Services_1.IRenderService),
        __param(1, Services_1.ICharSizeService)
    ], MouseService);
    return MouseService;
}());
exports.MouseService = MouseService;
//# sourceMappingURL=MouseService.js.map