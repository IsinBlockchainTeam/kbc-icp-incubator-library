import {Signer, utils} from 'ethers';
import { Escrow as EscrowContract, Escrow__factory } from "../smart-contracts";
import { EscrowStatus } from "../types/EscrowStatus";

export class EscrowDriver {
    private _contract: EscrowContract;

    constructor(signer: Signer, escrowAddress: string) {
        this._contract = Escrow__factory
            .connect(escrowAddress, signer.provider!)
            .connect(signer);
    }

    async getOwner(): Promise<string> {
        return await this._contract.getOwner();
    }

    async getPayee(): Promise<string> {
        return await this._contract.getPayee();
    }

    async getPurchaser(): Promise<string> {
        return await this._contract.getPurchaser();
    }

    async getPayers(): Promise<string[]> {
        return await this._contract.getPayers();
    }

    async getPayer(address: string): Promise<EscrowContract.PayerStructOutput> {
        return await this._contract.getPayer(address);
    }

    async getAgreedAmount(): Promise<number> {
        return (await this._contract.getAgreedAmount()).toNumber();
    }

    async getDeployedAt(): Promise<number> {
        return (await this._contract.getDeployedAt()).toNumber();
    }

    async getDuration(): Promise<number> {
        return (await this._contract.getDuration()).toNumber();
    }

    async getState(): Promise<EscrowStatus> {
        switch (await this._contract.getState()) {
            case 0:
                return EscrowStatus.ACTIVE;
            case 1:
                return EscrowStatus.REFUNDING;
            case 2:
                return EscrowStatus.CLOSED;
            default:
                throw new Error('Invalid state');
        }
    }

    async getDepositAmount(): Promise<number> {
        return (await this._contract.getDepositAmount()).toNumber();
    }

    async getTokenAddress(): Promise<string> {
        return await this._contract.getTokenAddress();
    }

    async getCommissioner(): Promise<string> {
        return await this._contract.getCommissioner();
    }

    async getBaseFee(): Promise<number> {
        return (await this._contract.getBaseFee()).toNumber();
    }

    async getPercentageFee(): Promise<number> {
        return (await this._contract.getPercentageFee()).toNumber();
    }

    async updateCommissioner(newCommissioner: string): Promise<void> {
        if(!utils.isAddress(newCommissioner)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.updateCommissioner(newCommissioner);
        await tx.wait();
    }

    async updateBaseFee(newBaseFee: number): Promise<void> {
        const tx = await this._contract.updateBaseFee(newBaseFee);
        await tx.wait();
    }

    async updatePercentageFee(newPercentageFee: number): Promise<void> {
        if(newPercentageFee < 0 || newPercentageFee > 100) {
            throw new Error('Percentage fee must be between 0 and 100');
        }
        const tx = await this._contract.updatePercentageFee(newPercentageFee);
        await tx.wait();
    }

    async getDeadline(): Promise<number> {
        return (await this._contract.getDeadline()).toNumber();
    }

    async hasExpired(): Promise<boolean> {
        return await this._contract.hasExpired();
    }

    async withdrawalAllowed(): Promise<boolean> {
        return await this._contract.withdrawalAllowed();
    }

    async refundAllowed(): Promise<boolean> {
        return await this._contract.refundAllowed();
    }

    async addDelegate(delegate: string): Promise<void> {
        if(!utils.isAddress(delegate)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.addDelegate(delegate);
        await tx.wait();
    }

    async removeDelegate(delegate: string): Promise<void> {
        if(!utils.isAddress(delegate)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.removeDelegate(delegate);
        await tx.wait();
    }

    async deposit(amount: number): Promise<void> {
        const tx = await this._contract.deposit(amount);
        await tx.wait();
    }

    async close(): Promise<void> {
        const tx = await this._contract.close();
        await tx.wait();
    }

    async enableRefund(): Promise<void> {
        const tx = await this._contract.enableRefund();
        await tx.wait();
    }

    async enableRefundForExpiredEscrow(): Promise<void> {
        const tx = await this._contract.enableRefundForExpiredEscrow();
        await tx.wait();
    }

    async withdraw(): Promise<void> {
        const tx = await this._contract.withdraw();
        await tx.wait();
    }

    async refund(): Promise<void> {
        const tx = await this._contract.refund();
        await tx.wait();
    }
}