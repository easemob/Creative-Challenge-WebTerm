import { IColor, IColorContrastCache } from 'browser/Types';
export declare class ColorContrastCache implements IColorContrastCache {
    private _color;
    private _rgba;
    clear(): void;
    setCss(bg: number, fg: number, value: string | null): void;
    getCss(bg: number, fg: number): string | null | undefined;
    setColor(bg: number, fg: number, value: IColor | null): void;
    getColor(bg: number, fg: number): IColor | null | undefined;
}
//# sourceMappingURL=ColorContrastCache.d.ts.map