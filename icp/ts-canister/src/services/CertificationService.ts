import { StableBTreeMap } from 'azle';
import { StableMemoryId } from '../utils/stableMemory';
import {
    validateAddress,
    validateAssessmentAssuranceLevel,
    validateAssessmentStandard,
    validateDatesValidity,
    validateFieldValue,
    validateProcessTypes
} from '../utils/validation';
import {
    CertificateDocumentInfo,
    CertificateType,
    CompanyCertificate,
    MaterialCertificate,
    ScopeCertificate,
    RoleProof,
    BaseCertificate,
    CertificateTypeEnum,
    EvaluationStatus,
    EvaluationStatusEnum
} from '../models/types';

type CertificationRecord = {
    subject: string;
    certType: CertificateType;
};

class CertificationService {
    private static _instance: CertificationService;

    private _allCertificateRecords = StableBTreeMap<bigint, CertificationRecord>(StableMemoryId.ALL_CERTIFICATE_RECORDS);

    private _companyCertificates = StableBTreeMap<string, CompanyCertificate[]>(StableMemoryId.COMPANY_CERTIFICATES);

    private _scopeCertificates = StableBTreeMap<string, ScopeCertificate[]>(StableMemoryId.SCOPE_CERTIFICATES);

    private _materialCertificates = StableBTreeMap<string, MaterialCertificate[]>(StableMemoryId.MATERIAL_CERTIFICATES);

