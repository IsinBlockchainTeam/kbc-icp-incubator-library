import { OrderLine } from './OrderLine';

describe('OrderLine', () => {
    let orderLine: OrderLine;

    beforeAll(() => {
        orderLine = new OrderLine(0, 1, 50);
    });

    it('should correctly initialize a new ContractLine', () => {
        expect(orderLine.id).toEqual(0);
        expect(orderLine.contractLineId).toEqual(1);
        expect(orderLine.quantity).toEqual(50);
    });

    it('should correctly set the id', () => {
        orderLine.id = 1;
        expect(orderLine.id).toEqual(1);
    });

    it('should correctly set the contractLineId', () => {
        orderLine.contractLineId = 2;
        expect(orderLine.contractLineId).toEqual(2);
    });

    it('should correctly set the quantity', () => {
        orderLine.quantity = 20;
        expect(orderLine.quantity).toEqual(20);
    });
});
