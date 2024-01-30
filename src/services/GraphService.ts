import {Signer} from 'ethers';
import {Line, Trade} from '../entities/Trade';
import {AssetOperation} from '../entities/AssetOperation';
import {TradeManagerService} from './TradeManagerService';
import {AssetOperationService} from './AssetOperationService';
import {Material} from "../entities/Material";
import {AssetOperationType} from "../types/AssetOperationType";

export type Node = {
    id: number,
    type: AssetOperationType,
    resourceId: string,
};

export type Edge = {
    resourcesIds: Array<string>,
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

    constructor(signer: Signer, tradeManagerService: TradeManagerService, transformationService: AssetOperationService) {
        this._signer = signer;
        this._tradeManagerService = tradeManagerService;
        this._assetOperationService = transformationService;
    }

    public async findTradesByMaterialOutput(materialId: number): Promise<Map<Trade, Line[]>> {
        const result: Map<Trade, Line[]> = new Map<Trade, Line[]>();
        const trades: Trade[] = await this._tradeManagerService.getTradesByMaterial(materialId);

        for(const trade of trades) {
            const filteredLines: Line[] = trade.lines.filter((l) => l.material?.id === materialId);
            if(filteredLines.length > 0) {
                result.set(trade, filteredLines);
            }
        }

        return result;
    }

    // 1. materialId = 5
    public async computeGraph(materialId: number, partialGraphData: GraphData = {
        nodes: [],
        edges: []
    }): Promise<GraphData> {
        const assetOperations = await this._assetOperationService.getAssetOperationsByOutputMaterial(materialId);
        if(assetOperations.length === 0) {
            return partialGraphData;
        }

        let transformation: AssetOperation | undefined = assetOperations.filter((ao) => ao.type === AssetOperationType.TRANSFORMATION)[0];
        let consolidations: AssetOperation[] = [];

        if(assetOperations.some((ao) => ao.type === AssetOperationType.CONSOLIDATION)) {
            // There is always maximum one transformation for each material!
            const consolidationsOnly = assetOperations.filter((ao) => ao.type === AssetOperationType.CONSOLIDATION);
            const transformationsOnly = assetOperations.filter((ao) => ao.type === AssetOperationType.TRANSFORMATION);

            transformation = transformationsOnly.length > 0 ? transformationsOnly[0] : undefined;

            // Sort descending
            consolidations = consolidationsOnly.sort((a, b) => b.id - a.id);

            consolidations.forEach((consolidation) => {
                partialGraphData.nodes.push({
                    id: consolidation.id,
                    type: AssetOperationType.CONSOLIDATION,
                    resourceId: consolidation.name
                });
            });
        }

        // If the material is referenced in one or more consolidations but not in a transformation, the material is an input material. Return.
        if(consolidations.length > 0 && !transformation)
            return partialGraphData;

        if(!transformation)
            throw new Error("GraphState: Invalid state.");

        partialGraphData.nodes.push({
            id: transformation.id,
            type: AssetOperationType.TRANSFORMATION,
            resourceId: transformation.name
        });

        await Promise.all(transformation.inputMaterials.map(async (assetOperationInputMaterial: Material) => {
            const filteredTradesMap: Map<Trade, Line[]> = await this.findTradesByMaterialOutput(assetOperationInputMaterial.id);
            if(filteredTradesMap.size === 0) {
                return partialGraphData;
            }

            const tradeWithMaterialIdMap: Map<Trade, number[]> = new Map(
                Array.from(filteredTradesMap).map(([trade, lines]) => [trade, lines.map((l) => l.material!.id)])
            );

            await Promise.all(Array.from(tradeWithMaterialIdMap).map(async ([trade, materialInputIds]) => {
                await Promise.all(materialInputIds.map(async (involvedMaterialInputId: number) => {
                    const inputAssetOperations: AssetOperation[] = await this._assetOperationService.getAssetOperationsByOutputMaterial(involvedMaterialInputId);

                    partialGraphData.edges.push({
                        resourcesIds: Array.from(filteredTradesMap.entries())
                            .filter(([_, lines]) => lines
                                .filter((tl) => tl.material!.id === involvedMaterialInputId).length > 0)
                            .map(([trade, _]) => `${trade.supplier}_trade_${trade.tradeId}`),
                        from: inputAssetOperations[0].name,
                        to: transformation!.name
                    });

                    await this.computeGraph(involvedMaterialInputId, partialGraphData);
                }));
            }));
        }));

        return partialGraphData;
    }

    // public async computeGraph(supplierAddress: string, materialId: number, partialGraphData: GraphData = {
    //     nodes: [],
    //     edges: [],
    // }): Promise<GraphData> {
    //     /*
    //     // TODO: quando arriva un trade in ingresso per cui c'è un materiale, non posso vedere la sua chain dal momento che l'utente loggato non sarà l'owner della relativa trasformazione
    //     const transformations = await this.findTransformationsByMaterialOutput(supplierAddress, materialId);
    //     if (transformations.length === 0) { return partialGraphData; }
    //     if (transformations.length > 1) {
    //         throw new Error(`Multiple transformations found for material id ${materialId}`);
    //     }
    //
    //     partialGraphData.nodes.push({
    //         resourceId: this.getGraphEntityId(transformations[0]),
    //     });
    //
    //     await Promise.all(transformations[0].inputMaterials.map(async (transformationInputMaterial) => {
    //         const tradesWithLines = await this.findTradesByMaterialOutput(supplierAddress, transformationInputMaterial.id);
    //         if (tradesWithLines.size === 0) { return partialGraphData; }
    //
    //         const idsAlreadyPresent: number[] = [];
    //         const involvedTradeMaterialInputIds = Array.from(tradesWithLines)
    //             .filter(([_, lines]) => lines.flatMap((l) => l.materialIds[1]).includes(transformationInputMaterial.id))
    //             .reduce((acc, curr) => {
    //                 const materialIds = curr[1].map((tl) => tl.materialIds[0]).filter((id) => !idsAlreadyPresent.includes(id));
    //                 if (materialIds.length) {
    //                     acc.set(curr[0], materialIds);
    //                     idsAlreadyPresent.push(...materialIds);
    //                 }
    //                 return acc;
    //             }, new Map<Trade, number[]>());
    //         // const involvedMaterialInputIds = [...new Set(Array.from(tradesWithLines.values())
    //         //     .flat()
    //         //     .map((tl) => tl.materialIds)
    //         //     .filter((x) => x[1] === transformationInputMaterial)
    //         //     .map((x) => x[0]),
    //         // )];
    //
    //         await Promise.all(Array.from(involvedTradeMaterialInputIds).map(async ([trade, materialInputIds]) => {
    //             await Promise.all(materialInputIds.map(async (involvedMaterialInputId) => {
    //                 const inputTransformations = await this.findTransformationsByMaterialOutput(trade.supplier, involvedMaterialInputId);
    //                 if (inputTransformations.length !== 1)
    //                     throw new Error(`${inputTransformations.length > 1 ? 'Multiple' : 'No'} transformations found for material id ${involvedMaterialInputId}`);
    //
    //                 partialGraphData.edges.push({
    //                     resourcesIds: Array.from(tradesWithLines.entries())
    //                         .filter(([_, lines]) => lines
    //                             .filter((tl) => tl.materialIds.some((x) => x === involvedMaterialInputId)).length > 0)
    //                         .map(([trade, _]) => this.getGraphEntityId(trade)),
    //                     from: this.getGraphEntityId(inputTransformations[0]),
    //                     to: this.getGraphEntityId(transformations[0]),
    //                 });
    //
    //                 await this.computeGraph(trade.supplier, involvedMaterialInputId, partialGraphData);
    //             }));
    //         }));
    //         // await Promise.all(involvedMaterialInputIds.map(async (involvedMaterialInputId) => {
    //         //     const inputTransformations = await this.findTransformationsByMaterialOutput(supplierAddress, involvedMaterialInputId);
    //         //     if (inputTransformations.length !== 1)
    //         //         throw new Error(`${inputTransformations.length > 1 ? 'Multiple' : 'No'} transformations found for material id ${involvedMaterialInputId}`);
    //         //
    //         //     partialGraphData.edges.push({
    //         //         resourcesIds: Array.from(tradesWithLines.entries())
    //         //             .filter(([_, lines]) => lines
    //         //                 .filter((tl) => tl.materialIds.some((x) => x === involvedMaterialInputId)).length > 0)
    //         //             .map(([trade, _]) => this.getGraphEntityId(trade)),
    //         //         from: this.getGraphEntityId(inputTransformations[0]),
    //         //         to: this.getGraphEntityId(transformations[0]),
    //         //     });
    //         //
    //         //     await this.computeGraph(supplierAddress, involvedMaterialInputId, partialGraphData);
    //         // }));
    //     })); */
    //     return partialGraphData;
    // }

    // @ts-ignore
    private getGraphEntityId(t: AssetOperation | Trade): string {
        // return t.owner ? t.name : `${t.supplier}_trade_${t.id}`;
    }
}
