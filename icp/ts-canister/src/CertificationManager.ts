import { IDL, init, StableBTreeMap, update } from 'azle';
import {
    BaseCertificate,
    CertificateType,
    CertificateTypeEnum,
    CompanyCertificate,
    DocumentEvaluationStatus,
    DocumentInfo,
    MaterialCertificate,
    ScopeCertificate
} from './models/Certificate';
import { OnlyEditor, OnlyViewer } from './decorators/roles';
import { RoleProof } from './models/Proof';
import {
    validateAddress,
    validateAssessmentStandard,
    validateAssessmentAssuranceLevel,
    validateDatesValidity,
    validateFieldValue,
    validateProcessTypes
} from './utils/validation';

type CertificationRecord = {
    subject: string;
    certType: CertificateType;
};
const CertificationRecord = IDL.Record({
    subject: IDL.Text,
    certType: CertificateType
});

class CertificationManager {
    allCertificateRecords = StableBTreeMap<bigint, CertificationRecord>(0);

    companyCertificates = StableBTreeMap<string, CompanyCertificate[]>(1);

    scopeCertificates = StableBTreeMap<string, ScopeCertificate[]>(2);

    materialCertificates = StableBTreeMap<string, MaterialCertificate[]>(3);

    counter = 0;

    @init([])
    async init(): Promise<void> {
        this.counter = this.allCertificateRecords.keys().length;
    }

