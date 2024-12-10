import { ProcessTypeDriver } from '../drivers/ProcessTypeDriver';

export class ProcessTypeService {
    private readonly _processTypeDriver: ProcessTypeDriver;

    constructor(processTypeDriver: ProcessTypeDriver) {
        this._processTypeDriver = processTypeDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._processTypeDriver.getAllValues();
    }

    async addValue(value: string, industrialSector?: string): Promise<string> {
        return this._processTypeDriver.addValue(value, industrialSector);
    }

    async removeValue(value: string, industrialSector?: string): Promise<string> {
        return this._processTypeDriver.removeValue(value, industrialSector);
    }

    async hasValue(value: string): Promise<boolean> {
        return this._processTypeDriver.hasValue(value);
    }
}
