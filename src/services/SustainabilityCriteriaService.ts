import { SustainabilityCriteriaDriver } from '../drivers/SustainabilityCriteriaDriver';

export class SustainabilityCriteriaService {
    private readonly _sustainabilityCriteriaDriver: SustainabilityCriteriaDriver;

    constructor(sustainabilityCriteriaDriver: SustainabilityCriteriaDriver) {
        this._sustainabilityCriteriaDriver = sustainabilityCriteriaDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._sustainabilityCriteriaDriver.getAllValues();
    }

    async addValue(value: string): Promise<string> {
        return this._sustainabilityCriteriaDriver.addValue(value);
    }

    async removeValue(value: string): Promise<string> {
        return this._sustainabilityCriteriaDriver.removeValue(value);
    }

    async hasValue(value: string): Promise<boolean> {
        return this._sustainabilityCriteriaDriver.hasValue(value);
    }
}
