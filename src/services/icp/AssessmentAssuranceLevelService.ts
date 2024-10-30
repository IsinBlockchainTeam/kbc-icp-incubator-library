import { AssessmentAssuranceLevelDriver } from '../../drivers/icp/AssessmentAssuranceLevelDriver';

export class AssessmentAssuranceLevelService {
    private readonly _assessmentAssuranceLevelDriver: AssessmentAssuranceLevelDriver;

    constructor(assessmentAssuranceLevelDriver: AssessmentAssuranceLevelDriver) {
        this._assessmentAssuranceLevelDriver = assessmentAssuranceLevelDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._assessmentAssuranceLevelDriver.getAllValues();
    }

    async addValue(value: string): Promise<void> {
        return this._assessmentAssuranceLevelDriver.addValue(value);
    }

    async removeValue(value: string): Promise<void> {
        return this._assessmentAssuranceLevelDriver.removeValue(value);
    }

    async hasValue(value: string): Promise<boolean> {
        return this._assessmentAssuranceLevelDriver.hasValue(value);
    }
}
