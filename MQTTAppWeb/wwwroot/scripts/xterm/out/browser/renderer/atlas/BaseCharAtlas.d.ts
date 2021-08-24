import { IGlyphIdentifier } from 'browser/renderer/atlas/Types';
import { IDisposable } from 'common/Types';
export declare abstract class BaseCharAtlas implements IDisposable {
    private _didWarmUp;
    dispose(): void;
    warmUp(): void;
    private _doWarmUp;
    beginFrame(): void;
    abstract draw(ctx: CanvasRenderingContext2D, glyph: IGlyphIdentifier, x: number, y: number): boolean;
}
//# sourceMappingURL=BaseCharAtlas.d.ts.map