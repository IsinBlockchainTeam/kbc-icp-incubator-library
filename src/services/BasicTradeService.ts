import { TradeService } from './TradeService';
import { TradeDriver } from '../drivers/TradeDriver';
import { BasicTradeDriver } from '../drivers/BasicTradeDriver';

export class BasicTradeService extends TradeService {
    constructor(tradeDriver: TradeDriver) {
        super(tradeDriver);
    }

    async getBasicTrade(): Promise<{
        tradeId: number,
        supplier: string,
        customer: string,
        commissioner: string,
        externalUrl: string,
        lineIds: number[],
        name: string
    }> {
        return this._tradeDriverImplementation.getBasicTrade();
    }

    async setName(name: string): Promise<void> {
        return this._tradeDriverImplementation.setName(name);
    }

    private get _tradeDriverImplementation(): BasicTradeDriver {
        return this._tradeDriver as BasicTradeDriver;
    }
}
