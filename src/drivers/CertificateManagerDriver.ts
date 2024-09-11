import { Event, Signer, utils } from 'ethers';
import { CertificateManager, CertificateManager__factory } from '../smart-contracts';
import { CompanyCertificate } from '../entities/CompanyCertificate';
import { EntityBuilder } from '../utils/EntityBuilder';
import { ScopeCertificate } from '../entities/ScopeCertificate';
import { MaterialCertificate } from '../entities/MaterialCertificate';
import { RoleProof } from '../types/RoleProof';
import {
    BaseCertificate,
    CertificateDocumentInfo,
    DocumentEvaluationStatus
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
        document: CertificateDocumentInfo,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date
    ): Promise<number> {
        const tx: any = await this._actual.registerCompanyCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            document,
            issueDate.getTime(),
            validFrom.getTime(),
            validUntil.getTime()
        );
        const { events } = await tx.wait();
        if (!events)
            throw new Error('Error during company certificate registration, no events found');

        return events.find((event: Event) => event.event === 'CompanyCertificateRegistered')
            .args[0];
    }

    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        document: CertificateDocumentInfo,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ): Promise<number> {
        const tx: any = await this._actual.registerScopeCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            document,
            issueDate.getTime(),
            validFrom.getTime(),
            validUntil.getTime(),
            processTypes
        );
        const { events } = await tx.wait();
        if (!events)
            throw new Error('Error during scope certificate registration, no events found');

        return events.find((event: Event) => event.event === 'ScopeCertificateRegistered').args[0];
    }

    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        document: CertificateDocumentInfo,
        issueDate: Date,
        materialId: number
    ): Promise<number> {
        const tx: any = await this._actual.registerMaterialCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            document,
            issueDate.getTime(),
            materialId
        );
        const { events } = await tx.wait();
        if (!events)
            throw new Error('Error during material certificate registration, no events found');

        return events.find((event: Event) => event.event === 'MaterialCertificateRegistered')
            .args[0];
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

    async getBaseCertificatesInfoByConsigneeCompany(
        roleProof: RoleProof,
        consigneeCompany: string
    ): Promise<BaseCertificate[]> {
        const certificates = await this._actual.getBaseCertificatesInfoByConsigneeCompany(
            roleProof,
            consigneeCompany
        );
        return certificates.map((certificate) => EntityBuilder.buildBaseCertificate(certificate));
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
        consigneeCompany: string,
        materialId: number
    ): Promise<MaterialCertificate[]> {
        const certificates = await this._actual.getMaterialCertificates(
            roleProof,
            consigneeCompany,
            materialId
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

    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date
    ): Promise<void> {
        try {
            const tx = await this._actual.updateCompanyCertificate(
                roleProof,
                certificateId,
                assessmentStandard,
                issueDate.getTime(),
                validFrom.getTime(),
                validUntil.getTime()
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ): Promise<void> {
        try {
            const tx = await this._actual.updateScopeCertificate(
                roleProof,
                certificateId,
                assessmentStandard,
                issueDate.getTime(),
                validFrom.getTime(),
                validUntil.getTime(),
                processTypes
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        issueDate: Date,
        materialId: number
    ): Promise<void> {
        try {
            const tx = await this._actual.updateMaterialCertificate(
                roleProof,
                certificateId,
                assessmentStandard,
                issueDate.getTime(),
                materialId
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async evaluateDocument(
        roleProof: RoleProof,
        certificateId: number,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus
    ): Promise<void> {
        try {
            const tx = await this._actual.evaluateDocument(
                roleProof,
                certificateId,
                documentId,
                evaluationStatus
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateDocument(
        roleProof: RoleProof,
        certificationId: number,
        documentId: number,
        externalUrl: string,
        contentHash: string
    ): Promise<void> {
        try {
            const tx = await this._actual.updateDocument(
                roleProof,
                certificationId,
                documentId,
                externalUrl,
                contentHash
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getBaseCertificateInfoById(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<BaseCertificate> {
        const certificateInfo = await this._actual.getBaseCertificateInfoById(
            roleProof,
            certificateId
        );
        return EntityBuilder.buildBaseCertificate(certificateInfo);
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
