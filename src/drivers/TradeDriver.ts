import { Signer } from 'ethers';
import { Trade as TradeContract, Trade__factory } from '../smart-contracts';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import { getTradeTypeByIndex } from '../utils/utils';
import { DocumentStatus } from '../entities/Document';
import { RoleProof } from '../types/RoleProof';

export class TradeDriver {
    protected _contract: TradeContract;

    constructor(signer: Signer, tradeAddress: string) {
        this._contract = Trade__factory.connect(tradeAddress, signer.provider!).connect(signer);
    }

    async getLineCounter(roleProof: RoleProof): Promise<number> {
        const counter = await this._contract.getLineCounter(roleProof);
        return counter.toNumber();
    }

    async getTradeType(roleProof: RoleProof): Promise<TradeType> {
        return getTradeTypeByIndex(await this._contract.getTradeType(roleProof));
    }

    async getLineExists(roleProof: RoleProof, id: number): Promise<boolean> {
        return this._contract.getLineExists(roleProof, id);
    }

    async addDocument(
        roleProof: RoleProof,
        documentType: DocumentType,
        externalUrl: string,
        contentHash: string
    ): Promise<void> {
        const tx = await this._contract.addDocument(
            roleProof,
            documentType,
            externalUrl,
            contentHash
        );
        await tx.wait();
    }

    async updateDocument(
        roleProof: RoleProof,
        documentId: number,
        externalUrl: string,
        contentHash: string
    ): Promise<void> {
        const tx = await this._contract.updateDocument(
            roleProof,
            documentId,
            externalUrl,
            contentHash
        );
        await tx.wait();
    }

    async validateDocument(
        roleProof: RoleProof,
        documentId: number,
        status: DocumentStatus
    ): Promise<void> {
        const tx = await this._contract.validateDocument(roleProof, documentId, status);
        await tx.wait();
    }

    async getAllDocumentIds(roleProof: RoleProof): Promise<number[]> {
        const ids = await this._contract.getAllDocumentIds(roleProof);
        return ids.map((id) => id.toNumber());
    }

    async getDocumentIdsByType(
        roleProof: RoleProof,
        documentType: DocumentType
    ): Promise<number[]> {
        const ids = await this._contract.getDocumentIdsByType(roleProof, documentType);
        return ids.map((id) => id.toNumber());
    }

    async getDocumentStatus(roleProof: RoleProof, documentId: number): Promise<DocumentStatus> {
        const result = await this._contract.getDocumentStatus(roleProof, documentId);
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
}
