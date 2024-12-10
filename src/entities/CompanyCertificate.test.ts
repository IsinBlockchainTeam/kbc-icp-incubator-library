import { CompanyCertificate } from './CompanyCertificate';
import { CertificateType, CertificateDocumentType } from './Certificate';
import { EvaluationStatus } from './Evaluation';
import { AssessmentReferenceStandard } from './AssessmentReferenceStandard';

describe('CompanyCertificate', () => {
    let companyCertificate: CompanyCertificate;
    const issueDate = new Date();
    const validFrom = new Date(new Date().setDate(new Date().getDate() + 1));
    const validUntil = new Date(new Date().setDate(new Date().getDate() + 365));
    const assessmentReferenceStandard = new AssessmentReferenceStandard(
        1,
        'standard1',
        'criteria1',
        'http://logo1',
        'http://site1'
    );

    beforeAll(() => {
        companyCertificate = new CompanyCertificate(
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
        expect(companyCertificate.assessmentReferenceStandard).toEqual(assessmentReferenceStandard);
        expect(companyCertificate.assessmentAssuranceLevel).toEqual('assessmentAssuranceLevel');
        expect(companyCertificate.document).toEqual({
            referenceId: 'referenceId',
            documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
            externalUrl: 'externalUrl',
            metadata: {
                filename: 'file.pdf',
                fileType: 'application/pdf'
            }
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

    it('should correctly set the assessmentReferenceStandard', () => {
        const newAssessmentReferenceStandard = new AssessmentReferenceStandard(
            2,
            'standard2',
            'criteria2',
            'http://logo2',
            'http://site2'
        );
        companyCertificate.assessmentReferenceStandard = newAssessmentReferenceStandard;
        expect(companyCertificate.assessmentReferenceStandard).toEqual(
            newAssessmentReferenceStandard
        );
    });

    it('should correctly set the assessmentAssuranceLevel', () => {
        companyCertificate.assessmentAssuranceLevel = 'newAssessmentAssuranceLevel';
        expect(companyCertificate.assessmentAssuranceLevel).toEqual('newAssessmentAssuranceLevel');
    });

    it('should correctly set the document', () => {
        companyCertificate.document = {
            referenceId: 'newReferenceId',
            documentType: CertificateDocumentType.COUNTRY_OF_ORIGIN,
            externalUrl: 'newExternalUrl',
            metadata: {
                filename: 'file_updated.pdf',
                fileType: 'application/pdf'
            }
        };
        expect(companyCertificate.document).toEqual({
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
