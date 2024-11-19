import { FiatDriver } from '../../drivers/icp/FiatDriver';

export class FiatService {
    private readonly _fiatDriver: FiatDriver;

    constructor(fiatDriver: FiatDriver) {
        this._fiatDriver = fiatDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._fiatDriver.getAllValues();
    }

    async addValue(value: string): Promise<string> {
        return this._fiatDriver.addValue(value);
    }

    async removeValue(value: string): Promise<string> {
        return this._fiatDriver.removeValue(value);
    }

    async hasValue(value: string): Promise<boolean> {
        return this._fiatDriver.hasValue(value);
    }
}
