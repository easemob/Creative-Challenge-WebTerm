import { IRenderer, IRenderDimensions, IRequestRedrawEvent } from 'browser/renderer/Types';
import { Disposable } from 'common/Lifecycle';
import { IColorSet, ILinkifier, ILinkifier2 } from 'browser/Types';
import { ICharSizeService } from 'browser/services/Services';
import { IBufferService, IOptionsService, IInstantiationService } from 'common/services/Services';
import { IEvent } from 'common/EventEmitter';
export declare class Renderer extends Disposable implements IRenderer {
    private _colors;
    private readonly _screenElement;
    private readonly _bufferService;
    private readonly _charSizeService;
    private readonly _optionsService;
    private _id;
    private _renderLayers;
    private _devicePixelRatio;
    dimensions: IRenderDimensions;
    private _onRequestRedraw;
    get onRequestRedraw(): IEvent<IRequestRedrawEvent>;
    constructor(_colors: IColorSet, _screenElement: HTMLElement, linkifier: ILinkifier, linkifier2: ILinkifier2, instantiationService: IInstantiationService, _bufferService: IBufferService, _charSizeService: ICharSizeService, _optionsService: IOptionsService);
    dispose(): void;
    onDevicePixelRatioChange(): void;
    setColors(colors: IColorSet): void;
    onResize(cols: number, rows: number): void;
    onCharSizeChanged(): void;
    onBlur(): void;
    onFocus(): void;
    onSelectionChanged(start: [number, number] | undefined, end: [number, number] | undefined, columnSelectMode?: boolean): void;
    onCursorMove(): void;
    onOptionsChanged(): void;
    clear(): void;
    private _runOperation;
    renderRows(start: number, end: number): void;
    private _updateDimensions;
}
//# sourceMappingURL=Renderer.d.ts.map