import {IDL, query, update} from "azle";
import {RoleProof, Phase, Shipment, EvaluationStatus, DocumentInfo, DocumentType} from "../models/types";
import {RoleProof as IDLRoleProof, Phase as IDLPhase, Shipment as IDLShipment, IDLEvaluationStatus as IDLEvaluationStatus, IDLDocumentInfo, IDLDocumentType } from "../models/idls";
import ShipmentService from "../services/ShipmentService";
import {AtLeastEditor, AtLeastViewer} from "../decorators/roles";
import { OnlyCommissioner, OnlyInvolvedParties, OnlySupplier } from '../decorators/shipmentParties';

//TODO: fix @OnlyInvolvedParties
//TODO: fix @OnlySupplier
//TODO: fix @OnlyCommissioner
class ShipmentController {
    @update([IDLRoleProof], IDL.Vec(IDLShipment))
    @AtLeastViewer
    async getShipments(roleProof: RoleProof): Promise<Shipment[]> {
        return ShipmentService.instance.getShipments(roleProof.membershipProof.delegatorAddress);
    }

    @update([IDLRoleProof, IDL.Nat], IDLShipment)
    @AtLeastViewer
    @OnlyInvolvedParties
    async getShipment(_: RoleProof, id: bigint): Promise<Shipment> {
        return ShipmentService.instance.getShipment(id);
    }

    @update([IDLRoleProof, IDL.Nat], IDLPhase)
    @AtLeastViewer
    @OnlyInvolvedParties
    async getShipmentPhase(_: RoleProof, id: bigint): Promise<Phase> {
        return ShipmentService.instance.getShipmentPhase(id);
    }

    @update([IDLRoleProof, IDL.Nat, IDLDocumentType], IDL.Vec(IDLDocumentInfo))
    @AtLeastViewer
    @OnlyInvolvedParties
    async getDocumentsByType(_: RoleProof, id: bigint, documentType: DocumentType): Promise<DocumentInfo[]> {
        return ShipmentService.instance.getDocumentsByType(id, documentType);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], IDLShipment)
    @AtLeastEditor
    @OnlySupplier
    async setShipmentDetails(
        _: RoleProof,
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
    @AtLeastEditor
    @OnlyCommissioner
    async evaluateSample(_: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateSample(id, evaluationStatus);
    }

    @update([IDLRoleProof, IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @AtLeastEditor
    @OnlyCommissioner
    async evaluateShipmentDetails(_: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateShipmentDetails(id, evaluationStatus);
    }

    @update([IDLRoleProof, IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @AtLeastEditor
    @OnlyCommissioner
    async evaluateQuality(_: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateQuality(id, evaluationStatus);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat], IDLShipment)
    @AtLeastEditor
    async depositFunds(_: RoleProof, id: bigint, amount: bigint): Promise<Shipment> {
        return ShipmentService.instance.depositFunds(id, amount);
    }

    @update([IDLRoleProof, IDL.Nat], IDLShipment)
    @AtLeastEditor
    async lockFunds(_: RoleProof, id: bigint): Promise<Shipment> {
        return ShipmentService.instance.lockFunds(id);
    }

    @update([IDLRoleProof, IDL.Nat], IDLShipment)
    @AtLeastEditor
    async unlockFunds(_: RoleProof, id: bigint): Promise<Shipment> {
        return ShipmentService.instance.unlockFunds(id);
    }

    @update([IDLRoleProof, IDL.Nat], IDL.Vec(IDL.Tuple(IDLDocumentType, IDL.Vec(IDLDocumentInfo))))
    @AtLeastViewer
    @OnlyInvolvedParties
    async getDocuments(_: RoleProof, id: bigint): Promise<Array<[DocumentType, DocumentInfo[]]>> {
        return ShipmentService.instance.getDocuments(id);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat], IDLDocumentInfo)
    @AtLeastViewer
    @OnlyInvolvedParties
    async getDocument(_: RoleProof, id: bigint, documentId: bigint): Promise<DocumentInfo> {
        return ShipmentService.instance.getDocument(id, documentId);
    }

    @update([IDLRoleProof, IDL.Nat, IDLDocumentType, IDL.Text], IDLShipment)
    @AtLeastEditor
    @OnlyInvolvedParties
    async addDocument(roleProof: RoleProof, id: bigint, documentType: DocumentType, externalUrl: string): Promise<Shipment> {
        return ShipmentService.instance.addDocument(id, roleProof.membershipProof.delegatorAddress, documentType, externalUrl);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat, IDL.Text], IDLShipment)
    @AtLeastEditor
    @OnlyInvolvedParties
    async updateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, externalUrl: string): Promise<Shipment> {
        return ShipmentService.instance.updateDocument(id, roleProof.membershipProof.delegatorAddress, documentId, externalUrl);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @AtLeastEditor
    @OnlyInvolvedParties
    async evaluateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, documentEvaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateDocument(id, roleProof.membershipProof.delegatorAddress, documentId, documentEvaluationStatus);
    }

    @query([IDLPhase], IDL.Vec(IDLDocumentType))
    getUploadableDocuments(phase: Phase) {
        return ShipmentService.instance.getUploadableDocuments(phase);
    }

    @query([IDLPhase], IDL.Vec(IDLDocumentType))
    getRequiredDocuments(phase: Phase) {
        return ShipmentService.instance.getRequiredDocuments(phase);
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
