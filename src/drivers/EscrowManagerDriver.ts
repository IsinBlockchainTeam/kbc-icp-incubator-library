import {BigNumber, Signer, utils} from 'ethers';
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

    async registerEscrow(payee: string, purchaser: string, agreedAmount: number, duration: number, tokenAddress: string): Promise<void> {
        if(!utils.isAddress(payee) || !utils.isAddress(purchaser) || !utils.isAddress(tokenAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerEscrow(payee, purchaser, agreedAmount, duration, tokenAddress);
        await tx.wait();
    }

    async getCommissioner(): Promise<string> {
        return this._contract.getCommissioner();
    }

    async updateCommissioner(newCommissioner: string): Promise<void> {
        if(!utils.isAddress(newCommissioner)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.updateCommissioner(newCommissioner);
        await tx.wait();
    }

    async getEscrow(id: number): Promise<Escrow> {
        const escrow = await this._contract.getEscrow(id);
        return EntityBuilder.buildEscrowFromString(escrow);
    }

    async getEscrowsId(purchaser: string): Promise<number[]> {
        const escrowsId = await this._contract.getEscrowsId(purchaser);
        return escrowsId.map((id: BigNumber) => id.toNumber());
    }
}