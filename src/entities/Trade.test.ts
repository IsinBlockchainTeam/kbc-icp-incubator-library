import { BigNumber } from 'ethers';
import { Line, LineRequest, Trade } from './Trade';
import {
    Trade as TradeContract,
} from '../smart-contracts/contracts/OrderTrade';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';

class TestTrade extends Trade {
    // eslint-disable-next-line no-useless-constructor
    constructor(tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lines: Line[]) {
        super(tradeId, supplier, customer, commissioner, externalUrl, lines);
    }
}

describe('Line', () => {
    let line: Line;

    beforeAll(() => {
        const productCategory = new ProductCategory(1, 'test', 1, 'test');
        line = new Line(0, new Material(1, productCategory), productCategory);
    });

    it('should correctly initialize a Line', () => {
        expect(line.id)
            .toEqual(0);
        expect(line.material)
            .toEqual(new Material(1, new ProductCategory(1, 'test', 1, 'test')));
        expect(line.productCategory)
            .toEqual(new ProductCategory(1, 'test', 1, 'test'));
    });

    it('should correctly set the id', () => {
        line.id = 42;
        expect(line.id)
            .toEqual(42);
    });

    it('should correctly set the material', () => {
        line.material = new Material(2, new ProductCategory(2, 'test2', 2, 'test2'));
        expect(line.material)
            .toEqual(new Material(2, new ProductCategory(2, 'test2', 2, 'test2')));
    });

    it('should correctly set the product category', () => {
        line.productCategory = new ProductCategory(2, 'test2', 2, 'test2');
        expect(line.productCategory)
            .toEqual(new ProductCategory(2, 'test2', 2, 'test2'));
    });
});

describe('LineRequest', () => {
    let line: LineRequest;

    beforeAll(() => {
        const productCategory = new ProductCategory(1, 'test', 1, 'test');
        line = new LineRequest(new Material(1, productCategory), productCategory);
    });

    it('should correctly initialize a LineRequest', () => {
        expect(line.material)
            .toEqual(new Material(1, new ProductCategory(1, 'test', 1, 'test')));
        expect(line.productCategory)
            .toEqual(new ProductCategory(1, 'test', 1, 'test'));
    });

    it('should correctly set the material', () => {
        line.material = new Material(2, new ProductCategory(2, 'test2', 2, 'test2'));
        expect(line.material)
            .toEqual(new Material(2, new ProductCategory(2, 'test2', 2, 'test2')));
    });

    it('should correctly set the product category', () => {
        line.productCategory = new ProductCategory(2, 'test2', 2, 'test2');
        expect(line.productCategory)
            .toEqual(new ProductCategory(2, 'test2', 2, 'test2'));
    });
});

describe('Trade', () => {
    let trade: TestTrade;

    beforeAll(() => {
        trade = new TestTrade(0, 'supplier', 'customer', 'commissioner', 'https://test.com', []);
    });

    it('should correctly initialize a Trade', () => {
        expect(trade.tradeId)
            .toEqual(0);
        expect(trade.supplier)
            .toEqual('supplier');
        expect(trade.customer)
            .toEqual('customer');
        expect(trade.commissioner)
            .toEqual('commissioner');
        expect(trade.externalUrl)
            .toEqual('https://test.com');
        expect(trade.lines)
            .toEqual([]);
    });

    it('should correctly set the tradeId', () => {
        trade.tradeId = 42;
        expect(trade.tradeId)
            .toEqual(42);
    });

    it('should correctly set the supplier', () => {
        trade.supplier = 'newSupplier';
        expect(trade.supplier)
            .toEqual('newSupplier');
    });

    it('should correctly set the customer', () => {
        trade.customer = 'newCustomer';
        expect(trade.customer)
            .toEqual('newCustomer');
    });

    it('should correctly set the commissioner', () => {
        trade.commissioner = 'newCommissioner';
        expect(trade.commissioner)
            .toEqual('newCommissioner');
    });

    it('should correctly set the externalUrl', () => {
        trade.externalUrl = 'https://new-test.com';
        expect(trade.externalUrl)
            .toEqual('https://new-test.com');
    });

    it('should correctly set the lines', () => {
        const productCategory = new ProductCategory(3, 'test', 1, 'test');
        const newLine: TradeContract.LineStructOutput = {
            id: BigNumber.from(1),
            materialId: BigNumber.from(2),
            productCategoryId: BigNumber.from(3),
            exists: true,
        } as TradeContract.LineStructOutput;
        trade.lines = [EntityBuilder.buildTradeLine(newLine, new Material(2, productCategory), productCategory)];
        expect(trade.lines)
            .toEqual([EntityBuilder.buildTradeLine(newLine, new Material(2, productCategory), productCategory)]);
    });
});
