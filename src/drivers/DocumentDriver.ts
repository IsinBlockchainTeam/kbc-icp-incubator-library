/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { Event, Signer, utils } from 'ethers';
import { DocumentManager, DocumentManager__factory } from '../smart-contracts';
import { DocumentInfo } from '../entities/DocumentInfo';
import { EntityBuilder } from '../utils/EntityBuilder';
import { RoleProof } from '../types/RoleProof';

export class DocumentDriver {
    private _contract: DocumentManager;

    constructor(signer: Signer, documentAddress: string) {
        this._contract = DocumentManager__factory.connect(
            documentAddress,
            signer.provider!
        ).connect(signer);
    }

    async registerDocument(
        roleProof: RoleProof,
        externalUrl: string,
        contentHash: string,
        uploadedBy: string
    ): Promise<number> {
        try {
            const tx: any = await this._contract.registerDocument(
                roleProof,
                externalUrl,
                contentHash,
                uploadedBy
            );
            const receipt = await tx.wait();
            const id = receipt.events.find((event: Event) => event.event === 'DocumentRegistered')
                .args[0];
            return id.toNumber();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateDocument(
        roleProof: RoleProof,
        documentId: number,
        externalUrl: string,
        contentHash: string,
        uploadedBy: string
    ): Promise<void> {
        const tx = await this._contract.updateDocument(
            roleProof,
            documentId,
            externalUrl,
            contentHash,
            uploadedBy
        );
        await tx.wait();
    }

    async getDocumentById(roleProof: RoleProof, documentId: number): Promise<DocumentInfo> {
        const document = await this._contract.getDocumentById(roleProof, documentId);
        return EntityBuilder.buildDocumentInfo(document);
    }

    async getDocumentsCounter(roleProof: RoleProof): Promise<number> {
        const counter = await this._contract.getDocumentsCounter(roleProof);
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
