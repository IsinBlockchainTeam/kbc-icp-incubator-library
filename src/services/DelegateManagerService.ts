import { DelegateManagerDriver } from '../drivers/DelegateManagerDriver';
import { RoleProof } from '../types/RoleProof';

export class DelegateManagerService {
    private _delegateManagerDriver: DelegateManagerDriver;

    constructor(delegateManagerDriver: DelegateManagerDriver) {
        this._delegateManagerDriver = delegateManagerDriver;
    }

    async getRevocationRegistryAddress(): Promise<string> {
        return this._delegateManagerDriver.getRevocationRegistryAddress();
    }

    async addDelegator(delegatorAddress: string): Promise<void> {
        return this._delegateManagerDriver.addDelegator(delegatorAddress);
    }

    async removeDelegator(delegatorAddress: string): Promise<void> {
        return this._delegateManagerDriver.removeDelegator(delegatorAddress);
    }

    async isDelegator(delegatorAddress: string): Promise<boolean> {
        return this._delegateManagerDriver.isDelegator(delegatorAddress);
    }

    async hasValidRole(roleProof: RoleProof, role: string): Promise<boolean> {
        return this._delegateManagerDriver.hasValidRole(roleProof, role);
    }
}
