import {IDL, query, update} from "azle";
import {RoleProof} from "../models/Proof";
import {Phase, Shipment} from "../models/Shipment";
import {OnlyEditor, OnlyViewer} from "../decorators/roles";
import {EvaluationStatus} from "../models/Evaluation";
import {DocumentInfo, DocumentType} from "../models/Document";
import ShipmentService from "../services/ShipmentService";

//TODO: fix @OnlyInvolvedParties
//TODO: fix @OnlySupplier
//TODO: fix @OnlyCommissioner
class ShipmentController {
    @update([RoleProof], IDL.Vec(Shipment))
    @OnlyViewer
    async getShipments(roleProof: RoleProof): Promise<Shipment[]> {
        return ShipmentService.instance.getShipments(roleProof);
    }

    @update([RoleProof, IDL.Nat], Shipment)
    @OnlyViewer
    //@OnlyInvolvedParties
    async getShipment(roleProof: RoleProof, id: bigint): Promise<Shipment> {
        return ShipmentService.instance.getShipment(roleProof, id);
    }

    @update([RoleProof, IDL.Nat], Phase)
    @OnlyViewer
    //@OnlyInvolvedParties
    async getShipmentPhase(roleProof: RoleProof, id: bigint): Promise<Phase> {
        return ShipmentService.instance.getShipmentPhase(roleProof, id);
    }

    @update([RoleProof, IDL.Nat, DocumentType], IDL.Opt(IDL.Vec(DocumentInfo)))
    @OnlyViewer
    //@OnlyInvolvedParties
    async getDocumentsByType(roleProof: RoleProof, id: bigint, documentType: DocumentType): Promise<DocumentInfo[] | []> {
        return ShipmentService.instance.getDocumentsByType(roleProof, id, documentType);
    }

    @update([RoleProof, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], Shipment)
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

    @update([RoleProof, IDL.Nat, EvaluationStatus], Shipment)
    @OnlyEditor
    // @OnlyCommissioner
    async evaluateSample(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateSample(roleProof, id, evaluationStatus);
    }

    @update([RoleProof, IDL.Nat, EvaluationStatus], Shipment)
    @OnlyEditor
    // @OnlyCommissioner
    async evaluateShipmentDetails(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateShipmentDetails(roleProof, id, evaluationStatus);
    }

    @update([RoleProof, IDL.Nat, EvaluationStatus], Shipment)
    @OnlyEditor
    // @OnlyCommissioner
    async evaluateQuality(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateQuality(roleProof, id, evaluationStatus);
    }

    @update([RoleProof, IDL.Nat, IDL.Nat], Shipment)
    @OnlyEditor
    async depositFunds(roleProof: RoleProof, id: bigint, amount: bigint): Promise<Shipment> {
        return ShipmentService.instance.depositFunds(roleProof, id, amount);
    }

    @update([RoleProof, IDL.Nat], IDL.Vec(IDL.Tuple(DocumentType, IDL.Vec(DocumentInfo))))
    @OnlyViewer
    // @OnlyInvolvedParties
    async getDocuments(roleProof: RoleProof, id: bigint) {
        return ShipmentService.instance.getDocuments(roleProof, id);
    }

    @update([RoleProof, IDL.Nat, DocumentType, IDL.Text], Shipment)
    @OnlyEditor
    // @OnlyInvolvedParties
    async addDocument(roleProof: RoleProof, id: bigint, documentType: DocumentType, externalUrl: string): Promise<Shipment> {
        return ShipmentService.instance.addDocument(roleProof, id, documentType, externalUrl);
    }

    @update([RoleProof, IDL.Nat, IDL.Nat, IDL.Text], Shipment)
    @OnlyEditor
    // @OnlyInvolvedParties
    async updateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, externalUrl: string): Promise<Shipment> {
        return ShipmentService.instance.updateDocument(roleProof, id, documentId, externalUrl);
    }

    @update([RoleProof, IDL.Nat, IDL.Nat, EvaluationStatus], Shipment)
    @OnlyEditor
    // @OnlyInvolvedParties
    async evaluateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, documentEvaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateDocument(roleProof, id, documentId, documentEvaluationStatus);
    }

    @query([], IDL.Vec(DocumentType))
    getPhase1Documents() {
        return ShipmentService.instance.getPhase1Documents();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase1RequiredDocuments() {
        return ShipmentService.instance.getPhase1RequiredDocuments();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase2Documents() {
        return ShipmentService.instance.getPhase2Documents();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase2RequiredDocuments() {
        return ShipmentService.instance.getPhase2RequiredDocuments();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase3Documents() {
        return ShipmentService.instance.getPhase3Documents();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase3RequiredDocuments() {
        return ShipmentService.instance.getPhase3RequiredDocuments();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase4Documents() {
        return ShipmentService.instance.getPhase4Documents();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase4RequiredDocuments() {
        return ShipmentService.instance.getPhase4RequiredDocuments();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase5Documents() {
        return ShipmentService.instance.getPhase5Documents();
    }

    @query([], IDL.Vec(DocumentType))
    getPhase5RequiredDocuments() {
        return ShipmentService.instance.getPhase5RequiredDocuments();
    }
}
export default ShipmentController;
