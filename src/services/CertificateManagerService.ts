import { CertificateManagerDriver } from '../drivers/CertificateManagerDriver';
import { CompanyCertificate } from '../entities/CompanyCertificate';
import { ScopeCertificate } from '../entities/ScopeCertificate';
import { MaterialCertificate } from '../entities/MaterialCertificate';

export class CertificateManagerService {
    private _certificateManagerDriver: CertificateManagerDriver;

    constructor(certificateManagerDriver: CertificateManagerDriver) {
        this._certificateManagerDriver = certificateManagerDriver;
    }

    async registerCompanyCertificate(issuer: string, company: string, assessmentStandard: string, documentId: number, issueDate: Date, validFrom: Date, validUntil: Date): Promise<void> {
        return this._certificateManagerDriver.registerCompanyCertificate(issuer, company, assessmentStandard, documentId, issueDate, validFrom, validUntil);
    }

    async registerScopeCertificate(issuer: string, company: string, assessmentStandard: string, documentId: number, issueDate: Date, validFrom: Date, validUntil: Date, processTypes: string[]): Promise<void> {
        return this._certificateManagerDriver.registerScopeCertificate(issuer, company, assessmentStandard, documentId, issueDate, validFrom, validUntil, processTypes);
    }

    async registerMaterialCertificate(issuer: string, assessmentStandard: string, documentId: number, issueDate: Date, tradeId: number, lineId: number): Promise<void> {
        return this._certificateManagerDriver.registerMaterialCertificate(issuer, assessmentStandard, documentId, issueDate, tradeId, lineId);
    }

    async getCompanyCertificates(company: string): Promise<CompanyCertificate[]> {
        return this._certificateManagerDriver.getCompanyCertificates(company);
    }

    async getScopeCertificates(company: string, processType: string): Promise<ScopeCertificate[]> {
        return this._certificateManagerDriver.getScopeCertificates(company, processType);
    }

    async getMaterialCertificates(tradeId: number, tradeLineId: number): Promise<MaterialCertificate[]> {
        return this._certificateManagerDriver.getMaterialCertificates(tradeId, tradeLineId);
    }
}
