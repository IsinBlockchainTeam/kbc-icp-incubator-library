import { BigNumber } from 'ethers';
import { MaterialStructOutput, TransformationStructOutput } from '../smart-contracts/contracts/SupplyChainManager';
import { Material } from '../entities/Material';
import { EntityBuilder } from './EntityBuilder';
import { BasicTradeInfo } from '../entities/BasicTradeInfo';
import { DocumentManager, RelationshipManager, TradeManager } from '../smart-contracts';
import { TradeLine } from '../entities/TradeLine';
import { OrderInfo } from '../entities/OrderInfo';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { Relationship } from '../entities/Relationship';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Transformation } from '../entities/Transformation';
import { Trade } from '../entities/Trade';

describe('EntityBuilder', () => {
    describe('buildMaterial', () => {
        it('should correctly build a material', () => {
            const bcMaterial: MaterialStructOutput = [BigNumber.from(0), 'material', 'owner'] as MaterialStructOutput;
            bcMaterial.id = BigNumber.from(0);
            bcMaterial.name = 'material';
            bcMaterial.owner = 'owner';

            expect(EntityBuilder.buildMaterial(bcMaterial)).toEqual(new Material(0, 'material', 'owner'));
        });
    });

    describe('buildTransformation', () => {
        it('should correctly build a transformation', () => {
            const bcTransformation: TransformationStructOutput = [BigNumber.from(0), 'transformation', [BigNumber.from(1), BigNumber.from(2)], BigNumber.from(3), 'owner'] as TransformationStructOutput;
            bcTransformation.id = BigNumber.from(0);
            bcTransformation.name = 'transformation';
            bcTransformation.inputMaterialsIds = [BigNumber.from(1), BigNumber.from(2)];
            bcTransformation.outputMaterialId = BigNumber.from(3);
            bcTransformation.owner = 'owner';

            expect(EntityBuilder.buildTransformation(bcTransformation)).toEqual(new Transformation(0, 'transformation', [1, 2], 3, 'owner'));
        });
    });

    describe('buildGeneralTrade', () => {
        it('should correctly build a Trade', () => {
            const bcTrade = {
                id: BigNumber.from(0),
                tradeType: 0,
                supplier: 'supplier',
                customer: 'customer',
                externalUrl: 'extUrl',
                lineIds: [BigNumber.from(1)],
            };

            expect(EntityBuilder.buildGeneralTrade(bcTrade)).toEqual(new Trade(bcTrade.id.toNumber(), bcTrade.supplier, bcTrade.customer, bcTrade.externalUrl, bcTrade.lineIds.map((id) => id.toNumber()), bcTrade.tradeType));
        });
    });

    describe('buildBasicTradeInfo', () => {
        it('should correctly build a BasicTradeInfo', () => {
            const bcTrade = {
                id: BigNumber.from(0),
                name: 'trade 1',
                supplier: 'supplier',
                customer: 'customer',
                externalUrl: 'extUrl',
                lineIds: [BigNumber.from(1)],
            };

            expect(EntityBuilder.buildBasicTradeInfo(bcTrade)).toEqual(new BasicTradeInfo(bcTrade.id.toNumber(), bcTrade.supplier, bcTrade.customer, bcTrade.externalUrl, bcTrade.lineIds.map((id) => id.toNumber()), bcTrade.name));
        });
    });

    describe('buildTradeLine', () => {
        const bcTradeLinePrice: TradeManager.OrderLinePriceStructOutput = [BigNumber.from(10005), BigNumber.from(2), 'CHF'] as TradeManager.OrderLinePriceStructOutput;

        it('should correctly build a TradeLine', () => {
            const bcTradeLine: TradeManager.TradeLineStructOutput = [BigNumber.from(0), [BigNumber.from(1), BigNumber.from(2)], 'categoryA', BigNumber.from(100), bcTradeLinePrice, true] as TradeManager.TradeLineStructOutput;
            bcTradeLine.id = BigNumber.from(0);
            bcTradeLine.productCategory = 'categoryA';
            bcTradeLine.materialIds = [BigNumber.from(1), BigNumber.from(2)];
            bcTradeLine.exists = true;

            expect(EntityBuilder.buildTradeLine(bcTradeLine)).toEqual(new TradeLine(bcTradeLine.id.toNumber(), [bcTradeLine.materialIds[0].toNumber(), bcTradeLine.materialIds[1].toNumber()], bcTradeLine.productCategory));
        });
    });

    describe('buildOrderInfo', () => {
        it('should correctly build an OrderInfo', () => {
            const bcOrder = {
                id: BigNumber.from(0),
                supplier: 'supplier',
                customer: 'customer',
                offeree: 'offeree',
                offeror: 'offeror',
                externalUrl: 'extUrl',
                lineIds: [BigNumber.from(1)],
                paymentDeadline: BigNumber.from(1692001147),
                documentDeliveryDeadline: BigNumber.from(1692001147),
                arbiter: 'arbiter',
                shippingDeadline: BigNumber.from(1692001147),
                deliveryDeadline: BigNumber.from(1692001147),
            };
            expect(EntityBuilder.buildOrderInfo(bcOrder)).toEqual(
                new OrderInfo(bcOrder.id.toNumber(), bcOrder.supplier, bcOrder.customer, bcOrder.externalUrl, bcOrder.offeree, bcOrder.offeror,
                    bcOrder.lineIds.map((l) => l.toNumber()), new Date(bcOrder.paymentDeadline.toNumber()), new Date(bcOrder.documentDeliveryDeadline.toNumber()),
                    bcOrder.arbiter, new Date(bcOrder.shippingDeadline.toNumber()), new Date(bcOrder.deliveryDeadline.toNumber())),
            );
        });
    });

    describe('buildOrderLine', () => {
        const bcOrderLinePrice: TradeManager.OrderLinePriceStructOutput = [BigNumber.from(10005), BigNumber.from(2), 'CHF'] as TradeManager.OrderLinePriceStructOutput;

        it('should correctly build an OrderLinePrice', () => {
            bcOrderLinePrice.amount = BigNumber.from(10005);
            bcOrderLinePrice.decimals = BigNumber.from(2);
            bcOrderLinePrice.fiat = 'CHF';

            expect(EntityBuilder.buildOrderLinePrice(bcOrderLinePrice)).toEqual(new OrderLinePrice(bcOrderLinePrice.amount.toNumber() / BigNumber.from(10).pow(bcOrderLinePrice.decimals).toNumber(), bcOrderLinePrice.fiat));
        });

        it('should correctly build an OrderLine', () => {
            const bcTradeLine: TradeManager.TradeLineStructOutput = [BigNumber.from(0), [BigNumber.from(1), BigNumber.from(2)], 'categoryA', BigNumber.from(40), bcOrderLinePrice, true] as TradeManager.TradeLineStructOutput;
            bcTradeLine.id = BigNumber.from(0);
            bcTradeLine.productCategory = 'categoryA';
            bcTradeLine.materialIds = [BigNumber.from(1), BigNumber.from(2)];
            bcTradeLine.quantity = BigNumber.from(40);
            bcTradeLine.price = bcOrderLinePrice;
            bcTradeLine.exists = true;

            expect(EntityBuilder.buildOrderLine(bcTradeLine)).toEqual(new OrderLine(bcTradeLine.id.toNumber(), [bcTradeLine.materialIds[0].toNumber(), bcTradeLine.materialIds[1].toNumber()], bcTradeLine.productCategory,
                bcTradeLine.quantity.toNumber(), EntityBuilder.buildOrderLinePrice(bcTradeLine.price)));
        });
    });

    describe('buildRelationship', () => {
        it('should correctly build a relationship', () => {
            const bcRelationship: RelationshipManager.RelationshipStructOutput = [BigNumber.from(0), 'companyA_address', 'companyB_address', BigNumber.from(1692001147), BigNumber.from(0), true] as RelationshipManager.RelationshipStructOutput;
            bcRelationship.id = BigNumber.from(0);
            bcRelationship.companyA = 'companyA';
            bcRelationship.companyB = 'companyB';
            bcRelationship.validFrom = BigNumber.from(1692001147);
            bcRelationship.validUntil = BigNumber.from(0);
            bcRelationship.exists = true;

            const relationship = new Relationship(0, 'companyA', 'companyB', new Date(1692001147), new Date(0));
            expect(EntityBuilder.buildRelationship(bcRelationship)).toEqual(relationship);
            expect(relationship.validUntil).toBeUndefined();
        });
    });

    describe('buildDocument', () => {
        it('should correctly build a document', () => {
            const bcDocument: DocumentManager.DocumentStructOutput = [BigNumber.from(0), 'owner', BigNumber.from(2), 'doc name', 'doc type', 'external url', true] as DocumentManager.DocumentStructOutput;
            bcDocument.id = BigNumber.from(0);
            bcDocument.owner = 'owner';
            bcDocument.transactionId = BigNumber.from(2);
            bcDocument.name = 'doc name';
            bcDocument.documentType = 'doc type';
            bcDocument.externalUrl = 'external url';
            bcDocument.exists = true;

            const document = new DocumentInfo(0, 'owner', 2, 'doc name', 'doc type', 'external url');
            expect(EntityBuilder.buildDocument(bcDocument)).toEqual(document);
        });
    });
});
