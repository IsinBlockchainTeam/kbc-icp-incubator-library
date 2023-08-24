import { Order } from './Order';

describe('Order', () => {
    let order: Order;
    const deadline = new Date('2030-10-10');
    const deadline2 = new Date('2050-05-05');

    beforeAll(() => {
        order = new Order(0, 'supplier', 'customer', 'externalUrl', 'offeree', 'offeror', [1, 2],
            'FOB', deadline, deadline, 'shipper', 'arbiter', 'shipping port',
            deadline, 'delivery port', deadline, 'shipped');
    });

    it('should correctly initialize a new Order', () => {
        expect(order.id).toEqual(0);
        expect(order.supplier).toEqual('supplier');
        expect(order.customer).toEqual('customer');
        expect(order.offeree).toEqual('offeree');
        expect(order.offeror).toEqual('offeror');
        expect(order.externalUrl).toEqual('externalUrl');
        expect(order.lineIds).toEqual([1, 2]);
        expect(order.offereeSigned).toBeFalsy();
        expect(order.offerorSigned).toBeFalsy();
        expect(order.incoterms).toEqual('FOB');
        expect(order.paymentDeadline).toEqual(deadline);
        expect(order.documentDeliveryDeadline).toEqual(deadline);
        expect(order.shipper).toEqual('shipper');
        expect(order.arbiter).toEqual('arbiter');
        expect(order.shippingPort).toEqual('shipping port');
        expect(order.shippingDeadline).toEqual(deadline);
        expect(order.deliveryPort).toEqual('delivery port');
        expect(order.deliveryDeadline).toEqual(deadline);
        expect(order.status).toEqual('shipped');
    });

    it('should correctly set the id', () => {
        order.id = 1;
        expect(order.id).toEqual(1);
    });

    it('should correctly set the line ids', () => {
        order.lineIds = [3, 4, 5];
        expect(order.lineIds).toEqual([3, 4, 5]);
    });

    it('should correctly set the supplier', () => {
        order.supplier = 'supplier2';
        expect(order.supplier).toEqual('supplier2');
    });

    it('should correctly set the customer', () => {
        order.customer = 'customer2';
        expect(order.customer).toEqual('customer2');
    });

    it('should correctly set the externalUrl', () => {
        order.externalUrl = 'externalUrl2';
        expect(order.externalUrl).toEqual('externalUrl2');
    });

    it('should correctly set the offeree', () => {
        order.offeree = 'offeree2';
        expect(order.offeree).toEqual('offeree2');
    });

    it('should correctly set the offeror', () => {
        order.offeror = 'offeror2';
        expect(order.offeror).toEqual('offeror2');
    });

    it('should correctly set the offereeSigned', () => {
        order.offereeSigned = true;
        expect(order.offereeSigned).toBeTruthy();
    });

    it('should correctly set the offerorSigned', () => {
        order.offerorSigned = false;
        expect(order.offerorSigned).toBeFalsy();
    });

    it('should correctly set the incoterms', () => {
        order.incoterms = 'FOB';
        expect(order.incoterms).toEqual('FOB');
    });

    it('should correctly set the paymentDeadline', () => {
        order.paymentDeadline = deadline2;
        expect(order.paymentDeadline).toEqual(deadline2);
    });

    it('should correctly set the documentDeliveryDeadline', () => {
        order.documentDeliveryDeadline = deadline2;
        expect(order.documentDeliveryDeadline).toEqual(deadline2);
    });

    it('should correctly set the shipper', () => {
        order.shipper = 'shipper 2';
        expect(order.shipper).toEqual('shipper 2');
    });

    it('should correctly set the arbiter', () => {
        order.arbiter = 'arbiter 2';
        expect(order.arbiter).toEqual('arbiter 2');
    });
    it('should correctly set the shippingPort', () => {
        order.shippingPort = 'shippingPort 2';
        expect(order.shippingPort).toEqual('shippingPort 2');
    });

    it('should correctly set the shippingDeadline', () => {
        order.shippingDeadline = deadline2;
        expect(order.shippingDeadline).toEqual(deadline2);
    });

    it('should correctly set the deliveryPort', () => {
        order.deliveryPort = 'deliveryPort 2';
        expect(order.deliveryPort).toEqual('deliveryPort 2');
    });

    it('should correctly set the deliveryDeadline', () => {
        order.deliveryDeadline = deadline2;
        expect(order.deliveryDeadline).toEqual(deadline2);
    });

    it('should correctly set the status', () => {
        order.status = 'on board';
        expect(order.status).toEqual('on board');
    });
});
