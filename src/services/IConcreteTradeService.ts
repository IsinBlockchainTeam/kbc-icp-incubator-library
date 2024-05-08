import { Line, LineRequest, Trade } from '../entities/Trade';

export interface IConcreteTradeService {
    getTrade(blockNumber?: number): Promise<Trade>;
    getLines(): Promise<Line[]>;
    getLine(id: number, blockNumber?: number): Promise<Line>;
    addLine(line: LineRequest): Promise<number>;
    updateLine(line: LineRequest): Promise<void>;
    assignMaterial(lineId: number, materialId: number): Promise<void>;
}
