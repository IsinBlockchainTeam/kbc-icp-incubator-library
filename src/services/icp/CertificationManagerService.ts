import { RoleProof } from '@kbc-lib/azle-types';
import { CertificationManagerDriver } from '../../drivers/icp/CertificationManagerDriver';
import { BaseCertificate, CertificateDocumentInfo } from '../../entities/icp/Certificate';
import { CompanyCertificate } from '../../entities/icp/CompanyCertificate';
import { ScopeCertificate } from '../../entities/icp/ScopeCertificate';
import { MaterialCertificate } from '../../entities/icp/MaterialCertificate';
import { EvaluationStatus } from '../../entities/icp/Document';

export class CertificationManagerService {
    private readonly _certificationManagerDriver: CertificationManagerDriver;

    constructor(certificationManagerDriver: CertificationManagerDriver) {
        this._certificationManagerDriver = certificationManagerDriver;
    }

    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocumentInfo,
        validFrom: Date,
        validUntil: Date
    ): Promise<CompanyCertificate> {
        return this._certificationManagerDriver.registerCompanyCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            document,
            validFrom,
            validUntil
        );
    }

    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocumentInfo,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ): Promise<ScopeCertificate> {
        return this._certificationManagerDriver.registerScopeCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            document,
            validFrom,
            validUntil,
            processTypes
        );
    }

    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocumentInfo,
        materialId: number
    ): Promise<MaterialCertificate> {
        return this._certificationManagerDriver.registerMaterialCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            document,
            materialId
        );
    }

    async getBaseCertificatesInfoBySubject(
        roleProof: RoleProof,
        subject: string
    ): Promise<BaseCertificate[]> {
        return this._certificationManagerDriver.getBaseCertificatesInfoBySubject(
            roleProof,
            subject
        );
    }

    async getCompanyCertificates(
        roleProof: RoleProof,
        subject: string
    ): Promise<CompanyCertificate[]> {
        return this._certificationManagerDriver.getCompanyCertificates(roleProof, subject);
    }

    async getScopeCertificates(roleProof: RoleProof, subject: string): Promise<ScopeCertificate[]> {
        return this._certificationManagerDriver.getScopeCertificates(roleProof, subject);
    }

    async getMaterialCertificates(
        roleProof: RoleProof,
        subject: string
    ): Promise<MaterialCertificate[]> {
        return this._certificationManagerDriver.getMaterialCertificates(roleProof, subject);
    }

    async getCompanyCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<CompanyCertificate> {
        return this._certificationManagerDriver.getCompanyCertificate(roleProof, subject, id);
    }

    async getScopeCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<ScopeCertificate> {
        return this._certificationManagerDriver.getScopeCertificate(roleProof, subject, id);
    }

    async getMaterialCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<MaterialCertificate> {
        return this._certificationManagerDriver.getMaterialCertificate(roleProof, subject, id);
    }

    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        validFrom: Date,
        validUntil: Date
    ) {
        return this._certificationManagerDriver.updateCompanyCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            validFrom,
            validUntil
        );
    }

    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ) {
        return this._certificationManagerDriver.updateScopeCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            validFrom,
            validUntil,
            processTypes
        );
    }

    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        materialId: number
    ) {
        return this._certificationManagerDriver.updateMaterialCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            materialId
        );
    }

    async updateDocument(
        roleProof: RoleProof,
        certificateId: number,
        document: CertificateDocumentInfo
    ) {
        return this._certificationManagerDriver.updateDocument(roleProof, certificateId, document);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        certificateId: number,
        documentId: number,
        evaluationStatus: EvaluationStatus
    ) {
        return this._certificationManagerDriver.evaluateDocument(
            roleProof,
            certificateId,
            documentId,
            evaluationStatus
        );
    }
}
