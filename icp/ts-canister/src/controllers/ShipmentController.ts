import { IDL, query, update } from 'azle';
import {
    RoleProof as IDLRoleProof,
    Phase as IDLPhase,
    Shipment as IDLShipment,
    EvaluationStatus as IDLEvaluationStatus,
    DocumentInfo as IDLDocumentInfo,
    DocumentType as IDLDocumentType
} from '../models/idls';
import { RoleProof, Phase, Shipment, EvaluationStatus, DocumentInfo, DocumentType } from '../models/types';
import { OnlyEditor, OnlyViewer } from '../decorators/roles';
import ShipmentService from '../services/ShipmentService';

// TODO: fix @OnlyInvolvedParties
// TODO: fix @OnlySupplier
// TODO: fix @OnlyCommissioner
class ShipmentController {
    @update([IDLRoleProof], IDL.Vec(IDLShipment))
    @OnlyViewer
    async getShipments(roleProof: RoleProof): Promise<Shipment[]> {
        return ShipmentService.instance.getShipments(roleProof);
    }

    @update([IDLRoleProof, IDL.Nat], IDLShipment)
    @OnlyViewer
    // @OnlyInvolvedParties
    async getShipment(roleProof: RoleProof, id: bigint): Promise<Shipment> {
        return ShipmentService.instance.getShipment(roleProof, id);
    }

    @update([IDLRoleProof, IDL.Nat], IDLPhase)
    @OnlyViewer
    // @OnlyInvolvedParties
    async getShipmentPhase(roleProof: RoleProof, id: bigint): Promise<Phase> {
        return ShipmentService.instance.getShipmentPhase(roleProof, id);
    }

    @update([IDLRoleProof, IDL.Nat, IDLDocumentType], IDL.Opt(IDL.Vec(IDLDocumentInfo)))
    @OnlyViewer
    // @OnlyInvolvedParties
    async getDocumentsByType(roleProof: RoleProof, id: bigint, documentType: DocumentType): Promise<DocumentInfo[] | []> {
        return ShipmentService.instance.getDocumentsByType(roleProof, id, documentType);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], IDLShipment)
    @OnlyEditor
    // @OnlySupplier
    async setShipmentDetails(
        roleProof: RoleProof,
        id: bigint,
        shipmentNumber: bigint,
        expirationDate: bigint,
        fixingDate: bigint,
        targetExchange: string,
        differentialApplied: bigint,
        price: bigint,
        quantity: bigint,
        containersNumber: bigint,
        netWeight: bigint,
        grossWeight: bigint
    ): Promise<Shipment> {
        return ShipmentService.instance.setShipmentDetails(
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

    @update([IDLRoleProof, IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @OnlyEditor
    // @OnlyCommissioner
    async evaluateSample(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateSample(roleProof, id, evaluationStatus);
    }

    @update([IDLRoleProof, IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @OnlyEditor
    // @OnlyCommissioner
    async evaluateShipmentDetails(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateShipmentDetails(roleProof, id, evaluationStatus);
    }

    @update([IDLRoleProof, IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @OnlyEditor
    // @OnlyCommissioner
    async evaluateQuality(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateQuality(roleProof, id, evaluationStatus);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat], IDLShipment)
    @OnlyEditor
    async depositFunds(roleProof: RoleProof, id: bigint, amount: bigint): Promise<Shipment> {
        return ShipmentService.instance.depositFunds(roleProof, id, amount);
    }

    @update([IDLRoleProof, IDL.Nat], IDL.Vec(IDL.Tuple(IDLDocumentType, IDL.Vec(IDLDocumentInfo))))
    @OnlyViewer
    // @OnlyInvolvedParties
    async getDocuments(roleProof: RoleProof, id: bigint) {
        return ShipmentService.instance.getDocuments(roleProof, id);
    }

    @update([IDLRoleProof, IDL.Nat, IDLDocumentType, IDL.Text], IDLShipment)
    @OnlyEditor
    // @OnlyInvolvedParties
    async addDocument(roleProof: RoleProof, id: bigint, documentType: DocumentType, externalUrl: string): Promise<Shipment> {
        return ShipmentService.instance.addDocument(roleProof, id, documentType, externalUrl);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat, IDL.Text], IDLShipment)
    @OnlyEditor
    // @OnlyInvolvedParties
    async updateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, externalUrl: string): Promise<Shipment> {
        return ShipmentService.instance.updateDocument(roleProof, id, documentId, externalUrl);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @OnlyEditor
    // @OnlyInvolvedParties
    async evaluateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, documentEvaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateDocument(roleProof, id, documentId, documentEvaluationStatus);
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase1Documents() {
        return ShipmentService.instance.getPhase1Documents();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase1RequiredDocuments() {
        return ShipmentService.instance.getPhase1RequiredDocuments();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase2Documents() {
        return ShipmentService.instance.getPhase2Documents();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase2RequiredDocuments() {
        return ShipmentService.instance.getPhase2RequiredDocuments();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase3Documents() {
        return ShipmentService.instance.getPhase3Documents();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase3RequiredDocuments() {
        return ShipmentService.instance.getPhase3RequiredDocuments();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase4Documents() {
        return ShipmentService.instance.getPhase4Documents();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase4RequiredDocuments() {
        return ShipmentService.instance.getPhase4RequiredDocuments();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase5Documents() {
        return ShipmentService.instance.getPhase5Documents();
    }

    @query([], IDL.Vec(IDLDocumentType))
    getPhase5RequiredDocuments() {
        return ShipmentService.instance.getPhase5RequiredDocuments();
    }
}
export default ShipmentController;
