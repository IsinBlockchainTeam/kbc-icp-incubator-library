import { IDL } from 'azle';
import { Address } from './Address';

export type DocumentType = { SERVICE_GUIDE: null } | { SENSORY_EVALUATION_ANALYSIS_REPORT: null } | { SUBJECT_TO_APPROVAL_OF_SAMPLE: null } | { PRE_SHIPMENT_SAMPLE: null } | { SHIPPING_INSTRUCTIONS: null } | { SHIPPING_NOTE: null } | { BOOKING_CONFIRMATION: null } | { CARGO_COLLECTION_ORDER: null } | { EXPORT_INVOICE: null } | { TRANSPORT_CONTRACT: null } | { TO_BE_FREED_SINGLE_EXPORT_DECLARATION: null } | { EXPORT_CONFIRMATION: null } | { FREED_SINGLE_EXPORT_DECLARATION: null } | { CONTAINER_PROOF_OF_DELIVERY: null } | { PHYTOSANITARY_CERTIFICATE: null } | { BILL_OF_LADING: null } | { ORIGIN_CERTIFICATE_ICO: null } | { WEIGHT_CERTIFICATE: null } | { GENERIC: null };
export const DocumentType = IDL.Variant({
    SERVICE_GUIDE: IDL.Null,
    SENSORY_EVALUATION_ANALYSIS_REPORT: IDL.Null,
    SUBJECT_TO_APPROVAL_OF_SAMPLE: IDL.Null,
    PRE_SHIPMENT_SAMPLE: IDL.Null,
    SHIPPING_INSTRUCTIONS: IDL.Null,
    SHIPPING_NOTE: IDL.Null,
    BOOKING_CONFIRMATION: IDL.Null,
    CARGO_COLLECTION_ORDER: IDL.Null,
    EXPORT_INVOICE: IDL.Null,
    TRANSPORT_CONTRACT: IDL.Null,
    TO_BE_FREED_SINGLE_EXPORT_DECLARATION: IDL.Null,
    EXPORT_CONFIRMATION: IDL.Null,
    FREED_SINGLE_EXPORT_DECLARATION: IDL.Null,
    CONTAINER_PROOF_OF_DELIVERY: IDL.Null,
    PHYTOSANITARY_CERTIFICATE: IDL.Null,
    BILL_OF_LADING: IDL.Null,
    ORIGIN_CERTIFICATE_ICO: IDL.Null,
    WEIGHT_CERTIFICATE: IDL.Null,
    GENERIC: IDL.Null
});

export type DocumentEvaluationStatus = { NOT_EVALUATED: null } | { APPROVED: null } | { NOT_APPROVED: null };
export const DocumentEvaluationStatus = IDL.Variant({
    NOT_EVALUATED: IDL.Null,
    APPROVED: IDL.Null,
    NOT_APPROVED: IDL.Null,
});

export type DocumentInfo = {
    id: bigint;
    documentType: DocumentType;
    evaluationStatus: DocumentEvaluationStatus;
    uploadedBy: string;
    externalUrl: string;
};
export const DocumentInfo = IDL.Record({
    id: IDL.Nat,
    documentType: DocumentType,
    evaluationStatus: DocumentEvaluationStatus,
    uploadedBy: IDL.Text,
    externalUrl: IDL.Text,
});

export type Phase = { PHASE_1: null } | { PHASE_2: null } | { PHASE_3: null } | { PHASE_4: null } | { PHASE_5: null } | { CONFIRMED: null } | { ARBITRATION: null };
export const Phase = IDL.Variant({
    PHASE_1: IDL.Null,
    PHASE_2: IDL.Null,
    PHASE_3: IDL.Null,
    PHASE_4: IDL.Null,
    PHASE_5: IDL.Null,
    CONFIRMED: IDL.Null,
    ARBITRATION: IDL.Null,
});

export type EvaluationStatus = { NOT_EVALUATED: null } | { APPROVED: null } | { NOT_APPROVED: null };
export const EvaluationStatus = IDL.Variant({
    NOT_EVALUATED: IDL.Null,
    APPROVED: IDL.Null,
    NOT_APPROVED: IDL.Null,
});

export type FundStatus = { NOT_LOCKED: null } | { LOCKED: null } | { RELEASED: null };
export const FundStatus = IDL.Variant({
    NOT_LOCKED: IDL.Null,
    LOCKED: IDL.Null,
    RELEASED: IDL.Null,
});

export type Shipment = {
    id: number;
    supplier: Address;
    commissioner: Address;
    escrowAddress: Address;
    sampleEvaluationStatus: EvaluationStatus;
    detailsEvaluationStatus: EvaluationStatus;
    qualityEvaluationStatus: EvaluationStatus;
    fundsStatus: FundStatus;
    detailsSet: boolean;
    sampleApprovalRequired: boolean;
    shipmentNumber: number;
    expirationDate: number;
    fixingDate: number;
    targetExchange: string;
    differentialApplied: number;
    price: number;
    quantity: number;
    containersNumber: number;
    netWeight: number;
    grossWeight: number;
    documents: Array<[DocumentType, DocumentInfo[]]>,
};
export const Shipment = IDL.Record({
    id: IDL.Nat,
    supplier: Address,
    commissioner: Address,
    escrowAddress: Address,
    sampleEvaluationStatus: EvaluationStatus,
    detailsEvaluationStatus: EvaluationStatus,
    qualityEvaluationStatus: EvaluationStatus,
    fundsStatus: FundStatus,
    detailsSet: IDL.Bool,
    sampleApprovalRequired: IDL.Bool,
    shipmentNumber: IDL.Nat,
    expirationDate: IDL.Int,
    fixingDate: IDL.Int,
    targetExchange: IDL.Text,
    differentialApplied: IDL.Nat,
    price: IDL.Nat,
    quantity: IDL.Nat,
    containersNumber: IDL.Nat,
    netWeight: IDL.Nat,
    grossWeight: IDL.Nat,
    documents: IDL.Vec(IDL.Tuple(DocumentType, IDL.Vec(DocumentInfo))),
});
