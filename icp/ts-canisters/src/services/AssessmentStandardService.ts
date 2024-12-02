import EnumerationService from './EnumerationService';
import { StableMemoryId } from '../utils/stableMemory';

class AssessmentStandardService extends EnumerationService {
    private static _instance: AssessmentStandardService;

    static get instance(): AssessmentStandardService {
        if (!this._instance) {
            this._instance = new AssessmentStandardService(StableMemoryId.ASSESSMENT_STANDARD_ENUM);
        }
        return this._instance;
    }
}

export default AssessmentStandardService;
