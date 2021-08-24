import { Disposable } from 'common/Lifecycle';
import { IMouseService, ISelectionService } from 'browser/services/Services';
import { IMouseZoneManager, IMouseZone } from 'browser/Types';
import { IBufferService, IOptionsService } from 'common/services/Services';
export declare class MouseZoneManager extends Disposable implements IMouseZoneManager {
    private readonly _element;
    private readonly _screenElement;
    private readonly _bufferService;
    private readonly _mouseService;
    private readonly _selectionService;
    private readonly _optionsService;
    private _zones;
    private _areZonesActive;
    private _mouseMoveListener;
    private _mouseLeaveListener;
    private _clickListener;
    private _tooltipTimeout;
    private _currentZone;
    private _lastHoverCoords;
    private _initialSelectionLength;
    constructor(_element: HTMLElement, _screenElement: HTMLElement, _bufferService: IBufferService, _mouseService: IMouseService, _selectionService: ISelectionService, _optionsService: IOptionsService);
    dispose(): void;
    add(zone: IMouseZone): void;
    clearAll(start?: number, end?: number): void;
    private _activate;
    private _deactivate;
    private _onMouseMove;
    private _onHover;
    private _onTooltip;
    private _onMouseDown;
    private _onMouseLeave;
    private _onClick;
    private _getSelectionLength;
    private _findZoneEventAt;
}
//# sourceMappingURL=MouseZoneManager.d.ts.map