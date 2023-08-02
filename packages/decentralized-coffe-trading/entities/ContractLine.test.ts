import { ContractLine } from './ContractLine';

describe('ContractLine', () => {
    let contractLine: ContractLine;

    beforeAll(() => {
        contractLine = new ContractLine(0, 'CategoryA', 20, {
            amount: 5.2,
            fiat: 'USD',
        });
    });

    it('should correctly initialize a new ContractLine', () => {
        expect(contractLine.id).toEqual(0);
        expect(contractLine.productCategory).toEqual('CategoryA');
        expect(contractLine.quantity).toEqual(20);
        expect(contractLine.price.amount).toEqual(5.2);
        expect(contractLine.price.fiat).toEqual('USD');
    });

    it('should correctly set the id', () => {
        contractLine.id = 1;
        expect(contractLine.id).toEqual(1);
    });

    it('should correctly set the productCategory', () => {
        contractLine.productCategory = 'categoryB';
        expect(contractLine.productCategory).toEqual('categoryB');
    });

    it('should correctly set the quantity', () => {
        contractLine.quantity = 30;
        expect(contractLine.quantity).toEqual(30);
    });

    it('should correctly set the price', () => {
        contractLine.price = {
            amount: 25,
            fiat: 'CHF',
        };
        expect(contractLine.price.amount).toEqual(25);
        expect(contractLine.price.fiat).toEqual('CHF');
    });
});
