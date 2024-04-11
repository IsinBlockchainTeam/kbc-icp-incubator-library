import { Signer } from 'ethers';
import { CertificateManager, CertificateManager__factory } from '../smart-contracts';
import { CompanyCertificate } from '../entities/CompanyCertificate';
import { EntityBuilder } from '../utils/EntityBuilder';
import { ScopeCertificate } from '../entities/ScopeCertificate';
import { MaterialCertificate } from '../entities/MaterialCertificate';

export class CertificateManagerDriver {
    private _certificateManagerContract: CertificateManager;

    constructor(signer: Signer, certificateManagerAddress: string) {
        this._certificateManagerContract = CertificateManager__factory
            .connect(certificateManagerAddress, signer.provider!)
            .connect(signer);
    }

    async registerCompanyCertificate(issuer: string, company: string, assessmentStandard: string, documentId: number, issueDate: Date, validFrom: Date, validUntil: Date): Promise<void> {
        try {
            const tx = await this._certificateManagerContract.registerCompanyCertificate(issuer, company, assessmentStandard, documentId, issueDate.getTime(), validFrom.getTime(), validUntil.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async registerScopeCertificate(issuer: string, company: string, assessmentStandard: string, documentId: number, issueDate: Date, validFrom: Date, validUntil: Date, processTypes: string[]): Promise<void> {
        try {
            const tx = await this._certificateManagerContract.registerScopeCertificate(issuer, company, assessmentStandard, documentId, issueDate.getTime(), validFrom.getTime(), validUntil.getTime(), processTypes);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async registerMaterialCertificate(issuer: string, assessmentStandard: string, documentId: number, issueDate: Date, tradeId: number, lineId: number): Promise<void> {
        try {
            const tx = await this._certificateManagerContract.registerMaterialCertificate(issuer, assessmentStandard, documentId, issueDate.getTime(), tradeId, lineId);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getCompanyCertificates(company: string): Promise<CompanyCertificate[]> {
        const certificates = await this._certificateManagerContract.getCompanyCertificates(company);
        return certificates.map((certificate) => EntityBuilder.buildCompanyCertificate(certificate));
    }

    async getScopeCertificates(company: string, processType: string): Promise<ScopeCertificate[]> {
        const certificates = await this._certificateManagerContract.getScopeCertificates(company, processType);
        return certificates.map((certificate) => EntityBuilder.buildScopeCertificate(certificate));
    }

    async getMaterialCertificates(tradeId: number, tradeLineId: number): Promise<MaterialCertificate[]> {
        const certificates = await this._certificateManagerContract.getMaterialCertificates(tradeId, tradeLineId);
        return certificates.map((certificate) => EntityBuilder.buildMaterialCertificate(certificate));
    }
}
