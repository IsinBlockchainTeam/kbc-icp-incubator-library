import EnumerationService, { EnumerationType } from './EnumerationService';
import { StableMemoryId } from '../utils/stableMemory';

class AssessmentAssuranceLevelService extends EnumerationService {
    private static _instance: AssessmentAssuranceLevelService;

    static get instance(): AssessmentAssuranceLevelService {
        if (!this._instance) {
            this._instance = new AssessmentAssuranceLevelService(
                StableMemoryId.ASSESSMENT_ASSURANCE_LEVEL_ENUM,
                EnumerationType.ASSESSMENT_ASSURANCE_LEVEL
            );
        }
        return this._instance;
    }
}

export default AssessmentAssuranceLevelService;
