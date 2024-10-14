import { IDL } from 'azle';

export enum DocumentEvaluationStatusEnum {
    NOT_EVALUATED = 'NOT_EVALUATED',
    APPROVED = 'APPROVED',
    NOT_APPROVED = 'NOT_APPROVED'
}
export const DocumentEvaluationStatus = IDL.Variant({
    NOT_EVALUATED: IDL.Null,
    APPROVED: IDL.Null,
    NOT_APPROVED: IDL.Null
});
export type DocumentEvaluationStatus = { NOT_EVALUATED: null } | { APPROVED: null } | { NOT_APPROVED: null };

export enum DocumentTypeEnum {
    CERTIFICATE_OF_CONFORMITY = 'CERTIFICATE_OF_CONFORMITY',
    COUNTRY_OF_ORIGIN = 'COUNTRY_OF_ORIGIN',
    SWISS_DECODE = 'SWISS_DECODE',
    PRODUCTION_REPORT = 'PRODUCTION_REPORT',
    PRODUCTION_FACILITY_LICENSE = 'PRODUCTION_FACILITY_LICENSE'
}
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
    docType: DocumentType,
    externalUrl: IDL.Text
});
export type DocumentInfo = {
    id: bigint;
    docType: DocumentType;
    externalUrl: string;
};

export enum CertificateTypeEnum {
    COMPANY = 'COMPANY',
    SCOPE = 'SCOPE',
    MATERIAL = 'MATERIAL'
}
export const CertificateType = IDL.Variant({
    COMPANY: IDL.Null,
    SCOPE: IDL.Null,
    MATERIAL: IDL.Null
});
export type CertificateType = { COMPANY: null } | { SCOPE: null } | { MATERIAL: null };

const BaseCertificateType = {
    id: IDL.Nat,
    issuer: IDL.Text,
    subject: IDL.Text,
    uploadedBy: IDL.Text,
    assessmentStandard: IDL.Text,
    assessmentAssuranceLevel: IDL.Text,
    referenceId: IDL.Text,
    document: DocumentInfo,
    evaluationStatus: DocumentEvaluationStatus,
    certType: CertificateType,
    issueDate: IDL.Nat
};
export const BaseCertificate = IDL.Record({
    ...BaseCertificateType
});
export interface BaseCertificate {
    id: bigint;
    issuer: string;
    subject: string;
    uploadedBy: string;
    assessmentStandard: string;
    assessmentAssuranceLevel: string;
    referenceId: string;
    document: DocumentInfo;
    evaluationStatus: DocumentEvaluationStatus;
    certType: CertificateType;
    issueDate: bigint;
}

export const CompanyCertificate = IDL.Record({
    ...BaseCertificateType,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat
});
export interface CompanyCertificate extends BaseCertificate {
    validFrom: bigint;
    validUntil: bigint;
}

export const ScopeCertificate = IDL.Record({
    ...BaseCertificateType,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat,
    processTypes: IDL.Vec(IDL.Text)
});
export interface ScopeCertificate extends BaseCertificate {
    validFrom: bigint;
    validUntil: bigint;
    processTypes: string[];
}

export const MaterialCertificate = IDL.Record({
    ...BaseCertificateType,
    materialId: IDL.Nat
});
export interface MaterialCertificate extends BaseCertificate {
    materialId: bigint;
}
