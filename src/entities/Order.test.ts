import { Order } from './Order';
import {OrderLine, OrderLinePrice} from './OrderLine';

describe('Order', () => {
    let order: Order;

    beforeAll(() => {
        order = new Order(0, 'supplier', 'customer', 'externalUrl', 'offeree', 'offeror', [1, 2], []);
    });

    it('should correctly initialize a new Order', () => {
        expect(order.id).toEqual(0);
        expect(order.lines).toEqual([]);
        expect(order.supplier).toEqual('supplier');
        expect(order.customer).toEqual('customer');
        expect(order.offeree).toEqual('offeree');
        expect(order.offeror).toEqual('offeror');
        expect(order.externalUrl).toEqual('externalUrl');
        expect(order.lineIds).toEqual([1, 2]);
        expect(order.lines).toEqual([]);
        expect(order.offereeSigned).toBeFalsy();
        expect(order.offerorSigned).toBeFalsy();
    });

    it('should correctly set the id', () => {
        order.id = 1;
        expect(order.id).toEqual(1);
    });

    it('should correctly set the lines', () => {
        const orderLine: OrderLine = new OrderLine(1,'CategoryA', 20, new OrderLinePrice(10.25, 'USD'));
        order.lines = [orderLine];
        expect(order.lines).toEqual([orderLine]);
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
});
