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

    async hasValidRole(roleProof: RoleProof, role: string): Promise<boolean> {
        return this._delegateManagerContract.hasValidRole(roleProof, role);
    }
}
