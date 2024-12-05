import { IDL, query, update } from 'azle';
import AssessmentReferenceStandardService from '../services/AssessmentReferenceStandardService';
import { AtLeastViewer } from '../decorators/roles';
import { IDLAssessmentReferenceStandard } from '../models/idls/AssessmentReferenceStandard';
import { AssessmentReferenceStandard } from '../models/types/src/AssessmentReferenceStandard';

class AssessmentStandardController {
    @query([], IDL.Vec(IDLAssessmentReferenceStandard))
    @AtLeastViewer
    async getAllAssessmentStandards(): Promise<AssessmentReferenceStandard[]> {
        return AssessmentReferenceStandardService.instance.getAll();
    }

    @query([IDL.Nat], IDLAssessmentReferenceStandard)
    @AtLeastViewer
    async getAssessmentStandard(id: bigint): Promise<AssessmentReferenceStandard | null> {
        return AssessmentReferenceStandardService.instance.getById(id);
    }

    @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text], IDLAssessmentReferenceStandard)
    async addAssessmentStandard(
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ): Promise<AssessmentReferenceStandard> {
        return AssessmentReferenceStandardService.instance.add(name, sustainabilityCriteria, logoUrl, siteUrl);
    }

    @update([IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text], IDLAssessmentReferenceStandard)
    async updateAssessmentStandard(
        id: bigint,
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ): Promise<AssessmentReferenceStandard> {
        return AssessmentReferenceStandardService.instance.update(id, name, sustainabilityCriteria, logoUrl, siteUrl);
    }

    @update([IDL.Nat], IDLAssessmentReferenceStandard)
    async removeAssessmentStandard(id: bigint): Promise<AssessmentReferenceStandard> {
        return AssessmentReferenceStandardService.instance.remove(id);
    }
}

export default AssessmentStandardController;
