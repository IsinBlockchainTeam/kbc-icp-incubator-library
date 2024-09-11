import {
    BaseCertificate,
    CertificateType,
    DocumentEvaluationStatus,
    DocumentType
} from './Certificate';

describe('Certificate', () => {
    let certificate: BaseCertificate;
    const issueDate = new Date();

    beforeAll(() => {
        certificate = new BaseCertificate(
            0,
            'issuer',
            'consigneeCompany',
            'assessmentStandard',
            { id: 1, documentType: DocumentType.CERTIFICATE_OF_CONFORMITY },
            DocumentEvaluationStatus.NOT_EVALUATED,
            CertificateType.COMPANY,
            issueDate
        );
    });

    it('should correctly initialize a Certificate', () => {
        expect(certificate.id).toEqual(0);
        expect(certificate.issuer).toEqual('issuer');
        expect(certificate.consigneeCompany).toEqual('consigneeCompany');
        expect(certificate.assessmentStandard).toEqual('assessmentStandard');
        expect(certificate.document).toEqual({
            id: 1,
            documentType: DocumentType.CERTIFICATE_OF_CONFORMITY
        });
        expect(certificate.evaluationStatus).toEqual(DocumentEvaluationStatus.NOT_EVALUATED);
        expect(certificate.certificateType).toEqual(CertificateType.COMPANY);
        expect(certificate.issueDate).toEqual(issueDate);
    });

    it('should correctly set the id', () => {
        certificate.id = 1;
        expect(certificate.id).toEqual(1);
    });

    it('should correctly set the issuer', () => {
        certificate.issuer = 'newIssuer';
        expect(certificate.issuer).toEqual('newIssuer');
    });

    it('should correctly set the consigneeCompany', () => {
        certificate.consigneeCompany = 'newConsigneeCompany';
        expect(certificate.consigneeCompany).toEqual('newConsigneeCompany');
    });

    it('should correctly set the assessmentStandard', () => {
        certificate.assessmentStandard = 'newAssessmentStandard';
        expect(certificate.assessmentStandard).toEqual('newAssessmentStandard');
    });

    it('should correctly set the document', () => {
        certificate.document = { id: 2, documentType: DocumentType.COUNTRY_OF_ORIGIN };
        expect(certificate.document).toEqual({
            id: 2,
            documentType: DocumentType.COUNTRY_OF_ORIGIN
        });
    });

    it('should correctly set the evaluationStatus', () => {
        certificate.evaluationStatus = DocumentEvaluationStatus.APPROVED;
        expect(certificate.evaluationStatus).toEqual(DocumentEvaluationStatus.APPROVED);
    });

    it('should correctly set the certificateType', () => {
        certificate.certificateType = CertificateType.SCOPE;
        expect(certificate.certificateType).toEqual(CertificateType.SCOPE);
    });

    it('should correctly set the issueDate', () => {
        const newIssueDate = new Date();
        certificate.issueDate = newIssueDate;
        expect(certificate.issueDate).toEqual(newIssueDate);
    });
});
