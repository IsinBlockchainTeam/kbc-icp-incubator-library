import { Material } from '../entities/Material';
import { AssetOperation } from '../entities/AssetOperation';
import { Trade } from '../smart-contracts/contracts/BasicTrade';
import {
    DocumentManager,
    MaterialManager,
    OfferManager,
    OrderTrade,
    RelationshipManager,
    AssetOperationManager,
    ProductCategoryManager,
    CertificateManager
} from '../smart-contracts';
import { Relationship } from '../entities/Relationship';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Offer } from '../entities/Offer';
import { Line } from '../entities/Trade';
import { OrderLine, OrderLinePrice } from '../entities/OrderTrade';
import { ProductCategory } from '../entities/ProductCategory';
import { CompanyCertificate } from '../entities/CompanyCertificate';
import { ScopeCertificate } from '../entities/ScopeCertificate';
import { MaterialCertificate } from '../entities/MaterialCertificate';
import { BaseCertificate } from '../entities/Certificate';

export class EntityBuilder {
    static buildProductCategory(
        bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput
    ): ProductCategory {
        return new ProductCategory(
            bcProductCategory.id.toNumber(),
            bcProductCategory.name,
            bcProductCategory.quality,
            bcProductCategory.description
        );
    }

    static buildMaterial(
        bcMaterial: MaterialManager.MaterialStructOutput,
        productCategory: ProductCategoryManager.ProductCategoryStructOutput
    ): Material {
        if (bcMaterial.productCategoryId.toNumber() !== productCategory.id.toNumber())
            throw new Error('Product category id of material and product category must be equal');

        return new Material(bcMaterial.id.toNumber(), this.buildProductCategory(productCategory));
    }

    static buildAssetOperation(
        bcAssetOperation: AssetOperationManager.AssetOperationStructOutput,
        inputMaterials: MaterialManager.MaterialStructOutput[],
        inputProductCategories: ProductCategoryManager.ProductCategoryStructOutput[],
        outputMaterial: MaterialManager.MaterialStructOutput,
        outputProductCategories: ProductCategoryManager.ProductCategoryStructOutput
    ): AssetOperation {
        if (inputMaterials.length !== inputProductCategories.length)
            throw new Error(
                'Input materials and input product categories must have the same length'
            );

        const builtInputMaterials: Material[] = [];
        for (let i = 0; i < inputMaterials.length; i++) {
            builtInputMaterials.push(
                this.buildMaterial(inputMaterials[i], inputProductCategories[i])
            );
        }

        return new AssetOperation(
            bcAssetOperation.id.toNumber(),
            bcAssetOperation.name,
            builtInputMaterials,
            this.buildMaterial(outputMaterial, outputProductCategories),
            bcAssetOperation.latitude,
            bcAssetOperation.longitude,
            bcAssetOperation.processTypes
        );
    }

    static buildRelationship(
        bcRelationship: RelationshipManager.RelationshipStructOutput
    ): Relationship {
        return new Relationship(
            bcRelationship.id.toNumber(),
            bcRelationship.companyA,
            bcRelationship.companyB,
            new Date(bcRelationship.validFrom.toNumber()),
            new Date(bcRelationship.validUntil.toNumber())
        );
    }

    static buildDocumentInfo(bcDocument: DocumentManager.DocumentStructOutput): DocumentInfo {
        return new DocumentInfo(
            bcDocument.id.toNumber(),
            bcDocument.externalUrl,
            bcDocument.contentHash,
            bcDocument.uploadedBy
        );
    }

    static buildOffer(
        bcOffer: OfferManager.OfferStructOutput,
        bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput
    ): Offer {
        return new Offer(
            bcOffer.id.toNumber(),
            bcOffer.owner,
            this.buildProductCategory(bcProductCategory)
        );
    }

    static buildTradeLine(
        bcLine: Trade.LineStructOutput,
        bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput,
        bcMaterial?: MaterialManager.MaterialStructOutput
    ): Line {
        if (bcMaterial)
            return new Line(
                bcLine.id.toNumber(),
                this.buildMaterial(bcMaterial, bcProductCategory),
                this.buildProductCategory(bcProductCategory),
                bcLine.quantity.toNumber(),
                bcLine.unit
            );
        return new Line(
            bcLine.id.toNumber(),
            undefined,
            this.buildProductCategory(bcProductCategory),
            bcLine.quantity.toNumber(),
            bcLine.unit
        );
    }

