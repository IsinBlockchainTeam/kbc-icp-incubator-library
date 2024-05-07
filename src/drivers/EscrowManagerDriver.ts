import { BigNumber, Event, Signer, utils } from 'ethers';
import { EscrowManager, EscrowManager__factory } from '../smart-contracts';

export class EscrowManagerDriver {
    private _contract: EscrowManager;

    constructor(signer: Signer, escrowManagerAddress: string) {
        this._contract = EscrowManager__factory
            .connect(escrowManagerAddress, signer.provider!)
            .connect(signer);
    }

    async getEscrowCounter(): Promise<number> {
        return (await this._contract.getEscrowCounter()).toNumber();
    }

    async registerEscrow(payee: string, purchaser: string, agreedAmount: number, duration: number, tokenAddress: string): Promise<[number, string, string]> {
        if (!utils.isAddress(payee) || !utils.isAddress(purchaser) || !utils.isAddress(tokenAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerEscrow(payee, purchaser, agreedAmount, duration, tokenAddress);
        const { events, transactionHash } = await tx.wait();
        if (!events) {
            throw new Error('Error during escrow registration, no events found');
        }
        const eventArgs = events.find((e: Event) => e.event === 'EscrowRegistered')?.args;

        return [eventArgs?.id.toNumber(), eventArgs?.escrowAddress, transactionHash];
    }

    async getCommissioner(): Promise<string> {
        return this._contract.getCommissioner();
    }

    async updateCommissioner(newCommissioner: string): Promise<void> {
        if (!utils.isAddress(newCommissioner)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.updateCommissioner(newCommissioner);
        await tx.wait();
    }

    async getBaseFee(): Promise<number> {
        return (await this._contract.getBaseFee()).toNumber();
    }

    async updateBaseFee(newBaseFee: number): Promise<void> {
        const tx = await this._contract.updateBaseFee(newBaseFee);
        await tx.wait();
    }

    async getPercentageFee(): Promise<number> {
        return (await this._contract.getPercentageFee()).toNumber();
    }

    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        if (newPercentageFee < 0 || newPercentageFee > 100) {
            throw new Error('Percentage fee must be between 0 and 100');
        }
        const tx = await this._contract.updatePercentageFee(newPercentageFee);
        await tx.wait();
    }

    async getEscrow(id: number): Promise<string> {
        return this._contract.getEscrow(id);
    }

    async getEscrowIdsOfPurchaser(purchaser: string): Promise<number[]> {
        const escrowsId = await this._contract.getEscrowIdsOfPurchaser(purchaser);
        return escrowsId.map((id: BigNumber) => id.toNumber());
    }
}
