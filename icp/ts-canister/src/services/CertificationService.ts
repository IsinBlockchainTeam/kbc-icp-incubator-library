import { IDL, StableBTreeMap } from 'azle';
import { CertificateType, CompanyCertificate, DocumentInfo, MaterialCertificate, ScopeCertificate } from '../models/Certificate';
import { StableMemoryId } from '../utils/stableMemory';
import { RoleProof } from '../models/Proof';
import { validateAddress, validateAssessmentAssuranceLevel, validateAssessmentStandard, validateDatesValidity } from '../utils/validation';

type CertificationRecord = {
    subject: string;
    certType: CertificateType;
};
const CertificationRecord = IDL.Record({
    subject: IDL.Text,
    certType: CertificateType
});

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
        else this._companyCertificates.get(subject)!.push(certificate);
        this._allCertificateRecords.insert(BigInt(certificate.id), { subject, certType: certificate.certType });
        return certificate;
    }
}

export default CertificationService;
