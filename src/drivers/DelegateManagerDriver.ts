import { DelegateManager, DelegateManager__factory } from '../smart-contracts';
import { Signer } from 'ethers';

export class DelegateManagerDriver {
    private _delegateManagerContract: DelegateManager;

    constructor(signer: Signer, delegateManagerAddress: string) {
        this._delegateManagerContract = DelegateManager__factory.connect(
            delegateManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async addDelegator(delegatorAddress: string): Promise<void> {
        const tx = await this._delegateManagerContract.addDelegator(delegatorAddress);
        await tx.wait();
    }

    async removeDelegator(delegatorAddress: string): Promise<void> {
        const tx = await this._delegateManagerContract.removeDelegator(delegatorAddress);
        await tx.wait();
    }

    async addDelegate(delegateAddress: string): Promise<void> {
        const tx = await this._delegateManagerContract.addDelegate(delegateAddress);
        await tx.wait();
    }

    async removeDelegate(delegateAddress: string): Promise<void> {
        const tx = await this._delegateManagerContract.removeDelegate(delegateAddress);
        await tx.wait();
    }
}
