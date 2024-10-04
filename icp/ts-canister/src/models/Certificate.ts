import { IDL } from 'azle';
import { Address } from './Address';

export const DocumentEvaluationStatus = IDL.Variant({
    NOT_EVALUATED: IDL.Null,
    APPROVED: IDL.Null,
    NOT_APPROVED: IDL.Null
});
export type DocumentEvaluationStatus = { NOT_EVALUATED: null } | { APPROVED: null } | { NOT_APPROVED: null };

export const DocumentType = IDL.Variant({
    CERTIFICATE_OF_CONFORMITY: IDL.Null,
    COUNTRY_OF_ORIGIN: IDL.Null,
    SWISS_DECODE: IDL.Null,
    PRODUCTION_REPORT: IDL.Null,
    PRODUCTION_FACILITY_LICENSE: IDL.Null
});
export type DocumentType =
    | { CERTIFICATE_OF_CONFORMITY: null }
    | { COUNTRY_OF_ORIGIN: null }
    | { SWISS_DECODE: null }
    | { PRODUCTION_REPORT: null }
    | { PRODUCTION_FACILITY_LICENSE: null };

export const DocumentInfo = IDL.Record({
    id: IDL.Nat,
    type: DocumentType
});
export type DocumentInfo = {
    id: number;
    type: DocumentType;
};

export const CertificateType = IDL.Variant({
    COMPANY: IDL.Null,
    SCOPE: IDL.Null,
    MATERIAL: IDL.Null
});
export type CertificateType = { COMPANY: null } | { SCOPE: null } | { MATERIAL: null };

export const BaseCertificate = IDL.Record({
    id: IDL.Nat,
    uploadedBy: Address,
    issuer: Address,
    subject: Address,
    assessmentStandard: IDL.Text,
    document: DocumentInfo,
    evaluationStatus: DocumentEvaluationStatus,
    type: CertificateType,
    issueDate: IDL.Nat
});
export type BaseCertificate = {
    id: number;
    uploadedBy: Address;
    issuer: Address;
    subject: Address;
    assessmentStandard: string;
    document: DocumentInfo;
    evaluationStatus: DocumentEvaluationStatus;
    type: CertificateType;
    issueDate: number;
};

export const CompanyCertificate = IDL.Record({
    ...BaseCertificate,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat
});
export type CompanyCertificate = BaseCertificate & {
    validFrom: number;
    validUntil: number;
};

export const ScopeCertificate = IDL.Record({
    ...BaseCertificate,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat,
    processTypes: IDL.Vec(IDL.Text)
});
export type ScopeCertificate = BaseCertificate & {
    validFrom: number;
    validUntil: number;
    processTypes: string[];
};

export const MaterialCertificate = IDL.Record({
    ...BaseCertificate,
    materialId: IDL.Nat
});
export type MaterialCertificate = BaseCertificate & {
    materialId: number;
};
