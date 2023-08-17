/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { Signer, utils } from 'ethers';
import { DocumentManager, DocumentManager__factory } from '../smart-contracts';
import { Document } from '../entities/Document';
import { EntityBuilder } from '../utils/EntityBuilder';

export class DocumentDriver {
    protected _contract: DocumentManager;

    constructor(
        signer: Signer,
        documentAddress: string,
    ) {
        this._contract = DocumentManager__factory
            .connect(documentAddress, signer.provider!)
            .connect(signer);
    }

    async registerDocument(ownerAddress: string, transactionId: number, name: string, documentType: string, externalUrl: string): Promise<void> {
        if (!utils.isAddress(ownerAddress)) throw new Error('Owner not an address');

        try {
            const tx = await this._contract.registerDocument(
                ownerAddress,
                transactionId,
                name,
                documentType,
                externalUrl,
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentCounter(ownerAddress: string): Promise<number> {
        if (!utils.isAddress(ownerAddress)) throw new Error('Owner not an address');

        try {
            const counter = await this._contract.getDocumentCounter(ownerAddress);
            return counter.toNumber();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async documentExists(ownerAddress: string, transactionId: number, documentId: number): Promise<boolean> {
        if (!utils.isAddress(ownerAddress)) throw new Error('Owner not an address');

        try {
            return this._contract.documentExists(ownerAddress, transactionId, documentId);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentInfo(ownerAddress: string, transactionId: number, documentId: number): Promise<Document> {
        if (!utils.isAddress(ownerAddress)) throw new Error('Owner not an address');

        try {
            const document = await this._contract.getDocumentInfo(ownerAddress, transactionId, documentId);
            return EntityBuilder.buildDocument(document);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getTransactionDocumentIds(ownerAddress: string, transactionId: number): Promise<number[]> {
        if (!utils.isAddress(ownerAddress)) throw new Error('Owner not an address');

        try {
            const ids = await this._contract.getTransactionDocumentIds(ownerAddress, transactionId);
            return ids.map((id) => id.toNumber());
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
}
