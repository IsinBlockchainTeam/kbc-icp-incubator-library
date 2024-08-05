import {ShipmentManagerDriver} from "../drivers/ShipmentManagerDriver";
import {DocumentInfo, DocumentType, Shipment, ShipmentStatus} from "../entities/Shipment";

export class ShipmentManagerService {
    private _shipmentManagerDriver: ShipmentManagerDriver;

    constructor(shipmentManagerDriver: ShipmentManagerDriver) {
        this._shipmentManagerDriver = shipmentManagerDriver;
    }

    async getShipmentCounter(): Promise<number> {
        return this._shipmentManagerDriver.getShipmentCounter();
    }

    async getShipment(id: number): Promise<Shipment> {
        return this._shipmentManagerDriver.getShipment(id);
    }

    async getShipmentStatus(id: number): Promise<ShipmentStatus> {
        return this._shipmentManagerDriver.getShipmentStatus(id);
    }

    async getDocumentsIds(id: number): Promise<number[]> {
        return this._shipmentManagerDriver.getDocumentsIds(id);
    }

    async getDocumentInfo(shipmentId: number, documentId: number): Promise<DocumentInfo> {
        return this._shipmentManagerDriver.getDocumentInfo(shipmentId, documentId);
    }

    async getDocumentsIdsByType(shipmentId: number, documentType: number): Promise<number[]> {
        return this._shipmentManagerDriver.getDocumentsIdsByType(shipmentId, documentType);
    }

    async addShipment(date: number, quantity: number, weight: number, price: number): Promise<void> {
        return this._shipmentManagerDriver.addShipment(date, quantity, weight, price);
    }

    async approveShipment(id: number): Promise<void> {
        return this._shipmentManagerDriver.approveShipment(id);
    }

    async lockFunds(id: number): Promise<void> {
        return this._shipmentManagerDriver.lockFunds(id);
    }

    async confirmShipment(id: number): Promise<void> {
        return this._shipmentManagerDriver.confirmShipment(id);
    }

    async startShipmentArbitration(id: number): Promise<void> {
        return this._shipmentManagerDriver.startShipmentArbitration(id);
    }

    async addDocument(shipmentId: number, documentType: DocumentType, externalUrl: string, contentHash: string): Promise<void> {
        return this._shipmentManagerDriver.addDocument(shipmentId, documentType, externalUrl, contentHash);
    }

    async updateDocument(shipmentId: number, documentId: number, externalUrl: string, contentHash: string): Promise<void> {
        return this._shipmentManagerDriver.updateDocument(shipmentId, documentId, externalUrl, contentHash);
    }

    async approveDocument(shipmentId: number, documentId: number): Promise<void> {
        return this._shipmentManagerDriver.approveDocument(shipmentId, documentId);
    }

    async rejectDocument(shipmentId: number, documentId: number): Promise<void> {
        return this._shipmentManagerDriver.rejectDocument(shipmentId, documentId);
    }
}
