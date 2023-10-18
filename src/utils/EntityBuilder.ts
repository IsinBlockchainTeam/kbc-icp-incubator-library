import { BigNumber } from 'ethers';
import { Material } from '../entities/Material';
import { Transformation } from '../entities/Transformation';
import { OrderInfo } from '../entities/OrderInfo';
import { DocumentManager, RelationshipManager, TradeManager } from '../smart-contracts';
import { MaterialStructOutput, TransformationStructOutput } from '../smart-contracts/contracts/SupplyChainManager';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { Relationship } from '../entities/Relationship';
import { DocumentInfo } from '../entities/DocumentInfo';
import { BasicTradeInfo } from '../entities/BasicTradeInfo';
import { TradeLine } from '../entities/TradeLine';
import { Trade } from '../entities/Trade';

export class EntityBuilder {
    static buildMaterial(bcMaterial: MaterialStructOutput): Material {
        return new Material(bcMaterial.id.toNumber(), bcMaterial.name, bcMaterial.owner);
    }

    static buildTransformation(bcTransformation: TransformationStructOutput): Transformation {
        return new Transformation(bcTransformation.id.toNumber(), bcTransformation.name, bcTransformation.inputMaterials.map((m) => this.buildMaterial(m)), bcTransformation.outputMaterialId.toNumber(), bcTransformation.owner);
    }

    static buildGeneralTrade(bcTrade: {id: BigNumber, tradeType: number, supplier: string, customer: string, externalUrl: string, lineIds: BigNumber[]}): Trade {
        return new Trade(bcTrade.id.toNumber(), bcTrade.supplier, bcTrade.customer, bcTrade.externalUrl, bcTrade.lineIds.map((id) => id.toNumber()), bcTrade.tradeType);
    }

    static buildBasicTradeInfo(bcTrade: {id: BigNumber, name: string, supplier: string, customer: string, externalUrl: string, lineIds: BigNumber[]}): BasicTradeInfo {
        return new BasicTradeInfo(bcTrade.id.toNumber(), bcTrade.supplier, bcTrade.customer, bcTrade.externalUrl, bcTrade.lineIds.map((id) => id.toNumber()), bcTrade.name);
    }

    static buildTradeLine(bcTradeLine: TradeManager.TradeLineStructOutput): TradeLine {
        return new TradeLine(bcTradeLine.id.toNumber(), [bcTradeLine.materialIds[0].toNumber(), bcTradeLine.materialIds[1].toNumber()], bcTradeLine.productCategory);
    }

    static buildOrderInfo(bcOrder: { id: BigNumber, supplier: string, customer: string, offeree: string, offeror: string, externalUrl: string, lineIds: BigNumber[], paymentDeadline: BigNumber,
                        documentDeliveryDeadline: BigNumber, arbiter: string, shippingDeadline: BigNumber, deliveryDeadline: BigNumber }): OrderInfo {
        return new OrderInfo(bcOrder.id.toNumber(), bcOrder.supplier, bcOrder.customer, bcOrder.externalUrl, bcOrder.offeree, bcOrder.offeror,
            bcOrder.lineIds.map((l) => l.toNumber()), new Date(bcOrder.paymentDeadline.toNumber()), new Date(bcOrder.documentDeliveryDeadline.toNumber()),
            bcOrder.arbiter, new Date(bcOrder.shippingDeadline.toNumber()), new Date(bcOrder.deliveryDeadline.toNumber()));
    }

    static buildOrderLinePrice(bcOrderLinePrice: TradeManager.OrderLinePriceStructOutput): OrderLinePrice {
        return new OrderLinePrice(bcOrderLinePrice.amount.toNumber() / BigNumber.from(10).pow(bcOrderLinePrice.decimals).toNumber(), bcOrderLinePrice.fiat);
    }

    static buildOrderLine(bcTradeLine: TradeManager.TradeLineStructOutput): OrderLine {
        return new OrderLine(bcTradeLine.id.toNumber(), [bcTradeLine.materialIds[0].toNumber(), bcTradeLine.materialIds[1].toNumber()], bcTradeLine.productCategory,
            bcTradeLine.quantity.toNumber(), this.buildOrderLinePrice(bcTradeLine.price));
    }

    static buildRelationship(bcRelationship: RelationshipManager.RelationshipStructOutput): Relationship {
        return new Relationship(bcRelationship.id.toNumber(), bcRelationship.companyA, bcRelationship.companyB, new Date(bcRelationship.validFrom.toNumber()), new Date(bcRelationship.validUntil.toNumber()));
    }

    static buildDocumentInfo(bcDocument: DocumentManager.DocumentStructOutput): DocumentInfo {
        return new DocumentInfo(bcDocument.id.toNumber(), bcDocument.transactionId.toNumber(), bcDocument.name, bcDocument.documentType, bcDocument.externalUrl, bcDocument.transactionLineId.toNumber());
    }
}
