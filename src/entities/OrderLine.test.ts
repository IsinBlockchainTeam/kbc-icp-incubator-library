import { OrderLine, OrderLinePrice } from './OrderLine';

describe('OrderLine', () => {
    let orderLine: OrderLine;
    let orderLinePrice: OrderLinePrice;

    beforeAll(() => {
        orderLinePrice = new OrderLinePrice(10.25, 'USD');

        orderLine = new OrderLine(0, [1, 2], 'Arabic 85', 20, orderLinePrice);
    });

    it('should correctly initialize a new OrderLine', () => {
        expect(orderLine.id).toEqual(0);
        expect(orderLine.productCategory).toEqual('Arabic 85');
        expect(orderLine.quantity).toEqual(20);
        expect(orderLine.price.amount).toEqual(orderLinePrice.amount);
        expect(orderLine.price.fiat).toEqual(orderLinePrice.fiat);
    });

    it('should correctly set the id', () => {
        orderLine.id = 1;
        expect(orderLine.id).toEqual(1);
    });

    it('should correctly set the productCategory', () => {
        orderLine.productCategory = 'Excelsa 88';
        expect(orderLine.productCategory).toEqual('Excelsa 88');
    });

    it('should correctly set the quantity', () => {
        orderLine.quantity = 30;
        expect(orderLine.quantity).toEqual(30);
    });

    it('should correctly set the price', () => {
        orderLine.price = new OrderLinePrice(25, 'CHF');
        expect(orderLine.price.amount).toEqual(25);
        expect(orderLine.price.fiat).toEqual('CHF');
    });
});

describe('OrderLinePrice', () => {
    let orderLinePrice: OrderLinePrice;

    beforeAll(() => {
        orderLinePrice = new OrderLinePrice(10.25, 'USD');
    });

    it('should correctly initialize a new OrderLinePrice', () => {
        expect(orderLinePrice.amount).toEqual(10.25);
        expect(orderLinePrice.fiat).toEqual('USD');
    });

    it('should correctly set the amount', () => {
        orderLinePrice.amount = 15;
        expect(orderLinePrice.amount).toEqual(15);
    });

    it('should correctly set the fiat', () => {
        orderLinePrice.fiat = 'CHF';
        expect(orderLinePrice.fiat).toEqual('CHF');
    });
});
