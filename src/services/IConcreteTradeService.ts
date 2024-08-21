import { ResourceSpec } from '@blockchain-lib/common';
import { Line, LineRequest, Trade } from '../entities/Trade';
import { RoleProof } from '../types/RoleProof';

export interface IConcreteTradeService {
    getTrade(
        roleProof: RoleProof,
        resourceSpec?: ResourceSpec,
        blockNumber?: number
    ): Promise<Trade>;
    getLines(roleProof: RoleProof): Promise<Line[]>;
    getLine(roleProof: RoleProof, id: number, blockNumber?: number): Promise<Line>;
    addLine(roleProof: RoleProof, line: LineRequest): Promise<number>;
    updateLine(roleProof: RoleProof, line: Line): Promise<void>;
    assignMaterial(roleProof: RoleProof, lineId: number, materialId: number): Promise<void>;
}
