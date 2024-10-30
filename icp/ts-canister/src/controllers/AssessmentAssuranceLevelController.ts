import { IDL, query, update } from 'azle';
import AssessmentAssuranceLevelService from '../services/AssessmentAssuranceLevelService';
import { AtLeastSigner, AtLeastViewer } from '../decorators/roles';

class AssessmentAssuranceLevelController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllAssessmentAssuranceLevels(): Promise<string[]> {
        return AssessmentAssuranceLevelService.instance.getAllValues();
    }

    @update([IDL.Text])
    @AtLeastSigner
    async addAssessmentAssuranceLevel(value: string): Promise<void> {
        AssessmentAssuranceLevelService.instance.addValue(value);
    }

    @update([IDL.Text])
    @AtLeastSigner
    async removeAssessmentAssuranceLevel(value: string): Promise<void> {
        AssessmentAssuranceLevelService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasAssessmentAssuranceLevel(value: string): Promise<boolean> {
        return AssessmentAssuranceLevelService.instance.hasValue(value);
    }
}

export default AssessmentAssuranceLevelController;
