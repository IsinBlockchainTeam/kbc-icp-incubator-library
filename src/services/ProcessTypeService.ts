import { ProcessTypeDriver } from '../drivers/ProcessTypeDriver';

export class ProcessTypeService {
    private readonly _processTypeDriver: ProcessTypeDriver;

    constructor(processTypeDriver: ProcessTypeDriver) {
        this._processTypeDriver = processTypeDriver;
    }

    async getAllValues(): Promise<string[]> {
        return this._processTypeDriver.getAllValues();
    }

    async addValue(value: string): Promise<string> {
        return this._processTypeDriver.addValue(value);
    }

    async removeValue(value: string): Promise<string> {
        return this._processTypeDriver.removeValue(value);
    }

    async hasValue(value: string): Promise<boolean> {
        return this._processTypeDriver.hasValue(value);
    }
}
