import { OrderLine, OrderLinePrice, OrderTrade } from './OrderTrade';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';
import { NegotiationStatus } from '../types/NegotiationStatus';

describe('OrderTrade', () => {
    let orderTrade: OrderTrade;

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date('2024-10-10'));
        orderTrade = new OrderTrade(
            1,
            'supplier',
            'customer',
            'commissioner',
            'externalUrl',
            [
                new OrderLine(
                    1,
                    new Material(1, new ProductCategory(1, 'name', 1, 'description')),
                    new ProductCategory(1, 'name', 1, 'description'),
                    100,
                    'unit',
                    new OrderLinePrice(1, 'CHF')
                )
            ],
            true,
            true,
            new Date().getTime(),
            new Date().getTime(),
            'arbiter',
            new Date().getTime(),
            new Date().getTime(),
            NegotiationStatus.INITIALIZED,
            500,
            'tokenAddress',
            'escrow',
            {
                incoterms: 'incoterms',
                shipper: 'shipper',
                shippingPort: 'shippingPort',
                deliveryPort: 'deliveryPort'
            }
        );
    });

    it('should correctly initialize an OrderTrade', () => {
        expect(orderTrade.tradeId).toEqual(1);
        expect(orderTrade.supplier).toEqual('supplier');
        expect(orderTrade.customer).toEqual('customer');
        expect(orderTrade.commissioner).toEqual('commissioner');
        expect(orderTrade.externalUrl).toEqual('externalUrl');
        expect(orderTrade.lines).toEqual([
            new OrderLine(
                1,
                new Material(1, new ProductCategory(1, 'name', 1, 'description')),
                new ProductCategory(1, 'name', 1, 'description'),
                100,
                'unit',
                new OrderLinePrice(1, 'CHF')
            )
        ]);
        expect(orderTrade.hasSupplierSigned).toEqual(true);
        expect(orderTrade.hasCommissionerSigned).toEqual(true);
        expect(orderTrade.paymentDeadline).toEqual(new Date().getTime());
        expect(orderTrade.documentDeliveryDeadline).toEqual(new Date().getTime());
        expect(orderTrade.arbiter).toEqual('arbiter');
        expect(orderTrade.shippingDeadline).toEqual(new Date().getTime());
        expect(orderTrade.deliveryDeadline).toEqual(new Date().getTime());
        expect(orderTrade.negotiationStatus).toEqual(NegotiationStatus.INITIALIZED);
        expect(orderTrade.agreedAmount).toEqual(500);
        expect(orderTrade.tokenAddress).toEqual('tokenAddress');
        expect(orderTrade.escrow).toEqual('escrow');
        expect(orderTrade.metadata?.incoterms).toEqual('incoterms');
        expect(orderTrade.metadata?.shipper).toEqual('shipper');
        expect(orderTrade.metadata?.shippingPort).toEqual('shippingPort');
        expect(orderTrade.metadata?.deliveryPort).toEqual('deliveryPort');
    });

    it('should correctly set hasSupplierSigned', () => {
        orderTrade.hasSupplierSigned = false;
        expect(orderTrade.hasSupplierSigned).toEqual(false);
    });

    it('should correctly set hasCommissionerSigned', () => {
        orderTrade.hasCommissionerSigned = false;
        expect(orderTrade.hasCommissionerSigned).toEqual(false);
    });

    it('should correctly set paymentDeadline', () => {
        orderTrade.paymentDeadline = new Date().getTime();
        expect(orderTrade.paymentDeadline).toEqual(new Date().getTime());
    });

    it('should correctly set documentDeliveryDeadline', () => {
        orderTrade.documentDeliveryDeadline = new Date().getTime();
        expect(orderTrade.documentDeliveryDeadline).toEqual(new Date().getTime());
    });

    it('should correctly set arbiter', () => {
        orderTrade.arbiter = 'newArbiter';
        expect(orderTrade.arbiter).toEqual('newArbiter');
    });

    it('should correctly set shippingDeadline', () => {
        orderTrade.shippingDeadline = new Date().getTime();
        expect(orderTrade.shippingDeadline).toEqual(new Date().getTime());
    });

    it('should correctly set deliveryDeadline', () => {
        orderTrade.deliveryDeadline = new Date().getTime();
        expect(orderTrade.deliveryDeadline).toEqual(new Date().getTime());
    });

    it('should correctly set negotiationStatus', () => {
        orderTrade.negotiationStatus = NegotiationStatus.CONFIRMED;
        expect(orderTrade.negotiationStatus).toEqual(NegotiationStatus.CONFIRMED);
    });

    it('should correctly set agreedAmount', () => {
        orderTrade.agreedAmount = 1000;
        expect(orderTrade.agreedAmount).toEqual(1000);
    });

    it('should correctly set tokenAddress', () => {
        orderTrade.tokenAddress = 'newTokenAddress';
        expect(orderTrade.tokenAddress).toEqual('newTokenAddress');
    });

    it('should correctly set escrow', () => {
        orderTrade.escrow = 'newEscrow';
        expect(orderTrade.escrow).toEqual('newEscrow');
    });

    it('should correctly set metadata', () => {
        orderTrade.metadata = {
            incoterms: 'newIncoterms',
            shipper: 'newShipper',
            shippingPort: 'newShippingPort',
            deliveryPort: 'newDeliveryPort'
        };
        expect(orderTrade.metadata?.incoterms).toEqual('newIncoterms');
        expect(orderTrade.metadata?.shipper).toEqual('newShipper');
        expect(orderTrade.metadata?.shippingPort).toEqual('newShippingPort');
        expect(orderTrade.metadata?.deliveryPort).toEqual('newDeliveryPort');
    });
});
