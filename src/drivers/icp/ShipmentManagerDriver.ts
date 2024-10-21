import type { ActorSubclass, Identity } from '@dfinity/agent';
import {DocumentType, EvaluationStatus, RoleProof} from "@kbc-lib/azle-types";
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';

export class ShipmentManagerDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async getShipments(roleProof: RoleProof) {
        return this._actor.getShipments(roleProof);
    }

    async getShipment(roleProof: RoleProof, id: number) {
        return this._actor.getShipment(roleProof, BigInt(id));
    }

    async getShipmentPhase(roleProof: RoleProof, id: number) {
        return this._actor.getShipmentPhase(roleProof, BigInt(id));
    }

    async getDocumentsByType(roleProof: RoleProof, id: number, documentType: DocumentType) {
        return this._actor.getDocumentsByType(roleProof, BigInt(id), documentType);
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
    ) {
        return this._actor.setShipmentDetails(
            roleProof,
            BigInt(id),
            BigInt(shipmentNumber),
            BigInt(expirationDate),
            BigInt(fixingDate),
            targetExchange,
            BigInt(differentialApplied),
            BigInt(price),
            BigInt(quantity),
            BigInt(containersNumber),
            BigInt(netWeight),
            BigInt(grossWeight)
        );
    }

    async evaluateSample(roleProof: RoleProof, id: number, evaluationStatus: EvaluationStatus) {
        return this._actor.evaluateSample(roleProof, BigInt(id), evaluationStatus);
    }

    async evaluateShipmentDetails(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ) {
        return this._actor.evaluateShipmentDetails(roleProof, BigInt(id), evaluationStatus);
    }

    async evaluateQuality(roleProof: RoleProof, id: number, evaluationStatus: EvaluationStatus) {
        return this._actor.evaluateQuality(roleProof, BigInt(id), evaluationStatus);
    }

    async depositFunds(roleProof: RoleProof, id: number, amount: number) {
        return this._actor.depositFunds(roleProof, BigInt(id), BigInt(amount));
    }

    async getDocuments(roleProof: RoleProof, id: number) {
        return this._actor.getDocuments(roleProof, BigInt(id));
    }

    async addDocument(
        roleProof: RoleProof,
        id: number,
        documentType: DocumentType,
        externalUrl: string
    ) {
        return this._actor.addDocument(roleProof, BigInt(id), documentType, externalUrl);
    }

    async updateDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number,
        externalUrl: string
    ) {
        return this._actor.updateDocument(roleProof, BigInt(id), BigInt(documentId), externalUrl);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number,
        evaluationStatus: EvaluationStatus
    ) {
        return this._actor.evaluateDocument(
            roleProof,
            BigInt(id),
            BigInt(documentId),
            evaluationStatus
        );
    }
}
