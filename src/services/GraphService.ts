import { Signer } from 'ethers';
import { Line, Trade } from '../entities/Trade';
import { AssetOperation } from '../entities/AssetOperation';
import { TradeManagerService } from './TradeManagerService';
import { AssetOperationService } from './AssetOperationService';
import { Material } from '../entities/Material';
import { AssetOperationType } from '../types/AssetOperationType';

export type Node = AssetOperation;

export type Edge = {
    trade: Trade,
    from: string,
    to: string,
};

export type GraphData = {
    nodes: Array<Node>,
    edges: Array<Edge>,
}

export class GraphService {
    private _signer: Signer;

    private _tradeManagerService: TradeManagerService;

    private _assetOperationService: AssetOperationService;

    constructor(signer: Signer, tradeManagerService: TradeManagerService, assetOperationService: AssetOperationService) {
        this._signer = signer;
        this._tradeManagerService = tradeManagerService;
        this._assetOperationService = assetOperationService;
    }

    private async _handleConsolidations(assetOperations: AssetOperation[], materialId: number, partialGraphData: GraphData = {
        nodes: [],
        edges: [],
    }): Promise<{transformation: AssetOperation | undefined, partialGraphData: GraphData}> {
        const transformation: AssetOperation = assetOperations.filter((ao) => ao.type === AssetOperationType.TRANSFORMATION)[0];
        if (assetOperations.some((ao: AssetOperation) => ao.type === AssetOperationType.CONSOLIDATION)) {
            // Sort descending
            const consolidations: AssetOperation[] = assetOperations
                .filter((ao) => ao.type === AssetOperationType.CONSOLIDATION)
                .sort((a, b) => b.id - a.id);
            const trades: Trade[] = (await this._tradeManagerService.getTradesByMaterial(materialId))
                .sort((a, b) => b.tradeId - a.tradeId);

            for (let i: number = 0; i < consolidations.length; i++) {
                partialGraphData.nodes.push(consolidations[i]);

                if (!transformation)
                    // The consolidation's input material is a "pure" material, not a transformation's output material.
                    break;

                partialGraphData.edges.push({
                    trade: trades[i],
                    from: i === consolidations.length - 1 ? transformation.name : consolidations[i + 1].name,
                    to: consolidations[i].name,
                });
            }
        }

        return { transformation, partialGraphData };
    }

    public async findTradesByMaterial(materialId: number): Promise<Map<Trade, Line[]>> {
        const result: Map<Trade, Line[]> = new Map<Trade, Line[]>();
        const trades: Trade[] = await this._tradeManagerService.getTradesByMaterial(materialId);

        for (const trade of trades) {
            const filteredLines: Line[] = trade.lines.filter((l) => l.material?.id === materialId);
            if (filteredLines.length > 0) {
                result.set(trade, filteredLines);
            }
        }

        return result;
    }

    public async computeGraph(materialId: number, partialGraphData: GraphData = {
        nodes: [],
        edges: [],
    }): Promise<GraphData> {
        const assetOperations = await this._assetOperationService.getAssetOperationsByOutputMaterial(materialId);
        if (assetOperations.length === 0) {
            return partialGraphData;
        }

        const result = await this._handleConsolidations(assetOperations, materialId, partialGraphData);
        const { transformation } = result;
        partialGraphData = result.partialGraphData;

        if (!transformation)
            // The material is a "pure" material, not a transformation's output material, return.
            return partialGraphData;

        if (partialGraphData.nodes.some((n) => n.id === transformation.id))
            // This branch has already been explored, return.
            return partialGraphData;

        partialGraphData.nodes.push(transformation);

        await Promise.all(transformation.inputMaterials.map(async (assetOperationInputMaterial: Material) => {
            const filteredTradesMap: Map<Trade, Line[]> = await this.findTradesByMaterial(assetOperationInputMaterial.id);
            if (filteredTradesMap.size === 0) {
                return partialGraphData;
            }

            const tradeWithMaterialIdMap: Map<Trade, number[]> = new Map(
                Array.from(filteredTradesMap).map(([trade, lines]) => [trade, lines.map((l: Line) => l.material!.id)]),
            );

            await Promise.all(Array.from(tradeWithMaterialIdMap).map(async ([trade, materialInputIds]) => {
                await Promise.all(materialInputIds.map(async (involvedMaterialInputId: number) => {
                    const inputAssetOperations: AssetOperation[] = await this._assetOperationService.getAssetOperationsByOutputMaterial(involvedMaterialInputId);

                    const newEdge: Edge = {
                        // resourcesIds: Array.from(filteredTradesMap.entries())
                        //     .filter(([_, lines]) => lines
                        //         .filter((tl) => tl.material!.id === involvedMaterialInputId).length > 0)
                        //     .map(([trade, _]) => `${trade.supplier}_trade_${trade.tradeId}`),
                        trade,
                        from: inputAssetOperations[0].name,
                        to: transformation!.name,
                    };

                    if (partialGraphData.edges.some((e) => e.trade === newEdge.trade && e.from === newEdge.from && e.to === newEdge.to))
                        // This branch has already been explored, return.
                        return partialGraphData;

                    partialGraphData.edges.push(newEdge);

                    await this.computeGraph(involvedMaterialInputId, partialGraphData);
                }));
            }));
        }));

        return partialGraphData;
    }
}