    static buildOrderLinePrice(
        bcOrderLinePrice: OrderTrade.OrderLinePriceStructOutput
    ): OrderLinePrice {
        const amount = parseFloat(
            `${bcOrderLinePrice.amount.toNumber()}.${bcOrderLinePrice.decimals.toNumber()}`
        );
        return new OrderLinePrice(amount, bcOrderLinePrice.fiat);
    }

    static buildOrderLine(
        bcLine: Trade.LineStructOutput,
        bcOrderLine: OrderTrade.OrderLineStructOutput,
        bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput,
        bcMaterial?: MaterialManager.MaterialStructOutput
    ): OrderLine {
        const line: Line = this.buildTradeLine(bcLine, bcProductCategory, bcMaterial);
        const price: OrderLinePrice = this.buildOrderLinePrice(bcOrderLine.price);
        return new OrderLine(
            line.id,
            line.material,
            line.productCategory,
            bcLine.quantity.toNumber(),
            bcLine.unit,
            price
        );
    }

    static buildBaseCertificate(
        bcBaseCertificate: CertificateManager.BaseInfoStructOutput
    ): BaseCertificate {
        return new BaseCertificate(
            bcBaseCertificate.id.toNumber(),
            bcBaseCertificate.issuer,
            bcBaseCertificate.consigneeCompany,
            bcBaseCertificate.assessmentStandard,
            bcBaseCertificate.documentId.toNumber(),
            bcBaseCertificate.evaluationStatus,
            bcBaseCertificate.certificateType,
            new Date(bcBaseCertificate.issueDate.toNumber())
        );
    }

    static buildCompanyCertificate(
        bcCompanyCertificate: CertificateManager.CompanyCertificateStructOutput
    ): CompanyCertificate {
        return new CompanyCertificate(
            bcCompanyCertificate.baseInfo.id.toNumber(),
            bcCompanyCertificate.baseInfo.issuer,
            bcCompanyCertificate.baseInfo.consigneeCompany,
            bcCompanyCertificate.baseInfo.assessmentStandard,
            bcCompanyCertificate.baseInfo.documentId.toNumber(),
            bcCompanyCertificate.baseInfo.evaluationStatus,
            bcCompanyCertificate.baseInfo.certificateType,
            new Date(bcCompanyCertificate.baseInfo.issueDate.toNumber()),
            new Date(bcCompanyCertificate.validFrom.toNumber()),
            new Date(bcCompanyCertificate.validUntil.toNumber())
        );
    }

    static buildScopeCertificate(
        bcScopeCertificate: CertificateManager.ScopeCertificateStructOutput
    ): ScopeCertificate {
        return new ScopeCertificate(
            bcScopeCertificate.baseInfo.id.toNumber(),
            bcScopeCertificate.baseInfo.issuer,
            bcScopeCertificate.baseInfo.consigneeCompany,
            bcScopeCertificate.baseInfo.assessmentStandard,
            bcScopeCertificate.baseInfo.documentId.toNumber(),
            bcScopeCertificate.baseInfo.evaluationStatus,
            bcScopeCertificate.baseInfo.certificateType,
            new Date(bcScopeCertificate.baseInfo.issueDate.toNumber()),
            bcScopeCertificate.processTypes,
            new Date(bcScopeCertificate.validFrom.toNumber()),
            new Date(bcScopeCertificate.validUntil.toNumber())
        );
    }

    static buildMaterialCertificate(
        bcMaterialCertificate: CertificateManager.MaterialCertificateStructOutput
    ): MaterialCertificate {
        return new MaterialCertificate(
            bcMaterialCertificate.baseInfo.id.toNumber(),
            bcMaterialCertificate.baseInfo.issuer,
            bcMaterialCertificate.baseInfo.consigneeCompany,
            bcMaterialCertificate.baseInfo.assessmentStandard,
            bcMaterialCertificate.baseInfo.documentId.toNumber(),
            bcMaterialCertificate.baseInfo.evaluationStatus,
            bcMaterialCertificate.baseInfo.certificateType,
            new Date(bcMaterialCertificate.baseInfo.issueDate.toNumber()),
            bcMaterialCertificate.materialId.toNumber()
        );
    }
}
