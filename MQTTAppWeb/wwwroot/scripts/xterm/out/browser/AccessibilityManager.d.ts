import { ITerminal } from 'browser/Types';
import { Disposable } from 'common/Lifecycle';
import { IRenderService } from 'browser/services/Services';
export declare class AccessibilityManager extends Disposable {
    private readonly _terminal;
    private readonly _renderService;
    private _accessibilityTreeRoot;
    private _rowContainer;
    private _rowElements;
    private _liveRegion;
    private _liveRegionLineCount;
    private _renderRowsDebouncer;
    private _screenDprMonitor;
    private _topBoundaryFocusListener;
    private _bottomBoundaryFocusListener;
    private _charsToConsume;
    private _charsToAnnounce;
    constructor(_terminal: ITerminal, _renderService: IRenderService);
    dispose(): void;
    private _onBoundaryFocus;
    private _onResize;
    private _createAccessibilityTreeNode;
    private _onTab;
    private _onChar;
    private _clearLiveRegion;
    private _onKey;
    private _refreshRows;
    private _renderRows;
    private _refreshRowsDimensions;
    private _refreshRowDimensions;
    private _announceCharacters;
}
//# sourceMappingURL=AccessibilityManager.d.ts.map