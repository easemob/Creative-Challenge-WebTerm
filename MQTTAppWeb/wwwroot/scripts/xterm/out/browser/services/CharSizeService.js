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
exports.CharSizeService = void 0;
var Services_1 = require("common/services/Services");
var EventEmitter_1 = require("common/EventEmitter");
var CharSizeService = (function () {
    function CharSizeService(document, parentElement, _optionsService) {
        this._optionsService = _optionsService;
        this.width = 0;
        this.height = 0;
        this._onCharSizeChange = new EventEmitter_1.EventEmitter();
        this._measureStrategy = new DomMeasureStrategy(document, parentElement, this._optionsService);
    }
    Object.defineProperty(CharSizeService.prototype, "hasValidSize", {
        get: function () { return this.width > 0 && this.height > 0; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CharSizeService.prototype, "onCharSizeChange", {
        get: function () { return this._onCharSizeChange.event; },
        enumerable: false,
        configurable: true
    });
    CharSizeService.prototype.measure = function () {
        var result = this._measureStrategy.measure();
        if (result.width !== this.width || result.height !== this.height) {
            this.width = result.width;
            this.height = result.height;
            this._onCharSizeChange.fire();
        }
    };
    CharSizeService = __decorate([
        __param(2, Services_1.IOptionsService)
    ], CharSizeService);
    return CharSizeService;
}());
exports.CharSizeService = CharSizeService;
var DomMeasureStrategy = (function () {
    function DomMeasureStrategy(_document, _parentElement, _optionsService) {
        this._document = _document;
        this._parentElement = _parentElement;
        this._optionsService = _optionsService;
        this._result = { width: 0, height: 0 };
        this._measureElement = this._document.createElement('span');
        this._measureElement.classList.add('xterm-char-measure-element');
        this._measureElement.textContent = 'W';
        this._measureElement.setAttribute('aria-hidden', 'true');
        this._parentElement.appendChild(this._measureElement);
    }
    DomMeasureStrategy.prototype.measure = function () {
        this._measureElement.style.fontFamily = this._optionsService.options.fontFamily;
        this._measureElement.style.fontSize = this._optionsService.options.fontSize + "px";
        var geometry = this._measureElement.getBoundingClientRect();
        if (geometry.width !== 0 && geometry.height !== 0) {
            this._result.width = geometry.width;
            this._result.height = Math.ceil(geometry.height);
        }
        return this._result;
    };
    return DomMeasureStrategy;
}());
//# sourceMappingURL=CharSizeService.js.map