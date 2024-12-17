import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { SustainabilityCriteriaDriver } from '../drivers/SustainabilityCriteriaDriver';

export class SustainabilityCriteriaService {
    private readonly _sustainabilityCriteriaDriver: SustainabilityCriteriaDriver;

    constructor(sustainabilityCriteriaDriver: SustainabilityCriteriaDriver) {
        this._sustainabilityCriteriaDriver = sustainabilityCriteriaDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._sustainabilityCriteriaDriver.getAllValues();
    }

    async addValue(value: string, industrialSector?: string): Promise<string> {
        return this._sustainabilityCriteriaDriver.addValue(
            value,
            industrialSector || IndustrialSectorEnum.DEFAULT
        );
    }

    async removeValue(value: string, industrialSector?: string): Promise<string> {
        return this._sustainabilityCriteriaDriver.removeValue(
            value,
            industrialSector || IndustrialSectorEnum.DEFAULT
        );
    }

    async hasValue(value: string): Promise<boolean> {
        return this._sustainabilityCriteriaDriver.hasValue(value);
    }
}
