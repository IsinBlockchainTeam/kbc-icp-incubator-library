import { BasicTradeInfo } from './BasicTradeInfo';
import { BasicTrade } from './BasicTrade';

describe('BasicTrade', () => {
    let basicTrade: BasicTrade;
    let basicTradeInfo: BasicTradeInfo;
    const issueDate = new Date();

    beforeAll(() => {
        basicTradeInfo = new BasicTradeInfo(0, 'supplier', 'customer', 'externalUrl', [1, 2], 'tradeName');
        basicTrade = new BasicTrade(basicTradeInfo, issueDate);
    });

    it('should correctly initialize a new BasicTrade', () => {
        expect(basicTrade.id).toEqual(basicTradeInfo.id);
        expect(basicTrade.supplier).toEqual(basicTradeInfo.supplier);
        expect(basicTrade.customer).toEqual(basicTradeInfo.customer);
        expect(basicTrade.externalUrl).toEqual(basicTradeInfo.externalUrl);
        expect(basicTrade.lineIds).toEqual(basicTradeInfo.lineIds);
        expect(basicTrade.name).toEqual(basicTradeInfo.name);
        expect(basicTrade.issueDate).toEqual(issueDate);
    });

    it('should correctly set the id', () => {
        basicTrade.id = 1;
        expect(basicTrade.id).toEqual(1);
    });

    it('should correctly set the supplier', () => {
        basicTrade.supplier = 'supplier 2';
        expect(basicTrade.supplier).toEqual('supplier 2');
    });

    it('should correctly set the customer', () => {
        basicTrade.customer = 'customer 2';
        expect(basicTrade.customer).toEqual('customer 2');
    });

    it('should correctly set the lineIds', () => {
        basicTrade.lineIds = [4, 5];
        expect(basicTrade.lineIds).toEqual([4, 5]);
    });

    it('should correctly set the name', () => {
        basicTrade.name = 'trade2';
        expect(basicTrade.name).toEqual('trade2');
    });
});
