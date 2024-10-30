import { IDL } from 'azle';
import { IDLEvaluationStatus as IDLEvaluationStatus} from './Evaluation';

export const Document = IDL.Record({
    id: IDL.Nat,
    externalUrl: IDL.Text,
    contentHash: IDL.Text,
    uploadedBy: IDL.Text,
});
export const IDLDocumentType = IDL.Variant({
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
export const IDLDocumentInfo = IDL.Record({
    id: IDL.Nat,
    documentType: IDLDocumentType,
    evaluationStatus: IDLEvaluationStatus,
    uploadedBy: IDL.Text,
    externalUrl: IDL.Text,
});
