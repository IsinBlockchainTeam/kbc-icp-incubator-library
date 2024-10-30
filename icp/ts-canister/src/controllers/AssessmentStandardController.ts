import { IDL, query, update } from 'azle';
import AssessmentStandardService from '../services/AssessmentStandardService';
import { AtLeastSigner, AtLeastViewer } from '../decorators/roles';

class AssessmentStandardController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllAssessmentStandards(): Promise<string[]> {
        return AssessmentStandardService.instance.getAllValues();
    }

    @update([IDL.Text])
    @AtLeastSigner
    async addAssessmentStandard(value: string): Promise<void> {
        AssessmentStandardService.instance.addValue(value);
    }

    @update([IDL.Text])
    @AtLeastSigner
    async removeAssessmentStandard(value: string): Promise<void> {
        AssessmentStandardService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasAssessmentStandard(value: string): Promise<boolean> {
        return AssessmentStandardService.instance.hasValue(value);
    }
}

export default AssessmentStandardController;
