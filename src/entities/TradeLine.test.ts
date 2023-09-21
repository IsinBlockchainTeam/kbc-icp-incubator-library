import { TradeLine } from './TradeLine';

describe('TradeLine', () => {
    let tradeLine: TradeLine;

    beforeAll(() => {
        tradeLine = new TradeLine(0, [1, 2], 'categoryA');
    });

    it('should correctly initialize a new BasicTrade', () => {
        expect(tradeLine.id).toEqual(0);
        expect(tradeLine.materialIds).toEqual([1, 2]);
        expect(tradeLine.productCategory).toEqual('categoryA');
    });

    it('should correctly set the id', () => {
        tradeLine.id = 1;
        expect(tradeLine.id).toEqual(1);
    });

    it('should correctly set the lineIds', () => {
        tradeLine.materialIds = [4, 5];
        expect(tradeLine.materialIds).toEqual([4, 5]);
    });

    it('should correctly set the productCategory', () => {
        tradeLine.productCategory = 'productCategory 2';
        expect(tradeLine.productCategory).toEqual('productCategory 2');
    });
});
