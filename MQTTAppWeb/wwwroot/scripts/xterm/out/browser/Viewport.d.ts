import { Disposable } from 'common/Lifecycle';
import { IColorSet, IViewport } from 'browser/Types';
import { ICharSizeService, IRenderService } from 'browser/services/Services';
import { IBufferService, IOptionsService } from 'common/services/Services';
export declare class Viewport extends Disposable implements IViewport {
    private readonly _scrollLines;
    private readonly _viewportElement;
    private readonly _scrollArea;
    private readonly _bufferService;
    private readonly _optionsService;
    private readonly _charSizeService;
    private readonly _renderService;
    scrollBarWidth: number;
    private _currentRowHeight;
    private _lastRecordedBufferLength;
    private _lastRecordedViewportHeight;
    private _lastRecordedBufferHeight;
    private _lastTouchY;
    private _lastScrollTop;
    private _wheelPartialScroll;
    private _refreshAnimationFrame;
    private _ignoreNextScrollEvent;
    constructor(_scrollLines: (amount: number) => void, _viewportElement: HTMLElement, _scrollArea: HTMLElement, _bufferService: IBufferService, _optionsService: IOptionsService, _charSizeService: ICharSizeService, _renderService: IRenderService);
    onThemeChange(colors: IColorSet): void;
    private _refresh;
    private _innerRefresh;
    syncScrollArea(immediate?: boolean): void;
    private _onScroll;
    private _bubbleScroll;
    onWheel(ev: WheelEvent): boolean;
    private _getPixelsScrolled;
    getLinesScrolled(ev: WheelEvent): number;
    private _applyScrollModifier;
    onTouchStart(ev: TouchEvent): void;
    onTouchMove(ev: TouchEvent): boolean;
}
//# sourceMappingURL=Viewport.d.ts.map