    @update([RoleProof, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, DocumentInfo, IDL.Nat, IDL.Nat], CompanyCertificate)
    @OnlyEditor
    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: DocumentInfo,
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
            id: BigInt(this.counter++),
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
        if (!this.companyCertificates.containsKey(subject)) this.companyCertificates.insert(subject, [certificate]);
        else this.companyCertificates.get(subject)!.push(certificate);
        this.allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    @update([RoleProof, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, DocumentInfo, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text)], ScopeCertificate)
    @OnlyEditor
    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: DocumentInfo,
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
            id: BigInt(this.counter++),
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
        if (!this.scopeCertificates.containsKey(subject)) this.scopeCertificates.insert(subject, [certificate]);
        else this.scopeCertificates.get(subject)!.push(certificate);
        this.allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    @update([RoleProof, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, DocumentInfo, IDL.Nat], MaterialCertificate)
    @OnlyEditor
    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: DocumentInfo,
        materialId: bigint
    ): Promise<MaterialCertificate> {
        validateAddress('Issuer', issuer);
        validateAddress('Subject', subject);
        await validateAssessmentStandard(assessmentStandard);
        await validateAssessmentAssuranceLevel(assessmentAssuranceLevel);
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        const certificate: MaterialCertificate = {
            id: BigInt(this.counter++),
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
        if (!this.materialCertificates.containsKey(subject)) this.materialCertificates.insert(subject, [certificate]);
        else this.materialCertificates.get(subject)!.push(certificate);
        this.allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }

    @update([RoleProof, IDL.Text], IDL.Vec(BaseCertificate))
    @OnlyViewer
    async getBaseCertificatesInfoBySubject(roleProof: RoleProof, subject: string): Promise<BaseCertificate[]> {
        validateAddress('Subject', subject);
        const companyCertificates = this.companyCertificates.get(subject) || [];
        const scopeCertificates = this.scopeCertificates.get(subject) || [];
        const materialCertificates = this.materialCertificates.get(subject) || [];
        const allCertificates = [...companyCertificates, ...scopeCertificates, ...materialCertificates];
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

    @update([RoleProof, IDL.Text], IDL.Vec(CompanyCertificate))
    @OnlyViewer
    async getCompanyCertificates(roleProof: RoleProof, subject: string): Promise<CompanyCertificate[]> {
        return this.companyCertificates.get(subject) || [];
    }

    @update([RoleProof, IDL.Text], IDL.Vec(ScopeCertificate))
    @OnlyViewer
    async getScopeCertificates(roleProof: RoleProof, subject: string): Promise<ScopeCertificate[]> {
        return this.scopeCertificates.get(subject) || [];
    }

    @update([RoleProof, IDL.Text], IDL.Vec(MaterialCertificate))
    @OnlyViewer
    async getMaterialCertificates(roleProof: RoleProof, subject: string): Promise<MaterialCertificate[]> {
        return this.materialCertificates.get(subject) || [];
    }

    @update([RoleProof, IDL.Text, IDL.Nat], CompanyCertificate)
    @OnlyViewer
    async getCompanyCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<CompanyCertificate> {
        const certificate = this.companyCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new Error('Company certificate not found');
        return certificate;
    }

    @update([RoleProof, IDL.Text, IDL.Nat], ScopeCertificate)
    @OnlyViewer
    async getScopeCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<ScopeCertificate> {
        const certificate = this.scopeCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new Error('Scope certificate not found');
        return certificate;
    }

    @update([RoleProof, IDL.Text, IDL.Nat], MaterialCertificate)
    @OnlyViewer
    async getMaterialCertificate(roleProof: RoleProof, subject: string, id: bigint): Promise<MaterialCertificate> {
        const certificate = this.materialCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new Error('Material certificate not found');
        return certificate;
    }

    @update([RoleProof, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat], CompanyCertificate)
    @OnlyEditor
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
        const [companyCertificate, companyCertificates, certificateIndex] = this._getCertificateInfoById<CompanyCertificate>(certificateId);
        validateFieldValue(companyCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        companyCertificate.assessmentStandard = assessmentStandard;
        companyCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        companyCertificate.referenceId = referenceId;
        companyCertificate.validFrom = BigInt(validFrom);
        companyCertificate.validUntil = BigInt(validUntil);

        companyCertificates[certificateIndex] = companyCertificate;
        this.companyCertificates.insert(companyCertificate.subject, companyCertificates);
        return companyCertificate;
    }

    @update([RoleProof, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text)], ScopeCertificate)
    @OnlyEditor
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
        const [scopeCertificate, scopeCertificates, certificateIndex] = this._getCertificateInfoById<ScopeCertificate>(certificateId);
        validateFieldValue(scopeCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        scopeCertificate.assessmentStandard = assessmentStandard;
        scopeCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        scopeCertificate.referenceId = referenceId;
        scopeCertificate.validFrom = BigInt(validFrom);
        scopeCertificate.validUntil = BigInt(validUntil);
        scopeCertificate.processTypes = processTypes;

        scopeCertificates[certificateIndex] = scopeCertificate;
        this.scopeCertificates.insert(scopeCertificate.subject, scopeCertificates);
        return scopeCertificate;
    }

    @update([RoleProof, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], MaterialCertificate)
    @OnlyEditor
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
        const [materialCertificate, materialCertificates, certificateIndex] = this._getCertificateInfoById<MaterialCertificate>(certificateId);
        validateFieldValue(materialCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        materialCertificate.assessmentStandard = assessmentStandard;
        materialCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        materialCertificate.referenceId = referenceId;
        materialCertificate.materialId = materialId;

        materialCertificates[certificateIndex] = materialCertificate;
        this.materialCertificates.insert(materialCertificate.subject, materialCertificates);
        return materialCertificate;
    }

    @update([RoleProof, IDL.Nat, DocumentInfo])
    @OnlyEditor
    async updateDocument(roleProof: RoleProof, certificateId: bigint, document: DocumentInfo): Promise<void> {
        const [certificate, certificates, certificateIndex] = this._getCertificateInfoById<BaseCertificate>(certificateId);
        certificate.document = document;
        this._updateCertificate(certificate, certificates, certificateIndex);
    }

    @update([RoleProof, IDL.Nat, IDL.Nat, DocumentEvaluationStatus])
    @OnlyEditor
    async evaluateDocument(roleProof: RoleProof, certificateId: bigint, documentId: bigint, evaluation: DocumentEvaluationStatus): Promise<void> {
        if ('NOT_EVALUATED' in evaluation) throw new Error('Invalid evaluation status');
        const [certificate, certificates, certificateIndex] = this._getCertificateInfoById<BaseCertificate>(certificateId);
        validateFieldValue(certificate.document.id, documentId, 'Document not found');
        certificate.evaluationStatus = evaluation;
        this._updateCertificate(certificate, certificates, certificateIndex);
    }

    _getCertificateInfoById<T extends BaseCertificate>(certificateId: bigint): [T, T[], number] {
        const certificateRecord = this.allCertificateRecords.get(certificateId);
        if (!certificateRecord) throw new Error('Certificate not found');
        let certificates: T[] | null;

        if (CertificateTypeEnum.COMPANY in certificateRecord.certType) {
            certificates = this.companyCertificates.get(certificateRecord.subject) as unknown as T[];
        } else if (CertificateTypeEnum.SCOPE in certificateRecord.certType) {
            certificates = this.scopeCertificates.get(certificateRecord.subject) as unknown as T[];
        } else if (CertificateTypeEnum.MATERIAL in certificateRecord.certType) {
            certificates = this.materialCertificates.get(certificateRecord.subject) as unknown as T[];
        } else {
            throw new Error('Invalid certificate type');
        }

        const index = certificates.findIndex((cert) => cert.id === certificateId);
        const certificate = index !== -1 ? certificates[index] : undefined;
        if (!certificate) throw new Error('The provided certificate ID does not match the certificate type');

        return [certificate, certificates, index];
    }

    _updateCertificate<T extends BaseCertificate>(certificate: T, certificates: T[], index: number): void {
        certificates[index] = certificate;
        if (CertificateTypeEnum.COMPANY in certificate.certType) {
            this.companyCertificates.insert(certificate.subject, certificates as unknown as CompanyCertificate[]);
        } else if (CertificateTypeEnum.SCOPE in certificate.certType) {
            this.scopeCertificates.insert(certificate.subject, certificates as unknown as ScopeCertificate[]);
        } else if (CertificateTypeEnum.MATERIAL in certificate.certType) {
            this.materialCertificates.insert(certificate.subject, certificates as unknown as MaterialCertificate[]);
        }
    }
}

export default CertificationManager;
