import { EscrowDriver } from "../drivers/EscrowDriver";
import { EscrowStatus } from "../types/EscrowStatus";
import { Escrow } from "../smart-contracts";

export class EscrowService {
    private _escrowDriver: EscrowDriver;

    constructor(supplyChainDriver: EscrowDriver) {
        this._escrowDriver = supplyChainDriver;
    }

    async getPayee(): Promise<string> {
        return this._escrowDriver.getPayee();
    }

    async getPurchaser(): Promise<string> {
        return this._escrowDriver.getPurchaser();
    }

    async getPayers(): Promise<Escrow.PayersStructOutput[]> {
        return this._escrowDriver.getPayers();
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

    async deposit(amount: number): Promise<void> {
        await this._escrowDriver.deposit(amount);
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