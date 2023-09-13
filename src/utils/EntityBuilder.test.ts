import { BigNumber } from 'ethers';
import { EntityBuilder } from './EntityBuilder';
import { Material } from '../entities/Material';
import {
    MaterialStructOutput,
    TradeStructOutput,
    TransformationStructOutput,
} from '../smart-contracts/contracts/SupplyChainManager';
import { Trade } from '../entities/Trade';
import { Transformation } from '../entities/Transformation';
import { DocumentManager, OrderManager, RelationshipManager } from '../smart-contracts';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { Order } from '../entities/Order';
import { Relationship } from '../entities/Relationship';
import { DocumentInfo } from '../entities/DocumentInfo';

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

    describe('buildTrade', () => {
        it('should correctly build a trade', () => {
            const bcTrade: TradeStructOutput = [BigNumber.from(0), 'trade', [[BigNumber.from(1), BigNumber.from(2)]], 'owner'] as TradeStructOutput;
            bcTrade.id = BigNumber.from(0);
            bcTrade.name = 'trade';
            bcTrade.materialsIds = [[BigNumber.from(1), BigNumber.from(2)]];
            bcTrade.owner = 'owner';

            expect(EntityBuilder.buildTrade(bcTrade)).toEqual(new Trade(0, 'trade', [[1, 2]], 'owner'));
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

    describe('build order', () => {
        it('should correctly build an Order', () => {
            const bcOrder = {
                id: BigNumber.from(0),
                supplier: 'supplier',
                customer: 'customer',
                offeree: 'offeree',
                offeror: 'offeror',
                externalUrl: 'extUrl',
                lineIds: [BigNumber.from(1)],
                incoterms: 'FOB',
                paymentDeadline: BigNumber.from(1692001147),
                documentDeliveryDeadline: BigNumber.from(1692001147),
                shipper: 'shipper',
                arbiter: 'arbiter',
                shippingPort: 'shippingPort',
                shippingDeadline: BigNumber.from(1692001147),
                deliveryPort: 'deliveryPort',
                deliveryDeadline: BigNumber.from(1692001147),
                status: 'status',
            };
            expect(EntityBuilder.buildOrder(bcOrder)).toEqual(
                new Order(bcOrder.id.toNumber(), bcOrder.supplier, bcOrder.customer, bcOrder.externalUrl, bcOrder.offeree, bcOrder.offeror, bcOrder.lineIds.map((l) => l.toNumber()),
                    bcOrder.incoterms, new Date(bcOrder.paymentDeadline.toNumber()), new Date(bcOrder.documentDeliveryDeadline.toNumber()), bcOrder.shipper, bcOrder.arbiter, bcOrder.shippingPort,
                    new Date(bcOrder.shippingDeadline.toNumber()), bcOrder.deliveryPort, new Date(bcOrder.deliveryDeadline.toNumber()), bcOrder.status),
            );
        });
    });

    describe('build order line', () => {
        const bcOrderLinePrice: OrderManager.OrderLinePriceStructOutput = [BigNumber.from(10005), BigNumber.from(2), 'CHF'] as OrderManager.OrderLinePriceStructOutput;

        it('should correctly build an OrderLinePrice', () => {
            bcOrderLinePrice.amount = BigNumber.from(10005);
            bcOrderLinePrice.decimals = BigNumber.from(2);
            bcOrderLinePrice.fiat = 'CHF';

            expect(EntityBuilder.buildOrderLinePrice(bcOrderLinePrice)).toEqual(new OrderLinePrice(100.05, 'CHF'));
        });

        it('should correctly build an OrderLine', () => {
            const bcOrderLine: OrderManager.OrderLineStructOutput = [BigNumber.from(0), 'categoryA', BigNumber.from(40), bcOrderLinePrice, true] as OrderManager.OrderLineStructOutput;
            bcOrderLine.id = BigNumber.from(0);
            bcOrderLine.productCategory = 'categoryA';
            bcOrderLine.quantity = BigNumber.from(40);
            bcOrderLine.price = bcOrderLinePrice;
            bcOrderLine.exists = true;

            expect(EntityBuilder.buildOrderLine(bcOrderLine)).toEqual(new OrderLine(0, 'categoryA', 40, EntityBuilder.buildOrderLinePrice(bcOrderLinePrice)));
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
