import { Signer, utils } from 'ethers';
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

    async getLineCounter(): Promise<number> {
        try {
            const counter = await this._contract.getLineCounter();
            return counter.toNumber();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getTradeType(): Promise<TradeType> {
        try {
            return getTradeTypeByIndex(await this._contract.getTradeType());
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getLineExists(id: number): Promise<boolean> {
        try {
            return this._contract.getLineExists(id);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getTradeStatus(): Promise<TradeStatus> {
        try {
            const result = await this._contract.getTradeStatus();
            switch (result) {
            case 0:
                return TradeStatus.PAYED;
            case 1:
                return TradeStatus.SHIPPED;
            case 2:
                return TradeStatus.ON_BOARD;
            case 3:
                return TradeStatus.CONTRACTING;
            default:
                throw new Error(`TradeDriver: an invalid value "${result}" for "TradeStatus" was returned by the contract`);
            }
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addDocument(documentType: DocumentType, externalUrl: string, contentHash: string): Promise<void> {
        try {
            const tx = await this._contract.addDocument(documentType, externalUrl, contentHash);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getAllDocumentIds(): Promise<number[]> {
        try {
            const ids = await this._contract.getAllDocumentIds();
            return ids.map((id) => id.toNumber());
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentIdsByType(documentType: DocumentType): Promise<number[]> {
        try {
            const ids = await this._contract.getDocumentIdsByType(documentType);
            return ids.map((id) => id.toNumber());
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addAdmin(account: string): Promise<void> {
        if (!utils.isAddress(account)) throw new Error('Not an address');
        try {
            const tx = await this._contract.addAdmin(account);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeAdmin(account: string): Promise<void> {
        if (!utils.isAddress(account)) throw new Error('Not an address');
        try {
            const tx = await this._contract.removeAdmin(account);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
