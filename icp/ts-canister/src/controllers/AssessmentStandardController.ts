import { IDL, query, update } from 'azle';
import AssessmentStandardService from '../services/AssessmentStandardService';
import { AtLeastViewer } from '../decorators/roles';

class AssessmentStandardController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllAssessmentStandards(): Promise<string[]> {
        return AssessmentStandardService.instance.getAllValues();
    }

    @update([IDL.Text], IDL.Text)
    async addAssessmentStandard(value: string): Promise<string> {
        return AssessmentStandardService.instance.addValue(value);
    }

    @update([IDL.Text], IDL.Text)
    async removeAssessmentStandard(value: string): Promise<string> {
        return AssessmentStandardService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasAssessmentStandard(value: string): Promise<boolean> {
        return AssessmentStandardService.instance.hasValue(value);
    }
}

export default AssessmentStandardController;
