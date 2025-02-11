import { StableBTreeMap } from 'azle';
import { StableMemoryId } from '../utils/stableMemory';
import {
    validateAddress,
    validateAssessmentAssuranceLevel,
    validateDatesValidity,
    validateFieldValue,
    validateMaterialById,
    validateProcessTypes
} from '../utils/validation';
import {
    BaseCertificate,
    CertificateDocumentInfo,
    CertificateType,
    CertificateTypeEnum,
    CompanyCertificate,
    EvaluationStatus,
    EvaluationStatusEnum,
    MaterialCertificate,
    ScopeCertificate
} from '../models/types';
import AuthenticationService from './AuthenticationService';
import {
    CertificateNotFoundError,
    CertificateTypeMismatchError,
    EvaluationStatusError,
    InvalidCertificateTypeError
} from '../models/errors/CertificationError';
import AssessmentReferenceStandardService from './AssessmentReferenceStandardService';

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

    registerCompanyCertificate(
        issuer: string,
        subject: string,
        assessmentReferenceStandardId: bigint,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        validFrom: bigint,
        validUntil: bigint,
        notes: string
    ): CompanyCertificate {
        validateAddress('Subject', subject);
        validateDatesValidity(Number(validFrom), Number(validUntil));
        validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        const companyAddress = AuthenticationService.instance.getDelegatorAddress();

        const certificate: CompanyCertificate = {
            id: BigInt(this._allCertificateRecords.keys().length + 1),
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentReferenceStandard: AssessmentReferenceStandardService.instance.getById(assessmentReferenceStandardId),
            assessmentAssuranceLevel,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate: BigInt(Date.now()),
            validFrom: BigInt(validFrom),
            validUntil: BigInt(validUntil),
            certType: { COMPANY: null },
            notes
        };
        if (!this._companyCertificates.containsKey(subject)) this._companyCertificates.insert(subject, [certificate]);
        else this._companyCertificates.insert(subject, [...this._companyCertificates.get(subject)!, certificate]);
        this._allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    registerScopeCertificate(
        issuer: string,
        subject: string,
        assessmentReferenceStandardId: bigint,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        validFrom: bigint,
        validUntil: bigint,
        processTypes: string[],
        notes: string
    ): ScopeCertificate {
        validateAddress('Subject', subject);
        validateDatesValidity(Number(validFrom), Number(validUntil));
        validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        validateProcessTypes(processTypes);
        const companyAddress = AuthenticationService.instance.getDelegatorAddress();
        const certificate: ScopeCertificate = {
            id: BigInt(this._allCertificateRecords.keys().length + 1),
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentReferenceStandard: AssessmentReferenceStandardService.instance.getById(assessmentReferenceStandardId),
            assessmentAssuranceLevel,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate: BigInt(Date.now()),
            validFrom: BigInt(validFrom),
            validUntil: BigInt(validUntil),
            processTypes,
            certType: { SCOPE: null },
            notes
        };
        if (!this._scopeCertificates.containsKey(subject)) this._scopeCertificates.insert(subject, [certificate]);
        else this._scopeCertificates.insert(subject, [...this._scopeCertificates.get(subject)!, certificate]);
        this._allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    registerMaterialCertificate(
        issuer: string,
        subject: string,
        assessmentReferenceStandardId: bigint,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        materialId: bigint,
        notes: string
    ): MaterialCertificate {
        validateAddress('Subject', subject);
        validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        validateMaterialById(materialId);
        const companyAddress = AuthenticationService.instance.getDelegatorAddress();
        const certificate: MaterialCertificate = {
            id: BigInt(this._allCertificateRecords.keys().length + 1),
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentReferenceStandard: AssessmentReferenceStandardService.instance.getById(assessmentReferenceStandardId),
            assessmentAssuranceLevel,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate: BigInt(Date.now()),
            materialId,
            certType: { MATERIAL: null },
            notes
        };
        if (!this._materialCertificates.containsKey(subject)) this._materialCertificates.insert(subject, [certificate]);
        else this._materialCertificates.insert(subject, [...this._materialCertificates.get(subject)!, certificate]);
        this._allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    getBaseCertificatesInfoBySubject(subject: string): BaseCertificate[] {
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
            assessmentReferenceStandard: certificate.assessmentReferenceStandard,
            assessmentAssuranceLevel: certificate.assessmentAssuranceLevel,
            document: certificate.document,
            evaluationStatus: certificate.evaluationStatus,
            issueDate: certificate.issueDate,
            certType: certificate.certType,
            notes: certificate.notes
        }));
    }

    getBaseCertificateById(certificateId: bigint): BaseCertificate {
        const [certificate] = this._getCertificateAndInfoById<BaseCertificate>(certificateId);
        return certificate;
    }

    getCompanyCertificates(subject: string): CompanyCertificate[] {
        return this._companyCertificates.get(subject) || [];
    }

    getScopeCertificates(subject: string): ScopeCertificate[] {
        return this._scopeCertificates.get(subject) || [];
    }

    getMaterialCertificates(subject: string): MaterialCertificate[] {
        return this._materialCertificates.get(subject) || [];
    }

    getCompanyCertificate(subject: string, id: bigint): CompanyCertificate {
        const certificate = this._companyCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new CertificateNotFoundError(CertificateTypeEnum.COMPANY);
        return certificate;
    }

    getScopeCertificate(subject: string, id: bigint): ScopeCertificate {
        const certificate = this._scopeCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new CertificateNotFoundError(CertificateTypeEnum.SCOPE);
        return certificate;
    }

    getMaterialCertificate(subject: string, id: bigint): MaterialCertificate {
        const certificate = this._materialCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new CertificateNotFoundError(CertificateTypeEnum.MATERIAL);
        return certificate;
    }

    updateCompanyCertificate(
        certificateId: bigint,
        assessmentReferenceStandardId: bigint,
        assessmentAssuranceLevel: string,
        validFrom: bigint,
        validUntil: bigint,
        notes: string
    ): CompanyCertificate {
        validateDatesValidity(Number(validFrom), Number(validUntil));
        validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        const [companyCertificate, companyCertificates, certificateIndex] = this._getCertificateAndInfoById<CompanyCertificate>(certificateId);
        validateFieldValue(
            companyCertificate.uploadedBy,
            AuthenticationService.instance.getDelegatorAddress(),
            'Caller is not the owner of the certificate'
        );
        companyCertificate.assessmentReferenceStandard = AssessmentReferenceStandardService.instance.getById(assessmentReferenceStandardId);
        companyCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        companyCertificate.validFrom = BigInt(validFrom);
        companyCertificate.validUntil = BigInt(validUntil);
        companyCertificate.notes = notes;

        this._updateCertificate(companyCertificate, companyCertificates, certificateIndex);
        return companyCertificate;
    }

    updateScopeCertificate(
        certificateId: bigint,
        assessmentReferenceStandardId: bigint,
        assessmentAssuranceLevel: string,
        validFrom: bigint,
        validUntil: bigint,
        processTypes: string[],
        notes: string
    ): ScopeCertificate {
        validateDatesValidity(Number(validFrom), Number(validUntil));
        validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        validateProcessTypes(processTypes);
        const [scopeCertificate, scopeCertificates, certificateIndex] = this._getCertificateAndInfoById<ScopeCertificate>(certificateId);
        validateFieldValue(
            scopeCertificate.uploadedBy,
            AuthenticationService.instance.getDelegatorAddress(),
            'Caller is not the owner of the certificate'
        );
        scopeCertificate.assessmentReferenceStandard = AssessmentReferenceStandardService.instance.getById(assessmentReferenceStandardId);
        scopeCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        scopeCertificate.validFrom = BigInt(validFrom);
        scopeCertificate.validUntil = BigInt(validUntil);
        scopeCertificate.processTypes = processTypes;
        scopeCertificate.notes = notes;

        this._updateCertificate(scopeCertificate, scopeCertificates, certificateIndex);
        return scopeCertificate;
    }

    updateMaterialCertificate(
        certificateId: bigint,
        assessmentReferenceStandardId: bigint,
        assessmentAssuranceLevel: string,
        materialId: bigint,
        notes: string
    ): MaterialCertificate {
        validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        const [materialCertificate, materialCertificates, certificateIndex] = this._getCertificateAndInfoById<MaterialCertificate>(certificateId);
        validateFieldValue(
            materialCertificate.uploadedBy,
            AuthenticationService.instance.getDelegatorAddress(),
            'Caller is not the owner of the certificate'
        );
        validateMaterialById(materialId);
        materialCertificate.assessmentReferenceStandard = AssessmentReferenceStandardService.instance.getById(assessmentReferenceStandardId);
        materialCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        materialCertificate.materialId = materialId;
        materialCertificate.notes = notes;

        this._updateCertificate(materialCertificate, materialCertificates, certificateIndex);
        return materialCertificate;
    }

    updateDocument(certificateId: bigint, document: CertificateDocumentInfo): BaseCertificate {
        const [certificate, certificates, certificateIndex] = this._getCertificateAndInfoById<BaseCertificate>(certificateId);
        certificate.document = document;
        this._updateCertificate(certificate, certificates, certificateIndex);
        return certificate;
    }

    evaluateDocument(certificateId: bigint, evaluation: EvaluationStatus): BaseCertificate {
        if (EvaluationStatusEnum.NOT_EVALUATED in evaluation) throw new EvaluationStatusError();
        const [certificate, certificates, certificateIndex] = this._getCertificateAndInfoById<BaseCertificate>(certificateId);
        certificate.evaluationStatus = evaluation;
        this._updateCertificate(certificate, certificates, certificateIndex);
        return certificate;
    }

    private _getCertificateAndInfoById<T extends BaseCertificate>(certificateId: bigint): [T, T[], number] {
        const certificateRecord = this._allCertificateRecords.get(certificateId);
        if (!certificateRecord) throw new CertificateNotFoundError();
        let certificates: T[] | null;

        if (CertificateTypeEnum.COMPANY in certificateRecord.certType) {
            certificates = this._companyCertificates.get(certificateRecord.subject) as unknown as T[];
        } else if (CertificateTypeEnum.SCOPE in certificateRecord.certType) {
            certificates = this._scopeCertificates.get(certificateRecord.subject) as unknown as T[];
        } else if (CertificateTypeEnum.MATERIAL in certificateRecord.certType) {
            certificates = this._materialCertificates.get(certificateRecord.subject) as unknown as T[];
        } else {
            throw new InvalidCertificateTypeError();
        }

        const index = certificates.findIndex((cert) => cert.id === certificateId);
        const certificate = index !== -1 ? certificates[index] : undefined;
        if (!certificate) throw new CertificateTypeMismatchError();

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
