import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { MaterialCertificate as ICPMaterialCertificate } from '@kbc-lib/azle-types';
import { EntityBuilder } from '../../utils/icp/EntityBuilder';
import { CompanyCertificate } from '../../entities/icp/CompanyCertificate';
import { MaterialCertificate } from '../../entities/icp/MaterialCertificate';
import { ScopeCertificate } from '../../entities/icp/ScopeCertificate';
import { BaseCertificate, CertificateDocumentInfo } from '../../entities/icp/Certificate';
import { EvaluationStatus } from '../../entities/icp/Evaluation';

export class CertificationDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async registerCompanyCertificate(
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        validFrom: Date,
        validUntil: Date,
        notes?: string
    ): Promise<CompanyCertificate> {
        const certificate = await this._actor.registerCompanyCertificate(
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            EntityBuilder.buildICPCertificateDocumentInfo(document),
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime()),
            notes || ''
        );
        return EntityBuilder.buildCompanyCertificate(certificate);
    }

    async registerScopeCertificate(
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[],
        notes?: string
    ): Promise<ScopeCertificate> {
        const certificate = await this._actor.registerScopeCertificate(
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            EntityBuilder.buildICPCertificateDocumentInfo(document),
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime()),
            processTypes,
            notes || ''
        );
        return EntityBuilder.buildScopeCertificate(certificate);
    }

    async registerMaterialCertificate(
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        materialId: number,
        notes?: string
    ): Promise<MaterialCertificate> {
        const certificate = await this._actor.registerMaterialCertificate(
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            EntityBuilder.buildICPCertificateDocumentInfo(document),
            BigInt(materialId),
            notes || ''
        );
        return this._buildMaterialCertificate(certificate);
    }

    async getBaseCertificateById(id: number): Promise<BaseCertificate> {
        const certificate = await this._actor.getBaseCertificateById(BigInt(id));
        return EntityBuilder.buildBaseCertificate(certificate);
    }

    async getBaseCertificatesInfoBySubject(subject: string): Promise<BaseCertificate[]> {
        const certificates = await this._actor.getBaseCertificatesInfoBySubject(subject);
        return certificates.map((cert) => EntityBuilder.buildBaseCertificate(cert));
    }

    async getCompanyCertificates(subject: string): Promise<CompanyCertificate[]> {
        const certificates = await this._actor.getCompanyCertificates(subject);
        return certificates.map((cert) => EntityBuilder.buildCompanyCertificate(cert));
    }

    async getScopeCertificates(subject: string): Promise<ScopeCertificate[]> {
        const certificates = await this._actor.getScopeCertificates(subject);
        return certificates.map((cert) => EntityBuilder.buildScopeCertificate(cert));
    }

    async getMaterialCertificates(subject: string): Promise<MaterialCertificate[]> {
        const certificates = await this._actor.getMaterialCertificates(subject);
        return Promise.all(certificates.map(async (cert) => this._buildMaterialCertificate(cert)));
    }

    async getCompanyCertificate(subject: string, id: number): Promise<CompanyCertificate> {
        const certificate = await this._actor.getCompanyCertificate(subject, BigInt(id));
        return EntityBuilder.buildCompanyCertificate(certificate);
    }

    async getScopeCertificate(subject: string, id: number): Promise<ScopeCertificate> {
        const certificate = await this._actor.getScopeCertificate(subject, BigInt(id));
        return EntityBuilder.buildScopeCertificate(certificate);
    }

    async getMaterialCertificate(subject: string, id: number): Promise<MaterialCertificate> {
        const certificate = await this._actor.getMaterialCertificate(subject, BigInt(id));
        return this._buildMaterialCertificate(certificate);
    }

    async updateCompanyCertificate(
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: Date,
        validUntil: Date,
        notes?: string
    ): Promise<CompanyCertificate> {
        const certificate = await this._actor.updateCompanyCertificate(
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime()),
            notes || ''
        );
        return EntityBuilder.buildCompanyCertificate(certificate);
    }

    async updateScopeCertificate(
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[],
        notes?: string
    ): Promise<ScopeCertificate> {
        const certificate = await this._actor.updateScopeCertificate(
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime()),
            processTypes,
            notes || ''
        );
        return EntityBuilder.buildScopeCertificate(certificate);
    }

    async updateMaterialCertificate(
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        materialId: number,
        notes?: string
    ): Promise<MaterialCertificate> {
        const certificate = await this._actor.updateMaterialCertificate(
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            BigInt(materialId),
            notes || ''
        );
        return this._buildMaterialCertificate(certificate);
    }

    async updateDocument(
        certificateId: number,
        document: CertificateDocumentInfo
    ): Promise<BaseCertificate> {
        const baseCertificate = await this._actor.updateCertificateDocument(
            BigInt(certificateId),
            EntityBuilder.buildICPCertificateDocumentInfo(document)
        );
        return EntityBuilder.buildBaseCertificate(baseCertificate);
    }

    async evaluateDocument(
        certificateId: number,
        evaluationStatus: EvaluationStatus
    ): Promise<BaseCertificate> {
        const baseCertificate = await this._actor.evaluateCertificateDocument(
            BigInt(certificateId),
            EntityBuilder.buildICPEvaluationStatus(evaluationStatus)
        );
        return EntityBuilder.buildBaseCertificate(baseCertificate);
    }

    private async _buildMaterialCertificate(
        certificate: ICPMaterialCertificate
    ): Promise<MaterialCertificate> {
        return EntityBuilder.buildMaterialCertificate(
            certificate,
            await this._actor.getMaterial(certificate.materialId)
        );
    }
}
