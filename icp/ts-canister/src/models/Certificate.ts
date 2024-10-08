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
    docType: DocumentType
});
export type DocumentInfo = {
    id: bigint;
    docType: DocumentType;
};

export const CertificateType = IDL.Variant({
    COMPANY: IDL.Null,
    SCOPE: IDL.Null,
    MATERIAL: IDL.Null
});
export type CertificateType = { COMPANY: null } | { SCOPE: null } | { MATERIAL: null };

const BaseCertificateType = {
    id: IDL.Nat,
    uploadedBy: Address,
    issuer: Address,
    subject: Address,
    assessmentStandard: IDL.Text,
    document: DocumentInfo,
    evaluationStatus: DocumentEvaluationStatus,
    certType: CertificateType,
    issueDate: IDL.Nat
};
export const BaseCertificate = IDL.Record({
    ...BaseCertificateType
});
export type BaseCertificate = {
    id: bigint;
    uploadedBy: Address;
    issuer: Address;
    subject: Address;
    assessmentStandard: string;

    document: DocumentInfo;
    evaluationStatus: DocumentEvaluationStatus;
    certType: CertificateType;
    issueDate: bigint;
};

export const CompanyCertificate = IDL.Record({
    ...BaseCertificateType,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat
});
export type CompanyCertificate = BaseCertificate & {
    validFrom: bigint;
    validUntil: bigint;
};

export const ScopeCertificate = IDL.Record({
    ...BaseCertificateType,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat,
    processTypes: IDL.Vec(IDL.Text)
});
export type ScopeCertificate = BaseCertificate & {
    validFrom: bigint;
    validUntil: bigint;
    processTypes: string[];
};

export const MaterialCertificate = IDL.Record({
    ...BaseCertificateType,
    materialId: IDL.Nat
});
export type MaterialCertificate = BaseCertificate & {
    materialId: bigint;
};
