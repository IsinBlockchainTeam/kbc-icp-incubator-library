import { CompanyCertificate } from './CompanyCertificate';
import { CertificateType, CertificateDocumentType } from './Certificate';
import { EvaluationStatus } from './Document';

describe('CompanyCertificate', () => {
    let companyCertificate: CompanyCertificate;
    const issueDate = new Date();
    const validFrom = new Date(new Date().setDate(new Date().getDate() + 1));
    const validUntil = new Date(new Date().setDate(new Date().getDate() + 365));

    beforeAll(() => {
        companyCertificate = new CompanyCertificate(
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
            CertificateType.COMPANY,
            issueDate,
            validFrom,
            validUntil
        );
    });

    it('should correctly initialize a CompanyCertificate', () => {
        expect(companyCertificate.id).toEqual(0);
        expect(companyCertificate.issuer).toEqual('issuer');
        expect(companyCertificate.subject).toEqual('subject');
        expect(companyCertificate.uploadedBy).toEqual('uploadedBy');
        expect(companyCertificate.assessmentStandard).toEqual('assessmentStandard');
        expect(companyCertificate.assessmentAssuranceLevel).toEqual('assessmentAssuranceLevel');
        expect(companyCertificate.referenceId).toEqual('referenceId');
        expect(companyCertificate.document).toEqual({
            id: 1,
            documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            externalUrl: 'externalUrl'
        });
        expect(companyCertificate.evaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(companyCertificate.certificateType).toEqual(CertificateType.COMPANY);
        expect(companyCertificate.issueDate).toEqual(issueDate);
        expect(companyCertificate.validFrom).toEqual(validFrom);
        expect(companyCertificate.validUntil).toEqual(validUntil);
    });

    it('should correctly set the id', () => {
        companyCertificate.id = 1;
        expect(companyCertificate.id).toEqual(1);
    });

    it('should correctly set the issuer', () => {
        companyCertificate.issuer = 'newIssuer';
        expect(companyCertificate.issuer).toEqual('newIssuer');
    });

    it('should correctly set the subject', () => {
        companyCertificate.subject = 'newSubject';
        expect(companyCertificate.subject).toEqual('newSubject');
    });

    it('should correctly set the uploadedBy', () => {
        companyCertificate.uploadedBy = 'newUploadedBy';
        expect(companyCertificate.uploadedBy).toEqual('newUploadedBy');
    });

    it('should correctly set the assessmentStandard', () => {
        companyCertificate.assessmentStandard = 'newAssessmentStandard';
        expect(companyCertificate.assessmentStandard).toEqual('newAssessmentStandard');
    });

    it('should correctly set the assessmentAssuranceLevel', () => {
        companyCertificate.assessmentAssuranceLevel = 'newAssessmentAssuranceLevel';
        expect(companyCertificate.assessmentAssuranceLevel).toEqual('newAssessmentAssuranceLevel');
    });

    it('should correctly set the referenceId', () => {
        companyCertificate.referenceId = 'newReferenceId';
        expect(companyCertificate.referenceId).toEqual('newReferenceId');
    });

    it('should correctly set the document', () => {
        companyCertificate.document = {
            id: 2,
            documentType: CertificateDocumentType.COUNTRY_OF_ORIGIN,
            externalUrl: 'newExternalUrl'
        };
        expect(companyCertificate.document).toEqual({
            id: 2,
            documentType: CertificateDocumentType.COUNTRY_OF_ORIGIN,
            externalUrl: 'newExternalUrl'
        });
    });

    it('should correctly set the evaluationStatus', () => {
        companyCertificate.evaluationStatus = EvaluationStatus.APPROVED;
        expect(companyCertificate.evaluationStatus).toEqual(EvaluationStatus.APPROVED);
    });

    it('should correctly set the certificateType', () => {
        companyCertificate.certificateType = CertificateType.SCOPE;
        expect(companyCertificate.certificateType).toEqual(CertificateType.SCOPE);
    });

    it('should correctly set the issueDate', () => {
        const newIssueDate = new Date();
        companyCertificate.issueDate = newIssueDate;
        expect(companyCertificate.issueDate).toEqual(newIssueDate);
    });

    it('should correctly set the validFrom', () => {
        const newValidFrom = new Date();
        companyCertificate.validFrom = newValidFrom;
        expect(companyCertificate.validFrom).toEqual(newValidFrom);
    });

    it('should correctly set the validUntil', () => {
        const newValidUntil = new Date();
        companyCertificate.validUntil = newValidUntil;
        expect(companyCertificate.validUntil).toEqual(newValidUntil);
    });
});
