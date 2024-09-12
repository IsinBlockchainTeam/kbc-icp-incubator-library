import { MaterialCertificate } from './MaterialCertificate';
import { CertificateType, DocumentEvaluationStatus, DocumentType } from './Certificate';

describe('MaterialCertificate', () => {
    let materialCertificate: MaterialCertificate;
    const issueDate = new Date();

    beforeAll(() => {
        materialCertificate = new MaterialCertificate(
            0,
            'issuer',
            'subject',
            'assessmentStandard',
            { id: 1, documentType: DocumentType.PRODUCTION_REPORT },
            DocumentEvaluationStatus.NOT_EVALUATED,
            CertificateType.MATERIAL,
            issueDate,
            3
        );
    });

    it('should correctly initialize a MaterialCertificate', () => {
        expect(materialCertificate.id).toEqual(0);
        expect(materialCertificate.issuer).toEqual('issuer');
        expect(materialCertificate.subject).toEqual('subject');
        expect(materialCertificate.assessmentStandard).toEqual('assessmentStandard');
        expect(materialCertificate.document).toEqual({
            id: 1,
            documentType: DocumentType.PRODUCTION_REPORT
        });
        expect(materialCertificate.evaluationStatus).toEqual(
            DocumentEvaluationStatus.NOT_EVALUATED
        );
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
        materialCertificate.subject = 'newConsigneeCompany';
        expect(materialCertificate.subject).toEqual('newConsigneeCompany');
    });

    it('should correctly set the assessmentStandard', () => {
        materialCertificate.assessmentStandard = 'newAssessmentStandard';
        expect(materialCertificate.assessmentStandard).toEqual('newAssessmentStandard');
    });

    it('should correctly set the document', () => {
        materialCertificate.document = {
            id: 2,
            documentType: DocumentType.PRODUCTION_FACILITY_LICENSE
        };
        expect(materialCertificate.document).toEqual({
            id: 2,
            documentType: DocumentType.PRODUCTION_FACILITY_LICENSE
        });
    });

    it('should correctly set the evaluationStatus', () => {
        materialCertificate.evaluationStatus = DocumentEvaluationStatus.APPROVED;
        expect(materialCertificate.evaluationStatus).toEqual(DocumentEvaluationStatus.APPROVED);
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
