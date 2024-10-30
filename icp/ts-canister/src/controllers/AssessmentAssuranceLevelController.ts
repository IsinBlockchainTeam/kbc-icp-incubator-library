import { IDL, query, update } from 'azle';
import AssessmentAssuranceLevelService from '../services/AssessmentAssuranceLevelService';

class AssessmentAssuranceLevelController {
    @query([], IDL.Vec(IDL.Text))
    getAllAssessmentAssuranceLevels(): string[] {
        return AssessmentAssuranceLevelService.instance.getAllValues();
    }

    @update([IDL.Text])
    addAssessmentAssuranceLevel(value: string): void {
        AssessmentAssuranceLevelService.instance.addValue(value);
    }

    @update([IDL.Text])
    removeAssessmentAssuranceLevel(value: string): void {
        AssessmentAssuranceLevelService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    hasAssessmentAssuranceLevel(value: string): boolean {
        return AssessmentAssuranceLevelService.instance.hasValue(value);
    }
}

export default AssessmentAssuranceLevelController;
