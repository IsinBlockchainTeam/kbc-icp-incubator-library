import { IDL, update } from 'azle';
import {
    CertificateDocumentInfo,
    MaterialCertificate,
    CompanyCertificate,
    ScopeCertificate,
    BaseCertificate,
    EvaluationStatus
} from '../models/types';
import CertificationService from '../services/CertificationService';
import {
    IDLBaseCertificate,
    IDLCompanyCertificate,
    IDLCertificateDocumentInfo,
    IDLEvaluationStatus,
    IDLScopeCertificate,
    IDLMaterialCertificate
} from '../models/idls';
import { AtLeastEditor, AtLeastViewer } from '../decorators/roles';

class CertificationController {
    @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDLCertificateDocumentInfo, IDL.Nat, IDL.Nat, IDL.Text], IDLCompanyCertificate)
    @AtLeastEditor
    async registerCompanyCertificate(
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

    @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDLCertificateDocumentInfo, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text), IDL.Text], IDLScopeCertificate)
    @AtLeastEditor
    async registerScopeCertificate(
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

    @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDLCertificateDocumentInfo, IDL.Nat, IDL.Text], IDLMaterialCertificate)
    @AtLeastEditor
    async registerMaterialCertificate(
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        materialId: bigint,
        notes: string
    ): Promise<MaterialCertificate> {
        return CertificationService.instance.registerMaterialCertificate(
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            document,
            materialId,
            notes
        );
    }

    @update([IDL.Nat], IDLBaseCertificate)
    @AtLeastViewer
    async getBaseCertificateById(id: bigint): Promise<BaseCertificate> {
        return CertificationService.instance.getBaseCertificateById(id);
    }

    @update([IDL.Text], IDL.Vec(IDLBaseCertificate))
    @AtLeastViewer
    async getBaseCertificatesInfoBySubject(subject: string): Promise<BaseCertificate[]> {
        return CertificationService.instance.getBaseCertificatesInfoBySubject(subject);
    }

    @update([IDL.Text], IDL.Vec(IDLCompanyCertificate))
    @AtLeastViewer
    async getCompanyCertificates(subject: string): Promise<CompanyCertificate[]> {
        return CertificationService.instance.getCompanyCertificates(subject);
    }

    @update([IDL.Text], IDL.Vec(IDLScopeCertificate))
    @AtLeastViewer
    async getScopeCertificates(subject: string): Promise<ScopeCertificate[]> {
        return CertificationService.instance.getScopeCertificates(subject);
    }

    @update([IDL.Text], IDL.Vec(IDLMaterialCertificate))
    @AtLeastViewer
    async getMaterialCertificates(subject: string): Promise<MaterialCertificate[]> {
        return CertificationService.instance.getMaterialCertificates(subject);
    }

    @update([IDL.Text, IDL.Nat], IDLCompanyCertificate)
    @AtLeastViewer
    async getCompanyCertificate(subject: string, id: bigint): Promise<CompanyCertificate> {
        return CertificationService.instance.getCompanyCertificate(subject, id);
    }

    @update([IDL.Text, IDL.Nat], IDLScopeCertificate)
    @AtLeastViewer
    async getScopeCertificate(subject: string, id: bigint): Promise<ScopeCertificate> {
        return CertificationService.instance.getScopeCertificate(subject, id);
    }

    @update([IDL.Text, IDL.Nat], IDLMaterialCertificate)
    @AtLeastViewer
    async getMaterialCertificate(subject: string, id: bigint): Promise<MaterialCertificate> {
        return CertificationService.instance.getMaterialCertificate(subject, id);
    }

    @update([IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Text], IDLCompanyCertificate)
    @AtLeastEditor
    async updateCompanyCertificate(
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: number,
        validUntil: number,
        notes: string
    ): Promise<CompanyCertificate> {
        return CertificationService.instance.updateCompanyCertificate(
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            validFrom,
            validUntil,
            notes
        );
    }

    @update([IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text), IDL.Text], IDLScopeCertificate)
    @AtLeastEditor
    async updateScopeCertificate(
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: number,
        validUntil: number,
        processTypes: string[],
        notes: string
    ): Promise<ScopeCertificate> {
        return CertificationService.instance.updateScopeCertificate(
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            validFrom,
            validUntil,
            processTypes,
            notes
        );
    }

    @update([IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text], IDLMaterialCertificate)
    @AtLeastEditor
    async updateMaterialCertificate(
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        materialId: bigint,
        notes: string
    ): Promise<MaterialCertificate> {
        return CertificationService.instance.updateMaterialCertificate(
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            materialId,
            notes
        );
    }

    @update([IDL.Nat, IDLCertificateDocumentInfo])
    @AtLeastEditor
    async updateCertificateDocument(certificateId: bigint, document: CertificateDocumentInfo): Promise<void> {
        return CertificationService.instance.updateDocument(certificateId, document);
    }

    @update([IDL.Nat, IDLEvaluationStatus])
    @AtLeastEditor
    async evaluateCertificateDocument(certificateId: bigint, evaluation: EvaluationStatus): Promise<void> {
        return CertificationService.instance.evaluateDocument(certificateId, evaluation);
    }
}

export default CertificationController;
