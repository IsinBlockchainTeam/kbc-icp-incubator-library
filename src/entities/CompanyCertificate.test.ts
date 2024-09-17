import { CompanyCertificate } from './CompanyCertificate';
import { CertificateType, DocumentEvaluationStatus, DocumentType } from './Certificate';

describe('CompanyCertificate', () => {
    let companyCertificate: CompanyCertificate;
    const issueDate = new Date().getTime();
    const validFrom = new Date(new Date().setDate(new Date().getDate() + 1)).getTime();
    const validUntil = new Date(new Date().setDate(new Date().getDate() + 365)).getTime();

    beforeAll(() => {
        companyCertificate = new CompanyCertificate(
            0,
            'issuer',
            'subject',
            'assessmentStandard',
            { id: 1, documentType: DocumentType.CERTIFICATE_OF_CONFORMITY },
            DocumentEvaluationStatus.NOT_EVALUATED,
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
        expect(companyCertificate.assessmentStandard).toEqual('assessmentStandard');
        expect(companyCertificate.document).toEqual({
            id: 1,
            documentType: DocumentType.CERTIFICATE_OF_CONFORMITY
        });
        expect(companyCertificate.evaluationStatus).toEqual(DocumentEvaluationStatus.NOT_EVALUATED);
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

    it('should correctly set the assessmentStandard', () => {
        companyCertificate.assessmentStandard = 'newAssessmentStandard';
        expect(companyCertificate.assessmentStandard).toEqual('newAssessmentStandard');
    });

    it('should correctly set the document', () => {
        companyCertificate.document = { id: 2, documentType: DocumentType.COUNTRY_OF_ORIGIN };
        expect(companyCertificate.document).toEqual({
            id: 2,
            documentType: DocumentType.COUNTRY_OF_ORIGIN
        });
    });

    it('should correctly set the evaluationStatus', () => {
        companyCertificate.evaluationStatus = DocumentEvaluationStatus.APPROVED;
        expect(companyCertificate.evaluationStatus).toEqual(DocumentEvaluationStatus.APPROVED);
    });

    it('should correctly set the certificateType', () => {
        companyCertificate.certificateType = CertificateType.SCOPE;
        expect(companyCertificate.certificateType).toEqual(CertificateType.SCOPE);
    });

    it('should correctly set the issueDate', () => {
        const newIssueDate = new Date().getTime();
        companyCertificate.issueDate = newIssueDate;
        expect(companyCertificate.issueDate).toEqual(newIssueDate);
    });

    it('should correctly set the validFrom', () => {
        const newValidFrom = new Date().getTime();
        companyCertificate.validFrom = newValidFrom;
        expect(companyCertificate.validFrom).toEqual(newValidFrom);
    });

    it('should correctly set the validUntil', () => {
        const newValidUntil = new Date().getTime();
        companyCertificate.validUntil = newValidUntil;
        expect(companyCertificate.validUntil).toEqual(newValidUntil);
    });
});
