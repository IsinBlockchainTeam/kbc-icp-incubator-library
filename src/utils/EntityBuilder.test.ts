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
import { OrderManager } from '../smart-contracts';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { Order } from '../entities/Order';

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
            };
            expect(EntityBuilder.buildOrder(bcOrder)).toEqual(
                new Order(bcOrder.id.toNumber(), bcOrder.supplier, bcOrder.customer, bcOrder.externalUrl, bcOrder.offeree, bcOrder.offeror, bcOrder.lineIds.map((l) => l.toNumber()),
                    bcOrder.incoterms, new Date(bcOrder.paymentDeadline.toNumber()), new Date(bcOrder.documentDeliveryDeadline.toNumber()), bcOrder.shipper, bcOrder.arbiter, bcOrder.shippingPort,
                    new Date(bcOrder.shippingDeadline.toNumber()), bcOrder.deliveryPort, new Date(bcOrder.deliveryDeadline.toNumber())),
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
});
