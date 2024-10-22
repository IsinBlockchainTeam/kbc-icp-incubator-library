import { MaterialCertificate } from './MaterialCertificate';
import { CertificateType, CertificateDocumentType } from './Certificate';
import { EvaluationStatus } from './Document';

describe('MaterialCertificate', () => {
    let materialCertificate: MaterialCertificate;
    const issueDate = new Date();

    beforeAll(() => {
        materialCertificate = new MaterialCertificate(
            0,
            'issuer',
            'subject',
            'uploadedBy',
            'assessmentStandard',
            'assessmentAssuranceLevel',
            'referenceId',
            {
                id: 1,
                documentType: CertificateDocumentType.PRODUCTION_REPORT,
                externalUrl: 'externalUrl'
            },
            EvaluationStatus.NOT_EVALUATED,
            CertificateType.MATERIAL,
            issueDate,
            3
        );
    });

    it('should correctly initialize a MaterialCertificate', () => {
        expect(materialCertificate.id).toEqual(0);
        expect(materialCertificate.issuer).toEqual('issuer');
        expect(materialCertificate.subject).toEqual('subject');
        expect(materialCertificate.uploadedBy).toEqual('uploadedBy');
        expect(materialCertificate.assessmentStandard).toEqual('assessmentStandard');
        expect(materialCertificate.assessmentAssuranceLevel).toEqual('assessmentAssuranceLevel');
        expect(materialCertificate.referenceId).toEqual('referenceId');
        expect(materialCertificate.document).toEqual({
            id: 1,
            documentType: CertificateDocumentType.PRODUCTION_REPORT,
            externalUrl: 'externalUrl'
        });
        expect(materialCertificate.evaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(materialCertificate.certificateType).toEqual(CertificateType.MATERIAL);
        expect(materialCertificate.issueDate).toEqual(issueDate);
        expect(materialCertificate.materialId).toEqual(3);
    });

    it('should correctly set the id', () => {
        materialCertificate.id = 1;
        expect(materialCertificate.id).toEqual(1);
    });

    it('should correctly set the issuer', () => {
        materialCertificate.issuer = 'newIssuer';
        expect(materialCertificate.issuer).toEqual('newIssuer');
    });

    it('should correctly set the subject', () => {
        materialCertificate.subject = 'newSubject';
        expect(materialCertificate.subject).toEqual('newSubject');
    });

    it('should correctly set the uploadedBy', () => {
        materialCertificate.uploadedBy = 'newUploadedBy';
        expect(materialCertificate.uploadedBy).toEqual('newUploadedBy');
    });

    it('should correctly set the assessmentStandard', () => {
        materialCertificate.assessmentStandard = 'newAssessmentStandard';
        expect(materialCertificate.assessmentStandard).toEqual('newAssessmentStandard');
    });

    it('should correctly set the assessmentAssuranceLevel', () => {
        materialCertificate.assessmentAssuranceLevel = 'newAssessmentAssuranceLevel';
        expect(materialCertificate.assessmentAssuranceLevel).toEqual('newAssessmentAssuranceLevel');
    });

    it('should correctly set the referenceId', () => {
        materialCertificate.referenceId = 'newReferenceId';
        expect(materialCertificate.referenceId).toEqual('newReferenceId');
    });

    it('should correctly set the document', () => {
        materialCertificate.document = {
            id: 2,
            documentType: CertificateDocumentType.PRODUCTION_FACILITY_LICENSE,
            externalUrl: 'newExternalUrl'
        };
        expect(materialCertificate.document).toEqual({
            id: 2,
            documentType: CertificateDocumentType.PRODUCTION_FACILITY_LICENSE,
            externalUrl: 'newExternalUrl'
        });
    });

    it('should correctly set the evaluationStatus', () => {
        materialCertificate.evaluationStatus = EvaluationStatus.APPROVED;
        expect(materialCertificate.evaluationStatus).toEqual(EvaluationStatus.APPROVED);
    });

    it('should correctly set the certificateType', () => {
        materialCertificate.certificateType = CertificateType.COMPANY;
        expect(materialCertificate.certificateType).toEqual(CertificateType.COMPANY);
    });

    it('should correctly set the issueDate', () => {
        const newDate = new Date();
        materialCertificate.issueDate = newDate;
        expect(materialCertificate.issueDate).toEqual(newDate);
    });

    it('should correctly set the materialId', () => {
        materialCertificate.materialId = 4;
        expect(materialCertificate.materialId).toEqual(4);
    });
});
