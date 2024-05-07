import { OrderTrade } from './OrderTrade';
import { OrderLine, OrderLinePrice, OrderTradeInfo } from './OrderTradeInfo';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';

describe('OrderTrade', () => {
    let orderTrade: OrderTrade;
    let orderTradeInfo: OrderTradeInfo;

    const units = ['KGM', 'BG'];

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date('2024-10-10'));
        orderTradeInfo = new OrderTradeInfo(1, 'supplier', 'customer', 'commissioner', 'externalUrl', [new OrderLine(1, new Material(1, new ProductCategory(1, 'name', 1, 'description')), new ProductCategory(1, 'name', 1, 'description'), 1, units[1], new OrderLinePrice(1, 'CHF'))], true, true, new Date().getTime(), new Date().getTime(), 'arbiter', new Date().getTime(), new Date().getTime(), 'escrow');
        orderTrade = new OrderTrade(orderTradeInfo, 'incoterms', 'shipper', 'shippingPort', 'deliveryPort');
    });

    it('should correctly initialize an OrderTrade', () => {
        expect(orderTrade.tradeId)
            .toEqual(1);
        expect(orderTrade.supplier)
            .toEqual('supplier');
        expect(orderTrade.customer)
            .toEqual('customer');
        expect(orderTrade.commissioner)
            .toEqual('commissioner');
        expect(orderTrade.externalUrl)
            .toEqual('externalUrl');
        expect(orderTrade.lines)
            .toEqual([new OrderLine(1, new Material(1, new ProductCategory(1, 'name', 1, 'description')), new ProductCategory(1, 'name', 1, 'description'), 1, units[1], new OrderLinePrice(1, 'CHF'))]);
        expect(orderTrade.hasSupplierSigned)
            .toEqual(true);
        expect(orderTrade.hasCommissionerSigned)
            .toEqual(true);
        expect(orderTrade.paymentDeadline)
            .toEqual(new Date().getTime());
        expect(orderTrade.documentDeliveryDeadline)
            .toEqual((new Date().getTime()));
        expect(orderTrade.arbiter)
            .toEqual('arbiter');
        expect(orderTrade.shippingDeadline)
            .toEqual((new Date().getTime()));
        expect(orderTrade.deliveryDeadline)
            .toEqual((new Date().getTime()));
        expect(orderTrade.escrow)
            .toEqual('escrow');
        expect(orderTrade.incoterms)
            .toEqual('incoterms');
        expect(orderTrade.shipper)
            .toEqual('shipper');
        expect(orderTrade.shippingPort)
            .toEqual('shippingPort');
        expect(orderTrade.deliveryPort)
            .toEqual('deliveryPort');
    });

    it('should correctly set the incoterms', () => {
        orderTrade.incoterms = 'new incoterms';
        expect(orderTrade.incoterms)
            .toEqual('new incoterms');
    });

    it('should correctly set the shipper', () => {
        orderTrade.shipper = 'new shipper';
        expect(orderTrade.shipper)
            .toEqual('new shipper');
    });

    it('should correctly set the shippingPort', () => {
        orderTrade.shippingPort = 'new shippingPort';
        expect(orderTrade.shippingPort)
            .toEqual('new shippingPort');
    });

    it('should correctly set the deliveryPort', () => {
        orderTrade.deliveryPort = 'new deliveryPort';
        expect(orderTrade.deliveryPort)
            .toEqual('new deliveryPort');
    });
});
