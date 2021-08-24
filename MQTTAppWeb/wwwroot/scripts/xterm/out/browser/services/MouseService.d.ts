import { ICharSizeService, IRenderService, IMouseService } from './Services';
export declare class MouseService implements IMouseService {
    private readonly _renderService;
    private readonly _charSizeService;
    serviceBrand: undefined;
    constructor(_renderService: IRenderService, _charSizeService: ICharSizeService);
    getCoords(event: {
        clientX: number;
        clientY: number;
    }, element: HTMLElement, colCount: number, rowCount: number, isSelection?: boolean): [number, number] | undefined;
    getRawByteCoords(event: MouseEvent, element: HTMLElement, colCount: number, rowCount: number): {
        x: number;
        y: number;
    } | undefined;
}
//# sourceMappingURL=MouseService.d.ts.map