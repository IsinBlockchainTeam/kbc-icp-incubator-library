import { Trade } from '../entities/Trade';
import { Transformation } from '../entities/Transformation';
import TradeService from './TradeService';
import { SupplyChainService } from './SupplyChainService';
import { TradeLine } from '../entities/TradeLine';
import retryTimes = jest.retryTimes;

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
    private _tradesWithLines?: Map<Trade, TradeLine[]>;

    private _transformations?: Transformation[];

    private _tradeService: TradeService;

    private _supplyChainService: SupplyChainService;

    constructor(tradeService: TradeService, supplyChainService: SupplyChainService) {
        this._tradeService = tradeService;
        this._supplyChainService = supplyChainService;
    }

    public async findTransformationsByMaterialOutput(supplierAddress: string, materialId: number): Promise<Transformation[]> {
        if (!this._transformations) this._transformations = await this._supplyChainService.getTransformations(supplierAddress);
        return this._transformations.filter((t) => t.outputMaterialId === materialId);
    }

    public async findTradesByMaterialOutput(supplierAddress: string, materialId: number): Promise<Map<Trade, TradeLine[]>> {
        if (!this._tradesWithLines) {
            // create and "cache" a map with trades and relative lines
            const trades = await this._tradeService.getGeneralTrades(supplierAddress);
            this._tradesWithLines = await trades.reduce(async (accPromise, curr) => {
                const acc = await accPromise;
                const tradeLines = await this._tradeService.getTradeLines(supplierAddress, curr.id);
                acc.set(curr, tradeLines);
                return acc;
            }, Promise.resolve(new Map<Trade, TradeLine[]>()));
        }
        // get only trades in which in the relative lines, as contractor material (materialIds[1]), there is one with 'materialId' value
        return new Map(Array.from(this._tradesWithLines).filter(([_, lines]) => lines.flatMap((l) => l.materialIds[1]).includes(materialId)));
    }

    public async computeGraph(supplierAddress: string, materialId: number, partialGraphData: GraphData = { nodes: [], edges: [] }): Promise<GraphData> {
        const transformations = await this.findTransformationsByMaterialOutput(supplierAddress, materialId);
        if (transformations.length === 0) { return partialGraphData; }
        if (transformations.length > 1) {
            throw new Error(`Multiple transformations found for material id ${materialId}`);
        }

        partialGraphData.nodes.push({
            resourceId: this.getGraphEntityId(transformations[0]),
        });

        await Promise.all(transformations[0].inputMaterialsIds.map(async (transformationInputMaterial) => {
            const tradesWithLine = await this.findTradesByMaterialOutput(supplierAddress, transformationInputMaterial);
            if (tradesWithLine.size === 0) { return partialGraphData; }

            const involvedMaterialInputIds = [...new Set(Array.from(tradesWithLine.values())
                .flat()
                .map((tl) => tl.materialIds)
                .filter((x) => x[1] === transformationInputMaterial)
                .map((x) => x[0]),
            )];

            await Promise.all(involvedMaterialInputIds.map(async (involvedMaterialInputId) => {
                const inputTransformations = await this.findTransformationsByMaterialOutput(supplierAddress, involvedMaterialInputId);
                if (inputTransformations.length !== 1)
                    throw new Error(`${inputTransformations.length > 1 ? 'Multiple' : 'No'} transformations found for material id ${involvedMaterialInputId}`);

                partialGraphData.edges.push({
                    resourcesIds: Object.values(tradesWithLine)
                        .flat()
                        .filter((tl) => tl.materialIds.some((x: number) => x === involvedMaterialInputId))
                        .map((t) => this.getGraphEntityId(t)),
                    from: this.getGraphEntityId(inputTransformations[0]),
                    to: this.getGraphEntityId(transformations[0]),
                });

                await this.computeGraph(supplierAddress, involvedMaterialInputId, partialGraphData);
            }));
        }));
        return partialGraphData;
    }

    // @ts-ignore
    private getGraphEntityId(t: Transformation | Trade): string { return `${t.owner || t.supplier}_${t.id}`; }
}
