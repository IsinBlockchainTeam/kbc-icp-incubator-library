import {Signer} from 'ethers';
import {Line, Trade} from '../entities/Trade';
import {AssetOperation} from '../entities/AssetOperation';
import {TradeManagerService} from './TradeManagerService';
import {AssetOperationService} from './AssetOperationService';
import {AssetOperationType} from "../types/AssetOperationType";

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

    private _assetOperationMap: Map<number, AssetOperation[]> = new Map<number, AssetOperation[]>();
    private _trades: Trade[] = [];
    private _flag: boolean = false;

    constructor(signer: Signer, tradeManagerService: TradeManagerService, transformationService: AssetOperationService) {
        this._signer = signer;
        this._tradeManagerService = tradeManagerService;
        this._assetOperationService = transformationService;
    }

    private _handleConsolidations(assetOperations: AssetOperation[], materialId: number, partialGraphData: GraphData = {
        nodes: [],
        edges: []
    }): { transformation: AssetOperation | undefined, partialGraphData: GraphData } {
        const transformation: AssetOperation = assetOperations.filter((ao: AssetOperation) => ao.type === AssetOperationType.TRANSFORMATION)[0];
        if(assetOperations.some((ao: AssetOperation) => ao.type === AssetOperationType.CONSOLIDATION)) {
            const consolidations: AssetOperation[] = assetOperations
                .filter((ao) => ao.type === AssetOperationType.CONSOLIDATION);
            const trades: Trade[] = this._trades.filter((t: Trade) => t.lines.some((l: Line) => l.material?.id === materialId));

            for(let i: number = 0; i < consolidations.length; i ++) {
                partialGraphData.nodes.push(consolidations[i]);

                if(i === consolidations.length - 1 && !transformation)
                    // The consolidation's input material is a "pure" material, not a transformation's output material.
                    break;

                partialGraphData.edges.push({
                    trade: this._flag ? trades[i + 1] : trades[i],
                    from: i === consolidations.length - 1 ? transformation.name : consolidations[i + 1].name,
                    to: consolidations[i].name
                });
            }
        }

        this._flag = false;

        return { transformation, partialGraphData }
    }

    private _computeGraph(materialId: number, partialGraphData: GraphData = {
        nodes: [],
        edges: []
    }): GraphData {
        const assetOperations = this._assetOperationMap.get(materialId) || [];
        if(assetOperations.length === 0) {
            return partialGraphData;
        }

        const result = this._handleConsolidations(assetOperations, materialId, partialGraphData);
        const { transformation } = result;
        partialGraphData = result.partialGraphData;

        if(!transformation)
            // The material is a "pure" material, not a transformation's output material, return.
            return partialGraphData;

        if(partialGraphData.nodes.some((n) => n.id === transformation.id))
            // This branch has already been explored, return.
            return partialGraphData;

        partialGraphData.nodes.push(transformation);

        for(const assetOperationInputMaterial of transformation.inputMaterials) {
            const filteredTradesMap: Map<Trade, number[]> = this._trades
                .filter((t: Trade) => t.lines.some((l: Line) => l.material?.id === assetOperationInputMaterial.id))
                .reduce((acc: Map<Trade, number[]>, trade: Trade) => {
                    acc.set(trade, trade.lines.filter((l: Line) => l.material?.id === assetOperationInputMaterial.id)
                        .map((l: Line) => l.material!.id));
                    return acc;
                }, new Map<Trade, number[]>());

            for(const [trade, materialInputIds] of filteredTradesMap) {
                for(const involvedMaterialInputId of materialInputIds) {
                    const list = this._assetOperationMap.get(involvedMaterialInputId);
                    const inputAssetOperation: AssetOperation | undefined = list ? list[0] : undefined;

                    if(!inputAssetOperation)
                        throw new Error("Found a trade whose material id is not associated with any asset operation");

                    if(inputAssetOperation.type === AssetOperationType.CONSOLIDATION && partialGraphData.nodes.some((ao: AssetOperation) => ao.id === inputAssetOperation.id))
                        return partialGraphData;

                    const newEdge: Edge = {
                        trade: trade,
                        from: inputAssetOperation.name,
                        to: transformation!.name
                    };

                    if(partialGraphData.edges.some((e) => e.trade === newEdge.trade && e.from === newEdge.from && e.to === newEdge.to))
                        // This branch has already been explored, return.
                        return partialGraphData;

                    partialGraphData.edges.push(newEdge);
                    this._flag = true;

                    this._computeGraph(involvedMaterialInputId, partialGraphData);
                }
            }
        }

        return partialGraphData;
    }

    private async _loadData() {
        const assetOperations = (await this._assetOperationService.getAssetOperations())
            .sort((a, b) => b.id - a.id);
        for(const assetOperation of assetOperations) {
            this._assetOperationMap.get(assetOperation.outputMaterial.id)?.push(assetOperation) || this._assetOperationMap.set(assetOperation.outputMaterial.id, [assetOperation]);
        }
        // this._assetOperations = await this._assetOperationService.getAssetOperations();
        this._trades = (await this._tradeManagerService.getTrades())
            .sort((a, b) => b.tradeId - a.tradeId);
    }

    public async computeGraph(materialId: number, refreshData: boolean): Promise<GraphData> {
        refreshData && await this._loadData();
        return this._computeGraph(materialId);
    }
}
