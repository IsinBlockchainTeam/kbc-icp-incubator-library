import { EscrowManagerDriver } from '../drivers/EscrowManagerDriver';

export class EscrowManagerService {
    private _escrowManagerDriver: EscrowManagerDriver;

    constructor(supplyChainDriver: EscrowManagerDriver) {
        this._escrowManagerDriver = supplyChainDriver;
    }

    async registerEscrow(payee: string, purchaser: string, agreedAmount: number, duration: number, tokenAddress: string): Promise<void> {
        await this._escrowManagerDriver.registerEscrow(payee, purchaser, agreedAmount, duration, tokenAddress);
    }

    async getCommissioner(): Promise<string> {
        return this._escrowManagerDriver.getCommissioner();
    }

    async updateCommissioner(newCommissioner: string): Promise<void> {
        await this._escrowManagerDriver.updateCommissioner(newCommissioner);
    }

    async getBaseFee(): Promise<number> {
        return this._escrowManagerDriver.getBaseFee();
    }

    async updateBaseFee(newBaseFee: number): Promise<void> {
        await this._escrowManagerDriver.updateBaseFee(newBaseFee);
    }

    async getPercentageFee(): Promise<number> {
        return this._escrowManagerDriver.getPercentageFee();
    }

    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        await this._escrowManagerDriver.updatePercentageFee(newPercentageFee);
    }

    async getEscrow(id: number): Promise<string> {
        return this._escrowManagerDriver.getEscrow(id);
    }

    async getEscrowIdsOfPurchaser(purchaser: string): Promise<number[]> {
        return this._escrowManagerDriver.getEscrowIdsOfPurchaser(purchaser);
    }
}
