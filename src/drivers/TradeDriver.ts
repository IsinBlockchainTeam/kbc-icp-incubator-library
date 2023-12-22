import { Signer } from 'ethers';
import { Trade as TradeContract, Trade__factory } from '../smart-contracts';
import { TradeStatus } from '../types/TradeStatus';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import { getTradeTypeByIndex } from '../utils/utils';

export class TradeDriver {
    protected _contract: TradeContract;

    constructor(signer: Signer, tradeAddress: string) {
        this._contract = Trade__factory
            .connect(tradeAddress, signer.provider!)
            .connect(signer);
    }

    async getTradeType(): Promise<TradeType> {
        return getTradeTypeByIndex(await this._contract.getTradeType());
    }

    async getLineExists(id: number): Promise<boolean> {
        return this._contract.getLineExists(id);
    }

    async getTradeStatus(): Promise<TradeStatus> {
        const result = await this._contract.getTradeStatus();
        switch (result) {
        case 0:
            return TradeStatus.SHIPPED;
        case 1:
            return TradeStatus.ON_BOARD;
        case 2:
            return TradeStatus.CONTRACTING;
        default:
            throw new Error(`TradeDriver: an invalid value "${result}" for "TradeStatus" was returned by the contract`);
        }
    }

    async addDocument(name: string, documentType: DocumentType, externalUrl: string): Promise<void> {
        const tx = await this._contract.addDocument(name, documentType, externalUrl);
        await tx.wait();
    }

    async addAdmin(account: string): Promise<void> {
        const tx = await this._contract.addAdmin(account);
        await tx.wait();
    }

    async removeAdmin(account: string): Promise<void> {
        const tx = await this._contract.removeAdmin(account);
        await tx.wait();
    }
}
