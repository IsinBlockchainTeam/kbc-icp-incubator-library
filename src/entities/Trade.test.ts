import { BigNumber } from 'ethers';
import { Line, LineRequest, Trade } from './Trade';
import {
    Trade as TradeContract,
} from '../smart-contracts/contracts/OrderTrade';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';
import { MaterialManager, ProductCategoryManager } from '../smart-contracts';

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
        line = new Line(0, new Material(1, productCategory), productCategory, 10, 'KGM');
    });

    it('should correctly initialize a Line', () => {
        expect(line.id)
            .toEqual(0);
        expect(line.material)
            .toEqual(new Material(1, new ProductCategory(1, 'test', 1, 'test')));
        expect(line.productCategory)
            .toEqual(new ProductCategory(1, 'test', 1, 'test'));
        expect(line.quantity)
            .toEqual(10);
        expect(line.unit)
            .toEqual('KGM');
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

    it('should correctly set the quantity', () => {
        line.quantity = 20;
        expect(line.quantity)
            .toEqual(20);
    });

    it('should correctly set the unit', () => {
        line.unit = 'BG';
        expect(line.unit)
            .toEqual('BG');
    });
});

describe('LineRequest', () => {
    let line: LineRequest;

    beforeAll(() => {
        line = new LineRequest(1, 15, 'KGM');
    });

    it('should correctly initialize a LineRequest', () => {
        expect(line.productCategoryId)
            .toEqual(1);
        expect(line.quantity)
            .toEqual(15);
        expect(line.unit)
            .toEqual('KGM');
    });

    it('should correctly set the product category', () => {
        line.productCategoryId = 2;
        expect(line.productCategoryId)
            .toEqual(2);
    });

    it('should correctly set the quantity', () => {
        line.quantity = 20;
        expect(line.quantity)
            .toEqual(20);
    });

    it('should correctly set the unit', () => {
        line.unit = 'BG';
        expect(line.unit)
            .toEqual('BG');
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
        const newLine: TradeContract.LineStructOutput = {
            id: BigNumber.from(1),
            materialId: BigNumber.from(2),
            quantity: BigNumber.from(10),
            unit: 'KGM',
            productCategoryId: BigNumber.from(3),
            exists: true,
        } as TradeContract.LineStructOutput;
        const materialStruct: MaterialManager.MaterialStructOutput = {
            id: BigNumber.from(2),
            productCategoryId: BigNumber.from(3),
            exists: true,
        } as MaterialManager.MaterialStructOutput;
        const productCategoryStruct: ProductCategoryManager.ProductCategoryStructOutput = {
            id: BigNumber.from(3),
            name: 'test',
            quality: 1,
            description: 'test',
            exists: true,
        } as ProductCategoryManager.ProductCategoryStructOutput;
        trade.lines = [EntityBuilder.buildTradeLine(newLine, productCategoryStruct, materialStruct)];
        expect(trade.lines)
            .toEqual([EntityBuilder.buildTradeLine(newLine, productCategoryStruct, materialStruct)]);
    });
});
