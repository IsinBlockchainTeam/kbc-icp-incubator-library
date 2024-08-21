import { FileHelpers } from '@blockchain-lib/common';
import { TradeService } from './TradeService';
import { BasicTradeDriver } from '../drivers/BasicTradeDriver';
import { IConcreteTradeService } from './IConcreteTradeService';
import { BasicTrade, BasicTradeMetadata } from '../entities/BasicTrade';
import { Line, LineRequest } from '../entities/Trade';
import { RoleProof } from '../types/RoleProof';

export class BasicTradeService extends TradeService implements IConcreteTradeService {
    async getTrade(roleProof: RoleProof, blockNumber?: number): Promise<BasicTrade> {
        return this._tradeDriverImplementation.getTrade(roleProof, blockNumber);
    }

    async getCompleteTrade(roleProof: RoleProof, blockNumber?: number): Promise<BasicTrade> {
        if (!this._icpFileDriver)
            throw new Error('BasicTradeService: ICPFileDriver has not been set');

        const trade = await this._tradeDriverImplementation.getTrade(roleProof, blockNumber);
        const bytes = await this._icpFileDriver.read(`${trade.externalUrl}/files/metadata.json`);
        trade.metadata = FileHelpers.getObjectFromBytes(bytes) as BasicTradeMetadata;
        return trade;
    }

    async getLines(roleProof: RoleProof): Promise<Line[]> {
        return this._tradeDriverImplementation.getLines(roleProof);
    }

    async getLine(roleProof: RoleProof, id: number, blockNumber?: number): Promise<Line> {
        return this._tradeDriverImplementation.getLine(roleProof, id, blockNumber);
    }

    async addLine(roleProof: RoleProof, line: LineRequest): Promise<number> {
        return this._tradeDriverImplementation.addLine(roleProof, line);
    }

    async updateLine(roleProof: RoleProof, line: Line): Promise<void> {
        return this._tradeDriverImplementation.updateLine(roleProof, line);
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
