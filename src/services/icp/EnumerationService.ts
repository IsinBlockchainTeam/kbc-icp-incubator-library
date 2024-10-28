import { EnumerationManagerDriver } from '../../drivers/icp/EnumerationManagerDriver';
import { Enumeration } from '../../entities/icp/Enumeration';

export class EnumerationService {
    private readonly _enumerationManagerDriver: EnumerationManagerDriver;

    constructor(enumerationManagerDriver: EnumerationManagerDriver) {
        this._enumerationManagerDriver = enumerationManagerDriver;
    }

    async getEnumerationsByType(enumeration: Enumeration): Promise<string[]> {
        return this._enumerationManagerDriver.getEnumerationsByType(enumeration);
    }

    async addEnumerationValue(enumeration: Enumeration, value: string): Promise<void> {
        await this._enumerationManagerDriver.addEnumerationValue(enumeration, value);
    }

    async removeEnumerationValue(enumeration: Enumeration, value: string): Promise<void> {
        await this._enumerationManagerDriver.removeEnumerationValue(enumeration, value);
    }

    async hasEnumerationValue(enumeration: Enumeration, value: string): Promise<boolean> {
        return this._enumerationManagerDriver.hasEnumerationValue(enumeration, value);
    }
}
