import { EscrowDriver } from '../drivers/EscrowDriver';
import { EscrowStatus } from '../types/EscrowStatus';
import { Escrow } from '../smart-contracts';

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

    async getPurchaser(): Promise<string> {
        return this._escrowDriver.getPurchaser();
    }

    async getPayers(): Promise<string[]> {
        return this._escrowDriver.getPayers();
    }

    async getPayer(address: string): Promise<Escrow.PayerStructOutput> {
        return this._escrowDriver.getPayer(address);
    }

    async getAgreedAmount(): Promise<number> {
        return this._escrowDriver.getAgreedAmount();
    }

    async getDeployedAt(): Promise<number> {
        return this._escrowDriver.getDeployedAt();
    }

    async getDuration(): Promise<number> {
        return this._escrowDriver.getDuration();
    }

    async getState(): Promise<EscrowStatus> {
        return this._escrowDriver.getState();
    }

    async getDepositAmount(): Promise<number> {
        return this._escrowDriver.getDepositAmount();
    }

    async getTokenAddress(): Promise<string> {
        return this._escrowDriver.getTokenAddress();
    }

    async getCommissioner(): Promise<string> {
        return this._escrowDriver.getCommissioner();
    }

    async getBaseFee(): Promise<number> {
        return this._escrowDriver.getBaseFee();
    }

    async updateBaseFee(newBaseFee: number): Promise<void> {
        await this._escrowDriver.updateBaseFee(newBaseFee);
    }

    async getPercentageFee(): Promise<number> {
        return this._escrowDriver.getPercentageFee();
    }

    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        await this._escrowDriver.updatePercentageFee(newPercentageFee);
    }

    async updateCommissioner(newCommissioner: string): Promise<void> {
        await this._escrowDriver.updateCommissioner(newCommissioner);
    }

    async getDeadline(): Promise<number> {
        return this._escrowDriver.getDeadline();
    }

    async hasExpired(): Promise<boolean> {
        return this._escrowDriver.hasExpired();
    }

    async withdrawalAllowed(): Promise<boolean> {
        return this._escrowDriver.withdrawalAllowed();
    }

    async refundAllowed(): Promise<boolean> {
        return this._escrowDriver.refundAllowed();
    }

    async addDelegate(delegate: string): Promise<void> {
        await this._escrowDriver.addDelegate(delegate);
    }

    async removeDelegate(delegate: string): Promise<void> {
        await this._escrowDriver.removeDelegate(delegate);
    }

    async deposit(amount: number): Promise<void> {
        await this._escrowDriver.deposit(amount);
    }

    async lock(): Promise<void> {
        await this._escrowDriver.lock();
    }

    async close(): Promise<void> {
        await this._escrowDriver.close();
    }

    async enableRefund(): Promise<void> {
        await this._escrowDriver.enableRefund();
    }

    async enableRefundForExpiredEscrow(): Promise<void> {
        await this._escrowDriver.enableRefundForExpiredEscrow();
    }

    async withdraw(): Promise<void> {
        await this._escrowDriver.withdraw();
    }

    async refund(): Promise<void> {
        await this._escrowDriver.refund();
    }
}
