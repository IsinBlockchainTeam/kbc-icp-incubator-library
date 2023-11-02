/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { Signer, utils } from 'ethers';
import { DocumentManager, DocumentManager__factory } from '../smart-contracts';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
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

    async registerDocument(transactionId: number, transactionType: string, name: string, documentType: DocumentType, externalUrl: string): Promise<void> {
        try {
            const tx = await this._contract.registerDocument(transactionId, transactionType, name, documentType, externalUrl);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentsCounterByTransactionIdAndType(transactionId: number, transactionType: string): Promise<number> {
        try {
            const counter = await this._contract.getDocumentsCounterByTransactionIdAndType(transactionId, transactionType);
            return counter.toNumber();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentsInfoByDocumentType(transactionId: number, transactionType: string, documentType: DocumentType): Promise<DocumentInfo[]> {
        try {
            const documents = await this._contract.getDocumentsByDocumentType(transactionId, transactionType, documentType);
            return documents.map((d) => EntityBuilder.buildDocumentInfo(d));
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

    async addOrderManager(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        try {
            const tx = await this._contract.addOrderManager(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeOrderManager(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        try {
            const tx = await this._contract.removeOrderManager(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
