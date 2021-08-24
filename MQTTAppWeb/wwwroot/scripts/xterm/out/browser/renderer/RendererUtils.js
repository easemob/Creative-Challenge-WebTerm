"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwIfFalsy = void 0;
function throwIfFalsy(value) {
    if (!value) {
        throw new Error('value must not be falsy');
    }
    return value;
}
exports.throwIfFalsy = throwIfFalsy;
//# sourceMappingURL=RendererUtils.js.map