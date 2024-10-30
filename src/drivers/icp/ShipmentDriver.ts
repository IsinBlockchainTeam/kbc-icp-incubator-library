import type { ActorSubclass, Identity } from '@dfinity/agent';
import { RoleProof } from '@kbc-lib/azle-types';
import { _SERVICE } from '../../declarations/entity_manager/entity_manager.did';
import { createActor } from '../../declarations/entity_manager';
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

    async getShipments(roleProof: RoleProof): Promise<Shipment[]> {
        const resp = await this._actor.getShipments(roleProof);
        return resp.map((rawShipment) => EntityBuilder.buildShipment(rawShipment));
    }

    async getShipment(roleProof: RoleProof, id: number): Promise<Shipment> {
        const resp = await this._actor.getShipment(roleProof, BigInt(id));
        return EntityBuilder.buildShipment(resp);
    }

    async getShipmentPhase(roleProof: RoleProof, id: number): Promise<Phase> {
        const resp = await this._actor.getShipmentPhase(roleProof, BigInt(id));
        return EntityBuilder.buildShipmentPhase(resp);
    }

    async getDocumentsByType(
        roleProof: RoleProof,
        id: number,
        documentType: DocumentType
    ): Promise<DocumentInfo[]> {
        const documents = await this._actor.getDocumentsByType(
            roleProof,
            BigInt(id),
            EntityBuilder.buildIDLDocumentType(documentType)
        );
        return documents.map((document) => EntityBuilder.buildDocumentInfo(document));
    }

    async setShipmentDetails(
        roleProof: RoleProof,
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
            roleProof,
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
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        const resp = await this._actor.evaluateSample(
            roleProof,
            BigInt(id),
            EntityBuilder.buildIDLEvaluationStatus(evaluationStatus)
        );
        return EntityBuilder.buildShipment(resp);
    }

    async evaluateShipmentDetails(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        const resp = await this._actor.evaluateShipmentDetails(
            roleProof,
            BigInt(id),
            EntityBuilder.buildIDLEvaluationStatus(evaluationStatus)
        );
        return EntityBuilder.buildShipment(resp);
    }

    async evaluateQuality(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        const resp = await this._actor.evaluateQuality(
            roleProof,
            BigInt(id),
            EntityBuilder.buildIDLEvaluationStatus(evaluationStatus)
        );
        return EntityBuilder.buildShipment(resp);
    }

    async depositFunds(roleProof: RoleProof, id: number, amount: number): Promise<Shipment> {
        const resp = await this._actor.depositFunds(roleProof, BigInt(id), BigInt(amount));
        return EntityBuilder.buildShipment(resp);
    }

    async lockFunds(roleProof: RoleProof, id: number): Promise<Shipment> {
        const resp = await this._actor.lockFunds(roleProof, BigInt(id));
        return EntityBuilder.buildShipment(resp);
    }

    async unlockFunds(roleProof: RoleProof, id: number): Promise<Shipment> {
        const resp = await this._actor.unlockFunds(roleProof, BigInt(id));
        return EntityBuilder.buildShipment(resp);
    }

    async getDocuments(
        roleProof: RoleProof,
        id: number
    ): Promise<Map<DocumentType, DocumentInfo[]>> {
        const documentArray = await this._actor.getDocuments(roleProof, BigInt(id));
        return EntityBuilder.buildShipmentDocuments(documentArray);
    }

    async getDocument(roleProof: RoleProof, id: number, documentId: number): Promise<DocumentInfo> {
        const document = await this._actor.getDocument(roleProof, BigInt(id), BigInt(documentId));
        return EntityBuilder.buildDocumentInfo(document);
    }

    async addDocument(
        roleProof: RoleProof,
        id: number,
        documentType: DocumentType,
        externalUrl: string
    ): Promise<Shipment> {
        const resp = await this._actor.addDocument(
            roleProof,
            BigInt(id),
            EntityBuilder.buildIDLDocumentType(documentType),
            externalUrl
        );
        return EntityBuilder.buildShipment(resp);
    }

    async updateDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number,
        externalUrl: string
    ): Promise<Shipment> {
        const resp = await this._actor.updateDocument(
            roleProof,
            BigInt(id),
            BigInt(documentId),
            externalUrl
        );
        return EntityBuilder.buildShipment(resp);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        const resp = await this._actor.evaluateDocument(
            roleProof,
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
