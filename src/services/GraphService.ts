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
    // private _trades: Array<Trade>;
    //
    // private _transformations: Array<Transformation>;
    //
    // constructor(
    //     trades: Array<Trade>,
    //     transformations: Array<Transformation>,
    // ) {
    //     this._trades = trades;
    //     this._transformations = transformations;
    // }
    //
    // public findTransformationsByMaterialOutput(
    //     materialId: number,
    // ): Array<Transformation> {
    //     return this._transformations.filter((t) => t.outputMaterialId === materialId);
    // }
    //
    // public findTradesByMaterialOutput(
    //     materialId: number,
    // ): Array<Trade> {
    //     return this._trades.filter((t) => t.materialsIds.map((x) => x[1]).includes(materialId));
    // }
    //
    // public getGraphEntityId = (t: Transformation | Trade): string => `${t.owner}_${t.id}`;
    //
    // public computeGraph = (
    //     materialId: number,
    //     partialGraphData: GraphData = { nodes: [], edges: [] },
    // ): GraphData => {
    //     const transformations = this.findTransformationsByMaterialOutput(materialId);
    //     if (transformations.length === 0) { return partialGraphData; }
    //     if (transformations.length > 1) {
    //         throw new Error(`Multiple transformations found for material id ${materialId}`);
    //     }
    //
    //     partialGraphData.nodes.push({
    //         resourceId: this.getGraphEntityId(transformations[0]),
    //     });
    //
    //     for (const transformationInputMaterial of transformations[0].inputMaterialsIds) {
    //         const trades = this.findTradesByMaterialOutput(transformationInputMaterial);
    //         if (trades.length === 0) { return partialGraphData; }
    //
    //         const involvedMaterialInputIds = [...new Set(trades
    //             .flatMap((t) => t.materialsIds)
    //             .filter((x) => x[1] === transformationInputMaterial)
    //             .map((x) => x[0]),
    //         )];
    //
    //         for (const involvedMaterialInputId of involvedMaterialInputIds) {
    //             const inputTransformations = this.findTransformationsByMaterialOutput(involvedMaterialInputId);
    //             if (inputTransformations.length != 1) {
    //                 throw new Error(`${inputTransformations.length > 1 ? 'Multiple' : 'No'} transformations found for material id ${involvedMaterialInputId}`);
    //             }
    //             partialGraphData.edges.push({
    //                 resourcesIds: trades
    //                     .filter((t) => t.materialsIds.some((x) => x[0] === involvedMaterialInputId))
    //                     .map((t) => this.getGraphEntityId(t)),
    //                 from: this.getGraphEntityId(inputTransformations[0]),
    //                 to: this.getGraphEntityId(transformations[0]),
    //             });
    //
    //             this.computeGraph(involvedMaterialInputId, partialGraphData);
    //         }
    //     }
    //     return partialGraphData;
    // };
}
