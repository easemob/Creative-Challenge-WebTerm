import { IOptionsService } from 'common/services/Services';
import { ISoundService } from 'browser/services/Services';
export declare class SoundService implements ISoundService {
    private _optionsService;
    serviceBrand: undefined;
    private static _audioContext;
    static get audioContext(): AudioContext | null;
    constructor(_optionsService: IOptionsService);
    playBellSound(): void;
    private _base64ToArrayBuffer;
    private _removeMimeType;
}
//# sourceMappingURL=SoundService.d.ts.map