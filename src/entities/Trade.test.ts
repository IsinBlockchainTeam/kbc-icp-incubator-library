import { Trade } from './Trade';

class TestDummyTrade extends Trade {
    constructor(id: number, supplier: string, customer: string, externalUrl: string, lineIds: number[]) {
        super(id, supplier, customer, externalUrl, lineIds);
    }
}

describe('Trade', () => {
    let trade: TestDummyTrade;

    beforeAll(() => {
        trade = new TestDummyTrade(0, 'supplier', 'customer', 'externalUrl', [1, 2]);
    });

    it('should correctly initialize a new BasicTrade', () => {
        expect(trade.id).toEqual(0);
        expect(trade.supplier).toEqual('supplier');
        expect(trade.customer).toEqual('customer');
        expect(trade.externalUrl).toEqual('externalUrl');
        expect(trade.lineIds).toEqual([1, 2]);
    });

    it('should correctly set the id', () => {
        trade.id = 1;
        expect(trade.id).toEqual(1);
    });

    it('should correctly set the supplier', () => {
        trade.supplier = 'supplier 2';
        expect(trade.supplier).toEqual('supplier 2');
    });

    it('should correctly set the customer', () => {
        trade.customer = 'customer 2';
        expect(trade.customer).toEqual('customer 2');
    });

    it('should correctly set the lineIds', () => {
        trade.lineIds = [4, 5];
        expect(trade.lineIds).toEqual([4, 5]);
    });
});
