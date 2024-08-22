import { Signer } from 'ethers';
import { Shipment as ShipmentContract, Shipment__factory } from '../smart-contracts';
import { DocumentInfo, DocumentType, Shipment, ShipmentPhase } from '../entities/Shipment';

export class ShipmentDriver {
    private _contract: ShipmentContract;

    constructor(signer: Signer, shipmentAddress: string) {
        this._contract = Shipment__factory.connect(shipmentAddress, signer.provider!).connect(
            signer
        );
    }

    async getShipment(): Promise<Shipment> {
        const result = await this._contract.getShipment();
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

    async getPhase(): Promise<ShipmentPhase> {
        return this._contract.getPhase();
    }

    async getDocumentInfo(documentId: number): Promise<DocumentInfo> {
        if (documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const result = await this._contract.getDocumentInfo(documentId);
        return new DocumentInfo(result[0].toNumber(), result[1], result[2], result[3]);
    }

    async getDocumentsIdsByType(documentType: DocumentType): Promise<number[]> {
        if (documentType < 0) {
            throw new Error('Document type must be greater than or equal to 0');
        }
        return (await this._contract.getDocumentsIdsByType(documentType)).map((value) =>
            value.toNumber()
        );
    }

    async getAllDocumentIds(): Promise<number[]> {
        const ids = await this._contract.getAllDocumentIds();
        return ids.map((id) => id.toNumber());
    }

    async updateShipment(
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ): Promise<void> {
        if (quantity < 0 || weight < 0 || price < 0) {
            throw new Error('Invalid arguments');
        }
        const tx = await this._contract.updateShipment(
            expirationDate.getTime(),
            quantity,
            weight,
            price
        );
        await tx.wait();
    }

    async approveShipment(): Promise<void> {
        const tx = await this._contract.approveShipment();
        await tx.wait();
    }

    async depositFunds(amount: number): Promise<void> {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        const tx = await this._contract.depositFunds(amount);
        await tx.wait();
    }

    async addDocument(
        documentType: DocumentType,
        externalUrl: string,
        documentHash: string
    ): Promise<void> {
        const tx = await this._contract.addDocument(documentType, externalUrl, documentHash);
        await tx.wait();
    }

    async updateDocument(
        documentId: number,
        externalUrl: string,
        documentHash: string
    ): Promise<void> {
        const tx = await this._contract.updateDocument(documentId, externalUrl, documentHash);
        await tx.wait();
    }

    async approveDocument(documentId: number): Promise<void> {
        if (documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const tx = await this._contract.approveDocument(documentId);
        await tx.wait();
    }

    async rejectDocument(documentId: number): Promise<void> {
        if (documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const tx = await this._contract.rejectDocument(documentId);
        await tx.wait();
    }

    async confirmShipment(): Promise<void> {
        const tx = await this._contract.confirmShipment();
        await tx.wait();
    }

    async startShipmentArbitration(): Promise<void> {
        const tx = await this._contract.startShipmentArbitration();
        await tx.wait();
    }
}
