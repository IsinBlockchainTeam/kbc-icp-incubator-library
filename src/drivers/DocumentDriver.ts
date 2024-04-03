/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { Signer, utils } from 'ethers';
import { DocumentManager, DocumentManager__factory } from '../smart-contracts';
import { DocumentInfo } from '../entities/DocumentInfo';
import { EntityBuilder } from '../utils/EntityBuilder';

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
        try {
            const tx = await this._contract.registerDocument(externalUrl, contentHash);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentById(documentId: number): Promise<DocumentInfo> {
        try {
            const document = await this._contract.getDocumentById(documentId);
            return EntityBuilder.buildDocumentInfo(document);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentsCounter(): Promise<number> {
        try {
            const counter = await this._contract.getDocumentsCounter();
            return counter.toNumber();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        try {
            const tx = await this._contract.addAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        try {
            const tx = await this._contract.removeAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addTradeManager(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        try {
            const tx = await this._contract.addTradeManager(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeTradeManager(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        try {
            const tx = await this._contract.removeTradeManager(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
