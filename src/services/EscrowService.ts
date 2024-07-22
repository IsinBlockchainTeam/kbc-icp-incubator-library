import { EscrowDriver } from '../drivers/EscrowDriver';
import { EscrowStatus } from '../types/EscrowStatus';

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
    async getState(): Promise<EscrowStatus> {
        return this._escrowDriver.getState();
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

    async getDepositedAmount(): Promise<number> {
        return this._escrowDriver.getDepositedAmount();
    }
    async getTotalDepositedAmount(): Promise<number> {
        return this._escrowDriver.getTotalDepositedAmount();
    }
    async getRefundedAmount(): Promise<number> {
        return this._escrowDriver.getRefundedAmount();
    }
    async getTotalRefundedAmount(): Promise<number> {
        return this._escrowDriver.getTotalRefundedAmount();
    }
    async getTotalWithdrawnAmount(): Promise<number> {
        return this._escrowDriver.getTotalWithdrawnAmount();
    }

    async getRefundablePercentage(): Promise<number> {
        return this._escrowDriver.getRefundablePercentage();
    }
    async getWithdrawablePercentage(): Promise<number> {
        return this._escrowDriver.getWithdrawablePercentage();
    }
    async getWithdrawableAmount(): Promise<number> {
        return this._escrowDriver.getWithdrawableAmount();
    }
    async getRefundableAmount(payer: string): Promise<number> {
        return this._escrowDriver.getRefundableAmount(payer);
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

    async enableWithdrawal(withdrawablePercentage: number): Promise<void> {
        await this._escrowDriver.enableWithdrawal(withdrawablePercentage);
    }
    async enableRefund(refundablePercentage: number): Promise<void> {
        await this._escrowDriver.enableRefund(refundablePercentage);
    }

    async deposit(amount: number): Promise<void> {
        await this._escrowDriver.deposit(amount);
    }
    async payerWithdraw(amount: number): Promise<void> {
        await this._escrowDriver.payerWithdraw(amount);
    }
    async payeeWithdraw(): Promise<void> {
        await this._escrowDriver.payeeWithdraw();
    }
    async payerRefund(): Promise<void> {
        await this._escrowDriver.payerRefund();
    }
}
