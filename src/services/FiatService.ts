import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { FiatDriver } from '../drivers/FiatDriver';

export class FiatService {
    private readonly _fiatDriver: FiatDriver;

    constructor(fiatDriver: FiatDriver) {
        this._fiatDriver = fiatDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._fiatDriver.getAllValues();
    }

    async addValue(value: string, industrialSector?: string): Promise<string> {
        return this._fiatDriver.addValue(value, industrialSector || IndustrialSectorEnum.DEFAULT);
    }

    async removeValue(value: string, industrialSector?: string): Promise<string> {
        return this._fiatDriver.removeValue(
            value,
            industrialSector || IndustrialSectorEnum.DEFAULT
        );
    }

    async hasValue(value: string): Promise<boolean> {
        return this._fiatDriver.hasValue(value);
    }
}
