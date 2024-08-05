import { EscrowManagerDriver } from '../drivers/EscrowManagerDriver';

export class EscrowManagerService {
    private _escrowManagerDriver: EscrowManagerDriver;

    constructor(supplyChainDriver: EscrowManagerDriver) {
        this._escrowManagerDriver = supplyChainDriver;
    }

    async getEscrowCounter(): Promise<number> {
        return this._escrowManagerDriver.getEscrowCounter();
    }

    async registerEscrow(admin: string, payee: string, duration: number, tokenAddress: string): Promise<[number, string, string]> {
        return this._escrowManagerDriver.registerEscrow(
            admin,
            payee,
            duration,
            tokenAddress
        );
    }

    async getFeeRecipient(): Promise<string> {
        return this._escrowManagerDriver.getFeeRecipient();
    }

    async getBaseFee(): Promise<number> {
        return this._escrowManagerDriver.getBaseFee();
    }

    async getPercentageFee(): Promise<number> {
        return this._escrowManagerDriver.getPercentageFee();
    }

    async getEscrow(id: number): Promise<string> {
        return this._escrowManagerDriver.getEscrow(id);
    }

    async updateFeeRecipient(newFeeRecipient: string): Promise<void> {
        await this._escrowManagerDriver.updateFeeRecipient(newFeeRecipient);
    }

    async updateBaseFee(newBaseFee: number): Promise<void> {
        await this._escrowManagerDriver.updateBaseFee(newBaseFee);
    }

    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        await this._escrowManagerDriver.updatePercentageFee(newPercentageFee);
    }

    async addAdmin(admin: string): Promise<void> {
        await this._escrowManagerDriver.addAdmin(admin);
    }

    async removeAdmin(admin: string): Promise<void> {
        await this._escrowManagerDriver.removeAdmin(admin);
    }
}
