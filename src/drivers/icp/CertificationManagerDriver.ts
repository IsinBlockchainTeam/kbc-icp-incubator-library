import { ActorSubclass, Identity } from '@dfinity/agent';
import { RoleProof } from '@kbc-lib/azle-types';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { EntityBuilder } from '../../utils/icp/EntityBuilder';
import { CompanyCertificate } from '../../entities/icp/CompanyCertificate';
import { MaterialCertificate } from '../../entities/icp/MaterialCertificate';
import { ScopeCertificate } from '../../entities/icp/ScopeCertificate';
import { BaseCertificate, CertificateDocumentInfo } from '../../entities/icp/Certificate';
import { EvaluationStatus } from '../../entities/icp/Document';

export class CertificationManagerDriver {
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
        roleProof: RoleProof,
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
            roleProof,
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
        roleProof: RoleProof,
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
            roleProof,
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
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        materialId: number,
        notes?: string
    ): Promise<MaterialCertificate> {
        const certificate = await this._actor.registerMaterialCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            EntityBuilder.buildICPCertificateDocumentInfo(document),
            BigInt(materialId),
            notes || ''
        );
        return EntityBuilder.buildMaterialCertificate(certificate);
    }

    async getBaseCertificateById(roleProof: RoleProof, id: number): Promise<BaseCertificate> {
        const certificate = await this._actor.getBaseCertificateById(roleProof, BigInt(id));
        return EntityBuilder.buildBaseCertificate(certificate);
    }

    async getBaseCertificatesInfoBySubject(
        roleProof: RoleProof,
        subject: string
    ): Promise<BaseCertificate[]> {
        const certificates = await this._actor.getBaseCertificatesInfoBySubject(roleProof, subject);
        return certificates.map((cert) => EntityBuilder.buildBaseCertificate(cert));
    }

    async getCompanyCertificates(
        roleProof: RoleProof,
        subject: string
    ): Promise<CompanyCertificate[]> {
        const certificates = await this._actor.getCompanyCertificates(roleProof, subject);
        return certificates.map((cert) => EntityBuilder.buildCompanyCertificate(cert));
    }

    async getScopeCertificates(roleProof: RoleProof, subject: string): Promise<ScopeCertificate[]> {
        const certificates = await this._actor.getScopeCertificates(roleProof, subject);
        return certificates.map((cert) => EntityBuilder.buildScopeCertificate(cert));
    }

    async getMaterialCertificates(
        roleProof: RoleProof,
        subject: string
    ): Promise<MaterialCertificate[]> {
        const certificates = await this._actor.getMaterialCertificates(roleProof, subject);
        return certificates.map((cert) => EntityBuilder.buildMaterialCertificate(cert));
    }

    async getCompanyCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<CompanyCertificate> {
        const certificate = await this._actor.getCompanyCertificate(roleProof, subject, BigInt(id));
        return EntityBuilder.buildCompanyCertificate(certificate);
    }

    async getScopeCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<ScopeCertificate> {
        const certificate = await this._actor.getScopeCertificate(roleProof, subject, BigInt(id));
        return EntityBuilder.buildScopeCertificate(certificate);
    }

    async getMaterialCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<MaterialCertificate> {
        const certificate = await this._actor.getMaterialCertificate(
            roleProof,
            subject,
            BigInt(id)
        );
        return EntityBuilder.buildMaterialCertificate(certificate);
    }

    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: Date,
        validUntil: Date,
        notes?: string
    ) {
        return this._actor.updateCompanyCertificate(
            roleProof,
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime()),
            notes || ''
        );
    }

    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[],
        notes?: string
    ) {
        return this._actor.updateScopeCertificate(
            roleProof,
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            BigInt(validFrom.getTime()),
            BigInt(validUntil.getTime()),
            processTypes,
            notes || ''
        );
    }

    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        materialId: number,
        notes?: string
    ) {
        return this._actor.updateMaterialCertificate(
            roleProof,
            BigInt(certificateId),
            assessmentStandard,
            assessmentAssuranceLevel,
            BigInt(materialId),
            notes || ''
        );
    }

    async updateDocument(
        roleProof: RoleProof,
        certificateId: number,
        document: CertificateDocumentInfo
    ) {
        return this._actor.updateCertificateDocument(
            roleProof,
            BigInt(certificateId),
            EntityBuilder.buildICPCertificateDocumentInfo(document)
        );
    }

    async evaluateDocument(
        roleProof: RoleProof,
        certificateId: number,
        documentId: number,
        evaluationStatus: EvaluationStatus
    ) {
        await this._actor.evaluateCertificateDocument(
            roleProof,
            BigInt(certificateId),
            BigInt(documentId),
            EntityBuilder.buildICPEvaluationStatus(evaluationStatus)
        );
    }
}
