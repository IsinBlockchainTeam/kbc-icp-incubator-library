import { EvaluationStatus } from './Evaluation';

export type Document = {
    id: number;
    externalUrl: string;
    contentHash: string;
    uploadedBy: string;
};

export type DocumentMetadata = {
    filename: string;
    fileType: string;
};

export enum DocumentTypeEnum {
    // shipment document types
    SERVICE_GUIDE = 'SERVICE_GUIDE',
    SENSORY_EVALUATION_ANALYSIS_REPORT = 'SENSORY_EVALUATION_ANALYSIS_REPORT',
    SUBJECT_TO_APPROVAL_OF_SAMPLE = 'SUBJECT_TO_APPROVAL_OF_SAMPLE',
    PRE_SHIPMENT_SAMPLE = 'PRE_SHIPMENT_SAMPLE',
    SHIPPING_INSTRUCTIONS = 'SHIPPING_INSTRUCTIONS',
    SHIPPING_NOTE = 'SHIPPING_NOTE',
    BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
    CARGO_COLLECTION_ORDER = 'CARGO_COLLECTION_ORDER',
    EXPORT_INVOICE = 'EXPORT_INVOICE',
    TRANSPORT_CONTRACT = 'TRANSPORT_CONTRACT',
    TO_BE_FREED_SINGLE_EXPORT_DECLARATION = 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION',
    EXPORT_CONFIRMATION = 'EXPORT_CONFIRMATION',
    FREED_SINGLE_EXPORT_DECLARATION = 'FREED_SINGLE_EXPORT_DECLARATION',
    CONTAINER_PROOF_OF_DELIVERY = 'CONTAINER_PROOF_OF_DELIVERY',
    PHYTOSANITARY_CERTIFICATE = 'PHYTOSANITARY_CERTIFICATE',
    BILL_OF_LADING = 'BILL_OF_LADING',
    ORIGIN_CERTIFICATE_ICO = 'ORIGIN_CERTIFICATE_ICO',
    WEIGHT_CERTIFICATE = 'WEIGHT_CERTIFICATE',
    GENERIC = 'GENERIC'
}
export type DocumentType =
    // shipment document types
    | { SERVICE_GUIDE: null }
    | { SENSORY_EVALUATION_ANALYSIS_REPORT: null }
    | { SUBJECT_TO_APPROVAL_OF_SAMPLE: null }
    | { PRE_SHIPMENT_SAMPLE: null }
    | { SHIPPING_INSTRUCTIONS: null }
    | { SHIPPING_NOTE: null }
    | { BOOKING_CONFIRMATION: null }
    | { CARGO_COLLECTION_ORDER: null }
    | { EXPORT_INVOICE: null }
    | { TRANSPORT_CONTRACT: null }
    | { TO_BE_FREED_SINGLE_EXPORT_DECLARATION: null }
    | { EXPORT_CONFIRMATION: null }
    | { FREED_SINGLE_EXPORT_DECLARATION: null }
    | { CONTAINER_PROOF_OF_DELIVERY: null }
    | { PHYTOSANITARY_CERTIFICATE: null }
    | { BILL_OF_LADING: null }
    | { ORIGIN_CERTIFICATE_ICO: null }
    | { WEIGHT_CERTIFICATE: null }
    | { GENERIC: null };

export type DocumentInfo = {
    id: bigint;
    documentType: DocumentType;
    evaluationStatus: EvaluationStatus;
    uploadedBy: string;
    externalUrl: string;
};
