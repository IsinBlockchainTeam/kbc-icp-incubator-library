import { BigNumber } from 'ethers';
import { MaterialManager, OrderTrade as OrderTradeContract, ProductCategoryManager } from '../smart-contracts';
import {
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
    OrderTradeInfo,
} from './OrderTradeInfo';
import { EntityBuilder } from '../utils/EntityBuilder';
import {
    Trade as TradeContract,
} from '../smart-contracts/contracts/OrderTrade';
import { ProductCategory } from './ProductCategory';
import { Material } from './Material';

describe('OrderLinePrice', () => {
    let price: OrderLinePrice;

    beforeAll(() => {
        price = new OrderLinePrice(10.2, 'CHF');
    });

    it('should correctly initialize an OrderLinePrice', () => {
        expect(price.amount)
            .toEqual(10.2);
        expect(price.fiat)
            .toEqual('CHF');
    });

    it('should correctly set the amount', () => {
        price.amount = 20.2;
        expect(price.amount)
            .toEqual(20.2);
    });

    it('should correctly set the fiat', () => {
        price.fiat = 'USD';
        expect(price.fiat)
            .toEqual('USD');
    });
});

describe('OrderLine', () => {
    let line: OrderLine;
    const units = ['KGM', 'BG'];

    beforeAll(() => {
        const productCategory = new ProductCategory(1, 'test', 1, 'test');
        line = new OrderLine(0, new Material(1, productCategory), productCategory, 10, units[1], new OrderLinePrice(10.2, 'CHF'));
    });

    it('should correctly initialize an OrderLine', () => {
        expect(line.id)
            .toEqual(0);
        expect(line.material)
            .toEqual(new Material(1, new ProductCategory(1, 'test', 1, 'test')));
        expect(line.productCategory)
            .toEqual(new ProductCategory(1, 'test', 1, 'test'));
        expect(line.quantity)
            .toEqual(10);
        expect(line.price)
            .toEqual(new OrderLinePrice(10.2, 'CHF'));
    });

    it('should correctly set the quantity', () => {
        line.quantity = 20;
        expect(line.quantity)
            .toEqual(20);
    });

    it('should correctly set the price', () => {
        line.price = new OrderLinePrice(5, 'EUR');
        expect(line.price)
            .toEqual(new OrderLinePrice(5, 'EUR'));
    });
});

describe('OrderLineRequest', () => {
    let line: OrderLineRequest;
    const units = ['KGM', 'BG'];

    beforeAll(() => {
        line = new OrderLineRequest(1, 10, units[0], new OrderLinePrice(10.2, 'CHF'));
    });

    it('should correctly initialize an OrderLineRequest', () => {
        expect(line.productCategoryId)
            .toEqual(1);
        expect(line.quantity)
            .toEqual(10);
        expect(line.price)
            .toEqual(new OrderLinePrice(10.2, 'CHF'));
    });

    it('should correctly set the quantity', () => {
        line.quantity = 20;
        expect(line.quantity)
            .toEqual(20);
    });

    it('should correctly set the price', () => {
        line.price = new OrderLinePrice(5, 'EUR');
        expect(line.price)
            .toEqual(new OrderLinePrice(5, 'EUR'));
    });
});

describe('OrderTradeInfo', () => {
    let orderTradeInfo: OrderTradeInfo;
    const units = ['KGM', 'BG'];

    beforeAll(() => {
        orderTradeInfo = new OrderTradeInfo(0, 'supplier', 'customer', 'commissioner', 'https://test.com',
            [], false, false, 100, 200, 'arbitrer', 300, 400, 'escrow');
    });

    it('should correctly initialize an OrderTrade', () => {
        expect(orderTradeInfo.hasSupplierSigned)
            .toEqual(false);
        expect(orderTradeInfo.hasCommissionerSigned)
            .toEqual(false);
        expect(orderTradeInfo.paymentDeadline)
            .toEqual(100);
        expect(orderTradeInfo.documentDeliveryDeadline)
            .toEqual(200);
        expect(orderTradeInfo.arbiter)
            .toEqual('arbitrer');
        expect(orderTradeInfo.shippingDeadline)
            .toEqual(300);
        expect(orderTradeInfo.deliveryDeadline)
            .toEqual(400);
        expect(orderTradeInfo.lines)
            .toEqual([]);
        expect(orderTradeInfo.escrow)
            .toEqual('escrow');
    });

    it('should correctly set the hasSupplierSigned', () => {
        orderTradeInfo.hasSupplierSigned = true;
        expect(orderTradeInfo.hasSupplierSigned)
            .toEqual(true);
    });

    it('should correctly set the hasCommissionerSigned', () => {
        orderTradeInfo.hasCommissionerSigned = true;
        expect(orderTradeInfo.hasCommissionerSigned)
            .toEqual(true);
    });

    it('should correctly set the paymentDeadline', () => {
        orderTradeInfo.paymentDeadline = 0;
        expect(orderTradeInfo.paymentDeadline)
            .toEqual(0);
    });

    it('should correctly set the documentDeliveryDeadline', () => {
        orderTradeInfo.documentDeliveryDeadline = 0;
        expect(orderTradeInfo.documentDeliveryDeadline)
            .toEqual(0);
    });

    it('should correctly set the arbiter', () => {
        orderTradeInfo.arbiter = 'new arbiter';
        expect(orderTradeInfo.arbiter)
            .toEqual('new arbiter');
    });

    it('should correctly set the shippingDeadline', () => {
        orderTradeInfo.shippingDeadline = 0;
        expect(orderTradeInfo.shippingDeadline)
            .toEqual(0);
    });

    it('should correctly set the deliveryDeadline', () => {
        orderTradeInfo.deliveryDeadline = 0;
        expect(orderTradeInfo.deliveryDeadline)
            .toEqual(0);
    });

    it('should correctly set the lines', () => {
        const newLine: TradeContract.LineStructOutput = {
            id: BigNumber.from(1),
            materialId: BigNumber.from(2),
            quantity: BigNumber.from(10),
            unit: units[1],
            productCategoryId: BigNumber.from(3),
            exists: true,
        } as TradeContract.LineStructOutput;
        const price: OrderTradeContract.OrderLinePriceStructOutput = {
            amount: BigNumber.from(10),
            decimals: BigNumber.from(0),
            fiat: 'fiat',
        } as OrderTradeContract.OrderLinePriceStructOutput;
        const newOrderLine: OrderTradeContract.OrderLineStructOutput = {
            price,
        } as OrderTradeContract.OrderLineStructOutput;
        const materialStruct: MaterialManager.MaterialStructOutput = {
            id: BigNumber.from(2),
            productCategoryId: BigNumber.from(3),
            exists: true,
        } as MaterialManager.MaterialStructOutput;
        const productCategoryStruct: ProductCategoryManager.ProductCategoryStructOutput = {
            id: BigNumber.from(3),
            name: 'test',
            quality: 1,
            description: 'test',
            exists: true,
        } as ProductCategoryManager.ProductCategoryStructOutput;

        orderTradeInfo.lines = [
            EntityBuilder.buildOrderLine(newLine, newOrderLine, productCategoryStruct, materialStruct),
        ];
        expect(orderTradeInfo.lines)
            .toEqual([EntityBuilder.buildOrderLine(newLine, newOrderLine, productCategoryStruct, materialStruct)]);
    });

    it('should correctly set the escrow', () => {
        orderTradeInfo.escrow = 'new escrow';
        expect(orderTradeInfo.escrow)
            .toEqual('new escrow');
    });
});
