/* eslint-disable camelcase */
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

    async registerDocument(ownerAddress: string, transactionId: number, name: string, documentType: string, externalUrl: string): Promise<void> {
        if (!utils.isAddress(ownerAddress)) throw new Error('Owner not an address');

        try {
            const tx = await this._contract.registerDocument(transactionId, name, documentType, externalUrl);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentCounterByTransactionId(transactionId: number): Promise<number> {
        try {
            const counter = await this._contract.getDocumentCounterByTransactionId(transactionId);
            return counter.toNumber();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async documentExists(transactionId: number, documentId: number): Promise<boolean> {
        try {
            return this._contract.documentExists(transactionId, documentId);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getDocumentInfo(transactionId: number, documentId: number): Promise<DocumentInfo> {
        try {
            const document = await this._contract.getDocumentInfo(transactionId, documentId);
            return EntityBuilder.buildDocument(document);
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
