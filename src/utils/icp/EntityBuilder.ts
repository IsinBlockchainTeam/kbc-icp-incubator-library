import {
    ProductCategory as ICPProductCategory,
    Material as ICPMaterial,
    Order as ICPOrder,
    OrderStatus as ICPOrderStatus,
    BaseCertificate as ICPBaseCertificate,
    CompanyCertificate as ICPCompanyCertificate,
    CertificateType as ICPCertificateType,
    CertificateDocumentInfo as ICPCertificateDocumentInfo,
    CertificateDocumentType as ICPCertificateDocumentType,
    EvaluationStatus as ICPEvaluationStatus,
    EvaluationStatusEnum as ICPEvaluationStatusEnum,
    MaterialCertificate as ICPMaterialCertificate,
    ScopeCertificate as ICPScopeCertificate
} from '@kbc-lib/azle-types';
import { Order, OrderStatus } from '../../entities/icp/Order';
import { ProductCategory } from '../../entities/ProductCategory';
import {Material} from "../../entities/Material";
import { CompanyCertificate } from '../../entities/icp/CompanyCertificate';
import { ScopeCertificate } from '../../entities/icp/ScopeCertificate';
import { MaterialCertificate } from '../../entities/icp/MaterialCertificate';
import {
    BaseCertificate,
    CertificateDocumentInfo,
    CertificateDocumentType,
    CertificateType
} from '../../entities/icp/Certificate';
import { EvaluationStatus } from '../../entities/icp/Document';

export class EntityBuilder {
    static buildProductCategory(productCategory: ICPProductCategory) {
        return new ProductCategory(
            Number(productCategory.id),
            productCategory.name,
            Number(productCategory.quality),
            productCategory.description
        );
    }

    static buildMaterial(material: ICPMaterial) {
        return new Material(
            Number(material.id),
            this.buildProductCategory(material.productCategory)
        );
    }

    static buildOrder(order: ICPOrder) {
        return new Order(
            Number(order.id),
            order.supplier,
            order.customer,
            order.commissioner,
            order.signatures,
            this._buildOrderStatus(order.status),
            new Date(Number(order.paymentDeadline) * 1000),
            new Date(Number(order.documentDeliveryDeadline) * 1000),
            new Date(Number(order.shippingDeadline) * 1000),
            new Date(Number(order.deliveryDeadline) * 1000),
            order.arbiter,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            order.lines.map((line) => ({
                productCategoryId: Number(line.productCategoryId),
                quantity: Number(line.quantity),
                unit: line.unit,
                price: {
                    amount: Number(line.price.amount),
                    fiat: line.price.fiat
                }
            })),
            order.token,
            Number(order.agreedAmount),
            // TODO check if this is correct
            order.shipmentId[0] ? Number(order.shipmentId[0]) : -1
        );
    }

    static buildBaseCertificate(baseCertificate: ICPBaseCertificate): BaseCertificate {
        return new BaseCertificate(
            Number(baseCertificate.id),
            baseCertificate.issuer,
            baseCertificate.subject,
            baseCertificate.uploadedBy,
            baseCertificate.assessmentStandard,
            baseCertificate.assessmentAssuranceLevel,
            this._buildCertificateDocumentInfo(baseCertificate.document),
            this._buildDocumentEvaluationStatus(baseCertificate.evaluationStatus),
            this._buildCertificateType(baseCertificate.certType),
            new Date(Number(baseCertificate.issueDate)),
            baseCertificate.notes
        );
    }

    static buildCompanyCertificate(companyCertificate: ICPCompanyCertificate): CompanyCertificate {
        return new CompanyCertificate(
            Number(companyCertificate.id),
            companyCertificate.issuer,
            companyCertificate.subject,
            companyCertificate.uploadedBy,
            companyCertificate.assessmentStandard,
            companyCertificate.assessmentAssuranceLevel,
            this._buildCertificateDocumentInfo(companyCertificate.document),
            this._buildDocumentEvaluationStatus(companyCertificate.evaluationStatus),
            this._buildCertificateType(companyCertificate.certType),
            new Date(Number(companyCertificate.issueDate) / 1000),
            new Date(Number(companyCertificate.validFrom)),
            new Date(Number(companyCertificate.validUntil)),
            companyCertificate.notes
        );
    }

