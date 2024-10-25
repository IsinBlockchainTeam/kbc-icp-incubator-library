import { ShipmentDriver } from '../../drivers/icp/ShipmentDriver';
import { RoleProof } from '@kbc-lib/azle-types';
import { Shipment, Phase } from '../../entities/icp/Shipment';
import { DocumentType, DocumentInfo } from '../../entities/icp/Document';
import { EvaluationStatus } from '../../entities/icp/Evaluation';

export class ShipmentService {
    private readonly _shipmentDriver: ShipmentDriver;

    constructor(shipmentDriver: ShipmentDriver) {
        this._shipmentDriver = shipmentDriver;
    }

    async getShipments(roleProof: RoleProof): Promise<Shipment[]> {
        return this._shipmentDriver.getShipments(roleProof);
    }

    async getShipment(roleProof: RoleProof, id: number): Promise<Shipment> {
        return this._shipmentDriver.getShipment(roleProof, id);
    }

    async getShipmentPhase(roleProof: RoleProof, id: number): Promise<Phase> {
        return this._shipmentDriver.getShipmentPhase(roleProof, id);
    }

    async getDocumentsByType(
        roleProof: RoleProof,
        id: number,
        documentType: DocumentType
    ): Promise<DocumentInfo[]> {
        return this._shipmentDriver.getDocumentsByType(roleProof, id, documentType);
    }

    async setShipmentDetails(
        roleProof: RoleProof,
        id: number,
        shipmentNumber: number,
        expirationDate: number,
        fixingDate: number,
        targetExchange: string,
        differentialApplied: number,
        price: number,
        quantity: number,
        containersNumber: number,
        netWeight: number,
        grossWeight: number
    ): Promise<Shipment> {
        return this._shipmentDriver.setShipmentDetails(
            roleProof,
            id,
            shipmentNumber,
            expirationDate,
            fixingDate,
            targetExchange,
            differentialApplied,
            price,
            quantity,
            containersNumber,
            netWeight,
            grossWeight
        );
    }

    async evaluateSample(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        return this._shipmentDriver.evaluateSample(roleProof, id, evaluationStatus);
    }

    async evaluateShipmentDetails(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        return this._shipmentDriver.evaluateShipmentDetails(roleProof, id, evaluationStatus);
    }

    async evaluateQuality(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        return this._shipmentDriver.evaluateQuality(roleProof, id, evaluationStatus);
    }

    async depositFunds(roleProof: RoleProof, id: number, amount: number): Promise<Shipment> {
        return this._shipmentDriver.depositFunds(roleProof, id, amount);
    }

    async lockFunds(roleProof: RoleProof, id: number): Promise<Shipment> {
        return this._shipmentDriver.lockFunds(roleProof, id);
    }

    async unlockFunds(roleProof: RoleProof, id: number): Promise<Shipment> {
        return this._shipmentDriver.unlockFunds(roleProof, id);
    }

    async getDocuments(
        roleProof: RoleProof,
        id: number
    ): Promise<Map<DocumentType, DocumentInfo[]>> {
        return this._shipmentDriver.getDocuments(roleProof, id);
    }

    async addDocument(
        roleProof: RoleProof,
        id: number,
        documentType: DocumentType,
        externalUrl: string
    ): Promise<Shipment> {
        return this._shipmentDriver.addDocument(roleProof, id, documentType, externalUrl);
    }

    async updateDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number,
        externalUrl: string
    ): Promise<Shipment> {
        return this._shipmentDriver.updateDocument(roleProof, id, documentId, externalUrl);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        return this._shipmentDriver.evaluateDocument(roleProof, id, documentId, evaluationStatus);
    }

    async getPhase1Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase1Documents();
    }

    async getPhase1RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase1RequiredDocuments();
    }

    async getPhase2Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase2Documents();
    }

    async getPhase2RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase2RequiredDocuments();
    }

    async getPhase3Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase3Documents();
    }

    async getPhase3RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase3RequiredDocuments();
    }

    async getPhase4Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase4Documents();
    }

    async getPhase4RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase4RequiredDocuments();
    }

    async getPhase5Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase5Documents();
    }

    async getPhase5RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase5RequiredDocuments();
    }
}
