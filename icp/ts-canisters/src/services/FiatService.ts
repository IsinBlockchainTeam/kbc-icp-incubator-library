import EnumerationService, { EnumerationType } from './EnumerationService';
import { StableMemoryId } from '../utils/stableMemory';

class FiatService extends EnumerationService {
    private static _instance: FiatService;

    static get instance(): FiatService {
        if (!this._instance) {
            this._instance = new FiatService(StableMemoryId.FIAT_ENUM, EnumerationType.FIAT);
        }
        return this._instance;
    }
}

export default FiatService;
