import { Signer, utils } from 'ethers';
import { Escrow as EscrowContract, Escrow__factory } from '../smart-contracts';
import { EscrowStatus } from '../types/EscrowStatus';

export class EscrowDriver {
    private _contract: EscrowContract;

    constructor(signer: Signer, escrowAddress: string) {
        this._contract = Escrow__factory.connect(escrowAddress, signer.provider!).connect(signer);
    }

    async getOwner(): Promise<string> {
        return this._contract.getOwner();
    }
    async getPayee(): Promise<string> {
        return this._contract.getPayee();
    }
    async getDeployedAt(): Promise<number> {
        return (await this._contract.getDeployedAt()).toNumber();
    }
    async getDuration(): Promise<number> {
        return (await this._contract.getDuration()).toNumber();
    }
    async getDeadline(): Promise<number> {
        return (await this._contract.getDeadline()).toNumber();
    }
    async getTokenAddress(): Promise<string> {
        return this._contract.getTokenAddress();
    }
    async getState(): Promise<EscrowStatus> {
        switch (await this._contract.getState()) {
            case 0:
                return EscrowStatus.ACTIVE;
            case 1:
                return EscrowStatus.WITHDRAWING;
            case 2:
                return EscrowStatus.REFUNDING;
            default:
                throw new Error('Invalid state');
        }
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
    async getFees(amount: number): Promise<number> {
        return (await this._contract.getFees(amount)).toNumber();
    }

    async getDepositedAmount(): Promise<number> {
        return (await this._contract.getDepositedAmount()).toNumber();
    }
    async getTotalDepositedAmount(): Promise<number> {
        return (await this._contract.getTotalDepositedAmount()).toNumber();
    }
    async getRefundedAmount(): Promise<number> {
        return (await this._contract.getRefundedAmount()).toNumber();
    }
    async getTotalRefundedAmount(): Promise<number> {
        return (await this._contract.getTotalRefundedAmount()).toNumber();
    }
    async getTotalWithdrawnAmount(): Promise<number> {
        return (await this._contract.getTotalWithdrawnAmount()).toNumber();
    }

    async getRefundablePercentage(): Promise<number> {
        return (await this._contract.getRefundablePercentage()).toNumber();
    }
    async getWithdrawablePercentage(): Promise<number> {
        return (await this._contract.getWithdrawablePercentage()).toNumber();
    }
    async getWithdrawableAmount(): Promise<number> {
        return (await this._contract.getWithdrawableAmount()).toNumber();
    }
    async getRefundableAmount(payer: string): Promise<number> {
        if (!utils.isAddress(payer)) {
            throw new Error('Not an address');
        }
        return (await this._contract.getRefundableAmount(payer)).toNumber();
    }

    async updateFeeRecipient(newCommissioner: string): Promise<void> {
        if (!utils.isAddress(newCommissioner)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.updateFeeRecipient(newCommissioner);
        await tx.wait();
    }
    async updateBaseFee(newBaseFee: number): Promise<void> {
        if (newBaseFee < 0) {
            throw new Error('Base fee must be greater than or equal to 0');
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

    async isExpired(): Promise<boolean> {
        return this._contract.isExpired();
    }

    async enableWithdrawal(withdrawablePercentage: number): Promise<void> {
        if (withdrawablePercentage < 0 || withdrawablePercentage > 100) {
            throw new Error('Percentage must be between 0 and 100');
        }
        const tx = await this._contract.enableWithdrawal(withdrawablePercentage);
        await tx.wait();
    }
    async enableRefund(refundablePercentage: number): Promise<void> {
        if (refundablePercentage < 0 || refundablePercentage > 100) {
            throw new Error('Percentage must be between 0 and 100');
        }
        const tx = await this._contract.enableRefund(refundablePercentage);
        await tx.wait();
    }

    async deposit(amount: number): Promise<void> {
        if (amount < 0) {
            throw new Error('Amount must be greater than or equal to 0');
        }
        const tx = await this._contract.deposit(amount);
        await tx.wait();
    }
    async payerWithdraw(amount: number): Promise<void> {
        if (amount < 0) {
            throw new Error('Amount must be greater than or equal to 0');
        }
        const tx = await this._contract.payerWithdraw(amount);
        await tx.wait();
    }
    async payeeWithdraw(): Promise<void> {
        const tx = await this._contract.payeeWithdraw();
        await tx.wait();
    }
    async payerRefund(): Promise<void> {
        const tx = await this._contract.payerRefund();
        await tx.wait();
    }
}
