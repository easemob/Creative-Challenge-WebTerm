import { ICharAtlasConfig } from 'browser/renderer/atlas/Types';
import { IColorSet } from 'browser/Types';
import { ITerminalOptions } from 'common/services/Services';
export declare function generateConfig(scaledCharWidth: number, scaledCharHeight: number, options: ITerminalOptions, colors: IColorSet): ICharAtlasConfig;
export declare function configEquals(a: ICharAtlasConfig, b: ICharAtlasConfig): boolean;
export declare function is256Color(colorCode: number): boolean;
//# sourceMappingURL=CharAtlasUtils.d.ts.map