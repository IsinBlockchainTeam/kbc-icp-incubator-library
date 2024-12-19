import { StableMemoryId } from '../utils/stableMemory';
import EnumerationService, { EnumerationType } from './EnumerationService';

class ProcessTypeService extends EnumerationService {
    private static _instance: ProcessTypeService;

    static get instance(): ProcessTypeService {
        if (!this._instance) {
            this._instance = new ProcessTypeService(StableMemoryId.PROCESS_TYPE_ENUM, EnumerationType.PROCESS_TYPE);
        }
        return this._instance;
    }
}

export default ProcessTypeService;
