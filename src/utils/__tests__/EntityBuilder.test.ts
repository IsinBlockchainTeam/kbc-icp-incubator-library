import {
    ProductCategory as ICPProductCategory,
    Material as ICPMaterial,
    Order as ICPOrder,
    Offer as ICPOffer,
    BaseCertificate as ICPBaseCertificate,
    CompanyCertificate as ICPCompanyCertificate,
    ScopeCertificate as ICPScopeCertificate,
    MaterialCertificate as ICPMaterialCertificate
} from '@kbc-lib/azle-types';
import { EntityBuilder } from '../EntityBuilder';
import { ProductCategory } from '../../entities/ProductCategory';
import { Material } from '../../entities/Material';
import { Offer } from '../../entities/Offer';
import { Order, OrderStatus } from '../../entities/Order';
import {
    BaseCertificate,
    CertificateDocumentType,
    CertificateType
} from '../../entities/Certificate';
import { EvaluationStatus } from '../../entities/Evaluation';
import { CompanyCertificate } from '../../entities/CompanyCertificate';
import { ScopeCertificate } from '../../entities/ScopeCertificate';
import { MaterialCertificate } from '../../entities/MaterialCertificate';

describe('EntityBuilder', () => {
    const assessmentReferenceStandard = {
        id: BigInt(1),
        name: 'assessment standard',
        logoUrl: 'logo url',
        siteUrl: 'site url',
        sustainabilityCriteria: 'sustainability criteria'
    };

    describe('buildProductCategory', () => {
        it('should correctly build a product category', () => {
            const icpProductCategory: ICPProductCategory = {
                id: BigInt(1),
                name: 'product category'
            };
            expect(EntityBuilder.buildProductCategory(icpProductCategory)).toEqual(
                new ProductCategory(1, 'product category')
            );
        });
    });

    describe('buildMaterial', () => {
        it('should correctly build a material', () => {
            const icpProductCategory: ICPProductCategory = {
                id: BigInt(1),
                name: 'product category'
            };
            const icpMaterial: ICPMaterial = {
                id: BigInt(1),
                owner: 'owner',
                name: 'name',
                productCategory: icpProductCategory,
                typology: 'typology',
                quality: 'quality',
                moisture: 'moisture',
                isInput: false
            };
            expect(EntityBuilder.buildMaterial(icpMaterial)).toEqual(
                new Material(
                    1,
                    icpMaterial.owner,
                    icpMaterial.name,
                    EntityBuilder.buildProductCategory(icpProductCategory),
                    icpMaterial.typology,
                    icpMaterial.quality,
                    icpMaterial.moisture,
                    icpMaterial.isInput
                )
            );
        });
    });

    describe('buildOffer', () => {
        it('should correctly build an offer', () => {
            const icpMaterial: ICPMaterial = {
                id: BigInt(1),
                name: 'name',
                owner: 'owner',
                productCategory: {
                    id: BigInt(1),
                    name: 'product category'
                },
                typology: 'typology',
                quality: 'quality',
                moisture: 'moisture',
                isInput: false
            };
            const icpOffer: ICPOffer = {
                id: BigInt(1),
                owner: 'owner',
                material: icpMaterial
            };
            expect(EntityBuilder.buildOffer(icpOffer)).toEqual(
                new Offer(1, 'owner', EntityBuilder.buildMaterial(icpMaterial))
            );
        });
    });

    describe('buildOrder', () => {
        it('should correctly build an order', () => {
            const icpOrder: ICPOrder = {
                id: BigInt(1),
                supplier: '0xsupplier',
                customer: '0xcustomer',
                commissioner: '0xcommissioner',
                signatures: ['0xsignature'],
                status: { PENDING: null },
                paymentDeadline: BigInt(1),
                documentDeliveryDeadline: BigInt(2),
                shippingDeadline: BigInt(3),
                deliveryDeadline: BigInt(4),
                arbiter: '0xarbiter',
                incoterms: 'FOB',
                shipper: 'shipper',
                shippingPort: 'shipping port',
                deliveryPort: 'delivery port',
                lines: [],
                token: 'token',
                agreedAmount: BigInt(5),
                shipmentId: []
            };
            const icpShipment = null;
            expect(EntityBuilder.buildOrder(icpOrder, icpShipment)).toEqual(
                new Order(
                    1,
                    '0xsupplier',
                    '0xcustomer',
                    '0xcommissioner',
                    ['0xsignature'],
                    OrderStatus.PENDING,
                    new Date(1000),
                    new Date(2000),
                    new Date(3000),
                    new Date(4000),
                    '0xarbiter',
                    'FOB',
                    'shipper',
                    'shipping port',
                    'delivery port',
                    [],
                    'token',
                    5,
                    null
                )
            );
        });
    });

    describe('buildBaseCertificate', () => {
        it('should correctly build a base certificate', () => {
            const icpBaseCertificate: ICPBaseCertificate = {
                id: BigInt(1),
                issuer: '0xissuer',
                subject: '0xsubject',
                uploadedBy: '0xuploadedBy',
                assessmentReferenceStandard,
                assessmentAssuranceLevel: 'assessment assurance level',
                document: {
                    referenceId: 'reference id',
                    documentType: { CERTIFICATE_OF_CONFORMITY: null },
                    externalUrl: 'external url',
                    metadata: {
                        filename: 'file.pdf',
                        fileType: 'application/pdf'
                    }
                },
                evaluationStatus: { NOT_EVALUATED: null },
                certType: { COMPANY: null },
                issueDate: BigInt(1),
                notes: 'notes'
            };
            expect(EntityBuilder.buildBaseCertificate(icpBaseCertificate)).toEqual(
                new BaseCertificate(
                    1,
                    '0xissuer',
                    '0xsubject',
                    '0xuploadedBy',
                    EntityBuilder.buildAssessmentReferenceStandard(
                        icpBaseCertificate.assessmentReferenceStandard
                    ),
                    'assessment assurance level',
                    {
                        referenceId: 'reference id',
                        documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                        externalUrl: 'external url',
                        metadata: {
                            filename: 'file.pdf',
                            fileType: 'application/pdf'
                        }
                    },
                    EvaluationStatus.NOT_EVALUATED,
                    CertificateType.COMPANY,
                    new Date(1),
                    'notes'
                )
            );
        });
    });

    describe('buildCompanyCertificate', () => {
        it('should correctly build a company certificate', () => {
            const icpCompanyCertificate: ICPCompanyCertificate = {
                id: BigInt(1),
                issuer: '0xissuer',
                subject: '0xsubject',
                uploadedBy: '0xuploadedBy',
                assessmentReferenceStandard,
                assessmentAssuranceLevel: 'assessment assurance level',
                document: {
                    referenceId: 'reference id',
                    documentType: { CERTIFICATE_OF_CONFORMITY: null },
                    externalUrl: 'external url',
                    metadata: {
                        filename: 'file.pdf',
                        fileType: 'application/pdf'
                    }
                },
                evaluationStatus: { NOT_EVALUATED: null },
                certType: { COMPANY: null },
                issueDate: BigInt(1),
                validFrom: BigInt(2),
                validUntil: BigInt(3),
                notes: 'notes'
            };
            expect(EntityBuilder.buildCompanyCertificate(icpCompanyCertificate)).toEqual(
                new CompanyCertificate(
                    1,
                    '0xissuer',
                    '0xsubject',
                    '0xuploadedBy',
                    EntityBuilder.buildAssessmentReferenceStandard(
                        icpCompanyCertificate.assessmentReferenceStandard
                    ),
                    'assessment assurance level',
                    {
                        referenceId: 'reference id',
                        documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                        externalUrl: 'external url',
                        metadata: {
                            filename: 'file.pdf',
                            fileType: 'application/pdf'
                        }
                    },
                    EvaluationStatus.NOT_EVALUATED,
                    CertificateType.COMPANY,
                    new Date(1 / 1000),
                    new Date(2),
                    new Date(3),
                    'notes'
                )
            );
        });
    });

    describe('buildScopeCertificate', () => {
        it('should correctly build a scope certificate', () => {
            const icpScopeCertificate: ICPScopeCertificate = {
                id: BigInt(1),
                issuer: '0xissuer',
                subject: '0xsubject',
                uploadedBy: '0xuploadedBy',
                assessmentReferenceStandard,
                assessmentAssuranceLevel: 'assessment assurance level',
                document: {
                    referenceId: 'reference id',
                    documentType: { CERTIFICATE_OF_CONFORMITY: null },
                    externalUrl: 'external url',
                    metadata: {
                        filename: 'file.pdf',
                        fileType: 'application/pdf'
                    }
                },
                evaluationStatus: { NOT_EVALUATED: null },
                certType: { SCOPE: null },
                issueDate: BigInt(1),
                validFrom: BigInt(2),
                validUntil: BigInt(3),
                processTypes: ['type1', 'type2'],
                notes: 'notes'
            };
            expect(EntityBuilder.buildScopeCertificate(icpScopeCertificate)).toEqual(
                new ScopeCertificate(
                    1,
                    '0xissuer',
                    '0xsubject',
                    '0xuploadedBy',
                    EntityBuilder.buildAssessmentReferenceStandard(
                        icpScopeCertificate.assessmentReferenceStandard
                    ),
                    'assessment assurance level',
                    {
                        referenceId: 'reference id',
                        documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                        externalUrl: 'external url',
                        metadata: {
                            filename: 'file.pdf',
                            fileType: 'application/pdf'
                        }
                    },
                    EvaluationStatus.NOT_EVALUATED,
                    CertificateType.SCOPE,
                    new Date(1 / 1000),
                    ['type1', 'type2'],
                    new Date(2),
                    new Date(3),
                    'notes'
                )
            );
        });
    });

    describe('buildMaterialCertificate', () => {
        it('should correctly build a material certificate', () => {
            const icpMaterialCertificate: ICPMaterialCertificate = {
                id: BigInt(1),
                issuer: '0xissuer',
                subject: '0xsubject',
                uploadedBy: '0xuploadedBy',
                assessmentReferenceStandard,
                assessmentAssuranceLevel: 'assessment assurance level',
                document: {
                    referenceId: 'reference id',
                    documentType: { CERTIFICATE_OF_CONFORMITY: null },
                    externalUrl: 'external url',
                    metadata: {
                        filename: 'file.pdf',
                        fileType: 'application/pdf'
                    }
                },
                evaluationStatus: { NOT_EVALUATED: null },
                certType: { MATERIAL: null },
                issueDate: BigInt(1),
                materialId: BigInt(2),
                notes: 'notes'
            };
            const icpMaterial: ICPMaterial = {
                id: BigInt(2),
                owner: 'owner',
                name: 'name',
                productCategory: {
                    id: BigInt(1),
                    name: 'product category'
                },
                typology: 'typology',
                quality: 'quality',
                moisture: 'moisture',
                isInput: false
            };
            expect(
                EntityBuilder.buildMaterialCertificate(icpMaterialCertificate, icpMaterial)
            ).toEqual(
                new MaterialCertificate(
                    1,
                    '0xissuer',
                    '0xsubject',
                    '0xuploadedBy',
                    EntityBuilder.buildAssessmentReferenceStandard(
                        icpMaterialCertificate.assessmentReferenceStandard
                    ),
                    'assessment assurance level',
                    {
                        referenceId: 'reference id',
                        documentType: CertificateDocumentType.CERTIFICATE_OF_CONFORMITY,
                        externalUrl: 'external url',
                        metadata: {
                            filename: 'file.pdf',
                            fileType: 'application/pdf'
                        }
                    },
                    EvaluationStatus.NOT_EVALUATED,
                    CertificateType.MATERIAL,
                    new Date(1 / 1000),
                    EntityBuilder.buildMaterial(icpMaterial),
                    'notes'
                )
            );
        });
    });
});
