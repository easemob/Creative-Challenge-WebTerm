import { IRenderDimensions, IRequestRedrawEvent } from 'browser/renderer/Types';
import { BaseRenderLayer } from 'browser/renderer/BaseRenderLayer';
import { IColorSet } from 'browser/Types';
import { IBufferService, IOptionsService, ICoreService } from 'common/services/Services';
import { IEventEmitter } from 'common/EventEmitter';
import { ICoreBrowserService } from 'browser/services/Services';
export declare class CursorRenderLayer extends BaseRenderLayer {
    private _onRequestRedraw;
    private readonly _coreService;
    private readonly _coreBrowserService;
    private _state;
    private _cursorRenderers;
    private _cursorBlinkStateManager;
    private _cell;
    constructor(container: HTMLElement, zIndex: number, colors: IColorSet, rendererId: number, _onRequestRedraw: IEventEmitter<IRequestRedrawEvent>, bufferService: IBufferService, optionsService: IOptionsService, _coreService: ICoreService, _coreBrowserService: ICoreBrowserService);
    resize(dim: IRenderDimensions): void;
    reset(): void;
    onBlur(): void;
    onFocus(): void;
    onOptionsChanged(): void;
    onCursorMove(): void;
    onGridChanged(startRow: number, endRow: number): void;
    private _render;
    private _clearCursor;
    private _renderBarCursor;
    private _renderBlockCursor;
    private _renderUnderlineCursor;
    private _renderBlurCursor;
}
//# sourceMappingURL=CursorRenderLayer.d.ts.map