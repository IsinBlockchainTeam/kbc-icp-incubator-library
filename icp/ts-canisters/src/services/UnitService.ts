import EnumerationService, { EnumerationType } from './EnumerationService';
import { StableMemoryId } from '../utils/stableMemory';

class UnitService extends EnumerationService {
    private static _instance: UnitService;

    static get instance(): UnitService {
        if (!this._instance) {
            this._instance = new UnitService(StableMemoryId.UNIT_ENUM, EnumerationType.UNIT);
        }
        return this._instance;
    }
}

export default UnitService;
