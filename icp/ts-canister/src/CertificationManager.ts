import { IDL, init, StableBTreeMap, update } from 'azle';
import { Address } from './models/Address';
import { BaseCertificate, CompanyCertificate, DocumentInfo, MaterialCertificate, ScopeCertificate } from './models/Certificate';
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

class CertificationManager {
    allCertificates = StableBTreeMap<bigint, BaseCertificate>(0);

    companyCertificates = StableBTreeMap<Address, CompanyCertificate[]>(1);

    scopeCertificates = StableBTreeMap<Address, ScopeCertificate[]>(2);

    materialCertificates = StableBTreeMap<Address, MaterialCertificate[]>(3);

    counter = 0;

    @init([])
    async init(): Promise<void> {
        this.counter = this.allCertificates.keys().length;
    }

    @update([RoleProof, Address, Address, IDL.Text, IDL.Text, IDL.Text, DocumentInfo, IDL.Nat, IDL.Nat], CompanyCertificate)
    @OnlyEditor
    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: Address,
        subject: Address,
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
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
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
        this.allCertificates.insert(BigInt(certificate.id), certificate);
        return certificate;
    }

    @update([RoleProof, Address, Address, IDL.Text, IDL.Text, IDL.Text, DocumentInfo, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text)], ScopeCertificate)
    @OnlyEditor
    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: Address,
        subject: Address,
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
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
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
        this.allCertificates.insert(BigInt(certificate.id), certificate);
        return certificate;
    }

    @update([RoleProof, Address, Address, IDL.Text, IDL.Text, IDL.Text, DocumentInfo, IDL.Nat], MaterialCertificate)
    @OnlyEditor
    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: Address,
        subject: Address,
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
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
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
        this.allCertificates.insert(BigInt(certificate.id), certificate);
        return certificate;
    }

    @update([RoleProof, Address], IDL.Vec(BaseCertificate))
    @OnlyViewer
    async getBaseCertificatesInfoBySubject(roleProof: RoleProof, subject: Address): Promise<BaseCertificate[]> {
        validateAddress('Subject', subject);
        const certificates = this.companyCertificates.get(subject) || [];
        const scopeCertificates = this.scopeCertificates.get(subject) || [];
        const materialCertificates = this.materialCertificates.get(subject) || [];
        const allCertificates = [...certificates, ...scopeCertificates, ...materialCertificates];
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

    @update([RoleProof, Address], IDL.Vec(CompanyCertificate))
    @OnlyViewer
    async getCompanyCertificates(roleProof: RoleProof, subject: Address): Promise<CompanyCertificate[]> {
        return this.companyCertificates.get(subject) || [];
    }

    @update([RoleProof, Address], IDL.Vec(ScopeCertificate))
    @OnlyViewer
    async getScopeCertificates(roleProof: RoleProof, subject: Address): Promise<ScopeCertificate[]> {
        return this.scopeCertificates.get(subject) || [];
    }

    @update([RoleProof, Address], IDL.Vec(MaterialCertificate))
    @OnlyViewer
    async getMaterialCertificates(roleProof: RoleProof, subject: Address): Promise<MaterialCertificate[]> {
        return this.materialCertificates.get(subject) || [];
    }

    @update([RoleProof, Address, IDL.Nat], CompanyCertificate)
    @OnlyViewer
    async getCompanyCertificate(roleProof: RoleProof, subject: Address, id: bigint): Promise<CompanyCertificate> {
        const certificate = this.companyCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new Error('Company certificate not found');
        return certificate;
    }

    @update([RoleProof, Address, IDL.Nat], ScopeCertificate)
    @OnlyViewer
    async getScopeCertificate(roleProof: RoleProof, subject: Address, id: bigint): Promise<ScopeCertificate> {
        const certificate = this.scopeCertificates.get(subject)?.find((cert) => BigInt(cert.id) === id);
        if (!certificate) throw new Error('Scope certificate not found');
        return certificate;
    }

    @update([RoleProof, Address, IDL.Nat], MaterialCertificate)
    @OnlyViewer
    async getMaterialCertificate(roleProof: RoleProof, subject: Address, id: bigint): Promise<MaterialCertificate> {
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
        const certificate = this.allCertificates.get(certificateId);
        if (!certificate || JSON.stringify(certificate.certType) !== JSON.stringify({ COMPANY: null }))
            throw new Error('Company certificate not found');
        const companyCertificate = certificate as CompanyCertificate;
        validateFieldValue(companyCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        companyCertificate.assessmentStandard = assessmentStandard;
        companyCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        companyCertificate.referenceId = referenceId;
        companyCertificate.validFrom = BigInt(validFrom);
        companyCertificate.validUntil = BigInt(validUntil);
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
        const certificate = this.allCertificates.get(certificateId);
        if (!certificate || JSON.stringify(certificate.certType) !== JSON.stringify({ SCOPE: null })) throw new Error('Scope certificate not found');
        const scopeCertificate = certificate as ScopeCertificate;
        validateFieldValue(scopeCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        scopeCertificate.assessmentStandard = assessmentStandard;
        scopeCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        scopeCertificate.referenceId = referenceId;
        scopeCertificate.validFrom = BigInt(validFrom);
        scopeCertificate.validUntil = BigInt(validUntil);
        scopeCertificate.processTypes = processTypes;
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
        const certificate = this.allCertificates.get(certificateId);
        if (!certificate || JSON.stringify(certificate.certType) !== JSON.stringify({ MATERIAL: null }))
            throw new Error('Material certificate not found');
        const materialCertificate = certificate as MaterialCertificate;
        validateFieldValue(materialCertificate.uploadedBy, roleProof.membershipProof.delegatorAddress, 'Caller is not the owner of the certificate');
        materialCertificate.assessmentStandard = assessmentStandard;
        materialCertificate.assessmentAssuranceLevel = assessmentAssuranceLevel;
        materialCertificate.referenceId = referenceId;
        materialCertificate.materialId = materialId;
        return materialCertificate;
    }
    //
    // @update([RoleProof, Address, IDL.Nat])
    // @OnlyEditor
    // async evaluateDocument(certificateId: bigint, documentId: bigint, evaluation: DocumentEvaluationStatus): Promise<void> {
    //     // TODO: check if evaluation is valid
    //     const certificate = this.allCertificates.get(certificateId);
    //     if (!certificate) throw new Error('Certificate not found');
    //     validateFieldValue(certificate.document.id, documentId, 'Document not found');
    //     // TODO: check if document is already evaluated
    //     certificate.evaluationStatus = evaluation;
    // }
}

export default CertificationManager;