    static buildScopeCertificate(scopeCertificate: ICPScopeCertificate): ScopeCertificate {
        return new ScopeCertificate(
            Number(scopeCertificate.id),
            scopeCertificate.issuer,
            scopeCertificate.subject,
            scopeCertificate.uploadedBy,
            scopeCertificate.assessmentStandard,
            scopeCertificate.assessmentAssuranceLevel,
            this._buildCertificateDocumentInfo(scopeCertificate.document),
            this._buildDocumentEvaluationStatus(scopeCertificate.evaluationStatus),
            this._buildCertificateType(scopeCertificate.certType),
            new Date(Number(scopeCertificate.issueDate) / 1000),
            scopeCertificate.processTypes,
            new Date(Number(scopeCertificate.validFrom)),
            new Date(Number(scopeCertificate.validUntil)),
            scopeCertificate.notes
        );
    }

    static buildMaterialCertificate(
        materialCertificate: ICPMaterialCertificate
    ): MaterialCertificate {
        return new MaterialCertificate(
            Number(materialCertificate.id),
            materialCertificate.issuer,
            materialCertificate.subject,
            materialCertificate.uploadedBy,
            materialCertificate.assessmentStandard,
            materialCertificate.assessmentAssuranceLevel,
            this._buildCertificateDocumentInfo(materialCertificate.document),
            this._buildDocumentEvaluationStatus(materialCertificate.evaluationStatus),
            this._buildCertificateType(materialCertificate.certType),
            new Date(Number(materialCertificate.issueDate) / 1000),
            Number(materialCertificate.materialId),
            materialCertificate.notes
        );
    }

    static buildICPCertificateDocumentInfo(
        document: CertificateDocumentInfo
    ): ICPCertificateDocumentInfo {
        return {
            referenceId: document.referenceId,
            documentType: this.buildICPCertificateDocumentType(document.documentType),
            externalUrl: document.externalUrl,
            metadata: document.metadata
        };
    }

    static buildICPEvaluationStatus(evaluationStatus: EvaluationStatus): ICPEvaluationStatus {
        return {
            [evaluationStatus]: null
        } as ICPEvaluationStatus;
    }

    static buildICPCertificateDocumentType(
        documentType: CertificateDocumentType
    ): ICPCertificateDocumentType {
        return {
            [documentType]: null
        } as ICPCertificateDocumentType;
    }

    static _buildCertificateDocumentType(
        documentType: ICPCertificateDocumentType
    ): CertificateDocumentType {
        if (CertificateDocumentType.CERTIFICATE_OF_CONFORMITY in documentType)
            return CertificateDocumentType.CERTIFICATE_OF_CONFORMITY;
        if (CertificateDocumentType.COUNTRY_OF_ORIGIN in documentType)
            return CertificateDocumentType.COUNTRY_OF_ORIGIN;
        if (CertificateDocumentType.SWISS_DECODE in documentType)
            return CertificateDocumentType.SWISS_DECODE;
        if (CertificateDocumentType.PRODUCTION_REPORT in documentType)
            return CertificateDocumentType.PRODUCTION_REPORT;
        if (CertificateDocumentType.PRODUCTION_FACILITY_LICENSE in documentType)
            return CertificateDocumentType.PRODUCTION_FACILITY_LICENSE;
        throw new Error('Invalid document type');
    }

    static _buildDocumentEvaluationStatus(
        documentEvaluationStatus: ICPEvaluationStatus
    ): EvaluationStatus {
        if (ICPEvaluationStatusEnum.NOT_EVALUATED in documentEvaluationStatus)
            return EvaluationStatus.NOT_EVALUATED;
        if (ICPEvaluationStatusEnum.APPROVED in documentEvaluationStatus)
            return EvaluationStatus.APPROVED;
        if (ICPEvaluationStatusEnum.NOT_APPROVED in documentEvaluationStatus)
            return EvaluationStatus.NOT_APPROVED;
        throw new Error('Invalid document evaluation status');
    }

    static _buildCertificateType(certificateType: ICPCertificateType): CertificateType {
        if (CertificateType.COMPANY in certificateType) return CertificateType.COMPANY;
        if (CertificateType.SCOPE in certificateType) return CertificateType.SCOPE;
        if (CertificateType.MATERIAL in certificateType) return CertificateType.MATERIAL;
        throw new Error('Invalid certificate type');
    }

    static _buildCertificateDocumentInfo(
        document: ICPCertificateDocumentInfo
    ): CertificateDocumentInfo {
        return {
            referenceId: document.referenceId,
            documentType: this._buildCertificateDocumentType(document.documentType),
            externalUrl: document.externalUrl,
            metadata: document.metadata
        };
    }

    static _buildOrderStatus(orderStatus: ICPOrderStatus): OrderStatus {
        if (OrderStatus.PENDING in orderStatus) return OrderStatus.PENDING;
        if (OrderStatus.CONFIRMED in orderStatus) return OrderStatus.CONFIRMED;
        if (OrderStatus.EXPIRED in orderStatus) return OrderStatus.EXPIRED;
        throw new Error('Invalid document type');
    }
}
