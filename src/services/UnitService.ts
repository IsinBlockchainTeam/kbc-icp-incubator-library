import { UnitDriver } from '../drivers/UnitDriver';

export class UnitService {
    private readonly _unitDriver: UnitDriver;

    constructor(unitDriver: UnitDriver) {
        this._unitDriver = unitDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._unitDriver.getAllValues();
    }

    async addValue(value: string): Promise<string> {
        return this._unitDriver.addValue(value);
    }

    async removeValue(value: string): Promise<string> {
        return this._unitDriver.removeValue(value);
    }

    async hasValue(value: string): Promise<boolean> {
        return this._unitDriver.hasValue(value);
    }
}
