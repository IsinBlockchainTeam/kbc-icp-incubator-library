import { TradeDriver } from '../drivers/TradeDriver';
import { TradeStatus } from '../types/TradeStatus';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';

export class TradeService {
    protected _tradeDriver: TradeDriver;

    constructor(supplyChainDriver: TradeDriver) {
        this._tradeDriver = supplyChainDriver;
    }

    async getLineCounter(): Promise<number> {
        return this._tradeDriver.getLineCounter();
    }

    async getTradeType(): Promise<TradeType> {
        return this._tradeDriver.getTradeType();
    }

    async getLineExists(id: number): Promise<boolean> {
        return this._tradeDriver.getLineExists(id);
    }

    async getTradeStatus(): Promise<TradeStatus> {
        return this._tradeDriver.getTradeStatus();
    }

    async addDocument(lineId: number, name: string, documentType: DocumentType, externalUrl: string): Promise<void> {
        return this._tradeDriver.addDocument(lineId, name, documentType, externalUrl);
    }

    async addAdmin(account: string): Promise<void> {
        return this._tradeDriver.addAdmin(account);
    }

    async removeAdmin(account: string): Promise<void> {
        return this._tradeDriver.removeAdmin(account);
    }
}
