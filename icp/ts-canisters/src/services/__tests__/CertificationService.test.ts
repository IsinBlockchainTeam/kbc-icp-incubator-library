import { StableBTreeMap } from 'azle';
import CertificationService from '../CertificationService';
import { BaseCertificate, CompanyCertificate, EvaluationStatus, MaterialCertificate, ScopeCertificate } from '../../models/types';
import AuthenticationService from '../AuthenticationService';
import { validateAddress, validateAssessmentAssuranceLevel, validateDatesValidity, validateFieldValue, validateMaterialById, validateProcessTypes } from '../../utils/validation';
import AssessmentReferenceStandardService from '../AssessmentReferenceStandardService';

jest.mock('azle');
jest.mock('../../services/AuthenticationService', () => ({
    instance: {
        getDelegatorAddress: jest.fn(),
        getRole: jest.fn()
    }
}));
jest.mock('../../utils/validation', () => ({
    validateAddress: jest.fn(),
    validateDeadline: jest.fn(),
    validateInterestedParty: jest.fn(),
    validateDatesValidity: jest.fn(),
    validateAssessmentStandard: jest.fn(),
    validateAssessmentAssuranceLevel: jest.fn(),
    validateProcessTypes: jest.fn(),
    validateMaterialById: jest.fn(),
    validateFieldValue: jest.fn()
}));
jest.mock('../AssessmentReferenceStandardService', () => ({
    instance: {
        getById: jest.fn()
    }
}));

