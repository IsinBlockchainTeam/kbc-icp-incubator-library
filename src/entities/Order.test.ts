import { Order } from './Order';
import { OrderLine } from './OrderLine';

describe('Order', () => {
    let order: Order;

    beforeAll(() => {
        order = new Order(0, 'supplier', 1, 'externalUrl', [1, 2], []);
    });

    it('should correctly initialize a new Order', () => {
        expect(order.id).toEqual(0);
        expect(order.supplier).toEqual('supplier');
        expect(order.contractId).toEqual(1);
        expect(order.lineIds).toEqual([1, 2]);
        expect(order.lines).toEqual([]);
        expect(order.externalUrl).toEqual('externalUrl');
    });

    it('should correctly set the id', () => {
        order.id = 1;
        expect(order.id).toEqual(1);
    });

    it('should correctly set the supplier', () => {
        order.supplier = 'supplier2';
        expect(order.supplier).toEqual('supplier2');
    });

    it('should correctly set the contract id', () => {
        order.contractId = 5;
        expect(order.contractId).toEqual(5);
    });

    it('should correctly set the lines', () => {
        const orderLine = new OrderLine(0, 1, 50);
        order.lines = [orderLine];
        expect(order.lines).toEqual([orderLine]);
    });

    it('should correctly set the line ids', () => {
        order.lineIds = [3, 4];
        expect(order.lineIds).toEqual([3, 4]);
    });

    it('should correctly set the externalUrl', () => {
        order.externalUrl = 'externalUrl2';
        expect(order.externalUrl).toEqual('externalUrl2');
    });
});
