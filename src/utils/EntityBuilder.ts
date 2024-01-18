import { Material } from '../entities/Material';
import { AssetOperation } from '../entities/AssetOperation';
import { Trade } from '../smart-contracts/contracts/BasicTrade';
import {
    DocumentManager,
    MaterialManager, OfferManager, OrderTrade,
    RelationshipManager,
    AssetOperationManager, ProductCategoryManager,
} from '../smart-contracts';
import { Relationship } from '../entities/Relationship';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Offer } from '../entities/Offer';
import { Line } from '../entities/Trade';
import { OrderLine, OrderLinePrice } from '../entities/OrderTrade';
import { ProductCategory } from '../entities/ProductCategory';

export class EntityBuilder {
    static buildProductCategory(bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput): ProductCategory {
        return new ProductCategory(bcProductCategory.id.toNumber(), bcProductCategory.name, bcProductCategory.quality, bcProductCategory.description);
    }

    static buildMaterial(bcMaterial: MaterialManager.MaterialStructOutput, productCategory: ProductCategoryManager.ProductCategoryStructOutput): Material {
        return new Material(bcMaterial.id.toNumber(), this.buildProductCategory(productCategory));
    }

    static buildTransformation(bcTransformation: AssetOperationManager.AssetOperationStructOutput, inputMaterials: Material[], outputMaterial: Material): AssetOperation {
        return new AssetOperation(bcTransformation.id.toNumber(), bcTransformation.name, inputMaterials, outputMaterial);
    }

    static buildRelationship(bcRelationship: RelationshipManager.RelationshipStructOutput): Relationship {
        return new Relationship(bcRelationship.id.toNumber(), bcRelationship.companyA, bcRelationship.companyB, new Date(bcRelationship.validFrom.toNumber()), new Date(bcRelationship.validUntil.toNumber()));
    }

    static buildDocumentInfo(bcDocument: DocumentManager.DocumentStructOutput): DocumentInfo {
        return new DocumentInfo(bcDocument.id.toNumber(), bcDocument.transactionId.toNumber(), bcDocument.name, bcDocument.documentType, bcDocument.externalUrl);
    }

    static buildOffer(bcOffer: OfferManager.OfferStructOutput): Offer {
        return new Offer(bcOffer.id.toNumber(), bcOffer.owner, bcOffer.productCategory);
    }

    static buildTradeLine(bcLine: Trade.LineStructOutput, material: Material, productCategory: ProductCategory): Line {
        return new Line(bcLine.id.toNumber(), material, productCategory);
    }

    static buildOrderLinePrice(bcOrderLinePrice: OrderTrade.OrderLinePriceStructOutput): OrderLinePrice {
        const amount = parseFloat(`${bcOrderLinePrice.amount.toNumber()}.${bcOrderLinePrice.decimals.toNumber()}`);
        return new OrderLinePrice(amount, bcOrderLinePrice.fiat);
    }

    static buildOrderLine(bcLine: Trade.LineStructOutput, bcOrderLine: OrderTrade.OrderLineStructOutput, material: Material, productCategory: ProductCategory): OrderLine {
        const line: Line = this.buildTradeLine(bcLine, material, productCategory);
        const price: OrderLinePrice = this.buildOrderLinePrice(bcOrderLine.price);
        return new OrderLine(line.id, line.material, line.productCategory, bcOrderLine.quantity.toNumber(), price);
    }
}
