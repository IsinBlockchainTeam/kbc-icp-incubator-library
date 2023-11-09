import { EscrowManagerDriver } from "../drivers/EscrowManagerDriver";
import {Escrow} from "../entities/Escrow";

export class EscrowManagerService {
    private _escrowManagerDriver: EscrowManagerDriver;

    constructor(supplyChainDriver: EscrowManagerDriver) {
        this._escrowManagerDriver = supplyChainDriver;
    }

    async registerEscrow(payee: string, payer: string, duration: number, tokenAddress: string): Promise<void> {
        await this._escrowManagerDriver.registerEscrow(payee, payer, duration, tokenAddress);
    }

    async getEscrow(id: number): Promise<Escrow> {
        return this._escrowManagerDriver.getEscrow(id);
    }

    async getPayees(payer: string): Promise<string[]> {
        return this._escrowManagerDriver.getPayees(payer);
    }
}