describe('CertificationService', () => {
    let certificationService: CertificationService;
    const authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<AuthenticationService>;
    const assessmentReferenceStandardServiceInstanceMock = AssessmentReferenceStandardService.instance as jest.Mocked<AssessmentReferenceStandardService>;

    const subject = '0xsubject';
    const mockedIssueDate = Date.now();
    const baseCertificate: BaseCertificate = {
        id: 1n,
        issuer: '0xissuer',
        subject,
        uploadedBy: '0xuploadedBy',
        assessmentReferenceStandard: {
            id: 1n,
            name: 'assessmentReferenceStandard',
            logoUrl: 'logoUrl',
            siteUrl: 'siteUrl',
            sustainabilityCriteria: 'sustainabilityCriteria'
        },
        assessmentAssuranceLevel: 'assessmentAssuranceLevel',
        document: {
            referenceId: 'referenceId',
            documentType: { CERTIFICATE_OF_CONFORMITY: null },
            externalUrl: 'externalUrl',
            metadata: { filename: 'file.pdf', fileType: 'application/pdf' }
        },
        evaluationStatus: { NOT_EVALUATED: null },
        certType: { COMPANY: null },
        issueDate: BigInt(mockedIssueDate),
        notes: 'notes'
    };
    const companyCertificate: CompanyCertificate = {
        ...baseCertificate,
        certType: { COMPANY: null },
        validFrom: 12345n,
        validUntil: 12345n
    };
    const scopeCertificate: ScopeCertificate = {
        ...baseCertificate,
        certType: { SCOPE: null },
        validFrom: 12345n,
        validUntil: 12345n,
        processTypes: ['processType']
    };
    const materialCertificate: MaterialCertificate = {
        ...baseCertificate,
        certType: { MATERIAL: null },
        materialId: 1n
    };

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
        insert: jest.fn(),
        containsKey: jest.fn()
    };

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(mockedIssueDate);
    });

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            keys: mockedFn.keys,
            insert: mockedFn.insert,
            containsKey: mockedFn.containsKey
        });
        certificationService = CertificationService.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('register a company certificate', () => {
        mockedFn.keys.mockReturnValue([]);
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(companyCertificate.uploadedBy);
        assessmentReferenceStandardServiceInstanceMock.getById.mockReturnValue(companyCertificate.assessmentReferenceStandard);
        const certificateRegistered = certificationService.registerCompanyCertificate(
            companyCertificate.issuer,
            companyCertificate.subject,
            companyCertificate.assessmentReferenceStandard.id,
            companyCertificate.assessmentAssuranceLevel,
            companyCertificate.document,
            companyCertificate.validFrom,
            companyCertificate.validUntil,
            companyCertificate.notes
        );

        expect(validateAddress).toHaveBeenCalledTimes(2);
        expect(validateDatesValidity).toHaveBeenCalledTimes(1);
        expect(validateAssessmentAssuranceLevel).toHaveBeenCalledTimes(1);
        expect(assessmentReferenceStandardServiceInstanceMock.getById).toHaveBeenCalledTimes(1);
        expect(authenticationServiceInstanceMock.getDelegatorAddress).toHaveBeenCalledTimes(1);

        expect(certificateRegistered).toEqual(companyCertificate);
    });

    it('register a scope certificate', () => {
        mockedFn.keys.mockReturnValue([]);
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(scopeCertificate.uploadedBy);
        assessmentReferenceStandardServiceInstanceMock.getById.mockReturnValue(companyCertificate.assessmentReferenceStandard);

        const certificateRegistered = certificationService.registerScopeCertificate(
            scopeCertificate.issuer,
            scopeCertificate.subject,
            scopeCertificate.assessmentReferenceStandard.id,
            scopeCertificate.assessmentAssuranceLevel,
            scopeCertificate.document,
            scopeCertificate.validFrom,
            scopeCertificate.validUntil,
            scopeCertificate.processTypes,
            scopeCertificate.notes
        );

        expect(validateAddress).toHaveBeenCalledTimes(2);
        expect(validateDatesValidity).toHaveBeenCalledTimes(1);
        expect(validateAssessmentAssuranceLevel).toHaveBeenCalledTimes(1);
        expect(validateProcessTypes).toHaveBeenCalledTimes(1);
        expect(assessmentReferenceStandardServiceInstanceMock.getById).toHaveBeenCalledTimes(1);
        expect(authenticationServiceInstanceMock.getDelegatorAddress).toHaveBeenCalledTimes(1);

        expect(certificateRegistered).toEqual(scopeCertificate);
    });

    it('register a material certificate', () => {
        mockedFn.keys.mockReturnValue([]);
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(materialCertificate.uploadedBy);
        assessmentReferenceStandardServiceInstanceMock.getById.mockReturnValue(companyCertificate.assessmentReferenceStandard);

        const certificateRegistered = certificationService.registerMaterialCertificate(
            materialCertificate.issuer,
            materialCertificate.subject,
            materialCertificate.assessmentReferenceStandard.id,
            materialCertificate.assessmentAssuranceLevel,
            materialCertificate.document,
            materialCertificate.materialId,
            materialCertificate.notes
        );

        expect(validateAddress).toHaveBeenCalledTimes(2);
        expect(validateAssessmentAssuranceLevel).toHaveBeenCalledTimes(1);
        expect(validateMaterialById).toHaveBeenCalledTimes(1);
        expect(assessmentReferenceStandardServiceInstanceMock.getById).toHaveBeenCalledTimes(1);
        expect(authenticationServiceInstanceMock.getDelegatorAddress).toHaveBeenCalledTimes(1);

        expect(certificateRegistered).toEqual(materialCertificate);
    });

    it('get base certificates info by subject', () => {
        mockedFn.get.mockReturnValueOnce([companyCertificate]);
        mockedFn.get.mockReturnValueOnce([scopeCertificate]);
        mockedFn.get.mockReturnValueOnce([materialCertificate]);
        mockedFn.values.mockReturnValue([companyCertificate, scopeCertificate, materialCertificate]);
        const certificates = certificationService.getBaseCertificatesInfoBySubject(baseCertificate.subject);

        expect(validateAddress).toHaveBeenCalledTimes(1);
        expect(certificates).toEqual(
            [companyCertificate, scopeCertificate, materialCertificate].map((certificate) => ({
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
            }))
        );
    });

    it('get base certificate by id', () => {
        mockedFn.get.mockReturnValueOnce({ subject, certType: { SCOPE: null } });
        mockedFn.get.mockReturnValue([baseCertificate]);
        const certificate = certificationService.getBaseCertificateById(baseCertificate.id);

        expect(mockedFn.get).toHaveBeenCalledTimes(2);
        expect(mockedFn.get).toHaveBeenNthCalledWith(1, baseCertificate.id);
        expect(mockedFn.get).toHaveBeenNthCalledWith(2, subject);
        expect(certificate).toEqual(baseCertificate);
    });

    it('get company certificates', () => {
        mockedFn.get.mockReturnValue([companyCertificate]);
        const certificates = certificationService.getCompanyCertificates(subject);

        expect(mockedFn.get).toHaveBeenCalledTimes(1);
        expect(mockedFn.get).toHaveBeenCalledWith(subject);
        expect(certificates).toEqual([companyCertificate]);
    });

    it('get scope certificates', () => {
        mockedFn.get.mockReturnValue([scopeCertificate]);
        const certificates = certificationService.getScopeCertificates(subject);

        expect(mockedFn.get).toHaveBeenCalledTimes(1);
        expect(mockedFn.get).toHaveBeenCalledWith(subject);
        expect(certificates).toEqual([scopeCertificate]);
    });

    it('get material certificates', () => {
        mockedFn.get.mockReturnValue([materialCertificate]);
        const certificates = certificationService.getMaterialCertificates(subject);

        expect(mockedFn.get).toHaveBeenCalledTimes(1);
        expect(mockedFn.get).toHaveBeenCalledWith(subject);
        expect(certificates).toEqual([materialCertificate]);
    });

    it('get company certificate by subject and id', () => {
        mockedFn.get.mockReturnValue([companyCertificate]);
        const certificate = certificationService.getCompanyCertificate(subject, companyCertificate.id);

        expect(mockedFn.get).toHaveBeenCalledTimes(1);
        expect(mockedFn.get).toHaveBeenCalledWith(subject);
        expect(certificate).toEqual(companyCertificate);
    });

    it('get company certificate by subject and id - fail (Company certificate not found)', () => {
        mockedFn.get.mockReturnValue([]);
        expect(() => certificationService.getCompanyCertificate(subject, companyCertificate.id)).toThrow(new Error('(CERTIFICATE_NOT_FOUND) COMPANY Certificate not found.'));
    });

    it('get scope certificate by subject and id', () => {
        mockedFn.get.mockReturnValue([scopeCertificate]);
        const certificate = certificationService.getScopeCertificate(subject, scopeCertificate.id);

        expect(mockedFn.get).toHaveBeenCalledTimes(1);
        expect(mockedFn.get).toHaveBeenCalledWith(subject);
        expect(certificate).toEqual(scopeCertificate);
    });

    it('get scope certificate by subject and id - fail (Scope certificate not found)', () => {
        mockedFn.get.mockReturnValue([]);
        expect(() => certificationService.getScopeCertificate(subject, scopeCertificate.id)).toThrow(new Error('(CERTIFICATE_NOT_FOUND) SCOPE Certificate not found.'));
    });

    it('get material certificate by subject and id', () => {
        mockedFn.get.mockReturnValue([materialCertificate]);
        const certificate = certificationService.getMaterialCertificate(subject, materialCertificate.id);

        expect(mockedFn.get).toHaveBeenCalledTimes(1);
        expect(mockedFn.get).toHaveBeenCalledWith(subject);
        expect(certificate).toEqual(materialCertificate);
    });

    it('get material certificate by subject and id - fail (Material certificate not found)', () => {
        mockedFn.get.mockReturnValue([]);
        expect(() => certificationService.getMaterialCertificate(subject, materialCertificate.id)).toThrow(new Error('(CERTIFICATE_NOT_FOUND) MATERIAL Certificate not found.'));
    });

    it('update a company certificate', () => {
        mockedFn.get.mockReturnValueOnce({ subject, certType: { COMPANY: null } });
        mockedFn.get.mockReturnValue([companyCertificate]);
        const updatedCertificate = certificationService.updateCompanyCertificate(
            companyCertificate.id,
            companyCertificate.assessmentReferenceStandard.id,
            companyCertificate.assessmentAssuranceLevel,
            companyCertificate.validFrom,
            987654n,
            companyCertificate.notes
        );

        expect(validateDatesValidity).toHaveBeenCalledTimes(1);
        expect(validateAssessmentAssuranceLevel).toHaveBeenCalledTimes(1);
        expect(validateFieldValue).toHaveBeenCalledTimes(1);
        expect(mockedFn.insert).toHaveBeenCalledTimes(1);
        expect(mockedFn.insert).toHaveBeenCalledWith(subject, [updatedCertificate]);

        expect(updatedCertificate).toEqual({
            ...companyCertificate,
            validUntil: 987654n
        });
    });

    it('update a scope certificate', () => {
        mockedFn.get.mockReturnValueOnce({ subject, certType: { SCOPE: null } });
        mockedFn.get.mockReturnValue([scopeCertificate]);
        const updatedCertificate = certificationService.updateScopeCertificate(
            scopeCertificate.id,
            scopeCertificate.assessmentReferenceStandard.id,
            'new assessmentAssuranceLevel',
            56789n,
            scopeCertificate.validUntil,
            [scopeCertificate.processTypes[0], 'new processType'],
            scopeCertificate.notes
        );

        expect(validateDatesValidity).toHaveBeenCalledTimes(1);
        expect(validateAssessmentAssuranceLevel).toHaveBeenCalledTimes(1);
        expect(validateProcessTypes).toHaveBeenCalledTimes(1);
        expect(validateFieldValue).toHaveBeenCalledTimes(1);
        expect(mockedFn.insert).toHaveBeenCalledTimes(1);
        expect(mockedFn.insert).toHaveBeenCalledWith(subject, [updatedCertificate]);

        expect(updatedCertificate).toEqual({
            ...scopeCertificate,
            assessmentAssuranceLevel: 'new assessmentAssuranceLevel',
            validFrom: 56789n,
            processTypes: [scopeCertificate.processTypes[0], 'new processType']
        });
    });

    it('update a material certificate', () => {
        mockedFn.get.mockReturnValueOnce({ subject, certType: { MATERIAL: null } });
        mockedFn.get.mockReturnValue([materialCertificate]);
        const updatedCertificate = certificationService.updateMaterialCertificate(
            materialCertificate.id,
            materialCertificate.assessmentReferenceStandard.id,
            materialCertificate.assessmentAssuranceLevel,
            5n,
            'new notes'
        );

        expect(validateAssessmentAssuranceLevel).toHaveBeenCalledTimes(1);
        expect(validateMaterialById).toHaveBeenCalledTimes(1);
        expect(validateFieldValue).toHaveBeenCalledTimes(1);
        expect(mockedFn.insert).toHaveBeenCalledTimes(1);
        expect(mockedFn.insert).toHaveBeenCalledWith(subject, [updatedCertificate]);

        expect(updatedCertificate).toEqual({
            ...materialCertificate,
            materialId: 5n,
            notes: 'new notes'
        });
    });

    it('update document for a certificate', () => {
        mockedFn.get.mockReturnValueOnce({ subject, certType: { MATERIAL: null } });
        mockedFn.get.mockReturnValue([baseCertificate]);
        const newDocumentInfo = {
            referenceId: 'newReferenceId',
            documentType: { CERTIFICATE_OF_CONFORMITY: null },
            externalUrl: 'newExternalUrl',
            metadata: { filename: 'newFile.pdf', fileType: 'application/pdf' }
        };
        const updatedCertificate = certificationService.updateDocument(baseCertificate.id, newDocumentInfo);

        expect(mockedFn.insert).toHaveBeenCalledTimes(1);
        expect(mockedFn.insert).toHaveBeenCalledWith(subject, [updatedCertificate]);
        expect(updatedCertificate.document).toEqual(newDocumentInfo);
    });

    it('evaluate a document', () => {
        mockedFn.get.mockReturnValueOnce({ subject, certType: { COMPANY: null } });
        mockedFn.get.mockReturnValue([baseCertificate]);
        const evaluationStatus: EvaluationStatus = { APPROVED: null };
        const updatedCertificate = certificationService.evaluateDocument(baseCertificate.id, evaluationStatus);

        expect(mockedFn.insert).toHaveBeenCalledTimes(1);
        expect(mockedFn.insert).toHaveBeenCalledWith(subject, [updatedCertificate]);
        expect(updatedCertificate.evaluationStatus).toEqual(evaluationStatus);
    });
});
