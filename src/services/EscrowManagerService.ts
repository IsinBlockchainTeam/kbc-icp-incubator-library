import { EscrowManagerDriver } from '../drivers/EscrowManagerDriver';
import { RoleProof } from '../types/RoleProof';

export class EscrowManagerService {
    private _escrowManagerDriver: EscrowManagerDriver;

    constructor(supplyChainDriver: EscrowManagerDriver) {
        this._escrowManagerDriver = supplyChainDriver;
    }

    async getEscrowCounter(roleProof: RoleProof): Promise<number> {
        return this._escrowManagerDriver.getEscrowCounter(roleProof);
    }

    async registerEscrow(
        roleProof: RoleProof,
        admin: string,
        payee: string,
        duration: number,
        tokenAddress: string
    ): Promise<[number, string, string]> {
        return this._escrowManagerDriver.registerEscrow(
            roleProof,
            admin,
            payee,
            duration,
            tokenAddress
        );
    }

    async getFeeRecipient(roleProof: RoleProof): Promise<string> {
        return this._escrowManagerDriver.getFeeRecipient(roleProof);
    }

    async getBaseFee(roleProof: RoleProof): Promise<number> {
        return this._escrowManagerDriver.getBaseFee(roleProof);
    }

    async getPercentageFee(roleProof: RoleProof): Promise<number> {
        return this._escrowManagerDriver.getPercentageFee(roleProof);
    }

    async getEscrow(roleProof: RoleProof, id: number): Promise<string> {
        return this._escrowManagerDriver.getEscrow(roleProof, id);
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
