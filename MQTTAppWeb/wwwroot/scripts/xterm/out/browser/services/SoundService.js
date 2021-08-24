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
exports.SoundService = void 0;
var Services_1 = require("common/services/Services");
var SoundService = (function () {
    function SoundService(_optionsService) {
        this._optionsService = _optionsService;
    }
    Object.defineProperty(SoundService, "audioContext", {
        get: function () {
            if (!SoundService._audioContext) {
                var audioContextCtor = window.AudioContext || window.webkitAudioContext;
                if (!audioContextCtor) {
                    console.warn('Web Audio API is not supported by this browser. Consider upgrading to the latest version');
                    return null;
                }
                SoundService._audioContext = new audioContextCtor();
            }
            return SoundService._audioContext;
        },
        enumerable: false,
        configurable: true
    });
    SoundService.prototype.playBellSound = function () {
        var ctx = SoundService.audioContext;
        if (!ctx) {
            return;
        }
        var bellAudioSource = ctx.createBufferSource();
        ctx.decodeAudioData(this._base64ToArrayBuffer(this._removeMimeType(this._optionsService.options.bellSound)), function (buffer) {
            bellAudioSource.buffer = buffer;
            bellAudioSource.connect(ctx.destination);
            bellAudioSource.start(0);
        });
    };
    SoundService.prototype._base64ToArrayBuffer = function (base64) {
        var binaryString = window.atob(base64);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };
    SoundService.prototype._removeMimeType = function (dataURI) {
        var splitUri = dataURI.split(',');
        return splitUri[1];
    };
    SoundService = __decorate([
        __param(0, Services_1.IOptionsService)
    ], SoundService);
    return SoundService;
}());
exports.SoundService = SoundService;
//# sourceMappingURL=SoundService.js.map