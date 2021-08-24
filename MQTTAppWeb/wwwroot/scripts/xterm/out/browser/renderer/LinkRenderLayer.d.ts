import { IRenderDimensions } from 'browser/renderer/Types';
import { BaseRenderLayer } from './BaseRenderLayer';
import { IColorSet, ILinkifier, ILinkifier2 } from 'browser/Types';
import { IBufferService, IOptionsService } from 'common/services/Services';
export declare class LinkRenderLayer extends BaseRenderLayer {
    private _state;
    constructor(container: HTMLElement, zIndex: number, colors: IColorSet, rendererId: number, linkifier: ILinkifier, linkifier2: ILinkifier2, bufferService: IBufferService, optionsService: IOptionsService);
    resize(dim: IRenderDimensions): void;
    reset(): void;
    private _clearCurrentLink;
    private _onShowLinkUnderline;
    private _onHideLinkUnderline;
}
//# sourceMappingURL=LinkRenderLayer.d.ts.map