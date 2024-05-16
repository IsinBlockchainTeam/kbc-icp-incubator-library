/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { Signer, utils } from 'ethers';
import { DocumentManager, DocumentManager__factory } from '../smart-contracts';
import { DocumentInfo } from '../entities/DocumentInfo';
import { EntityBuilder } from '../utils/EntityBuilder';
import { DocumentStatus } from '../entities/Document';

export class DocumentDriver {
    private _contract: DocumentManager;

    constructor(
        signer: Signer,
        documentAddress: string,
    ) {
        this._contract = DocumentManager__factory
            .connect(documentAddress, signer.provider!)
            .connect(signer);
    }

    async registerDocument(externalUrl: string, contentHash: string): Promise<void> {
        const tx = await this._contract.registerDocument(externalUrl, contentHash);
        await tx.wait();
    }

    async updateDocument(documentId: number, externalUrl: string, contentHash: string): Promise<void> {
        const tx = await this._contract.updateDocument(documentId, externalUrl, contentHash);
        await tx.wait();
    }

    async evaluateDocument(documentId: number, status: DocumentStatus): Promise<void> {
        const tx = await this._contract.evaluateDocument(documentId, status);
        await tx.wait();
    }

    async getDocumentById(documentId: number): Promise<DocumentInfo> {
        const document = await this._contract.getDocumentById(documentId);
        return EntityBuilder.buildDocumentInfo(document);
    }

    async getDocumentsCounter(): Promise<number> {
        const counter = await this._contract.getDocumentsCounter();
        return counter.toNumber();
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._contract.addAdmin(address);
        await tx.wait();
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._contract.removeAdmin(address);
        await tx.wait();
    }

    async addTradeManager(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._contract.addTradeManager(address);
        await tx.wait();
    }

    async removeTradeManager(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._contract.removeTradeManager(address);
        await tx.wait();
    }
}
