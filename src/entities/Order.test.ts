import { Order } from './Order';
import { OrderLine } from './OrderLine';

describe('Contract', () => {
    let contract: Order;

    beforeAll(() => {
        contract = new Order(0, 'supplier', 'customer', 'externalUrl', 'offeree', 'offeror', [1, 2], []);
    });

    it('should correctly initialize a new Order', () => {
        expect(contract.id).toEqual(0);
        expect(contract.lines).toEqual([]);
        expect(contract.supplier).toEqual('supplier');
        expect(contract.customer).toEqual('customer');
        expect(contract.offeree).toEqual('offeree');
        expect(contract.offeror).toEqual('offeror');
        expect(contract.externalUrl).toEqual('externalUrl');
        expect(contract.lineIds).toEqual([1, 2]);
        expect(contract.lines).toEqual([]);
        expect(contract.offereeSigned).toBeFalsy();
        expect(contract.offerorSigned).toBeFalsy();
    });

    it('should correctly set the id', () => {
        contract.id = 1;
        expect(contract.id).toEqual(1);
    });

    it('should correctly set the lines', () => {
        const contractLine: OrderLine = new OrderLine('CategoryA', 20, {
            amount: 5.2,
            fiat: 'USD',
        });
        contract.lines = [contractLine];
        expect(contract.lines).toEqual([contractLine]);
    });

    it('should correctly set the line ids', () => {
        contract.lineIds = [3, 4, 5];
        expect(contract.lineIds).toEqual([3, 4, 5]);
    });

    it('should correctly set the supplier', () => {
        contract.supplier = 'supplier2';
        expect(contract.supplier).toEqual('supplier2');
    });

    it('should correctly set the customer', () => {
        contract.customer = 'customer2';
        expect(contract.customer).toEqual('customer2');
    });

    it('should correctly set the externalUrl', () => {
        contract.externalUrl = 'externalUrl2';
        expect(contract.externalUrl).toEqual('externalUrl2');
    });

    it('should correctly set the offeree', () => {
        contract.offeree = 'offeree2';
        expect(contract.offeree).toEqual('offeree2');
    });

    it('should correctly set the offeror', () => {
        contract.offeror = 'offeror2';
        expect(contract.offeror).toEqual('offeror2');
    });

    it('should correctly set the offereeSigned', () => {
        contract.offereeSigned = true;
        expect(contract.offereeSigned).toBeTruthy();
    });

    it('should correctly set the offerorSigned', () => {
        contract.offerorSigned = false;
        expect(contract.offerorSigned).toBeFalsy();
    });
});
