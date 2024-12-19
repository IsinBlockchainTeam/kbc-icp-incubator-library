import { IDL, query, update } from 'azle';
import AssessmentAssuranceLevelService from '../services/AssessmentAssuranceLevelService';
import { AtLeastViewer } from '../decorators/roles';

class AssessmentAssuranceLevelController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllAssessmentAssuranceLevels(): Promise<string[]> {
        return AssessmentAssuranceLevelService.instance.getAllValues();
    }

    @update([IDL.Text, IDL.Text], IDL.Text)
    async addAssessmentAssuranceLevel(value: string, industrialSector: string): Promise<string> {
        return AssessmentAssuranceLevelService.instance.addValue(value, industrialSector);
    }

    @update([IDL.Text, IDL.Text], IDL.Text)
    async removeAssessmentAssuranceLevel(value: string, industrialSector: string): Promise<string> {
        return AssessmentAssuranceLevelService.instance.removeValue(value, industrialSector);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasAssessmentAssuranceLevel(value: string): Promise<boolean> {
        return AssessmentAssuranceLevelService.instance.hasValue(value);
    }
}

export default AssessmentAssuranceLevelController;
