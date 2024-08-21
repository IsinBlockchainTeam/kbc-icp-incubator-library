import { DelegateManagerDriver } from '../drivers/DelegateManagerDriver';

export class DelegateManagerService {
    private _delegateManagerDriver: DelegateManagerDriver;

    constructor(delegateManagerDriver: DelegateManagerDriver) {
        this._delegateManagerDriver = delegateManagerDriver;
    }

    async addDelegator(delegatorAddress: string): Promise<void> {
        return this._delegateManagerDriver.addDelegator(delegatorAddress);
    }

    async removeDelegator(delegatorAddress: string): Promise<void> {
        return this._delegateManagerDriver.removeDelegator(delegatorAddress);
    }

    async addDelegate(delegateAddress: string): Promise<void> {
        return this._delegateManagerDriver.addDelegate(delegateAddress);
    }

    async removeDelegate(delegateAddress: string): Promise<void> {
        return this._delegateManagerDriver.removeDelegate(delegateAddress);
    }
}
