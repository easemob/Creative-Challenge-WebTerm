"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contrastRatio = exports.toPaddedHex = exports.rgba = exports.rgb = exports.css = exports.color = exports.channels = void 0;
var channels;
(function (channels) {
    function toCss(r, g, b, a) {
        if (a !== undefined) {
            return "#" + toPaddedHex(r) + toPaddedHex(g) + toPaddedHex(b) + toPaddedHex(a);
        }
        return "#" + toPaddedHex(r) + toPaddedHex(g) + toPaddedHex(b);
    }
    channels.toCss = toCss;
    function toRgba(r, g, b, a) {
        if (a === void 0) { a = 0xFF; }
        return (r << 24 | g << 16 | b << 8 | a) >>> 0;
    }
    channels.toRgba = toRgba;
})(channels = exports.channels || (exports.channels = {}));
var color;
(function (color_1) {
    function blend(bg, fg) {
        var a = (fg.rgba & 0xFF) / 255;
        if (a === 1) {
            return {
                css: fg.css,
                rgba: fg.rgba
            };
        }
        var fgR = (fg.rgba >> 24) & 0xFF;
        var fgG = (fg.rgba >> 16) & 0xFF;
        var fgB = (fg.rgba >> 8) & 0xFF;
        var bgR = (bg.rgba >> 24) & 0xFF;
        var bgG = (bg.rgba >> 16) & 0xFF;
        var bgB = (bg.rgba >> 8) & 0xFF;
        var r = bgR + Math.round((fgR - bgR) * a);
        var g = bgG + Math.round((fgG - bgG) * a);
        var b = bgB + Math.round((fgB - bgB) * a);
        var css = channels.toCss(r, g, b);
        var rgba = channels.toRgba(r, g, b);
        return { css: css, rgba: rgba };
    }
    color_1.blend = blend;
    function isOpaque(color) {
        return (color.rgba & 0xFF) === 0xFF;
    }
    color_1.isOpaque = isOpaque;
    function ensureContrastRatio(bg, fg, ratio) {
        var result = rgba.ensureContrastRatio(bg.rgba, fg.rgba, ratio);
        if (!result) {
            return undefined;
        }
        return rgba.toColor((result >> 24 & 0xFF), (result >> 16 & 0xFF), (result >> 8 & 0xFF));
    }
    color_1.ensureContrastRatio = ensureContrastRatio;
    function opaque(color) {
        var rgbaColor = (color.rgba | 0xFF) >>> 0;
        var _a = rgba.toChannels(rgbaColor), r = _a[0], g = _a[1], b = _a[2];
        return {
            css: channels.toCss(r, g, b),
            rgba: rgbaColor
        };
    }
    color_1.opaque = opaque;
    function opacity(color, opacity) {
        var a = Math.round(opacity * 0xFF);
        var _a = rgba.toChannels(color.rgba), r = _a[0], g = _a[1], b = _a[2];
        return {
            css: channels.toCss(r, g, b, a),
            rgba: channels.toRgba(r, g, b, a)
        };
    }
    color_1.opacity = opacity;
})(color = exports.color || (exports.color = {}));
var css;
(function (css_1) {
    function toColor(css) {
        switch (css.length) {
            case 7:
                return {
                    css: css,
                    rgba: (parseInt(css.slice(1), 16) << 8 | 0xFF) >>> 0
                };
            case 9:
                return {
                    css: css,
                    rgba: parseInt(css.slice(1), 16) >>> 0
                };
        }
        throw new Error('css.toColor: Unsupported css format');
    }
    css_1.toColor = toColor;
})(css = exports.css || (exports.css = {}));
var rgb;
(function (rgb_1) {
    function relativeLuminance(rgb) {
        return relativeLuminance2((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, (rgb) & 0xFF);
    }
    rgb_1.relativeLuminance = relativeLuminance;
    function relativeLuminance2(r, g, b) {
        var rs = r / 255;
        var gs = g / 255;
        var bs = b / 255;
        var rr = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
        var rg = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
        var rb = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
        return rr * 0.2126 + rg * 0.7152 + rb * 0.0722;
    }
    rgb_1.relativeLuminance2 = relativeLuminance2;
})(rgb = exports.rgb || (exports.rgb = {}));
var rgba;
(function (rgba) {
    function ensureContrastRatio(bgRgba, fgRgba, ratio) {
        var bgL = rgb.relativeLuminance(bgRgba >> 8);
        var fgL = rgb.relativeLuminance(fgRgba >> 8);
        var cr = contrastRatio(bgL, fgL);
        if (cr < ratio) {
            if (fgL < bgL) {
                return reduceLuminance(bgRgba, fgRgba, ratio);
            }
            return increaseLuminance(bgRgba, fgRgba, ratio);
        }
        return undefined;
    }
    rgba.ensureContrastRatio = ensureContrastRatio;
    function reduceLuminance(bgRgba, fgRgba, ratio) {
        var bgR = (bgRgba >> 24) & 0xFF;
        var bgG = (bgRgba >> 16) & 0xFF;
        var bgB = (bgRgba >> 8) & 0xFF;
        var fgR = (fgRgba >> 24) & 0xFF;
        var fgG = (fgRgba >> 16) & 0xFF;
        var fgB = (fgRgba >> 8) & 0xFF;
        var cr = contrastRatio(rgb.relativeLuminance2(fgR, fgB, fgG), rgb.relativeLuminance2(bgR, bgG, bgB));
        while (cr < ratio && (fgR > 0 || fgG > 0 || fgB > 0)) {
            fgR -= Math.max(0, Math.ceil(fgR * 0.1));
            fgG -= Math.max(0, Math.ceil(fgG * 0.1));
            fgB -= Math.max(0, Math.ceil(fgB * 0.1));
            cr = contrastRatio(rgb.relativeLuminance2(fgR, fgB, fgG), rgb.relativeLuminance2(bgR, bgG, bgB));
        }
        return (fgR << 24 | fgG << 16 | fgB << 8 | 0xFF) >>> 0;
    }
    rgba.reduceLuminance = reduceLuminance;
    function increaseLuminance(bgRgba, fgRgba, ratio) {
        var bgR = (bgRgba >> 24) & 0xFF;
        var bgG = (bgRgba >> 16) & 0xFF;
        var bgB = (bgRgba >> 8) & 0xFF;
        var fgR = (fgRgba >> 24) & 0xFF;
        var fgG = (fgRgba >> 16) & 0xFF;
        var fgB = (fgRgba >> 8) & 0xFF;
        var cr = contrastRatio(rgb.relativeLuminance2(fgR, fgB, fgG), rgb.relativeLuminance2(bgR, bgG, bgB));
        while (cr < ratio && (fgR < 0xFF || fgG < 0xFF || fgB < 0xFF)) {
            fgR = Math.min(0xFF, fgR + Math.ceil((255 - fgR) * 0.1));
            fgG = Math.min(0xFF, fgG + Math.ceil((255 - fgG) * 0.1));
            fgB = Math.min(0xFF, fgB + Math.ceil((255 - fgB) * 0.1));
            cr = contrastRatio(rgb.relativeLuminance2(fgR, fgB, fgG), rgb.relativeLuminance2(bgR, bgG, bgB));
        }
        return (fgR << 24 | fgG << 16 | fgB << 8 | 0xFF) >>> 0;
    }
    rgba.increaseLuminance = increaseLuminance;
    function toChannels(value) {
        return [(value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF];
    }
    rgba.toChannels = toChannels;
    function toColor(r, g, b) {
        return {
            css: channels.toCss(r, g, b),
            rgba: channels.toRgba(r, g, b)
        };
    }
    rgba.toColor = toColor;
})(rgba = exports.rgba || (exports.rgba = {}));
function toPaddedHex(c) {
    var s = c.toString(16);
    return s.length < 2 ? '0' + s : s;
}
exports.toPaddedHex = toPaddedHex;
function contrastRatio(l1, l2) {
    if (l1 < l2) {
        return (l2 + 0.05) / (l1 + 0.05);
    }
    return (l1 + 0.05) / (l2 + 0.05);
}
exports.contrastRatio = contrastRatio;
//# sourceMappingURL=Color.js.map