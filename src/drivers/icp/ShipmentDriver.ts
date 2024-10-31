import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { Phase, Shipment } from '../../entities/icp/Shipment';
import { EntityBuilder } from '../../utils/icp/EntityBuilder';
import { DocumentInfo, DocumentType } from '../../entities/icp/Document';
import { EvaluationStatus } from '../../entities/icp/Evaluation';

export class ShipmentDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async getShipments(): Promise<Shipment[]> {
        const resp = await this._actor.getShipments();
        return resp.map((rawShipment) => EntityBuilder.buildShipment(rawShipment));
    }

    async getShipment(id: number): Promise<Shipment> {
        const resp = await this._actor.getShipment(BigInt(id));
        return EntityBuilder.buildShipment(resp);
    }

    async getShipmentPhase(id: number): Promise<Phase> {
        const resp = await this._actor.getShipmentPhase(BigInt(id));
        return EntityBuilder.buildShipmentPhase(resp);
    }

    async getDocumentsByType(
        id: number,
        documentType: DocumentType
    ): Promise<DocumentInfo[]> {
        const documents = await this._actor.getDocumentsByType(
            BigInt(id),
            EntityBuilder.buildIDLDocumentType(documentType)
        );
        return documents.map((document) => EntityBuilder.buildDocumentInfo(document));
    }

    async setShipmentDetails(
        id: number,
        shipmentNumber: number,
        expirationDate: Date,
        fixingDate: Date,
        targetExchange: string,
        differentialApplied: number,
        price: number,
        quantity: number,
        containersNumber: number,
        netWeight: number,
        grossWeight: number
    ): Promise<Shipment> {
        const resp = await this._actor.setShipmentDetails(
            BigInt(id),
            BigInt(shipmentNumber),
            BigInt(expirationDate.getTime()),
            BigInt(fixingDate.getTime()),
            targetExchange,
            BigInt(differentialApplied),
            BigInt(price),
            BigInt(quantity),
            BigInt(containersNumber),
            BigInt(netWeight),
            BigInt(grossWeight)
        );
        return EntityBuilder.buildShipment(resp);
    }

    async evaluateSample(
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        const resp = await this._actor.evaluateSample(
            BigInt(id),
            EntityBuilder.buildIDLEvaluationStatus(evaluationStatus)
        );
        return EntityBuilder.buildShipment(resp);
    }

    async evaluateShipmentDetails(
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        const resp = await this._actor.evaluateShipmentDetails(
            BigInt(id),
            EntityBuilder.buildIDLEvaluationStatus(evaluationStatus)
        );
        return EntityBuilder.buildShipment(resp);
    }

    async evaluateQuality(
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        const resp = await this._actor.evaluateQuality(
            BigInt(id),
            EntityBuilder.buildIDLEvaluationStatus(evaluationStatus)
        );
        return EntityBuilder.buildShipment(resp);
    }

    async depositFunds(id: number, amount: number): Promise<Shipment> {
        const resp = await this._actor.depositFunds(BigInt(id), BigInt(amount));
        return EntityBuilder.buildShipment(resp);
    }

    async lockFunds(id: number): Promise<Shipment> {
        const resp = await this._actor.lockFunds(BigInt(id));
        return EntityBuilder.buildShipment(resp);
    }

    async unlockFunds(id: number): Promise<Shipment> {
        const resp = await this._actor.unlockFunds(BigInt(id));
        return EntityBuilder.buildShipment(resp);
    }

    async getDocuments(
        id: number
    ): Promise<Map<DocumentType, DocumentInfo[]>> {
        const documentArray = await this._actor.getDocuments(BigInt(id));
        return EntityBuilder.buildShipmentDocuments(documentArray);
    }

    async getDocument(id: number, documentId: number): Promise<DocumentInfo> {
        const document = await this._actor.getDocument(BigInt(id), BigInt(documentId));
        return EntityBuilder.buildDocumentInfo(document);
    }

    async addDocument(
        id: number,
        documentType: DocumentType,
        externalUrl: string
    ): Promise<Shipment> {
        const resp = await this._actor.addDocument(
            BigInt(id),
            EntityBuilder.buildIDLDocumentType(documentType),
            externalUrl
        );
        return EntityBuilder.buildShipment(resp);
    }

    async updateDocument(
        id: number,
        documentId: number,
        externalUrl: string
    ): Promise<Shipment> {
        const resp = await this._actor.updateDocument(
            BigInt(id),
            BigInt(documentId),
            externalUrl
        );
        return EntityBuilder.buildShipment(resp);
    }

    async evaluateDocument(
        id: number,
        documentId: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        const resp = await this._actor.evaluateDocument(
            BigInt(id),
            BigInt(documentId),
            EntityBuilder.buildIDLEvaluationStatus(evaluationStatus)
        );
        return EntityBuilder.buildShipment(resp);
    }

    async getUploadableDocuments(phase: Phase): Promise<DocumentType[]> {
        const documents = await this._actor.getUploadableDocuments(
            EntityBuilder.buildShipmentIDLPhase(phase)
        );
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getRequiredDocuments(phase: Phase): Promise<DocumentType[]> {
        const documents = await this._actor.getRequiredDocuments(
            EntityBuilder.buildShipmentIDLPhase(phase)
        );
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase1Documents(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase1Documents();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase1RequiredDocuments(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase1RequiredDocuments();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase2Documents(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase2Documents();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase2RequiredDocuments(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase2RequiredDocuments();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase3Documents(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase3Documents();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase3RequiredDocuments(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase3RequiredDocuments();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase4Documents(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase4Documents();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase4RequiredDocuments(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase4RequiredDocuments();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase5Documents(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase5Documents();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }

    async getPhase5RequiredDocuments(): Promise<DocumentType[]> {
        const documents = await this._actor.getPhase5RequiredDocuments();
        return documents.map((document) => EntityBuilder.buildDocumentType(document));
    }
}
