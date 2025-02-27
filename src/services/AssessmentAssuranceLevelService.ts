import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { AssessmentAssuranceLevelDriver } from '../drivers/AssessmentAssuranceLevelDriver';

export class AssessmentAssuranceLevelService {
    private readonly _assessmentAssuranceLevelDriver: AssessmentAssuranceLevelDriver;

    constructor(assessmentAssuranceLevelDriver: AssessmentAssuranceLevelDriver) {
        this._assessmentAssuranceLevelDriver = assessmentAssuranceLevelDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._assessmentAssuranceLevelDriver.getAllValues();
    }

    async addValue(value: string, industrialSector?: string): Promise<string> {
        return this._assessmentAssuranceLevelDriver.addValue(
            value,
            industrialSector || IndustrialSectorEnum.DEFAULT
        );
    }

    async removeValue(value: string, industrialSector?: string): Promise<string> {
        return this._assessmentAssuranceLevelDriver.removeValue(
            value,
            industrialSector || IndustrialSectorEnum.DEFAULT
        );
    }

    async hasValue(value: string): Promise<boolean> {
        return this._assessmentAssuranceLevelDriver.hasValue(value);
    }
}
