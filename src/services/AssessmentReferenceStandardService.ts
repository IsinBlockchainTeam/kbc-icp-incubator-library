import { AssessmentReferenceStandardDriver } from '../drivers/AssessmentReferenceStandardDriver';
import { AssessmentReferenceStandard } from '../entities/AssessmentReferenceStandard';

export class AssessmentReferenceStandardService {
    private readonly _assessmentReferenceStandardDriver: AssessmentReferenceStandardDriver;

    constructor(assessmentReferenceStandardDriver: AssessmentReferenceStandardDriver) {
        this._assessmentReferenceStandardDriver = assessmentReferenceStandardDriver;
    }

    async getAll(): Promise<AssessmentReferenceStandard[]> {
        return this._assessmentReferenceStandardDriver.getAll();
    }

    async getById(id: number): Promise<AssessmentReferenceStandard> {
        return this._assessmentReferenceStandardDriver.getById(id);
    }

    async add(
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string,
        industrialSector?: string
    ): Promise<AssessmentReferenceStandard> {
        return this._assessmentReferenceStandardDriver.add(
            name,
            sustainabilityCriteria,
            logoUrl,
            siteUrl,
            industrialSector
        );
    }

    async removeById(id: number, industrialSector?: string): Promise<AssessmentReferenceStandard> {
        return this._assessmentReferenceStandardDriver.removeById(id, industrialSector);
    }
}
