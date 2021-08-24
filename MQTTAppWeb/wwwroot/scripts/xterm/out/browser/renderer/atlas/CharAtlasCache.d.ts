import { BaseCharAtlas } from 'browser/renderer/atlas/BaseCharAtlas';
import { IColorSet } from 'browser/Types';
import { ITerminalOptions } from 'common/services/Services';
export declare function acquireCharAtlas(options: ITerminalOptions, rendererId: number, colors: IColorSet, scaledCharWidth: number, scaledCharHeight: number): BaseCharAtlas;
export declare function removeTerminalFromCache(rendererId: number): void;
//# sourceMappingURL=CharAtlasCache.d.ts.map