import EnumerationService from './EnumerationService';
import { StableMemoryId } from '../utils/stableMemory';

class SustainabilityCriteriaService extends EnumerationService {
    private static _instance: SustainabilityCriteriaService;

    static get instance(): SustainabilityCriteriaService {
        if (!this._instance) {
            this._instance = new SustainabilityCriteriaService(StableMemoryId.SUSTAINABILITY_CRITERIA_ENUM);
        }
        return this._instance;
    }
}

export default SustainabilityCriteriaService;
