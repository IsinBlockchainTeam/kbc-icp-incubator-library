import {Signer} from "ethers";
import {
    ShipmentManager as ShipmentManagerContract,
    ShipmentManager__factory
} from "../smart-contracts";
import {DocumentInfo, DocumentType, Shipment, ShipmentStatus} from "../entities/Shipment";

export class ShipmentManagerDriver {
    private _contract: ShipmentManagerContract;

    constructor(signer: Signer, shipmentManagerAddress: string) {
        this._contract = ShipmentManager__factory.connect(shipmentManagerAddress, signer.provider!).connect(signer);
    }

    async getShipmentCounter(): Promise<number> {
        return (await this._contract.getShipmentCounter()).toNumber();
    }

    async getShipment(id: number): Promise<Shipment> {
        if(id < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        const result = await this._contract.getShipment(id);
        return new Shipment(
            result[0].toNumber(),
            result[1],
            result[2].toNumber(),
            result[3].toNumber(),
            result[4].toNumber(),
            result[5].toNumber(),
            result[6],
            result[7].map((value) => value.toNumber()),
            result[8]
        );
    }

    async getShipmentStatus(id: number): Promise<ShipmentStatus> {
        if(id < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        return this._contract.getShipmentStatus(id);
    }

    async getDocumentsIds(id: number): Promise<number[]> {
        if(id < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        return (await this._contract.getDocumentsIds(id)).map((value) => value.toNumber());
    }

    async getDocumentInfo(shipmentId: number, documentId: number): Promise<DocumentInfo> {
        if(shipmentId < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        if(documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const result = await this._contract.getDocumentInfo(shipmentId, documentId);
        return new DocumentInfo(
            result[0].toNumber(),
            result[1],
            result[2],
            result[3]
        );
    }

    async getDocumentsIdsByType(shipmentId: number, documentType: DocumentType): Promise<number[]> {
        if(shipmentId < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        if(documentType < 0) {
            throw new Error('Document type must be greater than or equal to 0');
        }
        return (await this._contract.getDocumentsIdsByType(shipmentId, documentType)).map((value) => value.toNumber());
    }

    async addShipment(date: number, quantity: number, weight: number, price: number): Promise<void> {
        if(date < 0 || quantity < 0 || weight < 0 || price < 0) {
            throw new Error('Invalid arguments');
        }
        const tx = await this._contract.addShipment(date, quantity, weight, price);
        await tx.wait();
    }

    async approveShipment(id: number): Promise<void> {
        if(id < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        const tx = await this._contract.approveShipment(id);
        await tx.wait();
    }

    async lockFunds(id: number): Promise<void> {
        if(id < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        const tx = await this._contract.lockFunds(id);
        await tx.wait();
    }

    async confirmShipment(id: number): Promise<void> {
        if (id < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        const tx = await this._contract.confirmShipment(id);
        await tx.wait();
    }

    async startShipmentArbitration(id: number): Promise<void> {
        if (id < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        const tx = await this._contract.startShipmentArbitration(id);
        await tx.wait();
    }

    async addDocument(shipmentId: number, documentType: DocumentType, externalUrl: string, documentHash: string): Promise<void> {
        if(shipmentId < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        if(documentType < 0) {
            throw new Error('Document type must be greater than or equal to 0');
        }
        const tx = await this._contract.addDocument(shipmentId, documentType, externalUrl, documentHash);
        await tx.wait();
    }

    async updateDocument(shipmentId: number, documentId: number, externalUrl: string, documentHash: string): Promise<void> {
        if(shipmentId < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        if(documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const tx = await this._contract.updateDocument(shipmentId, documentId, externalUrl, documentHash);
        await tx.wait();
    }

    async approveDocument(shipmentId: number, documentId: number): Promise<void> {
        if(shipmentId < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        if(documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const tx = await this._contract.approveDocument(shipmentId, documentId);
        await tx.wait();
    }

    async rejectDocument(shipmentId: number, documentId: number): Promise<void> {
        if(shipmentId < 0) {
            throw new Error('Shipment ID must be greater than or equal to 0');
        }
        if(documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const tx = await this._contract.rejectDocument(shipmentId, documentId);
        await tx.wait();
    }
}
