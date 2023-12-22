import { BasicTrade } from './BasicTrade';
import { Line } from './Trade';

describe('BasicTrade', () => {
    let basicTrade: BasicTrade;

    beforeAll(() => {
        basicTrade = new BasicTrade(0, 'supplier', 'customer', 'commissioner', 'https://test.com', new Map<number, Line>(), [], 'test trade');
    });

    it('should correctly initialize a BasicTrade', () => {
        expect(basicTrade.tradeId)
            .toEqual(0);
        expect(basicTrade.supplier)
            .toEqual('supplier');
        expect(basicTrade.customer)
            .toEqual('customer');
        expect(basicTrade.commissioner)
            .toEqual('commissioner');
        expect(basicTrade.externalUrl)
            .toEqual('https://test.com');
        expect(basicTrade.lines)
            .toEqual(new Map<number, Line>());
        expect(basicTrade.lineIds)
            .toEqual([]);
        expect(basicTrade.name)
            .toEqual('test trade');
    });

    it('should correctly set the name', () => {
        basicTrade.name = 'new test trade';
        expect(basicTrade.name)
            .toEqual('new test trade');
    });
});
