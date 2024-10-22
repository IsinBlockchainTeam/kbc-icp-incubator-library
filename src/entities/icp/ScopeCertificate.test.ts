import { ScopeCertificate } from './ScopeCertificate';
import { CertificateType, CertificateDocumentType } from './Certificate';
import { EvaluationStatus } from './Document';

describe('ScopeCertificate', () => {
    let scopeCertificate: ScopeCertificate;
    const issueDate = new Date();
    const validFrom = new Date();
    const validUntil = new Date();
    const processTypes = ['processType1', 'processType2'];

    beforeAll(() => {
        scopeCertificate = new ScopeCertificate(
            0,
            'issuer',
            'subject',
            'uploadedBy',
            'assessmentStandard',
            'assessmentAssuranceLevel',
            'referenceId',
            {
                id: 1,
                documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                externalUrl: 'externalUrl'
            },
            EvaluationStatus.NOT_EVALUATED,
            CertificateType.SCOPE,
            issueDate,
            processTypes,
            validFrom,
            validUntil
        );
    });

    it('should correctly initialize a ScopeCertificate', () => {
        expect(scopeCertificate.id).toEqual(0);
        expect(scopeCertificate.issuer).toEqual('issuer');
        expect(scopeCertificate.subject).toEqual('subject');
        expect(scopeCertificate.uploadedBy).toEqual('uploadedBy');
        expect(scopeCertificate.assessmentStandard).toEqual('assessmentStandard');
        expect(scopeCertificate.assessmentAssuranceLevel).toEqual('assessmentAssuranceLevel');
        expect(scopeCertificate.referenceId).toEqual('referenceId');
        expect(scopeCertificate.document).toEqual({
            id: 1,
            documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            externalUrl: 'externalUrl'
        });
        expect(scopeCertificate.evaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(scopeCertificate.certificateType).toEqual(CertificateType.SCOPE);
        expect(scopeCertificate.issueDate).toEqual(issueDate);
        expect(scopeCertificate.processTypes).toEqual(processTypes);
        expect(scopeCertificate.validFrom).toEqual(validFrom);
        expect(scopeCertificate.validUntil).toEqual(validUntil);
    });

    it('should correctly set the id', () => {
        scopeCertificate.id = 1;
        expect(scopeCertificate.id).toEqual(1);
    });

    it('should correctly set the issuer', () => {
        scopeCertificate.issuer = 'newIssuer';
        expect(scopeCertificate.issuer).toEqual('newIssuer');
    });

    it('should correctly set the subject', () => {
        scopeCertificate.subject = 'newSubject';
        expect(scopeCertificate.subject).toEqual('newSubject');
    });

    it('should correctly set the uploadedBy', () => {
        scopeCertificate.uploadedBy = 'newUploadedBy';
        expect(scopeCertificate.uploadedBy).toEqual('newUploadedBy');
    });

    it('should correctly set the assessmentStandard', () => {
        scopeCertificate.assessmentStandard = 'newAssessmentStandard';
        expect(scopeCertificate.assessmentStandard).toEqual('newAssessmentStandard');
    });

    it('should correctly set the assessmentAssuranceLevel', () => {
        scopeCertificate.assessmentAssuranceLevel = 'newAssessmentAssuranceLevel';
        expect(scopeCertificate.assessmentAssuranceLevel).toEqual('newAssessmentAssuranceLevel');
    });

    it('should correctly set the referenceId', () => {
        scopeCertificate.referenceId = 'newReferenceId';
        expect(scopeCertificate.referenceId).toEqual('newReferenceId');
    });

    it('should correctly set the document', () => {
        scopeCertificate.document = {
            id: 2,
            documentType: CertificateDocumentType.COUNTRY_OF_ORIGIN,
            externalUrl: 'newExternalUrl'
        };
        expect(scopeCertificate.document).toEqual({
            id: 2,
            documentType: CertificateDocumentType.COUNTRY_OF_ORIGIN,
            externalUrl: 'newExternalUrl'
        });
    });

    it('should correctly set the evaluationStatus', () => {
        scopeCertificate.evaluationStatus = EvaluationStatus.APPROVED;
        expect(scopeCertificate.evaluationStatus).toEqual(EvaluationStatus.APPROVED);
    });

    it('should correctly set the certificateType', () => {
        scopeCertificate.certificateType = CertificateType.SCOPE;
        expect(scopeCertificate.certificateType).toEqual(CertificateType.SCOPE);
    });

    it('should correctly set the processTypes', () => {
        scopeCertificate.processTypes = ['newProcessType1', 'newProcessType2'];
        expect(scopeCertificate.processTypes).toEqual(['newProcessType1', 'newProcessType2']);
    });

    it('should correctly set the validFrom', () => {
        const newValidFrom = new Date();
        scopeCertificate.validFrom = newValidFrom;
        expect(scopeCertificate.validFrom).toEqual(newValidFrom);
    });

    it('should correctly set the validUntil', () => {
        const newValidUntil = new Date();
        scopeCertificate.validUntil = newValidUntil;
        expect(scopeCertificate.validUntil).toEqual(newValidUntil);
    });

    it('should correctly set the issueDate', () => {
        const newIssueDate = new Date();
        scopeCertificate.issueDate = newIssueDate;
        expect(scopeCertificate.issueDate).toEqual(newIssueDate);
    });
});
