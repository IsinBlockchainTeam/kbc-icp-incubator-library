import { Signer } from 'ethers';
import { Shipment as ShipmentContract, Shipment__factory } from '../smart-contracts';
import { DocumentInfo, DocumentType, Shipment, ShipmentPhase } from '../entities/Shipment';
import { RoleProof } from '../types/RoleProof';

export class ShipmentDriver {
    private _contract: ShipmentContract;

    constructor(signer: Signer, shipmentAddress: string) {
        this._contract = Shipment__factory.connect(shipmentAddress, signer.provider!).connect(
            signer
        );
    }

    async getShipment(roleProof: RoleProof): Promise<Shipment> {
        const result = await this._contract.getShipment(roleProof);
        return new Shipment(
            result[0],
            new Date(result[1].toNumber()),
            result[2].toNumber(),
            result[3].toNumber(),
            result[4].toNumber(),
            result[5],
            result[6].map((value) => value.toNumber()),
            result[7],
            result[8],
            result[9],
            result[10]
        );
    }

    async getPhase(roleProof: RoleProof): Promise<ShipmentPhase> {
        return this._contract.getPhase(roleProof);
    }

    async getDocumentInfo(roleProof: RoleProof, documentId: number): Promise<DocumentInfo> {
        if (documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const result = await this._contract.getDocumentInfo(roleProof, documentId);
        return new DocumentInfo(result[0].toNumber(), result[1], result[2], result[3]);
    }

    async getDocumentsIdsByType(
        roleProof: RoleProof,
        documentType: DocumentType
    ): Promise<number[]> {
        if (documentType < 0) {
            throw new Error('Document type must be greater than or equal to 0');
        }
        return (await this._contract.getDocumentsIdsByType(roleProof, documentType)).map((value) =>
            value.toNumber()
        );
    }

  async getAllDocumentIds(roleProof: RoleProof): Promise<number[]> {
    const ids = await this._contract.getAllDocumentIds(roleProof);
    return ids.map((id) => id.toNumber());
  }

    async updateShipment(
        roleProof: RoleProof,
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ): Promise<void> {
        if (quantity < 0 || weight < 0 || price < 0) {
            throw new Error('Invalid arguments');
        }
        const tx = await this._contract.updateShipment(
            roleProof,
            expirationDate.getTime(),
            quantity,
            weight,
            price
        );
        await tx.wait();
    }

    async approveShipment(roleProof: RoleProof): Promise<void> {
        const tx = await this._contract.approveShipment(roleProof);
        await tx.wait();
    }

    async depositFunds(roleProof: RoleProof, amount: number): Promise<void> {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        const tx = await this._contract.depositFunds(roleProof, amount);
        await tx.wait();
    }

    async addDocument(
        roleProof: RoleProof,
        documentType: DocumentType,
        externalUrl: string,
        documentHash: string
    ): Promise<void> {
        const tx = await this._contract.addDocument(
            roleProof,
            documentType,
            externalUrl,
            documentHash
        );
        await tx.wait();
    }

    async updateDocument(
        roleProof: RoleProof,
        documentId: number,
        externalUrl: string,
        documentHash: string
    ): Promise<void> {
        const tx = await this._contract.updateDocument(
            roleProof,
            documentId,
            externalUrl,
            documentHash
        );
        await tx.wait();
    }

    async approveDocument(roleProof: RoleProof, documentId: number): Promise<void> {
        if (documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const tx = await this._contract.approveDocument(roleProof, documentId);
        await tx.wait();
    }

    async rejectDocument(roleProof: RoleProof, documentId: number): Promise<void> {
        if (documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const tx = await this._contract.rejectDocument(roleProof, documentId);
        await tx.wait();
    }

    async confirmShipment(roleProof: RoleProof): Promise<void> {
        const tx = await this._contract.confirmShipment(roleProof);
        await tx.wait();
    }

    async startShipmentArbitration(roleProof: RoleProof): Promise<void> {
        const tx = await this._contract.startShipmentArbitration(roleProof);
        await tx.wait();
    }
}
