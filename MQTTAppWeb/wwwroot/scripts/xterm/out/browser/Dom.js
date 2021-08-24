"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeElementFromParent = void 0;
function removeElementFromParent() {
    var _a;
    var elements = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        elements[_i] = arguments[_i];
    }
    for (var _b = 0, elements_1 = elements; _b < elements_1.length; _b++) {
        var e = elements_1[_b];
        (_a = e === null || e === void 0 ? void 0 : e.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(e);
    }
}
exports.removeElementFromParent = removeElementFromParent;
//# sourceMappingURL=Dom.js.map