import { Signer } from 'ethers';
import { Line, Trade } from '../entities/Trade';
import { Transformation } from '../entities/Transformation';
import { TradeManagerService } from './TradeManagerService';
import { TransformationService } from './TransformationService';

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
    private _tradeManagerService: TradeManagerService;

    private _transformationService: TransformationService;

    private _signer: Signer;

    constructor(tradeManagerService: TradeManagerService, transformationService: TransformationService, signer: Signer) {
        this._tradeManagerService = tradeManagerService;
        this._transformationService = transformationService;
        this._signer = signer;
    }

    public async findTransformationsByMaterialOutput(supplierAddress: string, materialId: number): Promise<Transformation[]> {
        const transformations = await this._transformationService.getTransformations(supplierAddress);
        return transformations.filter((t) => t.outputMaterialId === materialId);
    }

    /*
    public async findTradesByMaterialOutput(supplierAddress: string, materialId: number): Promise<Map<Trade, (TradeLine | OrderLine)[]>> {
        const trades = await this._tradeManagerService.getGeneralTrades(supplierAddress);
        const tradesWithLines = await trades.reduce(async (accPromise, curr: Trade) => {
            const acc = await accPromise;
            if (curr.type === undefined) return acc;
            // @ts-ignore
            const lines = curr.type === TradeType.TRADE
                ? await this._tradeManagerService.getTradeLines(curr.id)
                : curr.type === TradeType.ORDER
                    ? await this._tradeManagerService.getOrderLines(curr.id)
                    : [];
            acc.set(curr, lines);
            return acc;
        }, Promise.resolve(new Map<Trade, TradeLine[]>()));
        // get only trades in which in the relative lines, as consignee material (materialIds[1]), there is one with 'materialId' value
        return new Map(Array.from(tradesWithLines).filter(([_, lines]) => lines.flatMap((l) => l.materialIds[1]).includes(materialId)));
    }
    */

    // !!! Warning: If a trade has multiple lines with the same materialId as output, only the first one will be returned !!!
    public async findTradesByMaterialOutput(supplierAddress: string, materialId: number): Promise<Map<number, Line>> {
        const trades: Map<number, Line> = new Map<number, Line>();
        /*
        const tradeIds = await this._tradeManagerService.getTradeIdsOfSupplier(supplierAddress);
        for (const tradeId of tradeIds) {
            const tradeAddress: string = await this._tradeManagerService.getTrade(tradeId);
            const tradeDriver: TradeDriver = new TradeDriver(this._signer, tradeAddress);
            const { lineIds } = await tradeDriver.getTrade();
            for (const lineId of lineIds) {
                const line = await tradeDriver.getLine(lineId);
                if (line.materialsId[1].toNumber() === materialId) {
                    trades.set(tradeId, line);
                    break;
                }
            }
        }
         */
        return trades;
    }

    public async computeGraph(supplierAddress: string, materialId: number, partialGraphData: GraphData = {
        nodes: [],
        edges: [],
    }): Promise<GraphData> {
        /*
        // TODO: quando arriva un trade in ingresso per cui c'è un materiale, non posso vedere la sua chain dal momento che l'utente loggato non sarà l'owner della relativa trasformazione
        const transformations = await this.findTransformationsByMaterialOutput(supplierAddress, materialId);
        if (transformations.length === 0) { return partialGraphData; }
        if (transformations.length > 1) {
            throw new Error(`Multiple transformations found for material id ${materialId}`);
        }

        partialGraphData.nodes.push({
            resourceId: this.getGraphEntityId(transformations[0]),
        });

        await Promise.all(transformations[0].inputMaterials.map(async (transformationInputMaterial) => {
            const tradesWithLines = await this.findTradesByMaterialOutput(supplierAddress, transformationInputMaterial.id);
            if (tradesWithLines.size === 0) { return partialGraphData; }

            const idsAlreadyPresent: number[] = [];
            const involvedTradeMaterialInputIds = Array.from(tradesWithLines)
                .filter(([_, lines]) => lines.flatMap((l) => l.materialIds[1]).includes(transformationInputMaterial.id))
                .reduce((acc, curr) => {
                    const materialIds = curr[1].map((tl) => tl.materialIds[0]).filter((id) => !idsAlreadyPresent.includes(id));
                    if (materialIds.length) {
                        acc.set(curr[0], materialIds);
                        idsAlreadyPresent.push(...materialIds);
                    }
                    return acc;
                }, new Map<Trade, number[]>());
            // const involvedMaterialInputIds = [...new Set(Array.from(tradesWithLines.values())
            //     .flat()
            //     .map((tl) => tl.materialIds)
            //     .filter((x) => x[1] === transformationInputMaterial)
            //     .map((x) => x[0]),
            // )];

            await Promise.all(Array.from(involvedTradeMaterialInputIds).map(async ([trade, materialInputIds]) => {
                await Promise.all(materialInputIds.map(async (involvedMaterialInputId) => {
                    const inputTransformations = await this.findTransformationsByMaterialOutput(trade.supplier, involvedMaterialInputId);
                    if (inputTransformations.length !== 1)
                        throw new Error(`${inputTransformations.length > 1 ? 'Multiple' : 'No'} transformations found for material id ${involvedMaterialInputId}`);

                    partialGraphData.edges.push({
                        resourcesIds: Array.from(tradesWithLines.entries())
                            .filter(([_, lines]) => lines
                                .filter((tl) => tl.materialIds.some((x) => x === involvedMaterialInputId)).length > 0)
                            .map(([trade, _]) => this.getGraphEntityId(trade)),
                        from: this.getGraphEntityId(inputTransformations[0]),
                        to: this.getGraphEntityId(transformations[0]),
                    });

                    await this.computeGraph(trade.supplier, involvedMaterialInputId, partialGraphData);
                }));
            }));
            // await Promise.all(involvedMaterialInputIds.map(async (involvedMaterialInputId) => {
            //     const inputTransformations = await this.findTransformationsByMaterialOutput(supplierAddress, involvedMaterialInputId);
            //     if (inputTransformations.length !== 1)
            //         throw new Error(`${inputTransformations.length > 1 ? 'Multiple' : 'No'} transformations found for material id ${involvedMaterialInputId}`);
            //
            //     partialGraphData.edges.push({
            //         resourcesIds: Array.from(tradesWithLines.entries())
            //             .filter(([_, lines]) => lines
            //                 .filter((tl) => tl.materialIds.some((x) => x === involvedMaterialInputId)).length > 0)
            //             .map(([trade, _]) => this.getGraphEntityId(trade)),
            //         from: this.getGraphEntityId(inputTransformations[0]),
            //         to: this.getGraphEntityId(transformations[0]),
            //     });
            //
            //     await this.computeGraph(supplierAddress, involvedMaterialInputId, partialGraphData);
            // }));
        })); */
        return partialGraphData;
    }

    // @ts-ignore
    private getGraphEntityId(t: Transformation | Trade): string {
        // return t.owner ? t.name : `${t.supplier}_trade_${t.id}`;
    }
}
