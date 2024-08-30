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

    async hasValidRole(roleProof: RoleProof, role: string): Promise<boolean> {
        return this._delegateManagerDriver.hasValidRole(roleProof, role);
    }
}
