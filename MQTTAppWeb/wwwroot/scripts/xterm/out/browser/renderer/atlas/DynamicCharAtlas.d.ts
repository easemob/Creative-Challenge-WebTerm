import { IGlyphIdentifier, ICharAtlasConfig } from 'browser/renderer/atlas/Types';
import { BaseCharAtlas } from 'browser/renderer/atlas/BaseCharAtlas';
export declare function getGlyphCacheKey(glyph: IGlyphIdentifier): number;
export declare class DynamicCharAtlas extends BaseCharAtlas {
    private _config;
    private _cacheMap;
    private _cacheCanvas;
    private _cacheCtx;
    private _tmpCtx;
    private _width;
    private _height;
    private _drawToCacheCount;
    private _glyphsWaitingOnBitmap;
    private _bitmapCommitTimeout;
    private _bitmap;
    constructor(document: Document, _config: ICharAtlasConfig);
    dispose(): void;
    beginFrame(): void;
    draw(ctx: CanvasRenderingContext2D, glyph: IGlyphIdentifier, x: number, y: number): boolean;
    private _canCache;
    private _toCoordinateX;
    private _toCoordinateY;
    private _drawFromCache;
    private _getColorFromAnsiIndex;
    private _getBackgroundColor;
    private _getForegroundColor;
    private _drawToCache;
    private _addGlyphToBitmap;
    private _generateBitmap;
}
export declare class NoneCharAtlas extends BaseCharAtlas {
    constructor(document: Document, config: ICharAtlasConfig);
    draw(ctx: CanvasRenderingContext2D, glyph: IGlyphIdentifier, x: number, y: number): boolean;
}
//# sourceMappingURL=DynamicCharAtlas.d.ts.map