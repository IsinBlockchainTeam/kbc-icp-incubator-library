import {IDL, query, update} from "azle";
import {
    IDLPhase,
    IDLShipment,
    IDLEvaluationStatus,
    IDLDocumentInfo,
    IDLDocumentType
} from "../models/idls";
import {
    Phase, Shipment,
    EvaluationStatus,
    DocumentInfo, DocumentType
} from "../models/types";
import ShipmentService from "../services/ShipmentService";
import {AtLeastEditor, AtLeastViewer} from "../decorators/roles";
import {OnlyCommissioner, OnlyContractParty, OnlySupplier} from "../decorators/parties";

class ShipmentController {
    @query([], IDL.Vec(IDLShipment))
    @AtLeastViewer
    async getShipments(): Promise<Shipment[]> {
        return ShipmentService.instance.getShipments();
    }

    @query([IDL.Nat], IDLShipment)
    @AtLeastViewer
    @OnlyContractParty(ShipmentService.instance)
    async getShipment(id: bigint): Promise<Shipment> {
        return ShipmentService.instance.getShipment(id);
    }

    @query([IDL.Nat], IDLPhase)
    @AtLeastViewer
    @OnlyContractParty(ShipmentService.instance)
    async getShipmentPhase(id: bigint): Promise<Phase> {
        return ShipmentService.instance.getShipmentPhase(id);
    }

    @query([IDL.Nat, IDLDocumentType], IDL.Vec(IDLDocumentInfo))
    @AtLeastViewer
    @OnlyContractParty(ShipmentService.instance)
    async getDocumentsByType(id: bigint, documentType: DocumentType): Promise<DocumentInfo[]> {
        return ShipmentService.instance.getDocumentsByType(id, documentType);
    }

    @update([IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], IDLShipment)
    @AtLeastEditor
    @OnlySupplier(ShipmentService.instance)
    async setShipmentDetails(
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

    @update([IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @AtLeastEditor
    @OnlyCommissioner(ShipmentService.instance)
    async evaluateSample(id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateSample(id, evaluationStatus);
    }

    @update([IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @AtLeastEditor
    @OnlyCommissioner(ShipmentService.instance)
    async evaluateShipmentDetails(id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateShipmentDetails(id, evaluationStatus);
    }

    @update([IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @AtLeastEditor
    @OnlyCommissioner(ShipmentService.instance)
    async evaluateQuality(id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateQuality(id, evaluationStatus);
    }

    @update([IDL.Nat, IDL.Nat], IDLShipment)
    @AtLeastEditor
    async depositFunds(id: bigint, amount: bigint): Promise<Shipment> {
        return ShipmentService.instance.depositFunds(id, amount);
    }

    @update([IDL.Nat], IDLShipment)
    @AtLeastEditor
    async lockFunds(id: bigint): Promise<Shipment> {
        return ShipmentService.instance.lockFunds(id);
    }

    @update([IDL.Nat], IDLShipment)
    @AtLeastEditor
    async unlockFunds(id: bigint): Promise<Shipment> {
        return ShipmentService.instance.unlockFunds(id);
    }

    @query([IDL.Nat], IDL.Vec(IDL.Tuple(IDLDocumentType, IDL.Vec(IDLDocumentInfo))))
    @AtLeastViewer
    @OnlyContractParty(ShipmentService.instance)
    async getDocuments(id: bigint): Promise<Array<[DocumentType, DocumentInfo[]]>> {
        return ShipmentService.instance.getDocuments(id);
    }

    @query([IDL.Nat, IDL.Nat], IDLDocumentInfo)
    @AtLeastViewer
    @OnlyContractParty(ShipmentService.instance)
    async getDocument(id: bigint, documentId: bigint): Promise<DocumentInfo> {
        return ShipmentService.instance.getDocument(id, documentId);
    }

    @update([IDL.Nat, IDLDocumentType, IDL.Text], IDLShipment)
    @AtLeastEditor
    @OnlyContractParty(ShipmentService.instance)
    async addDocument(id: bigint, documentType: DocumentType, externalUrl: string): Promise<Shipment> {
        return ShipmentService.instance.addDocument(id, documentType, externalUrl);
    }

    @update([IDL.Nat, IDL.Nat, IDL.Text], IDLShipment)
    @AtLeastEditor
    @OnlyContractParty(ShipmentService.instance)
    async updateDocument(id: bigint, documentId: bigint, externalUrl: string): Promise<Shipment> {
        return ShipmentService.instance.updateDocument(id, documentId, externalUrl);
    }

    @update([IDL.Nat, IDL.Nat, IDLEvaluationStatus], IDLShipment)
    @AtLeastEditor
    @OnlyContractParty(ShipmentService.instance)
    async evaluateDocument(id: bigint, documentId: bigint, documentEvaluationStatus: EvaluationStatus): Promise<Shipment> {
        return ShipmentService.instance.evaluateDocument(id, documentId, documentEvaluationStatus);
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
