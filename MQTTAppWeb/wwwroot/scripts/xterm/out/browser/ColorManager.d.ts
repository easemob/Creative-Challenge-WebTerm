import { IColorManager, IColor, IColorSet } from 'browser/Types';
import { ITheme } from 'common/services/Services';
export declare const DEFAULT_ANSI_COLORS: readonly IColor[];
export declare class ColorManager implements IColorManager {
    allowTransparency: boolean;
    colors: IColorSet;
    private _ctx;
    private _litmusColor;
    private _contrastCache;
    constructor(document: Document, allowTransparency: boolean);
    onOptionsChange(key: string): void;
    setTheme(theme?: ITheme): void;
    private _parseColor;
}
//# sourceMappingURL=ColorManager.d.ts.map