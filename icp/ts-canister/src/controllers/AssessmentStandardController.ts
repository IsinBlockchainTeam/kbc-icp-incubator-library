import { IDL, query, update } from 'azle';
import AssessmentStandardService from '../services/AssessmentStandardService';

class AssessmentStandardController {
    @query([], IDL.Vec(IDL.Text))
    getAllAssessmentStandards(): string[] {
        return AssessmentStandardService.instance.getAllValues();
    }

    @update([IDL.Text])
    addAssessmentStandard(value: string): void {
        AssessmentStandardService.instance.addValue(value);
    }

    @update([IDL.Text])
    removeAssessmentStandard(value: string): void {
        AssessmentStandardService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    hasAssessmentStandard(value: string): boolean {
        return AssessmentStandardService.instance.hasValue(value);
    }
}

export default AssessmentStandardController;
