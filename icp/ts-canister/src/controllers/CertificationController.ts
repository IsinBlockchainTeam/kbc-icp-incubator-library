import { IDL, update } from 'azle';
import {
    CertificateDocumentInfo,
    MaterialCertificate,
    RoleProof,
    CompanyCertificate,
    ScopeCertificate,
    BaseCertificate,
    EvaluationStatus
} from '../models/types';
import { OnlyEditor, OnlyViewer } from '../decorators/roles';
import CertificationService from '../services/CertificationService';
import {
    BaseCertificate as IDLBaseCertificate,
    CompanyCertificate as IDLCompanyCertificate,
    CertificateDocumentInfo as IDLCertificateDocumentInfo,
    EvaluationStatus as IDLEvaluationStatus,
    RoleProof as IDLRoleProof,
    ScopeCertificate as IDLScopeCertificate,
    MaterialCertificate as IDLMaterialCertificate
} from '../models/idls';

class CertificationController {
    @update([IDLRoleProof, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDLCertificateDocumentInfo, IDL.Nat, IDL.Nat, IDL.Text], IDLCompanyCertificate)
    @OnlyEditor
    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        validFrom: number,
        validUntil: number,
        notes: string
    ): Promise<CompanyCertificate> {
        return CertificationService.instance.registerCompanyCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            document,
            validFrom,
            validUntil,
            notes
        );
    }

    @update(
        [IDLRoleProof, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDLCertificateDocumentInfo, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text), IDL.Text],
        IDLScopeCertificate
    )
    @OnlyEditor
    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        validFrom: number,
        validUntil: number,
        processTypes: string[],
        notes: string
    ): Promise<ScopeCertificate> {
        return CertificationService.instance.registerScopeCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            document,
            validFrom,
            validUntil,
            processTypes,
            notes
        );
    }

    @update([IDLRoleProof, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDLCertificateDocumentInfo, IDL.Nat, IDL.Text], IDLMaterialCertificate)
    @OnlyEditor
    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        materialId: bigint,
        notes: string
    ): Promise<MaterialCertificate> {
        return CertificationService.instance.registerMaterialCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            document,
            materialId,
            notes
        );
    }

    @update([IDLRoleProof, IDL.Nat], IDLBaseCertificate)
    @OnlyViewer
    async getBaseCertificateById(roleProof: RoleProof, id: bigint): Promise<BaseCertificate> {
        return CertificationService.instance.getBaseCertificateById(roleProof, id);
    }

    @update([IDLRoleProof, IDL.Text], IDL.Vec(IDLBaseCertificate))
    @OnlyViewer
    async getBaseCertificatesInfoBySubject(roleProof: RoleProof, subject: string): Promise<BaseCertificate[]> {
        return CertificationService.instance.getBaseCertificatesInfoBySubject(roleProof, subject);
    }

    @update([IDLRoleProof, IDL.Text], IDL.Vec(IDLCompanyCertificate))
    @OnlyViewer
    async getCompanyCertificates(roleProof: RoleProof, subject: string): Promise<CompanyCertificate[]> {
        return CertificationService.instance.getCompanyCertificates(roleProof, subject);
    }

    @update([IDLRoleProof, IDL.Text], IDL.Vec(IDLScopeCertificate))
    @OnlyViewer
    async getScopeCertificates(roleProof: RoleProof, subject: string): Promise<ScopeCertificate[]> {
        return CertificationService.instance.getScopeCertificates(roleProof, subject);
    }

    @update([IDLRoleProof, IDL.Text], IDL.Vec(IDLMaterialCertificate))
    @OnlyViewer
    async getMaterialCertificates(roleProof: RoleProof, subject: string): Promise<MaterialCertificate[]> {
        return CertificationService.instance.getMaterialCertificates(roleProof, subject);
    }

    @update([IDLRoleProof, IDL.Text, IDL.Nat], IDLCompanyCertificate)
    @OnlyViewer
    async getCompanyCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<CompanyCertificate> {
        return CertificationService.instance.getCompanyCertificate(roleProof, subject, id);
    }

    @update([IDLRoleProof, IDL.Text, IDL.Nat], IDLScopeCertificate)
    @OnlyViewer
    async getScopeCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<ScopeCertificate> {
        return CertificationService.instance.getScopeCertificate(roleProof, subject, id);
    }

    @update([IDLRoleProof, IDL.Text, IDL.Nat], IDLMaterialCertificate)
    @OnlyViewer
    async getMaterialCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<MaterialCertificate> {
        return CertificationService.instance.getMaterialCertificate(roleProof, subject, id);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Text], IDLCompanyCertificate)
    @OnlyEditor
    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: number,
        validUntil: number,
        notes: string
    ): Promise<CompanyCertificate> {
        return CertificationService.instance.updateCompanyCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            validFrom,
            validUntil,
            notes
        );
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text), IDL.Text], IDLScopeCertificate)
    @OnlyEditor
    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: number,
        validUntil: number,
        processTypes: string[],
        notes: string
    ): Promise<ScopeCertificate> {
        return CertificationService.instance.updateScopeCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            validFrom,
            validUntil,
            processTypes,
            notes
        );
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text], IDLMaterialCertificate)
    @OnlyEditor
    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        materialId: bigint,
        notes: string
    ): Promise<MaterialCertificate> {
        return CertificationService.instance.updateMaterialCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            materialId,
            notes
        );
    }

    @update([IDLRoleProof, IDL.Nat, IDLCertificateDocumentInfo])
    @OnlyEditor
    async updateCertificateDocument(roleProof: RoleProof, certificateId: bigint, document: CertificateDocumentInfo): Promise<void> {
        return CertificationService.instance.updateDocument(roleProof, certificateId, document);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat, IDLEvaluationStatus])
    @OnlyEditor
    async evaluateCertificateDocument(roleProof: RoleProof, certificateId: bigint, evaluation: EvaluationStatus): Promise<void> {
        return CertificationService.instance.evaluateDocument(roleProof, certificateId, evaluation);
    }
}

export default CertificationController;
