import { DownPaymentDriver } from '../drivers/DownPaymentDriver';

export class DownPaymentService {
    private _downPaymentDriver: DownPaymentDriver;

    constructor(supplyChainDriver: DownPaymentDriver) {
        this._downPaymentDriver = supplyChainDriver;
    }

    async getOwner(): Promise<string> {
        return this._downPaymentDriver.getOwner();
    }

    async getPayee(): Promise<string> {
        return this._downPaymentDriver.getPayee();
    }

    async getPayers(): Promise<string[]> {
        return this._downPaymentDriver.getPayers();
    }

    async getDeployedAt(): Promise<number> {
        return this._downPaymentDriver.getDeployedAt();
    }

    async getDuration(): Promise<number> {
        return this._downPaymentDriver.getDuration();
    }

    async getDeadline(): Promise<number> {
        return this._downPaymentDriver.getDeadline();
    }

    async getTokenAddress(): Promise<string> {
        return this._downPaymentDriver.getTokenAddress();
    }

    async getFeeRecipient(): Promise<string> {
        return this._downPaymentDriver.getFeeRecipient();
    }

    async getBaseFee(): Promise<number> {
        return this._downPaymentDriver.getBaseFee();
    }

    async getPercentageFee(): Promise<number> {
        return this._downPaymentDriver.getPercentageFee();
    }

    async getFees(amount: number): Promise<number> {
        return this._downPaymentDriver.getFees(amount);
    }

    async getTotalDepositedAmount(): Promise<number> {
        return this._downPaymentDriver.getTotalDepositedAmount();
    }

    async getDepositedAmount(payer: string): Promise<number> {
        return this._downPaymentDriver.getDepositedAmount(payer);
    }

    async getLockedAmount(): Promise<number> {
        return this._downPaymentDriver.getLockedAmount();
    }

    async getReleasableAmount(): Promise<number> {
        return this._downPaymentDriver.getReleasableAmount();
    }

    async getReleasedAmount(): Promise<number> {
        return this._downPaymentDriver.getReleasedAmount();
    }

    async getTotalRefundableAmount(): Promise<number> {
        return this._downPaymentDriver.getTotalRefundableAmount();
    }

    async getRefundedAmount(payer: string): Promise<number> {
        return this._downPaymentDriver.getRefundedAmount(payer);
    }

    async getTotalRefundedAmount(): Promise<number> {
        return this._downPaymentDriver.getTotalRefundedAmount();
    }

    async getBalance(): Promise<number> {
        return this._downPaymentDriver.getBalance();
    }

    async getWithdrawableAmount(payer: string): Promise<number> {
        return this._downPaymentDriver.getWithdrawableAmount(payer);
    }

    async getRefundableAmount(amount: number, payer: string): Promise<number> {
        return this._downPaymentDriver.getRefundableAmount(amount, payer);
    }

    async updateFeeRecipient(newFeeRecipient: string): Promise<void> {
        await this._downPaymentDriver.updateFeeRecipient(newFeeRecipient);
    }

    async updateBaseFee(newBaseFee: number): Promise<void> {
        await this._downPaymentDriver.updateBaseFee(newBaseFee);
    }

    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        await this._downPaymentDriver.updatePercentageFee(newPercentageFee);
    }

    async isExpired(): Promise<boolean> {
        return this._downPaymentDriver.isExpired();
    }

    async lockFunds(amount: number): Promise<void> {
        await this._downPaymentDriver.lockFunds(amount);
    }

    async releaseFunds(amount: number): Promise<void> {
        await this._downPaymentDriver.releaseFunds(amount);
    }

    async refundFunds(amount: number): Promise<void> {
        await this._downPaymentDriver.refundFunds(amount);
    }

    async deposit(amount: number, payer: string): Promise<void> {
        await this._downPaymentDriver.deposit(amount, payer);
    }

    async withdraw(amount: number): Promise<void> {
        await this._downPaymentDriver.withdraw(amount);
    }

    async addAdmin(admin: string): Promise<void> {
        await this._downPaymentDriver.addAdmin(admin);
    }

    async removeAdmin(admin: string): Promise<void> {
        await this._downPaymentDriver.removeAdmin(admin);
    }
}
