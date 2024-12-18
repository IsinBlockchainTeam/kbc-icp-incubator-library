import { BaseCertificate, CertificateType, CertificateDocumentType } from './Certificate';
import { EvaluationStatus } from './Evaluation';
import { AssessmentReferenceStandard } from './AssessmentReferenceStandard';

describe('Certificate', () => {
    let certificate: BaseCertificate;
    const issueDate = new Date();
    const assessmentReferenceStandard = new AssessmentReferenceStandard(
        1,
        'standard1',
        'criteria1',
        'http://logo1',
        'http://site1'
    );

    beforeAll(() => {
        certificate = new BaseCertificate(
            0,
            'issuer',
            'subject',
            'uploadedBy',
            assessmentReferenceStandard,
            'assessmentAssuranceLevel',
            {
                referenceId: 'referenceId',
                documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                externalUrl: 'externalUrl',
                metadata: {
                    filename: 'file.pdf',
                    fileType: 'application/pdf'
                }
            },
            EvaluationStatus.NOT_EVALUATED,
            CertificateType.COMPANY,
            issueDate
        );
    });

    it('should correctly initialize a Certificate', () => {
        expect(certificate.id).toEqual(0);
        expect(certificate.issuer).toEqual('issuer');
        expect(certificate.subject).toEqual('subject');
        expect(certificate.assessmentReferenceStandard).toEqual(assessmentReferenceStandard);
        expect(certificate.document).toEqual({
            referenceId: 'referenceId',
            documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            externalUrl: 'externalUrl',
            metadata: {
                filename: 'file.pdf',
                fileType: 'application/pdf'
            }
        });
        expect(certificate.evaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
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

    it('should correctly set the subject', () => {
        certificate.subject = 'newSubject';
        expect(certificate.subject).toEqual('newSubject');
    });

    it('should correctly set the uploadedBy', () => {
        certificate.uploadedBy = 'newUploadedBy';
        expect(certificate.uploadedBy).toEqual('newUploadedBy');
    });

    it('should correctly set the assessmentReferenceStandard', () => {
        const newAssessmentReferenceStandard = new AssessmentReferenceStandard(
            2,
            'standard2',
            'criteria2',
            'http://logo2',
            'http://site2'
        );
        certificate.assessmentReferenceStandard = newAssessmentReferenceStandard;
        expect(certificate.assessmentReferenceStandard).toEqual(newAssessmentReferenceStandard);
    });

    it('should correctly set the assessmentAssuranceLevel', () => {
        certificate.assessmentAssuranceLevel = 'newAssessmentAssuranceLevel';
        expect(certificate.assessmentAssuranceLevel).toEqual('newAssessmentAssuranceLevel');
    });

    it('should correctly set the document', () => {
        certificate.document = {
            referenceId: 'newReferenceId',
            documentType: CertificateDocumentType.COUNTRY_OF_ORIGIN,
            externalUrl: 'newExternalUrl',
            metadata: {
                filename: 'file_updated.pdf',
                fileType: 'application/pdf'
            }
        };
        expect(certificate.document).toEqual({
            referenceId: 'newReferenceId',
            documentType: CertificateDocumentType.COUNTRY_OF_ORIGIN,
            externalUrl: 'newExternalUrl',
            metadata: {
                filename: 'file_updated.pdf',
                fileType: 'application/pdf'
            }
        });
    });

    it('should correctly set the evaluationStatus', () => {
        certificate.evaluationStatus = EvaluationStatus.APPROVED;
        expect(certificate.evaluationStatus).toEqual(EvaluationStatus.APPROVED);
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
