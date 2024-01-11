import { BigNumber } from 'ethers';
import { OrderTrade as OrderTradeContract } from '../smart-contracts';
import {
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
    OrderTrade,
} from './OrderTrade';
import { EntityBuilder } from '../utils/EntityBuilder';
import {
    Trade as TradeContract,
} from '../smart-contracts/contracts/OrderTrade';

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

    beforeAll(() => {
        line = new OrderLine(0, [1, 2], 'test', 10, new OrderLinePrice(10.2, 'CHF'));
    });

    it('should correctly initialize an OrderLine', () => {
        expect(line.id)
            .toEqual(0);
        expect(line.materialsId)
            .toEqual([1, 2]);
        expect(line.productCategory)
            .toEqual('test');
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

    beforeAll(() => {
        line = new OrderLineRequest([1, 2], 'test', 10, new OrderLinePrice(10.2, 'CHF'));
    });

    it('should correctly initialize an OrderLineRequest', () => {
        expect(line.materialsId)
            .toEqual([1, 2]);
        expect(line.productCategory)
            .toEqual('test');
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

describe('OrderTrade', () => {
    let orderTrade: OrderTrade;

    beforeAll(() => {
        orderTrade = new OrderTrade(0, 'supplier', 'customer', 'commissioner', 'https://test.com',
            new Map<number, OrderLine>(), false, false, 100, 200, 'arbitrer', 300, 400, 'escrow');
    });

    it('should correctly initialize an OrderTrade', () => {
        expect(orderTrade.hasSupplierSigned)
            .toEqual(false);
        expect(orderTrade.hasCommissionerSigned)
            .toEqual(false);
        expect(orderTrade.paymentDeadline)
            .toEqual(100);
        expect(orderTrade.documentDeliveryDeadline)
            .toEqual(200);
        expect(orderTrade.arbiter)
            .toEqual('arbitrer');
        expect(orderTrade.shippingDeadline)
            .toEqual(300);
        expect(orderTrade.deliveryDeadline)
            .toEqual(400);
        expect(orderTrade.lines)
            .toEqual(new Map<number, OrderLinePrice>());
        expect(orderTrade.escrow)
            .toEqual('escrow');
    });

    it('should correctly set the hasSupplierSigned', () => {
        orderTrade.hasSupplierSigned = true;
        expect(orderTrade.hasSupplierSigned)
            .toEqual(true);
    });

    it('should correctly set the hasCommissionerSigned', () => {
        orderTrade.hasCommissionerSigned = true;
        expect(orderTrade.hasCommissionerSigned)
            .toEqual(true);
    });

    it('should correctly set the paymentDeadline', () => {
        orderTrade.paymentDeadline = 0;
        expect(orderTrade.paymentDeadline)
            .toEqual(0);
    });

    it('should correctly set the documentDeliveryDeadline', () => {
        orderTrade.documentDeliveryDeadline = 0;
        expect(orderTrade.documentDeliveryDeadline)
            .toEqual(0);
    });

    it('should correctly set the arbiter', () => {
        orderTrade.arbiter = 'new arbiter';
        expect(orderTrade.arbiter)
            .toEqual('new arbiter');
    });

    it('should correctly set the shippingDeadline', () => {
        orderTrade.shippingDeadline = 0;
        expect(orderTrade.shippingDeadline)
            .toEqual(0);
    });

    it('should correctly set the deliveryDeadline', () => {
        orderTrade.deliveryDeadline = 0;
        expect(orderTrade.deliveryDeadline)
            .toEqual(0);
    });

    it('should correctly set the lines', () => {
        const newOrderLines = new Map<number, OrderLine>();
        const newLine: TradeContract.LineStructOutput = {
            id: BigNumber.from(1),
            materialsId: [BigNumber.from(3), BigNumber.from(4)],
            productCategory: 'category2',
            exists: true,
        } as TradeContract.LineStructOutput;
        const price: OrderTradeContract.OrderLinePriceStructOutput = {
            amount: BigNumber.from(10),
            decimals: BigNumber.from(0),
            fiat: 'fiat',
        } as OrderTradeContract.OrderLinePriceStructOutput;
        const newOrderLine: OrderTradeContract.OrderLineStructOutput = {
            quantity: BigNumber.from(4),
            price,
        } as OrderTradeContract.OrderLineStructOutput;

        newOrderLines.set(1, EntityBuilder.buildOrderLine(newLine, newOrderLine));
        orderTrade.lines = newOrderLines;
        expect(orderTrade.lines)
            .toEqual(newOrderLines);
    });

    it('should correctly set the escrow', () => {
        orderTrade.escrow = 'new escrow';
        expect(orderTrade.escrow)
            .toEqual('new escrow');
    });
});
