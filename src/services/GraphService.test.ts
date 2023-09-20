describe('GraphService', () => {
    // let graphService: GraphService;
    //
    // it('should compute a graph', () => {
    //     const trades = [
    //         new Trade(1, 'trade', [[2, 7]], 'tradeOwner'),
    //         new Trade(2, 'trade', [[4, 8]], 'tradeOwner'),
    //         new Trade(3, 'trade', [[6, 11], [14, 15]], 'tradeOwner'),
    //         new Trade(4, 'trade', [[9, 10]], 'tradeOwner'),
    //         new Trade(5, 'trade', [[6, 11]], 'tradeOwner'),
    //     ];
    //     const transformations = [
    //         new Transformation(1, 'transformation', [1], 2, 'transformationOwner'),
    //         new Transformation(2, 'transformation', [3], 4, 'transformationOwner'),
    //         new Transformation(3, 'transformation', [5], 6, 'transformationOwner'),
    //         new Transformation(4, 'transformation', [7, 8], 9, 'transformationOwner'),
    //         new Transformation(5, 'transformation', [10, 11], 12, 'transformationOwner'),
    //         new Transformation(6, 'transformation', [13], 14, 'transformationOwner'),
    //         new Transformation(7, 'transformation', [15], 16, 'transformationOwner'),
    //     ];
    //     graphService = new GraphService(trades, transformations);
    //     const result = graphService.computeGraph(12);
    //     expect(result).toEqual({
    //         nodes: [
    //             { resourceId: 'transformationOwner_5' },
    //             { resourceId: 'transformationOwner_4' },
    //             { resourceId: 'transformationOwner_1' },
    //             { resourceId: 'transformationOwner_2' },
    //             { resourceId: 'transformationOwner_3' },
    //         ],
    //         edges: [
    //             { resourcesIds: ['tradeOwner_4'], from: 'transformationOwner_4', to: 'transformationOwner_5' },
    //             { resourcesIds: ['tradeOwner_1'], from: 'transformationOwner_1', to: 'transformationOwner_4' },
    //             { resourcesIds: ['tradeOwner_2'], from: 'transformationOwner_2', to: 'transformationOwner_4' },
    //             { resourcesIds: ['tradeOwner_3', 'tradeOwner_5'], from: 'transformationOwner_3', to: 'transformationOwner_5' },
    //         ],
    //     });
    // });
    //
    // it('should throw an error if it finds multiple transformation with the same output material', () => {
    //     const trades = [
    //         new Trade(1, 'trade', [[2, 7]], 'tradeOwner'),
    //         new Trade(2, 'trade', [[4, 8]], 'tradeOwner'),
    //         new Trade(3, 'trade', [[6, 11], [14, 15]], 'tradeOwner'),
    //         new Trade(4, 'trade', [[9, 10]], 'tradeOwner'),
    //         new Trade(5, 'trade', [[6, 11]], 'tradeOwner'),
    //     ];
    //     const transformations = [
    //         new Transformation(1, 'transformation', [1], 2, 'transformationOwner'),
    //         new Transformation(2, 'transformation', [3], 2, 'transformationOwner'),
    //         new Transformation(3, 'transformation', [5], 6, 'transformationOwner'),
    //         new Transformation(4, 'transformation', [7, 8], 9, 'transformationOwner'),
    //         new Transformation(5, 'transformation', [10, 11], 12, 'transformationOwner'),
    //         new Transformation(6, 'transformation', [13], 14, 'transformationOwner'),
    //         new Transformation(7, 'transformation', [15], 16, 'transformationOwner'),
    //     ];
    //     graphService = new GraphService(trades, transformations);
    //     expect(() => graphService.computeGraph(12)).toThrowError('Multiple transformations found for material id 2');
    // });
    //
    // it('should throw an error if it finds multiple transformation with the same output material - initial check', () => {
    //     const transformations = [
    //         new Transformation(1, 'transformation', [1], 2, 'transformationOwner'),
    //         new Transformation(2, 'transformation', [3], 2, 'transformationOwner'),
    //     ];
    //     graphService = new GraphService([], transformations);
    //     expect(() => graphService.computeGraph(2)).toThrowError('Multiple transformations found for material id 2');
    // });
    //
    // it('should throw an error if it finds no transformation with specific output material', () => {
    //     const trades = [
    //         new Trade(1, 'trade', [[2, 7]], 'tradeOwner'),
    //         new Trade(2, 'trade', [[4, 8]], 'tradeOwner'),
    //         new Trade(3, 'trade', [[6, 11], [14, 15]], 'tradeOwner'),
    //         new Trade(4, 'trade', [[-1, 10]], 'tradeOwner'),
    //         new Trade(5, 'trade', [[6, 11]], 'tradeOwner'),
    //     ];
    //     const transformations = [
    //         new Transformation(1, 'transformation', [1], 2, 'transformationOwner'),
    //         new Transformation(2, 'transformation', [3], 4, 'transformationOwner'),
    //         new Transformation(3, 'transformation', [5], 6, 'transformationOwner'),
    //         new Transformation(4, 'transformation', [7, 8], 9, 'transformationOwner'),
    //         new Transformation(5, 'transformation', [10, 11], 12, 'transformationOwner'),
    //         new Transformation(6, 'transformation', [13], 14, 'transformationOwner'),
    //         new Transformation(7, 'transformation', [15], 16, 'transformationOwner'),
    //     ];
    //     graphService = new GraphService(trades, transformations);
    //     expect(() => graphService.computeGraph(12)).toThrowError('No transformations found for material id -1');
    // });
    //
    // it('should handle an empty graph', () => {
    //     graphService = new GraphService([], []);
    //     const result = graphService.computeGraph(12);
    //     expect(result).toEqual({ nodes: [], edges: [] });
    // });
});
