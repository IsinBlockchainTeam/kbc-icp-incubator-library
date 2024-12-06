import { IDL, query, update } from 'azle';
import AssessmentReferenceStandardService from '../services/AssessmentReferenceStandardService';
import { AtLeastViewer } from '../decorators/roles';
import { IDLAssessmentReferenceStandard } from '../models/idls';
import { AssessmentReferenceStandard } from '../models/types';

class AssessmentReferenceStandardController {
    @query([], IDL.Vec(IDLAssessmentReferenceStandard))
    @AtLeastViewer
    async getAllAssessmentReferenceStandards(): Promise<AssessmentReferenceStandard[]> {
        return AssessmentReferenceStandardService.instance.getAll();
    }

    @query([IDL.Nat], IDLAssessmentReferenceStandard)
    @AtLeastViewer
    async getAssessmentReferenceStandard(id: bigint): Promise<AssessmentReferenceStandard> {
        return AssessmentReferenceStandardService.instance.getById(id);
    }

    @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text], IDLAssessmentReferenceStandard)
    async addAssessmentReferenceStandard(
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ): Promise<AssessmentReferenceStandard> {
        return AssessmentReferenceStandardService.instance.add(name, sustainabilityCriteria, logoUrl, siteUrl);
    }

    @update([IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text], IDLAssessmentReferenceStandard)
    async updateAssessmentReferenceStandard(
        id: bigint,
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ): Promise<AssessmentReferenceStandard> {
        return AssessmentReferenceStandardService.instance.update(id, name, sustainabilityCriteria, logoUrl, siteUrl);
    }

    @update([IDL.Nat], IDLAssessmentReferenceStandard)
    async removeAssessmentReferenceStandard(id: bigint): Promise<AssessmentReferenceStandard> {
        return AssessmentReferenceStandardService.instance.remove(id);
    }
}

export default AssessmentReferenceStandardController;
