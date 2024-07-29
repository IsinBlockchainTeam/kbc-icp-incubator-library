import { Event, Signer, utils } from 'ethers';
import { EscrowManager, EscrowManager__factory } from '../smart-contracts';

export class EscrowManagerDriver {
    private _contract: EscrowManager;

    constructor(signer: Signer, escrowManagerAddress: string) {
        this._contract = EscrowManager__factory.connect(
            escrowManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async getEscrowCounter(): Promise<number> {
        return (await this._contract.getEscrowCounter()).toNumber();
    }

    async registerEscrow(payee: string, duration: number, tokenAddress: string): Promise<[number, string, string]> {
        if (
            !utils.isAddress(payee) ||
            !utils.isAddress(tokenAddress)
        ) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerEscrow(
            payee,
            duration,
            tokenAddress
        );
        const { events, transactionHash } = await tx.wait();
        if (!events) {
            throw new Error('Error during escrow registration, no events found');
        }
        const eventArgs = events.find((e: Event) => e.event === 'EscrowRegistered')?.args;
        if (!eventArgs) {
            throw new Error('Error during escrow registration, escrow not registered');
        }

        return [eventArgs.id.toNumber(), eventArgs.escrowAddress, transactionHash];
    }

    async getFeeRecipient(): Promise<string> {
        return this._contract.getFeeRecipient();
    }
    async getBaseFee(): Promise<number> {
        return (await this._contract.getBaseFee()).toNumber();
    }
    async getPercentageFee(): Promise<number> {
        return (await this._contract.getPercentageFee()).toNumber();
    }
    async getEscrow(id: number): Promise<string> {
        return this._contract.getEscrow(id);
    }

    async updateFeeRecipient(newFeeRecipient: string): Promise<void> {
        if (!utils.isAddress(newFeeRecipient)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.updateFeeRecipient(newFeeRecipient);
        await tx.wait();
    }
    async updateBaseFee(newBaseFee: number): Promise<void> {
        if (newBaseFee < 0) {
            throw new Error('Base fee must be greater than 0');
        }
        const tx = await this._contract.updateBaseFee(newBaseFee);
        await tx.wait();
    }
    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        if (newPercentageFee < 0 || newPercentageFee > 100) {
            throw new Error('Percentage fee must be between 0 and 100');
        }
        const tx = await this._contract.updatePercentageFee(newPercentageFee);
        await tx.wait();
    }
}
