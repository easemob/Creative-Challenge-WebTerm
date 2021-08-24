import { ILinkifierEvent, LinkMatcherHandler, ILinkMatcherOptions, ILinkifier, IMouseZoneManager, IMouseZone, IRegisteredLinkMatcher } from 'browser/Types';
import { IEvent } from 'common/EventEmitter';
import { ILogService, IBufferService, IUnicodeService } from 'common/services/Services';
export declare class Linkifier implements ILinkifier {
    protected readonly _bufferService: IBufferService;
    private readonly _logService;
    private readonly _unicodeService;
    protected static _timeBeforeLatency: number;
    protected _linkMatchers: IRegisteredLinkMatcher[];
    private _mouseZoneManager;
    private _element;
    private _rowsTimeoutId;
    private _nextLinkMatcherId;
    private _rowsToLinkify;
    private _onShowLinkUnderline;
    get onShowLinkUnderline(): IEvent<ILinkifierEvent>;
    private _onHideLinkUnderline;
    get onHideLinkUnderline(): IEvent<ILinkifierEvent>;
    private _onLinkTooltip;
    get onLinkTooltip(): IEvent<ILinkifierEvent>;
    constructor(_bufferService: IBufferService, _logService: ILogService, _unicodeService: IUnicodeService);
    attachToDom(element: HTMLElement, mouseZoneManager: IMouseZoneManager): void;
    linkifyRows(start: number, end: number): void;
    private _linkifyRows;
    registerLinkMatcher(regex: RegExp, handler: LinkMatcherHandler, options?: ILinkMatcherOptions): number;
    private _addLinkMatcherToList;
    deregisterLinkMatcher(matcherId: number): boolean;
    private _doLinkifyRow;
    private _addLink;
    private _createLinkHoverEvent;
}
export declare class MouseZone implements IMouseZone {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    clickCallback: (e: MouseEvent) => any;
    hoverCallback: (e: MouseEvent) => any;
    tooltipCallback: (e: MouseEvent) => any;
    leaveCallback: () => void;
    willLinkActivate: (e: MouseEvent) => boolean;
    constructor(x1: number, y1: number, x2: number, y2: number, clickCallback: (e: MouseEvent) => any, hoverCallback: (e: MouseEvent) => any, tooltipCallback: (e: MouseEvent) => any, leaveCallback: () => void, willLinkActivate: (e: MouseEvent) => boolean);
}
//# sourceMappingURL=Linkifier.d.ts.map