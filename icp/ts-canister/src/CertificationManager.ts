import { IDL, query, StableBTreeMap, update } from 'azle';
import { Address } from './models/Address';
import { BaseCertificate, CompanyCertificate, DocumentInfo, MaterialCertificate, ScopeCertificate } from './models/Certificate';
import { RoleProof } from './models/Proof';
import { OnlyEditor, OnlyViewer } from './decorators/roles';
import { validateAddress } from './utils/validation';

class CertificationManager {
    allCertificates = StableBTreeMap<Address, BaseCertificate[]>(0);

    companyCertificates = StableBTreeMap<Address, CompanyCertificate[]>(1);

    scopeCertificates = StableBTreeMap<Address, ScopeCertificate[]>(2);

    materialCertificates = StableBTreeMap<Address, MaterialCertificate[]>(3);

    counter = 0;

    @update([RoleProof, Address, Address, IDL.Text, DocumentInfo, IDL.Nat, IDL.Nat, IDL.Nat], CompanyCertificate)
    @OnlyEditor
    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: Address,
        subject: Address,
        assessmentStandard: string,
        document: DocumentInfo,
        issueDate: number,
        validFrom: number,
        validUntil: number
    ): Promise<CompanyCertificate> {
        validateAddress('Issuer', issuer);
        validateAddress('Subject', subject);
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
        const certificate: CompanyCertificate = {
            id: this.counter++,
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentStandard,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate,
            validFrom,
            validUntil,
            type: { COMPANY: null }
        };
        if (!this.companyCertificates.containsKey(subject)) this.companyCertificates.insert(subject, [certificate]);
        else this.companyCertificates.get(subject)!.push(certificate);
        // TODO: add to this.allCertificates
        return certificate;
    }

    @update([RoleProof, Address, Address, IDL.Text, DocumentInfo, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text)], ScopeCertificate)
    @OnlyEditor
    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: Address,
        subject: Address,
        assessmentStandard: string,
        document: DocumentInfo,
        issueDate: number,
        validFrom: number,
        validUntil: number,
        processTypes: string[]
    ): Promise<ScopeCertificate> {
        validateAddress('Issuer', issuer);
        validateAddress('Subject', subject);
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
        const certificate: ScopeCertificate = {
            id: this.counter++,
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentStandard,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate,
            validFrom,
            validUntil,
            processTypes,
            type: { SCOPE: null }
        };
        if (!this.scopeCertificates.containsKey(subject)) this.scopeCertificates.insert(subject, [certificate]);
        else this.scopeCertificates.get(subject)!.push(certificate);
        return certificate;
    }

    @update([RoleProof, Address, Address, IDL.Text, DocumentInfo, IDL.Nat, IDL.Nat], MaterialCertificate)
    @OnlyEditor
    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: Address,
        subject: Address,
        assessmentStandard: string,
        document: DocumentInfo,
        issueDate: number,
        materialId: number
    ): Promise<MaterialCertificate> {
        validateAddress('Issuer', issuer);
        validateAddress('Subject', subject);
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
        const certificate: MaterialCertificate = {
            id: this.counter++,
            uploadedBy: companyAddress,
            issuer,
            subject,
            assessmentStandard,
            document,
            evaluationStatus: { NOT_EVALUATED: null },
            issueDate,
            materialId,
            type: { MATERIAL: null }
        };
        if (!this.materialCertificates.containsKey(subject)) this.materialCertificates.insert(subject, [certificate]);
        else this.materialCertificates.get(subject)!.push(certificate);
        return certificate;
    }

    @query([RoleProof, Address], IDL.Vec(IDL.Nat))
    @OnlyViewer
    async getCertificateIdsBySubject(roleProof: RoleProof, subject: Address): Promise<number[]> {
        validateAddress('Subject', subject);
        const certificates = this.companyCertificates.get(subject) || [];
        const scopeCertificates = this.scopeCertificates.get(subject) || [];
        const materialCertificates = this.materialCertificates.get(subject) || [];
        const allCertificates = [...certificates, ...scopeCertificates, ...materialCertificates];
        return allCertificates.map((certificate) => certificate.id);
    }

    @query([RoleProof, Address], IDL.Vec(BaseCertificate))
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
            document: certificate.document,
            evaluationStatus: certificate.evaluationStatus,
            issueDate: certificate.issueDate,
            type: certificate.type
        }));
    }

    @query([RoleProof, Address], IDL.Vec(CompanyCertificate))
    @OnlyViewer
    async getCompanyCertificates(roleProof: RoleProof, subject: Address): Promise<CompanyCertificate[]> {
        return this.companyCertificates.get(subject) || [];
    }

    @query([RoleProof, Address], IDL.Vec(ScopeCertificate))
    @OnlyViewer
    async getScopeCertificates(roleProof: RoleProof, subject: Address): Promise<ScopeCertificate[]> {
        return this.scopeCertificates.get(subject) || [];
    }

    @query([RoleProof, Address], IDL.Vec(MaterialCertificate))
    @OnlyViewer
    async getMaterialCertificates(roleProof: RoleProof, subject: Address): Promise<MaterialCertificate[]> {
        return this.materialCertificates.get(subject) || [];
    }

    @query([RoleProof, Address, IDL.Nat], IDL.Opt(CompanyCertificate))
    @OnlyViewer
    async getCompanyCertificate(roleProof: RoleProof, subject: Address, id: number): Promise<CompanyCertificate | undefined> {
        return this.companyCertificates.get(subject)?.find((certificate) => certificate.id === id);
    }

    @query([RoleProof, Address, IDL.Nat], IDL.Opt(ScopeCertificate))
    @OnlyViewer
    async getScopeCertificate(roleProof: RoleProof, subject: Address, id: number): Promise<ScopeCertificate | undefined> {
        return this.scopeCertificates.get(subject)?.find((certificate) => certificate.id === id);
    }

    @query([RoleProof, Address, IDL.Nat], IDL.Opt(MaterialCertificate))
    @OnlyViewer
    async getMaterialCertificate(roleProof: RoleProof, subject: Address, id: number): Promise<MaterialCertificate | undefined> {
        return this.materialCertificates.get(subject)?.find((certificate) => certificate.id === id);
    }

    @update([RoleProof, Address, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], CompanyCertificate)
    @OnlyEditor
    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        issueDate: number,
        validFrom: number,
        validUntil: number
    ): Promise<CompanyCertificate> {
        const companyCertificates = this.companyCertificates.get(roleProof.membershipProof.delegatorAddress as Address) || [];
        const certificate = companyCertificates.find((certificate) => certificate.id === certificateId);
        if (!certificate) throw new Error('Certificate not found');
        certificate.assessmentStandard = assessmentStandard;
        certificate.issueDate = issueDate;
        certificate.validFrom = validFrom;
        certificate.validUntil = validUntil;
        return certificate;
    }

    @update([RoleProof, Address, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Text)], ScopeCertificate)
    @OnlyEditor
    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        issueDate: number,
        validFrom: number,
        validUntil: number,
        processTypes: string[]
    ): Promise<ScopeCertificate> {
        const scopeCertificates = this.scopeCertificates.get(roleProof.membershipProof.delegatorAddress as Address) || [];
        const certificate = scopeCertificates.find((certificate) => certificate.id === certificateId);
        if (!certificate) throw new Error('Certificate not found');
        certificate.assessmentStandard = assessmentStandard;
        certificate.issueDate = issueDate;
        certificate.validFrom = validFrom;
        certificate.validUntil = validUntil;
        certificate.processTypes = processTypes;
        return certificate;
    }
}

export default CertificationManager;
