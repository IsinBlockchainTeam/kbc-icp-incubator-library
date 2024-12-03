import { AssessmentStandardDriver } from '../drivers/AssessmentStandardDriver';

export class AssessmentStandardService {
    private readonly _assessmentStandardDriver: AssessmentStandardDriver;

    constructor(assessmentStandardDriver: AssessmentStandardDriver) {
        this._assessmentStandardDriver = assessmentStandardDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._assessmentStandardDriver.getAllValues();
    }

    async addValue(value: string): Promise<string> {
        return this._assessmentStandardDriver.addValue(value);
    }

    async removeValue(value: string): Promise<string> {
        return this._assessmentStandardDriver.removeValue(value);
    }

    async hasValue(value: string): Promise<boolean> {
        return this._assessmentStandardDriver.hasValue(value);
    }
}
