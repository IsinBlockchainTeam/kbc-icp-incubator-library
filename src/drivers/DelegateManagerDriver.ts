import { DelegateManager, DelegateManager__factory } from '../smart-contracts';
import { Signer } from 'ethers';
import { RoleProof } from '../types/RoleProof';

export class DelegateManagerDriver {
    private _delegateManagerContract: DelegateManager;

    constructor(signer: Signer, delegateManagerAddress: string) {
        this._delegateManagerContract = DelegateManager__factory.connect(
            delegateManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async getRevocationRegistryAddress(): Promise<string> {
        return this._delegateManagerContract.getRevocationRegistry();
    }

    async addDelegator(delegatorAddress: string): Promise<void> {
        const tx = await this._delegateManagerContract.addDelegator(delegatorAddress);
        await tx.wait();
    }

    async removeDelegator(delegatorAddress: string): Promise<void> {
        const tx = await this._delegateManagerContract.removeDelegator(delegatorAddress);
        await tx.wait();
    }

    async isDelegator(delegatorAddress: string): Promise<boolean> {
        return this._delegateManagerContract.isDelegator(delegatorAddress);
    }

    async hasValidRole(roleProof: RoleProof, role: string): Promise<boolean> {
        return this._delegateManagerContract.hasValidRole(roleProof, role);
    }
}
