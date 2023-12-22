import { Line, LineRequest, Trade } from '../entities/Trade';

export interface IConcreteTradeDriver {
    getTrade(): Promise<Trade>;
    getLines(): Promise<Line[]>;
    getLine(id: number, blockNumber?: number): Promise<Line>;
    addLine(line: LineRequest): Promise<Line>;
    updateLine(line: Line): Promise<Line>;
}
