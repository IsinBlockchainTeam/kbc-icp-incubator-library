import { MaterialCertificate } from './MaterialCertificate';
import { CertificateType, CertificateDocumentType } from './Certificate';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';
import { EvaluationStatus } from './Evaluation';

describe('MaterialCertificate', () => {
    let materialCertificate: MaterialCertificate;
    const issueDate = new Date();
    const material: Material = new Material(1, new ProductCategory(1, 'productCategory1', 88, ''));

    beforeAll(() => {
        materialCertificate = new MaterialCertificate(
            0,
            'issuer',
            'subject',
            'uploadedBy',
            'assessmentStandard',
            'assessmentAssuranceLevel',
            {
                referenceId: 'referenceId',
                documentType: CertificateDocumentType.PRODUCTION_REPORT,
                externalUrl: 'externalUrl',
                metadata: {
                    filename: 'file.pdf',
                    fileType: 'application/pdf'
                }
            },
            EvaluationStatus.NOT_EVALUATED,
            CertificateType.MATERIAL,
            issueDate,
            material
        );
    });

    it('should correctly initialize a MaterialCertificate', () => {
        expect(materialCertificate.id).toEqual(0);
        expect(materialCertificate.issuer).toEqual('issuer');
        expect(materialCertificate.subject).toEqual('subject');
        expect(materialCertificate.uploadedBy).toEqual('uploadedBy');
        expect(materialCertificate.assessmentStandard).toEqual('assessmentStandard');
        expect(materialCertificate.assessmentAssuranceLevel).toEqual('assessmentAssuranceLevel');
        expect(materialCertificate.document).toEqual({
            referenceId: 'referenceId',
            documentType: CertificateDocumentType.PRODUCTION_REPORT,
            externalUrl: 'externalUrl',
            metadata: {
                filename: 'file.pdf',
                fileType: 'application/pdf'
            }
        });
        expect(materialCertificate.evaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(materialCertificate.certificateType).toEqual(CertificateType.MATERIAL);
        expect(materialCertificate.issueDate).toEqual(issueDate);
        expect(materialCertificate.material).toEqual(material);
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

    it('should correctly set the document', () => {
        materialCertificate.document = {
            referenceId: 'newReferenceId',
            documentType: CertificateDocumentType.PRODUCTION_FACILITY_LICENSE,
            externalUrl: 'newExternalUrl',
            metadata: {
                filename: 'file_updated.pdf',
                fileType: 'application/pdf'
            }
        };
        expect(materialCertificate.document).toEqual({
            referenceId: 'newReferenceId',
            documentType: CertificateDocumentType.PRODUCTION_FACILITY_LICENSE,
            externalUrl: 'newExternalUrl',
            metadata: {
                filename: 'file_updated.pdf',
                fileType: 'application/pdf'
            }
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
        const newMaterial = new Material(2, new ProductCategory(2, 'productCategory2', 88, ''));
        materialCertificate.material = newMaterial;
        expect(materialCertificate.material).toEqual(newMaterial);
    });
});