    static get instance() {
        if (!CertificationService._instance) {
            CertificationService._instance = new CertificationService();
        }
        return CertificationService._instance;
    }

    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocumentInfo,
        validFrom: number,
        validUntil: number
    ): Promise<CompanyCertificate> {
        validateAddress('Issuer', issuer);
        validateAddress('Subject', subject);
        validateDatesValidity(validFrom, validUntil);
        await validateAssessmentStandard(assessmentStandard);
        await validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        const companyAddress = roleProof.membershipProof.delegatorAddress;

        const certificate: CompanyCertificate = {
            id: BigInt(this._allCertificateRecords.keys().length + 1),
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate: BigInt(Date.now()),
            validFrom: BigInt(validFrom),
            validUntil: BigInt(validUntil),
            certType: { COMPANY: null }
        };
        if (!this._companyCertificates.containsKey(subject)) this._companyCertificates.insert(subject, [certificate]);
        else this._companyCertificates.insert(subject, [...this._companyCertificates.get(subject)!, certificate]);
        this._allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocumentInfo,
        validFrom: number,
        validUntil: number,
        processTypes: string[]
    ): Promise<ScopeCertificate> {
        validateAddress('Issuer', issuer);
        validateAddress('Subject', subject);
        validateDatesValidity(validFrom, validUntil);
        await validateAssessmentStandard(assessmentStandard);
        await validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        await validateProcessTypes(processTypes);
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        const certificate: ScopeCertificate = {
            id: BigInt(BigInt(this._allCertificateRecords.keys().length + 1)),
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate: BigInt(Date.now()),
            validFrom: BigInt(validFrom),
            validUntil: BigInt(validUntil),
            processTypes,
            certType: { SCOPE: null }
        };
        if (!this._scopeCertificates.containsKey(subject)) this._scopeCertificates.insert(subject, [certificate]);
        else this._scopeCertificates.insert(subject, [...this._scopeCertificates.get(subject)!, certificate]);
        this._allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocumentInfo,
        materialId: bigint
    ): Promise<MaterialCertificate> {
        validateAddress('Issuer', issuer);
        validateAddress('Subject', subject);
        await validateAssessmentStandard(assessmentStandard);
        await validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        const certificate: MaterialCertificate = {
            id: BigInt(BigInt(this._allCertificateRecords.keys().length + 1)),
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate: BigInt(Date.now()),
            materialId,
            certType: { MATERIAL: null }
        };
        if (!this._materialCertificates.containsKey(subject)) this._materialCertificates.insert(subject, [certificate]);
        else this._materialCertificates.insert(subject, [...this._materialCertificates.get(subject)!, certificate]);
        this._allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    async getBaseCertificatesInfoBySubject(roleProof: RoleProof, subject: string): Promise<BaseCertificate[]> {
        validateAddress('Subject', subject);
        const _companyCertificates = this._companyCertificates.get(subject) || [];
        const _scopeCertificates = this._scopeCertificates.get(subject) || [];
        const _materialCertificates = this._materialCertificates.get(subject) || [];
        const allCertificates = [..._companyCertificates, ..._scopeCertificates, ..._materialCertificates];
        return allCertificates.map((certificate) => ({
            id: certificate.id,
            uploadedBy: certificate.uploadedBy,
            issuer: certificate.issuer,
            subject: certificate.subject,
            assessmentStandard: certificate.assessmentStandard,
            assessmentAssuranceLevel: certificate.assessmentAssuranceLevel,
            referenceId: certificate.referenceId,
            document: certificate.document,
            evaluationStatus: certificate.evaluationStatus,
            issueDate: certificate.issueDate,
            certType: certificate.certType
        }));
    }

    async getCompanyCertificates(roleProof: RoleProof, subject: string): Promise<CompanyCertificate[]> {
        return this._companyCertificates.get(subject) || [];
    }

    async getScopeCertificates(roleProof: RoleProof, subject: string): Promise<ScopeCertificate[]> {
        return this._scopeCertificates.get(subject) || [];
    }

    async getMaterialCertificates(roleProof: RoleProof, subject: string): Promise<MaterialCertificate[]> {
        return this._materialCertificates.get(subject) || [];
    }

    async getCompanyCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<CompanyCertificate> {
        const certificate = this._companyCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new Error('Company certificate not found');
        return certificate;
    }

    async getScopeCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<ScopeCertificate> {
        const certificate = this._scopeCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new Error('Scope certificate not found');
        return certificate;
    }

    async getMaterialCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<MaterialCertificate> {
        const certificate = this._materialCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new Error('Material certificate not found');
        return certificate;
    }

    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        validFrom: number,
        validUntil: number
    ): Promise<CompanyCertificate> {
        validateDatesValidity(validFrom, validUntil);
        await validateAssessmentStandard(assessmentStandard);
        await validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        const [companyCertificate, _companyCertificates, certificateIndex] = this._getCertificateByIdAndInfo<CompanyCertificate>(certificateId);
        validateFieldValue(companyCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        companyCertificate.assessmentStandard = assessmentStandard;
        companyCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        companyCertificate.referenceId = referenceId;
        companyCertificate.validFrom = BigInt(validFrom);
        companyCertificate.validUntil = BigInt(validUntil);

        _companyCertificates[certificateIndex] = companyCertificate;
        this._companyCertificates.insert(companyCertificate.subject, _companyCertificates);
        return companyCertificate;
    }

    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        validFrom: number,
        validUntil: number,
        processTypes: string[]
    ): Promise<ScopeCertificate> {
        validateDatesValidity(validFrom, validUntil);
        await validateAssessmentStandard(assessmentStandard);
        await validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        await validateProcessTypes(processTypes);
        const [scopeCertificate, _scopeCertificates, certificateIndex] = this._getCertificateByIdAndInfo<ScopeCertificate>(certificateId);
        validateFieldValue(scopeCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        scopeCertificate.assessmentStandard = assessmentStandard;
        scopeCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        scopeCertificate.referenceId = referenceId;
        scopeCertificate.validFrom = BigInt(validFrom);
        scopeCertificate.validUntil = BigInt(validUntil);
        scopeCertificate.processTypes = processTypes;

        _scopeCertificates[certificateIndex] = scopeCertificate;
        this._scopeCertificates.insert(scopeCertificate.subject, _scopeCertificates);
        return scopeCertificate;
    }

    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: bigint,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        materialId: bigint
    ): Promise<MaterialCertificate> {
        await validateAssessmentStandard(assessmentStandard);
        await validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        const [materialCertificate, _materialCertificates, certificateIndex] = this._getCertificateByIdAndInfo<MaterialCertificate>(certificateId);
        validateFieldValue(materialCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        materialCertificate.assessmentStandard = assessmentStandard;
        materialCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        materialCertificate.referenceId = referenceId;
        materialCertificate.materialId = materialId;

        _materialCertificates[certificateIndex] = materialCertificate;
        this._materialCertificates.insert(materialCertificate.subject, _materialCertificates);
        return materialCertificate;
    }

    async updateDocument(roleProof: RoleProof, certificateId: bigint, document: CertificateDocumentInfo): Promise<void> {
        const [certificate, certificates, certificateIndex] = this._getCertificateByIdAndInfo<BaseCertificate>(certificateId);
        certificate.document = document;
        this._updateCertificate(certificate, certificates, certificateIndex);
    }

    async evaluateDocument(roleProof: RoleProof, certificateId: bigint, documentId: bigint, evaluation: EvaluationStatus): Promise<void> {
        if (EvaluationStatusEnum.NOT_EVALUATED in evaluation) throw new Error('Invalid evaluation status');
        const [certificate, certificates, certificateIndex] = this._getCertificateByIdAndInfo<BaseCertificate>(certificateId);
        validateFieldValue(certificate.document.id, documentId, 'Document not found');
        certificate.evaluationStatus = evaluation;
        this._updateCertificate(certificate, certificates, certificateIndex);
    }

    private _getCertificateByIdAndInfo<T extends BaseCertificate>(certificateId: bigint): [T, T[], number] {
        const certificateRecord = this._allCertificateRecords.get(certificateId);
        if (!certificateRecord) throw new Error('Certificate not found');
        let certificates: T[] | null;

        if (CertificateTypeEnum.COMPANY in certificateRecord.certType) {
            certificates = this._companyCertificates.get(certificateRecord.subject) as unknown as T[];
        } else if (CertificateTypeEnum.SCOPE in certificateRecord.certType) {
            certificates = this._scopeCertificates.get(certificateRecord.subject) as unknown as T[];
        } else if (CertificateTypeEnum.MATERIAL in certificateRecord.certType) {
            certificates = this._materialCertificates.get(certificateRecord.subject) as unknown as T[];
        } else {
            throw new Error('Invalid certificate type');
        }

        const index = certificates.findIndex((cert) => cert.id === certificateId);
        const certificate = index !== -1 ? certificates[index] : undefined;
        if (!certificate) throw new Error('The provided certificate ID does not match the certificate type');

        return [certificate, certificates, index];
    }

    private _updateCertificate<T extends BaseCertificate>(certificate: T, certificates: T[], index: number): void {
        certificates[index] = certificate;
        if (CertificateTypeEnum.COMPANY in certificate.certType) {
            this._companyCertificates.insert(certificate.subject, certificates as unknown as CompanyCertificate[]);
        } else if (CertificateTypeEnum.SCOPE in certificate.certType) {
            this._scopeCertificates.insert(certificate.subject, certificates as unknown as ScopeCertificate[]);
        } else if (CertificateTypeEnum.MATERIAL in certificate.certType) {
            this._materialCertificates.insert(certificate.subject, certificates as unknown as MaterialCertificate[]);
        }
    }
}

export default CertificationService;
