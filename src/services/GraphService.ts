import {Signer} from 'ethers';
import {Line, Trade} from '../entities/Trade';
import {AssetOperation} from '../entities/AssetOperation';
import {TradeManagerService} from './TradeManagerService';
import {AssetOperationService} from './AssetOperationService';
import {TradeType} from "../types/TradeType";
import {BasicTradeService} from "./BasicTradeService";
import {BasicTradeDriver} from "../drivers/BasicTradeDriver";
import {MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS} from "../integration-test/config";
import {OrderTradeService} from "./OrderTradeService";
import {OrderTradeDriver} from "../drivers/OrderTradeDriver";
import {IConcreteTradeService} from "./IConcreteTradeService";
import {Material} from "../entities/Material";

export type Node = {
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

    public async findTradesByMaterialOutput(supplierAddress: string, materialId: number): Promise<Map<Trade, Line[]>> {
        const result: Map<Trade, Line[]> = new Map<Trade, Line[]>();
        const trades: number[] = await this._tradeManagerService.getTradeIdsOfSupplier(supplierAddress);

        for (const tradeId of trades) {
            const tradeAddress: string = await this._tradeManagerService.getTrade(tradeId);
            const tradeType: TradeType = await this._tradeManagerService.getTradeType(tradeId);
            const tradeService: IConcreteTradeService = tradeType === TradeType.BASIC ?
                new BasicTradeService(new BasicTradeDriver(this._signer, tradeAddress, MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS)) :
                new OrderTradeService(new OrderTradeDriver(this._signer, tradeAddress, MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS));

            const lines: Line[] = await tradeService.getLines();
            const filteredLines: Line[] = lines.filter((l) => l.material?.id === materialId);
            if (filteredLines.length > 0) {
                result.set(await tradeService.getTrade(), filteredLines);
            }
        }

        return result;
    }

    public async computeGraph(supplierAddress: string, materialId: number, partialGraphData: GraphData = {
        nodes: [],
        edges: []
    }): Promise<GraphData> {
        const assetOperations = await this._assetOperationService.getAssetOperationsByOutputMaterial(materialId);
        if(assetOperations.length === 0) {
            return partialGraphData;
        }

        partialGraphData.nodes.push({
            resourceId: assetOperations[0].name
        });

        await Promise.all(assetOperations[0].inputMaterials.map(async (assetOperationInputMaterial: Material) => {
            const filteredTradesMap: Map<Trade, Line[]> = await this.findTradesByMaterialOutput(supplierAddress, assetOperationInputMaterial.id);
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
                        to: assetOperations[0].name
                    });

                    await this.computeGraph(trade.supplier, involvedMaterialInputId, partialGraphData);
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
