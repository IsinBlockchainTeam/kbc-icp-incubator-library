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
        if (bcMaterial.productCategoryId.toNumber() !== productCategory.id.toNumber())
            throw new Error('Product category id of material and product category must be equal');

        return new Material(bcMaterial.id.toNumber(), this.buildProductCategory(productCategory));
    }

    static buildTransformation(bcTransformation: AssetOperationManager.AssetOperationStructOutput, inputMaterials: MaterialManager.MaterialStructOutput[], inputProductCategories: ProductCategoryManager.ProductCategoryStructOutput[], outputMaterial: MaterialManager.MaterialStructOutput, outputProductCategories: ProductCategoryManager.ProductCategoryStructOutput): AssetOperation {
        if (inputMaterials.length !== inputProductCategories.length)
            throw new Error('Input materials and input product categories must have the same length');

        const builtInputMaterials: Material[] = [];
        for (let i = 0; i < inputMaterials.length; i++) {
            builtInputMaterials.push(this.buildMaterial(inputMaterials[i], inputProductCategories[i]));
        }

        return new AssetOperation(bcTransformation.id.toNumber(), bcTransformation.name, builtInputMaterials, this.buildMaterial(outputMaterial, outputProductCategories));
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

    static buildTradeLine(bcLine: Trade.LineStructOutput, bcMaterial: MaterialManager.MaterialStructOutput, bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput): Line {
        return new Line(bcLine.id.toNumber(), this.buildMaterial(bcMaterial, bcProductCategory), this.buildProductCategory(bcProductCategory));
    }

    static buildOrderLinePrice(bcOrderLinePrice: OrderTrade.OrderLinePriceStructOutput): OrderLinePrice {
        const amount = parseFloat(`${bcOrderLinePrice.amount.toNumber()}.${bcOrderLinePrice.decimals.toNumber()}`);
        return new OrderLinePrice(amount, bcOrderLinePrice.fiat);
    }

    static buildOrderLine(bcLine: Trade.LineStructOutput, bcOrderLine: OrderTrade.OrderLineStructOutput, bcMaterial: MaterialManager.MaterialStructOutput, bcProductCategory: ProductCategoryManager.ProductCategoryStructOutput): OrderLine {
        const line: Line = this.buildTradeLine(bcLine, bcMaterial, bcProductCategory);
        const price: OrderLinePrice = this.buildOrderLinePrice(bcOrderLine.price);
        return new OrderLine(line.id, line.material, line.productCategory, bcOrderLine.quantity.toNumber(), price);
    }
}
