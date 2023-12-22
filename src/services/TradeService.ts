import { TradeDriver } from '../drivers/TradeDriver';
import { TradeStatus } from '../types/TradeStatus';
import { DocumentType } from '../entities/DocumentInfo';
import { Line } from '../entities/Trade';

export class TradeService {
    protected _tradeDriver: TradeDriver;

    constructor(supplyChainDriver: TradeDriver) {
        this._tradeDriver = supplyChainDriver;
    }

    async getTrade(): Promise<{ tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lineIds: number[] }> {
        return this._tradeDriver.getTrade();
    }

    async getLines(): Promise<Line[]> {
        return this._tradeDriver.getLines();
    }

    async getLine(id: number): Promise<Line> {
        return this._tradeDriver.getLine(id);
    }

    async getLineExists(id: number): Promise<boolean> {
        return this._tradeDriver.getLineExists(id);
    }

    async addLine(materialIds: [number, number], productCategory: string): Promise<void> {
        return this._tradeDriver.addLine(materialIds, productCategory);
    }

    async updateLine(id: number, materialIds: [number, number], productCategory: string): Promise<void> {
        return this._tradeDriver.updateLine(id, materialIds, productCategory);
    }

    async getTradeStatus(): Promise<TradeStatus> {
        return this._tradeDriver.getTradeStatus();
    }

    async addDocument(name: string, documentType: DocumentType, externalUrl: string): Promise<void> {
        return this._tradeDriver.addDocument(name, documentType, externalUrl);
    }

    async addAdmin(account: string): Promise<void> {
        return this._tradeDriver.addAdmin(account);
    }

    async removeAdmin(account: string): Promise<void> {
        return this._tradeDriver.removeAdmin(account);
    }
}
