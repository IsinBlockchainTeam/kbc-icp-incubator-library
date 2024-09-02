import { Signer, utils } from 'ethers';
import { CertificateManager, CertificateManager__factory } from '../smart-contracts';
import { CompanyCertificate } from '../entities/CompanyCertificate';
import { EntityBuilder } from '../utils/EntityBuilder';
import { ScopeCertificate } from '../entities/ScopeCertificate';
import { MaterialCertificate } from '../entities/MaterialCertificate';
import { RoleProof } from '../types/RoleProof';
import {
    BaseCertificate,
    CertificationType,
    DocumentEvaluationStatus,
    DocumentType
} from '../entities/Certificate';

export class CertificateManagerDriver {
    private _actual: CertificateManager;

    constructor(signer: Signer, certificateManagerAddress: string) {
        this._actual = CertificateManager__factory.connect(
            certificateManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        documentId: number,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date
    ): Promise<number> {
        const tx = await this._actual.registerCompanyCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
            issueDate.getTime(),
            validFrom.getTime(),
            validUntil.getTime()
        );
        const { events } = await tx.wait();
        if (!events)
            throw new Error('Error during company certificate registration, no events found');

        const eventArgs = events.find(
            (event) => event.event === 'CompanyCertificateRegistered'
        )?.args;
        return eventArgs?.id.toNumber();
    }

    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        documentId: number,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ): Promise<number> {
        const tx = await this._actual.registerScopeCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
            issueDate.getTime(),
            validFrom.getTime(),
            validUntil.getTime(),
            processTypes
        );
        const { events } = await tx.wait();
        if (!events)
            throw new Error('Error during scope certificate registration, no events found');

        const eventArgs = events.find(
            (event) => event.event === 'ScopeCertificateRegistered'
        )?.args;
        return eventArgs?.id.toNumber();
    }

    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        documentId: number,
        issueDate: Date,
        tradeId: number,
        lineId: number
    ): Promise<number> {
        const tx = await this._actual.registerMaterialCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
            issueDate.getTime(),
            tradeId,
            lineId
        );
        const { events } = await tx.wait();
        if (!events)
            throw new Error('Error during material certificate registration, no events found');

        const eventArgs = events.find(
            (event) => event.event === 'MaterialCertificateRegistered'
        )?.args;
        return eventArgs?.id.toNumber();
    }

    async getCertificateIdsByConsigneeCompany(
        roleProof: RoleProof,
        consigneeCompany: string
    ): Promise<number[]> {
        const certificateIds = await this._actual.getCertificateIdsByConsigneeCompany(
            roleProof,
            consigneeCompany
        );
        return certificateIds.map((certificateId) => certificateId.toNumber());
    }

    async getCompanyCertificates(
        roleProof: RoleProof,
        consigneeCompany: string
    ): Promise<CompanyCertificate[]> {
        const certificates = await this._actual.getCompanyCertificates(roleProof, consigneeCompany);
        return certificates.map((certificate) =>
            EntityBuilder.buildCompanyCertificate(certificate)
        );
    }

    async getCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<CompanyCertificate> {
        const certificate = await this._actual.getCompanyCertificate(roleProof, certificateId);
        return EntityBuilder.buildCompanyCertificate(certificate);
    }

    async getScopeCertificates(
        roleProof: RoleProof,
        company: string,
        processType: string
    ): Promise<ScopeCertificate[]> {
        const certificates = await this._actual.getScopeCertificates(
            roleProof,
            company,
            processType
        );
        return certificates.map((certificate) => EntityBuilder.buildScopeCertificate(certificate));
    }

    async getScopeCertificate(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<ScopeCertificate> {
        const certificate = await this._actual.getScopeCertificate(roleProof, certificateId);
        return EntityBuilder.buildScopeCertificate(certificate);
    }

    async getMaterialCertificates(
        roleProof: RoleProof,
        tradeId: number,
        tradeLineId: number
    ): Promise<MaterialCertificate[]> {
        const certificates = await this._actual.getMaterialCertificates(
            roleProof,
            tradeId,
            tradeLineId
        );
        return certificates.map((certificate) =>
            EntityBuilder.buildMaterialCertificate(certificate)
        );
    }

    async getMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<MaterialCertificate> {
        const certificate = await this._actual.getMaterialCertificate(roleProof, certificateId);
        return EntityBuilder.buildMaterialCertificate(certificate);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        certificationId: number,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus
    ): Promise<void> {
        try {
            const tx = await this._actual.evaluateDocument(
                roleProof,
                certificationId,
                documentId,
                evaluationStatus
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addDocument(
        roleProof: RoleProof,
        consigneeCompany: string,
        certificationType: CertificationType,
        documentType: DocumentType,
        externalUrl: string,
        contentHash: string
    ): Promise<number> {
        const tx = await this._actual.addDocument(
            roleProof,
            consigneeCompany,
            certificationType,
            documentType,
            externalUrl,
            contentHash
        );
        const { events } = await tx.wait();
        if (!events) throw new Error('Error during document registration, no events found');

        const eventArgs = events.find((event) => event.event === 'DocumentAdded')?.args;
        return eventArgs?.id.toNumber();
    }

    async updateDocument(
        roleProof: RoleProof,
        documentId: number,
        externalUrl: string,
        contentHash: string
    ): Promise<void> {
        const tx = await this._actual.updateDocument(
            roleProof,
            documentId,
            externalUrl,
            contentHash
        );
        await tx.wait();
    }

    async getBaseCertificateInfoById(
        roleProof: RoleProof,
        certificationId: number
    ): Promise<BaseCertificate> {
        const certificationInfo = await this._actual.getBaseCertificationInfoById(
            roleProof,
            certificationId
        );
        return EntityBuilder.buildBaseCertificate(certificationInfo);
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._actual.addAdmin(address);
        await tx.wait();
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._actual.removeAdmin(address);
        await tx.wait();
    }
}
