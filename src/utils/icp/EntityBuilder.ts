import {
    ProductCategory as ICPProductCategory,
    Order as ICPOrder,
    OrderStatus as ICPOrderStatus,
  BaseCertificate as IDLBaseCertificate,
  CompanyCertificate as IDLCompanyCertificate,
  CertificateType as IDLCertificateType,
  CertificateDocumentInfo as IDLCertificateDocumentInfo,
  CertificateDocumentType as IDLCertificateDocumentType,
  EvaluationStatus as IDLEvaluationStatus,
  EvaluationStatusEnum as IDLEvaluationStatusEnum,
  MaterialCertificate as IDLMaterialCertificate,
  ScopeCertificate as IDLScopeCertificate
} from '@kbc-lib/azle-types';
import {Order, OrderStatus} from "../../entities/icp/Order";
import {ProductCategory} from "../../entities/ProductCategory";
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

    static buildBaseCertificate(baseCertificate: IDLBaseCertificate): BaseCertificate {
        return new BaseCertificate(
            Number(baseCertificate.id),
            baseCertificate.issuer,
            baseCertificate.subject,
            baseCertificate.uploadedBy,
            baseCertificate.assessmentStandard,
            baseCertificate.assessmentAssuranceLevel,
            baseCertificate.referenceId,
            this._buildCertificateDocumentInfo(baseCertificate.document),
            this._buildDocumentEvaluationStatus(baseCertificate.evaluationStatus),
            this._buildCertificateType(baseCertificate.certType),
            new Date(Number(baseCertificate.issueDate) * 1000)
        );
    }

    static buildCompanyCertificate(companyCertificate: IDLCompanyCertificate): CompanyCertificate {
        return new CompanyCertificate(
            Number(companyCertificate.id),
            companyCertificate.issuer,
            companyCertificate.subject,
            companyCertificate.uploadedBy,
            companyCertificate.assessmentStandard,
            companyCertificate.assessmentAssuranceLevel,
            companyCertificate.referenceId,
            this._buildCertificateDocumentInfo(companyCertificate.document),
            this._buildDocumentEvaluationStatus(companyCertificate.evaluationStatus),
            this._buildCertificateType(companyCertificate.certType),
            new Date(Number(companyCertificate.issueDate)),
            new Date(Number(companyCertificate.validFrom)),
            new Date(Number(companyCertificate.validUntil))
        );
    }

    static buildScopeCertificate(scopeCertificate: IDLScopeCertificate): ScopeCertificate {
        return new ScopeCertificate(
            Number(scopeCertificate.id),
            scopeCertificate.issuer,
            scopeCertificate.subject,
            scopeCertificate.uploadedBy,
            scopeCertificate.assessmentStandard,
            scopeCertificate.assessmentAssuranceLevel,
            scopeCertificate.referenceId,
            this._buildCertificateDocumentInfo(scopeCertificate.document),
            this._buildDocumentEvaluationStatus(scopeCertificate.evaluationStatus),
            this._buildCertificateType(scopeCertificate.certType),
            new Date(Number(scopeCertificate.issueDate)),
            scopeCertificate.processTypes,
            new Date(Number(scopeCertificate.validFrom)),
            new Date(Number(scopeCertificate.validUntil))
        );
    }

    static buildMaterialCertificate(
        materialCertificate: IDLMaterialCertificate
    ): MaterialCertificate {
        return new MaterialCertificate(
            Number(materialCertificate.id),
            materialCertificate.issuer,
            materialCertificate.subject,
            materialCertificate.uploadedBy,
            materialCertificate.assessmentStandard,
            materialCertificate.assessmentAssuranceLevel,
            materialCertificate.referenceId,
            this._buildCertificateDocumentInfo(materialCertificate.document),
            this._buildDocumentEvaluationStatus(materialCertificate.evaluationStatus),
            this._buildCertificateType(materialCertificate.certType),
            new Date(Number(materialCertificate.issueDate)),
            Number(materialCertificate.materialId)
        );
    }

    static buildIDLCertificateDocumentInfo(
        document: CertificateDocumentInfo
    ): IDLCertificateDocumentInfo {
        return {
            id: BigInt(document.id),
            docType: this.buildIDLCertificateDocumentType(document.documentType),
            externalUrl: document.externalUrl
        };
    }

    static buildIDLEvaluationStatus(evaluationStatus: EvaluationStatus): IDLEvaluationStatus {
        return {
            [evaluationStatus]: null
        } as IDLEvaluationStatus;
    }

    static buildIDLCertificateDocumentType(
        documentType: CertificateDocumentType
    ): IDLCertificateDocumentType {
        return {
            [documentType]: null
        } as IDLCertificateDocumentType;
    }

    static _buildCertificateDocumentType(
        documentType: IDLCertificateDocumentType
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
        documentEvaluationStatus: IDLEvaluationStatus
    ): EvaluationStatus {
        if (IDLEvaluationStatusEnum.NOT_EVALUATED in documentEvaluationStatus)
            return EvaluationStatus.NOT_EVALUATED;
        if (IDLEvaluationStatusEnum.APPROVED in documentEvaluationStatus)
            return EvaluationStatus.APPROVED;
        if (IDLEvaluationStatusEnum.NOT_APPROVED in documentEvaluationStatus)
            return EvaluationStatus.NOT_APPROVED;
        throw new Error('Invalid document evaluation status');
    }

    static _buildCertificateType(certificateType: IDLCertificateType): CertificateType {
        if (CertificateType.COMPANY in certificateType) return CertificateType.COMPANY;
        if (CertificateType.SCOPE in certificateType) return CertificateType.SCOPE;
        if (CertificateType.MATERIAL in certificateType) return CertificateType.MATERIAL;
        throw new Error('Invalid certificate type');
    }

    static _buildCertificateDocumentInfo(
        document: IDLCertificateDocumentInfo
    ): CertificateDocumentInfo {
        return {
            id: Number(document.id),
            documentType: this._buildCertificateDocumentType(document.docType),
            externalUrl: document.externalUrl
        };
    }

    static _buildOrderStatus(orderStatus: IDLOrderStatus): OrderStatus {
        if (OrderStatus.PENDING in orderStatus) return OrderStatus.PENDING;
        if (OrderStatus.CONFIRMED in orderStatus) return OrderStatus.CONFIRMED;
        if (OrderStatus.EXPIRED in orderStatus) return OrderStatus.EXPIRED;
        throw new Error('Invalid document type');
    }
}
