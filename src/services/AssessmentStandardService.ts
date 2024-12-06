import { AssessmentStandardDriver } from '../drivers/AssessmentStandardDriver';
import { AssessmentReferenceStandard } from '../entities/AssessmentReferenceStandard';

export class AssessmentStandardService {
    private readonly _assessmentStandardDriver: AssessmentStandardDriver;

    constructor(assessmentStandardDriver: AssessmentStandardDriver) {
        this._assessmentStandardDriver = assessmentStandardDriver;
    }

    async getAll(): Promise<AssessmentReferenceStandard[]> {
        return this._assessmentStandardDriver.getAll();
    }

    async getById(id: number): Promise<AssessmentReferenceStandard> {
        return this._assessmentStandardDriver.getById(id);
    }

    async add(
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ): Promise<AssessmentReferenceStandard> {
        return this._assessmentStandardDriver.add(name, sustainabilityCriteria, logoUrl, siteUrl);
    }

    async update(
        id: number,
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ): Promise<AssessmentReferenceStandard> {
        return this._assessmentStandardDriver.update(
            id,
            name,
            sustainabilityCriteria,
            logoUrl,
            siteUrl
        );
    }

    async removeById(id: number): Promise<AssessmentReferenceStandard> {
        return this._assessmentStandardDriver.removeById(id);
    }
}
