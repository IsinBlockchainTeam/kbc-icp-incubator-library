import { StorageACR } from '@blockchain-lib/common';
import { TradeService } from './TradeService';
import { BasicTradeDriver } from '../drivers/BasicTradeDriver';
import { IConcreteTradeService } from './IConcreteTradeService';
import { BasicTrade } from '../entities/BasicTrade';
import { Line, LineRequest } from '../entities/Trade';
import { DocumentSpec } from '../drivers/IStorageDocumentDriver';
import { MetadataSpec } from '../drivers/IStorageMetadataDriver';

export class BasicTradeService<MS extends MetadataSpec, DS extends DocumentSpec, ACR extends StorageACR> extends TradeService<MS, DS, ACR> implements IConcreteTradeService {
    async getTrade(blockNumber?: number): Promise<BasicTrade> {
        return this._tradeDriverImplementation.getTrade(blockNumber);
    }

    async getLines(): Promise<Line[]> {
        return this._tradeDriverImplementation.getLines();
    }

    async getLine(id: number, blockNumber?: number): Promise<Line> {
        return this._tradeDriverImplementation.getLine(id, blockNumber);
    }

    async addLine(line: LineRequest): Promise<Line> {
        return this._tradeDriverImplementation.addLine(line);
    }

    async updateLine(line: Line): Promise<Line> {
        return this._tradeDriverImplementation.updateLine(line);
    }

    async assignMaterial(lineId: number, materialId: number): Promise<void> {
        return this._tradeDriverImplementation.assignMaterial(lineId, materialId);
    }

    async setName(name: string): Promise<void> {
        return this._tradeDriverImplementation.setName(name);
    }

    private get _tradeDriverImplementation(): BasicTradeDriver {
        return this._tradeDriver as BasicTradeDriver;
    }
}
