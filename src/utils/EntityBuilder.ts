import { Material } from '../entities/Material';
import { AssetOperation } from '../entities/AssetOperation.test';
import { Trade } from '../smart-contracts/contracts/BasicTrade';
import {
    DocumentManager,
    MaterialManager, OfferManager, OrderTrade,
    RelationshipManager,
    TransformationManager,
} from '../smart-contracts';
import { Relationship } from '../entities/Relationship';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Offer } from '../entities/Offer';
import { Line } from '../entities/Trade';
import { OrderLine, OrderLinePrice } from '../entities/OrderTrade';

export class EntityBuilder {
    static buildMaterial(bcMaterial: MaterialManager.MaterialStructOutput): Material {
        return new Material(bcMaterial.id.toNumber(), bcMaterial.name, bcMaterial.owner);
    }

    static buildTransformation(bcTransformation: TransformationManager.TransformationStructOutput): AssetOperation {
        return new AssetOperation(bcTransformation.id.toNumber(), bcTransformation.name, bcTransformation.inputMaterials.map((m) => this.buildMaterial(m)), bcTransformation.outputMaterialId.toNumber(), bcTransformation.owner);
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

    static buildTradeLine(bcLine: Trade.LineStructOutput): Line {
        const materialsId: [number, number] = [
            bcLine.materialsId[0].toNumber(),
            bcLine.materialsId[1].toNumber(),
        ];
        return new Line(bcLine.id.toNumber(), materialsId, bcLine.productCategory);
    }

    static buildOrderLinePrice(bcOrderLinePrice: OrderTrade.OrderLinePriceStructOutput): OrderLinePrice {
        const amount = parseFloat(`${bcOrderLinePrice.amount.toNumber()}.${bcOrderLinePrice.decimals.toNumber()}`);
        return new OrderLinePrice(amount, bcOrderLinePrice.fiat);
    }

    static buildOrderLine(bcLine: Trade.LineStructOutput, bcOrderLine: OrderTrade.OrderLineStructOutput): OrderLine {
        const line: Line = this.buildTradeLine(bcLine);
        const price: OrderLinePrice = this.buildOrderLinePrice(bcOrderLine.price);
        return new OrderLine(line.id, line.materialsId, line.productCategory, bcOrderLine.quantity.toNumber(), price);
    }
}
