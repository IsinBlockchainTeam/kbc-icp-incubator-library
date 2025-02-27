import { Event, Signer, utils } from 'ethers';
import { DownPaymentManager, DownPaymentManager__factory } from '../smart-contracts';

export class DownPaymentManagerDriver {
    private _contract: DownPaymentManager;

    constructor(signer: Signer, downPaymentManagerAddress: string) {
        this._contract = DownPaymentManager__factory.connect(
            downPaymentManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async getDownPaymentCounter(): Promise<number> {
        return (await this._contract.getDownPaymentCounter()).toNumber();
    }

    async registerDownPayment(
        admin: string,
        payee: string,
        duration: number,
        tokenAddress: string
    ): Promise<[number, string, string]> {
        if (!utils.isAddress(admin) || !utils.isAddress(payee) || !utils.isAddress(tokenAddress)) {
            throw new Error('Not an address');
        }
        if (duration <= 0) {
            throw new Error('Duration must be greater than 0');
        }
        const tx = await this._contract.registerDownPayment(admin, payee, duration, tokenAddress);
        const { events, transactionHash } = await tx.wait();
        if (!events) {
            throw new Error('Error during down payment registration, no events found');
        }
        const eventArgs = events.find((e: Event) => e.event === 'DownPaymentRegistered')?.args;
        if (!eventArgs) {
            throw new Error('Error during down payment registration, down payment not registered');
        }

        return [eventArgs.id.toNumber(), eventArgs.downPaymentAddress, transactionHash];
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

    async getDownPayment(id: number): Promise<string> {
        return this._contract.getDownPayment(id);
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

    async addAdmin(admin: string): Promise<void> {
        if (!utils.isAddress(admin)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.addAdmin(admin);
        await tx.wait();
    }

    async removeAdmin(admin: string): Promise<void> {
        if (!utils.isAddress(admin)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.removeAdmin(admin);
        await tx.wait();
    }
}
