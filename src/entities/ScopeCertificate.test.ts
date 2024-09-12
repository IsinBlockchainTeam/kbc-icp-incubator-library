import { ScopeCertificate } from './ScopeCertificate';
import { CertificateType, DocumentEvaluationStatus, DocumentType } from './Certificate';

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
            'assessmentStandard',
            { id: 1, documentType: DocumentType.CERTIFICATE_OF_CONFORMITY },
            DocumentEvaluationStatus.NOT_EVALUATED,
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
        expect(scopeCertificate.assessmentStandard).toEqual('assessmentStandard');
        expect(scopeCertificate.document).toEqual({
            id: 1,
            documentType: DocumentType.CERTIFICATE_OF_CONFORMITY
        });
        expect(scopeCertificate.evaluationStatus).toEqual(DocumentEvaluationStatus.NOT_EVALUATED);
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
        scopeCertificate.subject = 'newConsigneeCompany';
        expect(scopeCertificate.subject).toEqual('newConsigneeCompany');
    });

    it('should correctly set the assessmentStandard', () => {
        scopeCertificate.assessmentStandard = 'newAssessmentStandard';
        expect(scopeCertificate.assessmentStandard).toEqual('newAssessmentStandard');
    });

    it('should correctly set the document', () => {
        scopeCertificate.document = { id: 2, documentType: DocumentType.COUNTRY_OF_ORIGIN };
        expect(scopeCertificate.document).toEqual({
            id: 2,
            documentType: DocumentType.COUNTRY_OF_ORIGIN
        });
    });

    it('should correctly set the evaluationStatus', () => {
        scopeCertificate.evaluationStatus = DocumentEvaluationStatus.APPROVED;
        expect(scopeCertificate.evaluationStatus).toEqual(DocumentEvaluationStatus.APPROVED);
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
