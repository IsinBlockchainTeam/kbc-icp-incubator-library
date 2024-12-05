import { DownPaymentManagerDriver } from '../drivers/DownPaymentManagerDriver';

export class DownPaymentManagerService {
    private _downPaymentManagerDriver: DownPaymentManagerDriver;

    constructor(supplyChainDriver: DownPaymentManagerDriver) {
        this._downPaymentManagerDriver = supplyChainDriver;
    }

    async getDownPaymentCounter(): Promise<number> {
        return this._downPaymentManagerDriver.getDownPaymentCounter();
    }

    async registerDownPayment(
        admin: string,
        payee: string,
        duration: number,
        tokenAddress: string
    ): Promise<[number, string, string]> {
        return this._downPaymentManagerDriver.registerDownPayment(
            admin,
            payee,
            duration,
            tokenAddress
        );
    }

    async getFeeRecipient(): Promise<string> {
        return this._downPaymentManagerDriver.getFeeRecipient();
    }

    async getBaseFee(): Promise<number> {
        return this._downPaymentManagerDriver.getBaseFee();
    }

    async getPercentageFee(): Promise<number> {
        return this._downPaymentManagerDriver.getPercentageFee();
    }

    async getDownPayment(id: number): Promise<string> {
        return this._downPaymentManagerDriver.getDownPayment(id);
    }

    async updateFeeRecipient(newFeeRecipient: string): Promise<void> {
        await this._downPaymentManagerDriver.updateFeeRecipient(newFeeRecipient);
    }

    async updateBaseFee(newBaseFee: number): Promise<void> {
        await this._downPaymentManagerDriver.updateBaseFee(newBaseFee);
    }

    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        await this._downPaymentManagerDriver.updatePercentageFee(newPercentageFee);
    }

    async addAdmin(admin: string): Promise<void> {
        await this._downPaymentManagerDriver.addAdmin(admin);
    }

    async removeAdmin(admin: string): Promise<void> {
        await this._downPaymentManagerDriver.removeAdmin(admin);
    }
}
