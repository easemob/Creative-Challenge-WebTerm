import { IOptionsService } from 'common/services/Services';
import { IEvent } from 'common/EventEmitter';
import { ICharSizeService } from 'browser/services/Services';
export declare class CharSizeService implements ICharSizeService {
    private readonly _optionsService;
    serviceBrand: undefined;
    width: number;
    height: number;
    private _measureStrategy;
    get hasValidSize(): boolean;
    private _onCharSizeChange;
    get onCharSizeChange(): IEvent<void>;
    constructor(document: Document, parentElement: HTMLElement, _optionsService: IOptionsService);
    measure(): void;
}
//# sourceMappingURL=CharSizeService.d.ts.map