import { OrderInfo } from './OrderInfo';
import { Order } from './Order';

describe('Order', () => {
    let orderInfo: OrderInfo;
    let order: Order;
    const deadline = new Date('2030-10-10');
    const deadline2 = new Date('2050-05-05');
    const metadataExternalUrl = 'CID';

    beforeAll(() => {
        orderInfo = new OrderInfo(0, 'supplier', 'customer', metadataExternalUrl, 'offeree', 'offeror', [1, 2],
            deadline, deadline, 'arbiter', deadline, deadline, 'escrow');
        order = new Order(orderInfo, 'FOB', 'shipper', 'shipping port', 'delivery port');
    });

    it('should correctly initialize a new Order', () => {
        expect(order.id).toEqual(orderInfo.id);
        expect(order.supplier).toEqual(orderInfo.supplier);
        expect(order.customer).toEqual(orderInfo.customer);
        expect(order.offeree).toEqual(orderInfo.offeree);
        expect(order.offeror).toEqual(orderInfo.offeror);
        expect(order.lineIds).toEqual(orderInfo.lineIds);
        expect(order.offereeSigned).toBeFalsy();
        expect(order.offerorSigned).toBeFalsy();
        expect(order.incoterms).toEqual('FOB');
        expect(order.paymentDeadline).toEqual(orderInfo.paymentDeadline);
        expect(order.documentDeliveryDeadline).toEqual(orderInfo.documentDeliveryDeadline);
        expect(order.shipper).toEqual('shipper');
        expect(order.arbiter).toEqual(orderInfo.arbiter);
        expect(order.shippingPort).toEqual('shipping port');
        expect(order.shippingDeadline).toEqual(orderInfo.shippingDeadline);
        expect(order.deliveryPort).toEqual('delivery port');
        expect(order.deliveryDeadline).toEqual(orderInfo.deliveryDeadline);
    });

    it('should correctly set the id', () => {
        orderInfo.id = 1;
        expect(orderInfo.id).toEqual(1);
    });

    it('should correctly set the supplier', () => {
        orderInfo.supplier = 'supplier2';
        expect(orderInfo.supplier).toEqual('supplier2');
    });

    it('should correctly set the customer', () => {
        orderInfo.customer = 'customer2';
        expect(orderInfo.customer).toEqual('customer2');
    });

    it('should correctly set the offeree', () => {
        orderInfo.offeree = 'offeree2';
        expect(orderInfo.offeree).toEqual('offeree2');
    });

    it('should correctly set the offeror', () => {
        orderInfo.offeror = 'offeror2';
        expect(orderInfo.offeror).toEqual('offeror2');
    });

    it('should correctly set the line ids', () => {
        orderInfo.lineIds = [3, 4, 5];
        expect(orderInfo.lineIds).toEqual([3, 4, 5]);
    });

    it('should correctly set the offereeSigned', () => {
        orderInfo.offereeSigned = true;
        expect(orderInfo.offereeSigned).toBeTruthy();
    });

    it('should correctly set the offerorSigned', () => {
        orderInfo.offerorSigned = false;
        expect(orderInfo.offerorSigned).toBeFalsy();
    });

    it('should correctly set the paymentDeadline', () => {
        orderInfo.paymentDeadline = deadline2;
        expect(orderInfo.paymentDeadline).toEqual(deadline2);
    });

    it('should correctly set the documentDeliveryDeadline', () => {
        orderInfo.documentDeliveryDeadline = deadline2;
        expect(orderInfo.documentDeliveryDeadline).toEqual(deadline2);
    });

    it('should correctly set the arbiter', () => {
        orderInfo.arbiter = 'arbiter 2';
        expect(orderInfo.arbiter).toEqual('arbiter 2');
    });

    it('should correctly set the shippingDeadline', () => {
        orderInfo.shippingDeadline = deadline2;
        expect(orderInfo.shippingDeadline).toEqual(deadline2);
    });

    it('should correctly set the deliveryDeadline', () => {
        orderInfo.deliveryDeadline = deadline2;
        expect(orderInfo.deliveryDeadline).toEqual(deadline2);
    });
});
