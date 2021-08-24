import { ISelectionRedrawRequestEvent, ISelectionRequestScrollLinesEvent } from 'browser/selection/Types';
import { SelectionModel } from 'browser/selection/SelectionModel';
import { IEvent } from 'common/EventEmitter';
import { IMouseService, ISelectionService, IRenderService } from 'browser/services/Services';
import { ILinkifier2 } from 'browser/Types';
import { IBufferService, IOptionsService, ICoreService } from 'common/services/Services';
import { Disposable } from 'common/Lifecycle';
export declare const enum SelectionMode {
    NORMAL = 0,
    WORD = 1,
    LINE = 2,
    COLUMN = 3
}
export declare class SelectionService extends Disposable implements ISelectionService {
    private readonly _element;
    private readonly _screenElement;
    private readonly _linkifier;
    private readonly _bufferService;
    private readonly _coreService;
    private readonly _mouseService;
    private readonly _optionsService;
    private readonly _renderService;
    serviceBrand: undefined;
    protected _model: SelectionModel;
    private _dragScrollAmount;
    protected _activeSelectionMode: SelectionMode;
    private _dragScrollIntervalTimer;
    private _refreshAnimationFrame;
    private _enabled;
    private _mouseMoveListener;
    private _mouseUpListener;
    private _trimListener;
    private _workCell;
    private _mouseDownTimeStamp;
    private _oldHasSelection;
    private _oldSelectionStart;
    private _oldSelectionEnd;
    private _onLinuxMouseSelection;
    get onLinuxMouseSelection(): IEvent<string>;
    private _onRedrawRequest;
    get onRequestRedraw(): IEvent<ISelectionRedrawRequestEvent>;
    private _onSelectionChange;
    get onSelectionChange(): IEvent<void>;
    private _onRequestScrollLines;
    get onRequestScrollLines(): IEvent<ISelectionRequestScrollLinesEvent>;
    constructor(_element: HTMLElement, _screenElement: HTMLElement, _linkifier: ILinkifier2, _bufferService: IBufferService, _coreService: ICoreService, _mouseService: IMouseService, _optionsService: IOptionsService, _renderService: IRenderService);
    dispose(): void;
    reset(): void;
    disable(): void;
    enable(): void;
    get selectionStart(): [number, number] | undefined;
    get selectionEnd(): [number, number] | undefined;
    get hasSelection(): boolean;
    get selectionText(): string;
    clearSelection(): void;
    refresh(isLinuxMouseSelection?: boolean): void;
    private _refresh;
    private _isClickInSelection;
    protected _areCoordsInSelection(coords: [number, number], start: [number, number], end: [number, number]): boolean;
    private _selectWordAtCursor;
    selectAll(): void;
    selectLines(start: number, end: number): void;
    private _onTrim;
    private _getMouseBufferCoords;
    private _getMouseEventScrollAmount;
    shouldForceSelection(event: MouseEvent): boolean;
    onMouseDown(event: MouseEvent): void;
    private _addMouseDownListeners;
    private _removeMouseDownListeners;
    private _onIncrementalClick;
    private _onSingleClick;
    private _onDoubleClick;
    private _onTripleClick;
    shouldColumnSelect(event: KeyboardEvent | MouseEvent): boolean;
    private _onMouseMove;
    private _dragScroll;
    private _onMouseUp;
    private _fireEventIfSelectionChanged;
    private _fireOnSelectionChange;
    private _onBufferActivate;
    private _convertViewportColToCharacterIndex;
    setSelection(col: number, row: number, length: number): void;
    rightClickSelect(ev: MouseEvent): void;
    private _getWordAt;
    protected _selectWordAt(coords: [number, number], allowWhitespaceOnlySelection: boolean): void;
    private _selectToWordAt;
    private _isCharWordSeparator;
    protected _selectLineAt(line: number): void;
}
//# sourceMappingURL=SelectionService.d.ts.map