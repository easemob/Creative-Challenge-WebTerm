"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRawByteCoords = exports.getCoords = exports.getCoordsRelativeToElement = void 0;
function getCoordsRelativeToElement(event, element) {
    var rect = element.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}
exports.getCoordsRelativeToElement = getCoordsRelativeToElement;
function getCoords(event, element, colCount, rowCount, hasValidCharSize, actualCellWidth, actualCellHeight, isSelection) {
    if (!hasValidCharSize) {
        return undefined;
    }
    var coords = getCoordsRelativeToElement(event, element);
    if (!coords) {
        return undefined;
    }
    coords[0] = Math.ceil((coords[0] + (isSelection ? actualCellWidth / 2 : 0)) / actualCellWidth);
    coords[1] = Math.ceil(coords[1] / actualCellHeight);
    coords[0] = Math.min(Math.max(coords[0], 1), colCount + (isSelection ? 1 : 0));
    coords[1] = Math.min(Math.max(coords[1], 1), rowCount);
    return coords;
}
exports.getCoords = getCoords;
function getRawByteCoords(coords) {
    if (!coords) {
        return undefined;
    }
    return { x: coords[0] + 32, y: coords[1] + 32 };
}
exports.getRawByteCoords = getRawByteCoords;
//# sourceMappingURL=Mouse.js.map