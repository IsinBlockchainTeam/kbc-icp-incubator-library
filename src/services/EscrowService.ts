import { EscrowDriver } from '../drivers/EscrowDriver';

export class EscrowService {
    private _escrowDriver: EscrowDriver;

    constructor(supplyChainDriver: EscrowDriver) {
        this._escrowDriver = supplyChainDriver;
    }

    async getOwner(): Promise<string> {
        return this._escrowDriver.getOwner();
    }

    async getPayee(): Promise<string> {
        return this._escrowDriver.getPayee();
    }

    async getPayers(): Promise<string[]> {
        return this._escrowDriver.getPayers();
    }

    async getDeployedAt(): Promise<number> {
        return this._escrowDriver.getDeployedAt();
    }

    async getDuration(): Promise<number> {
        return this._escrowDriver.getDuration();
    }

    async getDeadline(): Promise<number> {
        return this._escrowDriver.getDeadline();
    }

    async getTokenAddress(): Promise<string> {
        return this._escrowDriver.getTokenAddress();
    }

    async getFeeRecipient(): Promise<string> {
        return this._escrowDriver.getFeeRecipient();
    }

    async getBaseFee(): Promise<number> {
        return this._escrowDriver.getBaseFee();
    }

    async getPercentageFee(): Promise<number> {
        return this._escrowDriver.getPercentageFee();
    }

    async getFees(amount: number): Promise<number> {
        return this._escrowDriver.getFees(amount);
    }

    async getTotalDepositedAmount(): Promise<number> {
        return this._escrowDriver.getTotalDepositedAmount();
    }

    async getDepositedAmount(payer: string): Promise<number> {
        return this._escrowDriver.getDepositedAmount(payer);
    }

    async getLockedAmount(): Promise<number> {
        return this._escrowDriver.getLockedAmount();
    }

    async getReleasableAmount(): Promise<number> {
        return this._escrowDriver.getReleasableAmount();
    }

    async getReleasedAmount(): Promise<number> {
        return this._escrowDriver.getReleasedAmount();
    }

    async getTotalRefundableAmount(): Promise<number> {
        return this._escrowDriver.getTotalRefundableAmount();
    }

    async getRefundedAmount(payer: string): Promise<number> {
        return this._escrowDriver.getRefundedAmount(payer);
    }

    async getTotalRefundedAmount(): Promise<number> {
        return this._escrowDriver.getTotalRefundedAmount();
    }

    async getBalance(): Promise<number> {
        return this._escrowDriver.getBalance();
    }

    async getWithdrawableAmount(payer: string): Promise<number> {
        return this._escrowDriver.getWithdrawableAmount(payer);
    }

    async getRefundableAmount(amount: number, payer: string): Promise<number> {
        return this._escrowDriver.getRefundableAmount(amount, payer);
    }

    async updateFeeRecipient(newFeeRecipient: string): Promise<void> {
        await this._escrowDriver.updateFeeRecipient(newFeeRecipient);
    }

    async updateBaseFee(newBaseFee: number): Promise<void> {
        await this._escrowDriver.updateBaseFee(newBaseFee);
    }

    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        await this._escrowDriver.updatePercentageFee(newPercentageFee);
    }

    async isExpired(): Promise<boolean> {
        return this._escrowDriver.isExpired();
    }

    async lockFunds(amount: number): Promise<void> {
        await this._escrowDriver.lockFunds(amount);
    }

    async releaseFunds(amount: number): Promise<void> {
        await this._escrowDriver.releaseFunds(amount);
    }

    async deposit(amount: number): Promise<void> {
        await this._escrowDriver.deposit(amount);
    }

    async withdraw(amount: number): Promise<void> {
        await this._escrowDriver.withdraw(amount);
    }

    async addAdmin(admin: string): Promise<void> {
        await this._escrowDriver.addAdmin(admin);
    }

    async removeAdmin(admin: string): Promise<void> {
        await this._escrowDriver.removeAdmin(admin);
    }
}
