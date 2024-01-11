import { BigNumber } from 'ethers';
import { Line, LineRequest, Trade } from './Trade';
import {
    Trade as TradeContract,
} from '../smart-contracts/contracts/OrderTrade';
import { EntityBuilder } from '../utils/EntityBuilder';

class TestTrade extends Trade {
    constructor(tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lines: Map<number, Line>, lineIds: number[]) {
        super(tradeId, supplier, customer, commissioner, externalUrl, lines);
    }
}

describe('Line', () => {
    let line: Line;

    beforeAll(() => {
        line = new Line(0, [1, 2], 'test');
    });

    it('should correctly initialize a Line', () => {
        expect(line.id)
            .toEqual(0);
        expect(line.materialsId)
            .toEqual([1, 2]);
        expect(line.productCategory)
            .toEqual('test');
    });

    it('should correctly set the id', () => {
        line.id = 42;
        expect(line.id)
            .toEqual(42);
    });

    it('should correctly set the materialsId', () => {
        line.materialsId = [3, 4];
        expect(line.materialsId)
            .toEqual([3, 4]);
    });

    it('should correctly set the product category', () => {
        line.productCategory = 'new';
        expect(line.productCategory)
            .toEqual('new');
    });
});

describe('LineRequest', () => {
    let line: LineRequest;

    beforeAll(() => {
        line = new LineRequest([1, 2], 'test');
    });

    it('should correctly initialize a LineRequest', () => {
        expect(line.materialsId)
            .toEqual([1, 2]);
        expect(line.productCategory)
            .toEqual('test');
    });

    it('should correctly set the materialsId', () => {
        line.materialsId = [3, 4];
        expect(line.materialsId)
            .toEqual([3, 4]);
    });

    it('should correctly set the product category', () => {
        line.productCategory = 'new';
        expect(line.productCategory)
            .toEqual('new');
    });
});

describe('Trade', () => {
    let trade: TestTrade;

    beforeAll(() => {
        trade = new TestTrade(0, 'supplier', 'customer', 'commissioner', 'https://test.com', new Map<number, Line>(), []);
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
            .toEqual(new Map<number, TradeContract.LineStructOutput>());
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
        const newLines = new Map<number, Line>();
        const newLine: TradeContract.LineStructOutput = {
            id: BigNumber.from(0),
            materialsId: [BigNumber.from(0), BigNumber.from(1)],
            productCategory: 'test category',
            exists: true,
        } as TradeContract.LineStructOutput;
        newLines.set(1, EntityBuilder.buildTradeLine(newLine));
        trade.lines = newLines;
        expect(trade.lines)
            .toEqual(newLines);
    });
});
