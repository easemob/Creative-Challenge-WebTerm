export declare function getCoordsRelativeToElement(event: {
    clientX: number;
    clientY: number;
}, element: HTMLElement): [number, number];
export declare function getCoords(event: {
    clientX: number;
    clientY: number;
}, element: HTMLElement, colCount: number, rowCount: number, hasValidCharSize: boolean, actualCellWidth: number, actualCellHeight: number, isSelection?: boolean): [number, number] | undefined;
export declare function getRawByteCoords(coords: [number, number] | undefined): {
    x: number;
    y: number;
} | undefined;
//# sourceMappingURL=Mouse.d.ts.map