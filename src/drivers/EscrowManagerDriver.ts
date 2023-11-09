import { Signer, utils } from 'ethers';
import { EscrowManager, EscrowManager__factory } from "../smart-contracts";
import {Escrow} from "../entities/Escrow";
import {EntityBuilder} from "../utils/EntityBuilder";

export class EscrowManagerDriver {
    private _contract: EscrowManager;

    constructor(signer: Signer, escrowManagerAddress: string) {
        this._contract = EscrowManager__factory
            .connect(escrowManagerAddress, signer.provider!)
            .connect(signer);
    }

    async registerEscrow(payee: string, payer: string, duration: number, tokenAddress: string): Promise<void> {
        if(!utils.isAddress(payee) || !utils.isAddress(payer) || !utils.isAddress(tokenAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerEscrow(payee, payer, duration, tokenAddress);
        await tx.wait();
    }

    async getEscrow(id: number): Promise<Escrow> {
        const escrow = await this._contract.getEscrow(id);
        return EntityBuilder.buildEscrowFromString(escrow);
    }

    async getPayees(payer: string): Promise<string[]> {
        return await this._contract.getPayees(payer);
    }
}