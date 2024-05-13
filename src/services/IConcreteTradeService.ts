import { Line, LineRequest, Trade } from '../entities/Trade';
import { ResourceSpec } from "@blockchain-lib/common";

export interface IConcreteTradeService {
    getTrade(resourceSpec?: ResourceSpec, blockNumber?: number): Promise<Trade>;
    getLines(): Promise<Line[]>;
    getLine(id: number, blockNumber?: number): Promise<Line>;
    addLine(line: LineRequest): Promise<number>;
    updateLine(line: LineRequest): Promise<void>;
    assignMaterial(lineId: number, materialId: number): Promise<void>;
}
