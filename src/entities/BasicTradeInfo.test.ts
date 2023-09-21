import { BasicTradeInfo } from './BasicTradeInfo';

describe('BasicTradeInfo', () => {
    let basicTradeInfo: BasicTradeInfo;

    beforeAll(() => {
        basicTradeInfo = new BasicTradeInfo(0, 'supplier', 'customer', 'externalUrl', [1, 2], 'tradeName');
    });

    it('should correctly initialize a new BasicTrade', () => {
        expect(basicTradeInfo.id).toEqual(0);
        expect(basicTradeInfo.supplier).toEqual('supplier');
        expect(basicTradeInfo.customer).toEqual('customer');
        expect(basicTradeInfo.externalUrl).toEqual('externalUrl');
        expect(basicTradeInfo.lineIds).toEqual([1, 2]);
        expect(basicTradeInfo.name).toEqual('material');
    });

    it('should correctly set the id', () => {
        basicTradeInfo.id = 1;
        expect(basicTradeInfo.id).toEqual(1);
    });

    it('should correctly set the supplier', () => {
        basicTradeInfo.supplier = 'supplier 2';
        expect(basicTradeInfo.supplier).toEqual('supplier 2');
    });

    it('should correctly set the customer', () => {
        basicTradeInfo.customer = 'customer 2';
        expect(basicTradeInfo.customer).toEqual('customer 2');
    });

    it('should correctly set the lineIds', () => {
        basicTradeInfo.lineIds = [4, 5];
        expect(basicTradeInfo.lineIds).toEqual([4, 5]);
    });

    it('should correctly set the name', () => {
        basicTradeInfo.name = 'trade2';
        expect(basicTradeInfo.name).toEqual('trade2');
    });
});
