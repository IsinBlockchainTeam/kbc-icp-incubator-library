import { Signer, utils } from 'ethers';
import { Trade as TradeContract, Trade__factory } from '../smart-contracts';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import { getTradeTypeByIndex } from '../utils/utils';
import { DocumentStatus } from '../entities/Document';

export class TradeDriver {
    protected _contract: TradeContract;

    constructor(signer: Signer, tradeAddress: string) {
        this._contract = Trade__factory
            .connect(tradeAddress, signer.provider!)
            .connect(signer);
    }

    async getLineCounter(): Promise<number> {
        const counter = await this._contract.getLineCounter();
        return counter.toNumber();
    }

    async getTradeType(): Promise<TradeType> {
        return getTradeTypeByIndex(await this._contract.getTradeType());
    }

    async getLineExists(id: number): Promise<boolean> {
        return this._contract.getLineExists(id);
    }

    async addDocument(documentType: DocumentType, externalUrl: string, contentHash: string): Promise<void> {
        const tx = await this._contract.addDocument(documentType, externalUrl, contentHash);
        await tx.wait();
    }

    async updateDocument(documentId: number, externalUrl: string, contentHash: string): Promise<void> {
        const tx = await this._contract.updateDocument(documentId, externalUrl, contentHash);
        await tx.wait();
    }

    async validateDocument(documentId: number, status: DocumentStatus): Promise<void> {
        const tx = await this._contract.validateDocument(documentId, status);
        await tx.wait();
    }

    async getAllDocumentIds(): Promise<number[]> {
        const ids = await this._contract.getAllDocumentIds();
        return ids.map((id) => id.toNumber());
    }

    async getDocumentIdsByType(documentType: DocumentType): Promise<number[]> {
        const ids = await this._contract.getDocumentIdsByType(documentType);
        return ids.map((id) => id.toNumber());
    }

    async getDocumentStatus(documentId: number): Promise<DocumentStatus> {
        const result = await this._contract.getDocumentStatus(documentId);
        switch (result) {
        case 0:
            return DocumentStatus.NOT_EVALUATED;
        case 1:
            return DocumentStatus.APPROVED;
        case 2:
            return DocumentStatus.NOT_APPROVED;
        default:
            throw new Error('Invalid document status');
        }
    }

    async addAdmin(account: string): Promise<void> {
        if (!utils.isAddress(account)) throw new Error('Not an address');
        const tx = await this._contract.addAdmin(account);
        await tx.wait();
    }

    async removeAdmin(account: string): Promise<void> {
        if (!utils.isAddress(account)) throw new Error('Not an address');
        const tx = await this._contract.removeAdmin(account);
        await tx.wait();
    }
}
