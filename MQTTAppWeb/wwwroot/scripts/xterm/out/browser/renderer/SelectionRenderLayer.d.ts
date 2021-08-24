import { IRenderDimensions } from 'browser/renderer/Types';
import { BaseRenderLayer } from 'browser/renderer/BaseRenderLayer';
import { IColorSet } from 'browser/Types';
import { IBufferService, IOptionsService } from 'common/services/Services';
export declare class SelectionRenderLayer extends BaseRenderLayer {
    private _state;
    constructor(container: HTMLElement, zIndex: number, colors: IColorSet, rendererId: number, bufferService: IBufferService, optionsService: IOptionsService);
    private _clearState;
    resize(dim: IRenderDimensions): void;
    reset(): void;
    onSelectionChanged(start: [number, number] | undefined, end: [number, number] | undefined, columnSelectMode: boolean): void;
    private _didStateChange;
    private _areCoordinatesEqual;
}
//# sourceMappingURL=SelectionRenderLayer.d.ts.map