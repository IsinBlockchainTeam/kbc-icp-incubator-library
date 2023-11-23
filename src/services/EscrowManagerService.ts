import { EscrowManagerDriver } from "../drivers/EscrowManagerDriver";
import {Escrow} from "../entities/Escrow";

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

    async getEscrow(id: number): Promise<Escrow> {
        return this._escrowManagerDriver.getEscrow(id);
    }

    async getEscrowsId(payer: string): Promise<number[]> {
        return this._escrowManagerDriver.getEscrowsId(payer);
    }
}