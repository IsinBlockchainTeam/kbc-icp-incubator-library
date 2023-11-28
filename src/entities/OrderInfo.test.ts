import { OrderInfo } from './OrderInfo';

describe('OrderInfo', () => {
    let orderInfo: OrderInfo;
    const deadline = new Date('2030-10-10');
    const deadline2 = new Date('2050-05-05');
    const metadataExternalUrl = 'CID';

    beforeAll(() => {
        orderInfo = new OrderInfo(0, 'supplier', 'customer', metadataExternalUrl, 'offeree', 'offeror', [1, 2],
            deadline, deadline, 'arbiter', deadline, deadline, 'escrow');
    });

    it('should correctly initialize a new Order', () => {
        expect(orderInfo.id).toEqual(0);
        expect(orderInfo.supplier).toEqual('supplier');
        expect(orderInfo.customer).toEqual('customer');
        expect(orderInfo.offeree).toEqual('offeree');
        expect(orderInfo.offeror).toEqual('offeror');
        expect(orderInfo.lineIds).toEqual([1, 2]);
        expect(orderInfo.offereeSigned).toBeFalsy();
        expect(orderInfo.offerorSigned).toBeFalsy();
        expect(orderInfo.paymentDeadline).toEqual(deadline);
        expect(orderInfo.documentDeliveryDeadline).toEqual(deadline);
        expect(orderInfo.arbiter).toEqual('arbiter');
        expect(orderInfo.shippingDeadline).toEqual(deadline);
        expect(orderInfo.deliveryDeadline).toEqual(deadline);
        expect(orderInfo.escrow).toEqual('escrow');
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

    it('should correctly set the escrow', () => {
        orderInfo.escrow = 'escrow 2';
        expect(orderInfo.escrow).toEqual('escrow 2');
    });
});
