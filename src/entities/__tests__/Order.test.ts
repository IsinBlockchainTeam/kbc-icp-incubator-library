import {Order, OrderStatus} from "../Order";
import {Shipment} from "../Shipment";

describe('Order', () => {
    let order: Order;
    const date = new Date();

    beforeAll(() => {
        order = new Order(0, 'supplier', 'customer', 'commissioner', ['signature'], OrderStatus.PENDING, date, date, date, date, 'arbiter', 'incoterms', 'shipper', 'shippingPort', 'deliveryPort', [], 'token', 0, null);
    });

    it('should correctly initialize a new Order', () => {
        expect(order.id).toEqual(0);
        expect(order.supplier).toEqual('supplier');
        expect(order.customer).toEqual('customer');
        expect(order.commissioner).toEqual('commissioner');
        expect(order.signatures).toEqual(['signature']);
        expect(order.status).toEqual(OrderStatus.PENDING);
        expect(order.paymentDeadline).toEqual(date);
        expect(order.documentDeliveryDeadline).toEqual(date);
        expect(order.shippingDeadline).toEqual(date);
        expect(order.deliveryDeadline).toEqual(date);
        expect(order.arbiter).toEqual('arbiter');
        expect(order.incoterms).toEqual('incoterms');
        expect(order.shipper).toEqual('shipper');
        expect(order.shippingPort).toEqual('shippingPort');
        expect(order.deliveryPort).toEqual('deliveryPort');
        expect(order.lines).toEqual([]);
        expect(order.token).toEqual('token');
        expect(order.agreedAmount).toEqual(0);
        expect(order.shipment).toEqual(null);
    });

    it('should correctly set the id', () => {
        order.id = 1;
        expect(order.id).toEqual(1);
    });

    it('should correctly set the supplier', () => {
        order.supplier = 'supplier2';
        expect(order.supplier).toEqual('supplier2');
    });

    it('should correctly set the customer', () => {
        order.customer = 'customer2';
        expect(order.customer).toEqual('customer2');
    });

    it('should correctly set the commissioner', () => {
        order.commissioner = 'commissioner2';
        expect(order.commissioner).toEqual('commissioner2');
    });

    it('should correctly set the signatures', () => {
        order.signatures = ['signature2'];
        expect(order.signatures).toEqual(['signature2']);
    });

    it('should correctly set the status', () => {
        order.status = OrderStatus.CONFIRMED;
        expect(order.status).toEqual(OrderStatus.CONFIRMED);
    });

    it('should correctly set the paymentDeadline', () => {
        const otherDate = new Date();
        order.paymentDeadline = otherDate;
        expect(order.paymentDeadline).toEqual(otherDate);
    });

    it('should correctly set the documentDeliveryDeadline', () => {
        const otherDate = new Date();
        order.documentDeliveryDeadline = otherDate;
        expect(order.documentDeliveryDeadline).toEqual(otherDate);
    });

    it('should correctly set the shippingDeadline', () => {
        const otherDate = new Date();
        order.shippingDeadline = otherDate;
        expect(order.shippingDeadline).toEqual(otherDate);
    });

    it('should correctly set the deliveryDeadline', () => {
        const otherDate = new Date();
        order.deliveryDeadline = otherDate;
        expect(order.deliveryDeadline).toEqual(otherDate);
    });

    it('should correctly set the arbiter', () => {
        order.arbiter = 'arbiter2';
        expect(order.arbiter).toEqual('arbiter2');
    });

    it('should correctly set the incoterms', () => {
        order.incoterms = 'incoterms2';
        expect(order.incoterms).toEqual('incoterms2');
    });

    it('should correctly set the shipper', () => {
        order.shipper = 'shipper2';
        expect(order.shipper).toEqual('shipper2');
    });

    it('should correctly set the shippingPort', () => {
        order.shippingPort = 'shippingPort2';
        expect(order.shippingPort).toEqual('shippingPort2');
    });

    it('should correctly set the deliveryPort', () => {
        order.deliveryPort = 'deliveryPort2';
        expect(order.deliveryPort).toEqual('deliveryPort2');
    });

    it('should correctly set the lines', () => {
        order.lines = [];
        expect(order.lines).toEqual([]);
    });

    it('should correctly set the token', () => {
        order.token = 'token2';
        expect(order.token).toEqual('token2');
    });

    it('should correctly set the agreedAmount', () => {
        order.agreedAmount = 1;
        expect(order.agreedAmount).toEqual(1);
    });

    it('should correctly set the shipment', () => {
        const shipment = {} as Shipment;
        order.shipment = shipment;
        expect(order.shipment).toEqual(shipment);
    });
});
