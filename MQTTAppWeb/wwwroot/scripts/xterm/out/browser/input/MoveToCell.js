"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToCellSequence = void 0;
var EscapeSequences_1 = require("common/data/EscapeSequences");
function moveToCellSequence(targetX, targetY, bufferService, applicationCursor) {
    var startX = bufferService.buffer.x;
    var startY = bufferService.buffer.y;
    if (!bufferService.buffer.hasScrollback) {
        return resetStartingRow(startX, startY, targetX, targetY, bufferService, applicationCursor) +
            moveToRequestedRow(startY, targetY, bufferService, applicationCursor) +
            moveToRequestedCol(startX, startY, targetX, targetY, bufferService, applicationCursor);
    }
    var direction;
    if (startY === targetY) {
        direction = startX > targetX ? "D" : "C";
        return repeat(Math.abs(startX - targetX), sequence(direction, applicationCursor));
    }
    direction = startY > targetY ? "D" : "C";
    var rowDifference = Math.abs(startY - targetY);
    var cellsToMove = colsFromRowEnd(startY > targetY ? targetX : startX, bufferService) +
        (rowDifference - 1) * bufferService.cols + 1 +
        colsFromRowBeginning(startY > targetY ? startX : targetX, bufferService);
    return repeat(cellsToMove, sequence(direction, applicationCursor));
}
exports.moveToCellSequence = moveToCellSequence;
function colsFromRowBeginning(currX, bufferService) {
    return currX - 1;
}
function colsFromRowEnd(currX, bufferService) {
    return bufferService.cols - currX;
}
function resetStartingRow(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    if (moveToRequestedRow(startY, targetY, bufferService, applicationCursor).length === 0) {
        return '';
    }
    return repeat(bufferLine(startX, startY, startX, startY - wrappedRowsForRow(bufferService, startY), false, bufferService).length, sequence("D", applicationCursor));
}
function moveToRequestedRow(startY, targetY, bufferService, applicationCursor) {
    var startRow = startY - wrappedRowsForRow(bufferService, startY);
    var endRow = targetY - wrappedRowsForRow(bufferService, targetY);
    var rowsToMove = Math.abs(startRow - endRow) - wrappedRowsCount(startY, targetY, bufferService);
    return repeat(rowsToMove, sequence(verticalDirection(startY, targetY), applicationCursor));
}
function moveToRequestedCol(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    var startRow;
    if (moveToRequestedRow(startY, targetY, bufferService, applicationCursor).length > 0) {
        startRow = targetY - wrappedRowsForRow(bufferService, targetY);
    }
    else {
        startRow = startY;
    }
    var endRow = targetY;
    var direction = horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor);
    return repeat(bufferLine(startX, startRow, targetX, endRow, direction === "C", bufferService).length, sequence(direction, applicationCursor));
}
function wrappedRowsCount(startY, targetY, bufferService) {
    var wrappedRows = 0;
    var startRow = startY - wrappedRowsForRow(bufferService, startY);
    var endRow = targetY - wrappedRowsForRow(bufferService, targetY);
    for (var i = 0; i < Math.abs(startRow - endRow); i++) {
        var direction = verticalDirection(startY, targetY) === "A" ? -1 : 1;
        var line = bufferService.buffer.lines.get(startRow + (direction * i));
        if (line && line.isWrapped) {
            wrappedRows++;
        }
    }
    return wrappedRows;
}
function wrappedRowsForRow(bufferService, currentRow) {
    var rowCount = 0;
    var line = bufferService.buffer.lines.get(currentRow);
    var lineWraps = line && line.isWrapped;
    while (lineWraps && currentRow >= 0 && currentRow < bufferService.rows) {
        rowCount++;
        line = bufferService.buffer.lines.get(--currentRow);
        lineWraps = line && line.isWrapped;
    }
    return rowCount;
}
function horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    var startRow;
    if (moveToRequestedRow(targetX, targetY, bufferService, applicationCursor).length > 0) {
        startRow = targetY - wrappedRowsForRow(bufferService, targetY);
    }
    else {
        startRow = startY;
    }
    if ((startX < targetX &&
        startRow <= targetY) ||
        (startX >= targetX &&
            startRow < targetY)) {
        return "C";
    }
    return "D";
}
function verticalDirection(startY, targetY) {
    return startY > targetY ? "A" : "B";
}
function bufferLine(startCol, startRow, endCol, endRow, forward, bufferService) {
    var currentCol = startCol;
    var currentRow = startRow;
    var bufferStr = '';
    while (currentCol !== endCol || currentRow !== endRow) {
        currentCol += forward ? 1 : -1;
        if (forward && currentCol > bufferService.cols - 1) {
            bufferStr += bufferService.buffer.translateBufferLineToString(currentRow, false, startCol, currentCol);
            currentCol = 0;
            startCol = 0;
            currentRow++;
        }
        else if (!forward && currentCol < 0) {
            bufferStr += bufferService.buffer.translateBufferLineToString(currentRow, false, 0, startCol + 1);
            currentCol = bufferService.cols - 1;
            startCol = currentCol;
            currentRow--;
        }
    }
    return bufferStr + bufferService.buffer.translateBufferLineToString(currentRow, false, startCol, currentCol);
}
function sequence(direction, applicationCursor) {
    var mod = applicationCursor ? 'O' : '[';
    return EscapeSequences_1.C0.ESC + mod + direction;
}
function repeat(count, str) {
    count = Math.floor(count);
    var rpt = '';
    for (var i = 0; i < count; i++) {
        rpt += str;
    }
    return rpt;
}
//# sourceMappingURL=MoveToCell.js.map