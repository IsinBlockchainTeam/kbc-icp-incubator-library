import { Signer, utils } from 'ethers';
import { Escrow as EscrowContract, Escrow__factory } from '../smart-contracts';

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

    async getPayers(): Promise<string[]> {
        return this._contract.getPayers();
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
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        return (await this._contract.getFees(amount)).toNumber();
    }

    async getTotalDepositedAmount(): Promise<number> {
        return (await this._contract.getTotalDepositedAmount()).toNumber();
    }

    async getDepositedAmount(payer: string): Promise<number> {
        if (!utils.isAddress(payer)) {
            throw new Error('Not an address');
        }
        return (await this._contract.getDepositedAmount(payer)).toNumber();
    }

    async getLockedAmount(): Promise<number> {
        return (await this._contract.getLockedAmount()).toNumber();
    }

    async getReleasableAmount(): Promise<number> {
        return (await this._contract.getReleasableAmount()).toNumber();
    }

    async getReleasedAmount(): Promise<number> {
        return (await this._contract.getReleasedAmount()).toNumber();
    }

    async getTotalRefundableAmount(): Promise<number> {
        return (await this._contract.getTotalRefundableAmount()).toNumber();
    }

    async getRefundedAmount(payer: string): Promise<number> {
        if (!utils.isAddress(payer)) {
            throw new Error('Not an address');
        }
        return (await this._contract.getRefundedAmount(payer)).toNumber();
    }

    async getTotalRefundedAmount(): Promise<number> {
        return (await this._contract.getTotalRefundedAmount()).toNumber();
    }

    async getBalance(): Promise<number> {
        return (await this._contract.getBalance()).toNumber();
    }

    async getWithdrawableAmount(payer: string): Promise<number> {
        if (!utils.isAddress(payer)) {
            throw new Error('Not an address');
        }
        return (await this._contract.getWithdrawableAmount(payer)).toNumber();
    }

    async getRefundableAmount(amount: number, payer: string): Promise<number> {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        if (!utils.isAddress(payer)) {
            throw new Error('Not an address');
        }
        return (await this._contract.getRefundableAmount(amount, payer)).toNumber();
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

    async lockFunds(amount: number): Promise<void> {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        const tx = await this._contract.lockFunds(amount);
        await tx.wait();
    }

    async releaseFunds(amount: number): Promise<void> {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        const tx = await this._contract.releaseFunds(amount);
        await tx.wait();
    }

    async refundFunds(amount: number): Promise<void> {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        const tx = await this._contract.refundFunds(amount);
        await tx.wait();
    }

    async deposit(amount: number, payer: string): Promise<void> {
        if (amount < 0) {
            throw new Error('Amount must be greater than or equal to 0');
        }
        if (!utils.isAddress(payer)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.deposit(amount, payer);
        await tx.wait();
    }

    async withdraw(amount: number): Promise<void> {
        if (amount < 0) {
            throw new Error('Amount must be greater than or equal to 0');
        }
        const tx = await this._contract.withdraw(amount);
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
