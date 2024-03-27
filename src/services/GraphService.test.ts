import { createMock } from 'ts-auto-mock';
import { Signer } from 'ethers';
import { SolidStorageACR } from '@blockchain-lib/common';
import { GraphService } from './GraphService';
import { AssetOperation } from '../entities/AssetOperation';
import { Line, Trade } from '../entities/Trade';
import { TradeManagerService } from './TradeManagerService';
import { Material } from '../entities/Material';
import { AssetOperationService } from './AssetOperationService';
import { ProductCategory } from '../entities/ProductCategory';
import { TradeType } from '../types/TradeType';
import { BasicTrade } from '../entities/BasicTrade';
import { OrderLine, OrderLinePrice, OrderTradeInfo } from '../entities/OrderTradeInfo';
import { BasicTradeService } from './BasicTradeService';
import { OrderTradeService } from './OrderTradeService';
import { SolidMetadataSpec } from '../drivers/SolidMetadataDriver';
import { SolidDocumentSpec } from '../drivers/SolidDocumentDriver';

jest.mock('./TradeManagerService');
jest.mock('./AssetOperationService');
jest.mock('./MaterialService');
jest.mock('./ProductCategoryService');
jest.mock('./BasicTradeService');
jest.mock('./OrderTradeService');

describe('GraphService', () => {
    let graphService: GraphService<SolidMetadataSpec, SolidStorageACR>;

    const productCategories: ProductCategory[] = [
        new ProductCategory(1, 'Raw coffee beans', 85, 'first category'),
        new ProductCategory(2, 'Green coffee beans', 90, 'second category'),
        new ProductCategory(3, 'Processed coffee beans', 82, 'third category'),
        new ProductCategory(4, 'Ground roasted coffee', 80, 'fourth category'),
        new ProductCategory(5, 'Sea water', 20, 'fifth category'),
        new ProductCategory(6, 'Purified water', 50, 'sixth category'),
        new ProductCategory(7, 'Final coffee', 90, 'eighth category'),
        new ProductCategory(8, 'Pure water', 100, 'ninth category'),
    ];
    const materials: Material[] = [
        new Material(1, productCategories[0]),
        new Material(2, productCategories[1]),
        new Material(3, productCategories[2]),
        new Material(4, productCategories[3]),
        new Material(5, productCategories[4]),
        new Material(6, productCategories[5]),
        new Material(7, productCategories[6]),
        new Material(8, productCategories[7]),
    ];
    const assetOperations: AssetOperation[] = [
        new AssetOperation(1, 'Coffee beans processing', [materials[0], materials[1]], materials[2], '-73.9828170', '-28.6505430'),
        new AssetOperation(2, 'Coffee grinding', [materials[2]], materials[3], '-73.9265', '-23.4733'),
        new AssetOperation(3, 'Water purification', [materials[4]], materials[5], '-73.4667', '-23.5505'),
        new AssetOperation(4, 'Final coffee production', [materials[3], materials[5]], materials[6], '-73.64826', '-23.5505'),
        new AssetOperation(5, 'Final coffee consolidation', [materials[6]], materials[6], '-34.7567', '135.52'),
        new AssetOperation(6, 'Pure consolidation', [materials[7]], materials[7], '-73.1643', '-23.5505'),
        // new AssetOperation(4, 'Doubled material', [materials[5], materials[5]], materials[6]),
    ];

    const tradeTypes: TradeType[] = [TradeType.BASIC, TradeType.ORDER, TradeType.BASIC, TradeType.BASIC, TradeType.BASIC];
    const trades: Trade[] = [
        new BasicTrade(1, 'company1', 'customer', 'company2', 'externalUrl', [new Line(1, materials[2], productCategories[2])], 'shipping processed coffee'),
        new OrderTradeInfo(2, 'company2', 'customer', 'company3', 'externalUrl', [new OrderLine(1, materials[3], productCategories[3], 100, new OrderLinePrice(50, 'CHF'))], false, false, 100, 200, 'arbiter', 300, 400, 'escrow'),
        new BasicTrade(3, 'company1', 'customer', 'company3', 'externalUrl', [new Line(1, materials[5], productCategories[5])], 'shipping purified water'),
        new BasicTrade(4, 'company3', 'customer', 'company1', 'externalUrl', [new Line(1, materials[6], productCategories[6])], 'shipping final coffee'),
    ];

    const mockGetTrades = jest.fn().mockReturnValue(Array.from(trades));
    const mockGetAssetOperations = jest.fn().mockReturnValue(Array.from(assetOperations));

    const mockedTradeManagerService: TradeManagerService<SolidMetadataSpec, SolidStorageACR> = createMock<TradeManagerService<SolidMetadataSpec, SolidStorageACR>>({
        getTrades: mockGetTrades,
        getTrade: jest.fn().mockImplementation((id: number) => Promise.resolve(trades[id])),
        getTradeType: jest.fn().mockImplementation((id: number) => Promise.resolve(tradeTypes[id])),
    });
    const mockedAssetOperationService: AssetOperationService = createMock<AssetOperationService>({
        getAssetOperations: mockGetAssetOperations,
    });

    const mockedBasicGetTrade = jest.fn().mockResolvedValue(trades[0]);
    const mockedBasicGetLines = jest.fn().mockResolvedValue([trades[0].lines]);
    (BasicTradeService as jest.Mock).mockImplementation(() => createMock<BasicTradeService<SolidDocumentSpec, SolidMetadataSpec, SolidStorageACR>>({
        getTrade: mockedBasicGetTrade,
        getLines: mockedBasicGetLines,
    }));
    const mockedOrderGetTrade = jest.fn().mockResolvedValue(trades[1]);
    const mockedOrderGetLines = jest.fn().mockResolvedValue(trades[1].lines);
    (OrderTradeService as jest.Mock).mockImplementation(() => createMock<OrderTradeService<SolidDocumentSpec, SolidMetadataSpec, SolidStorageACR>>({
        getTrade: mockedOrderGetTrade,
        getLines: mockedOrderGetLines,
    }));

    beforeAll(() => {
        graphService = new GraphService(createMock<Signer>(), mockedTradeManagerService, mockedAssetOperationService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should compute a graph with transformations', async () => {
        const result = await graphService.computeGraph(4, true);

        expect(result.nodes).toEqual(expect.arrayContaining([assetOperations[1], assetOperations[0]]));
        expect(result.edges).toEqual(expect.arrayContaining([{
            trade: trades[0],
            from: assetOperations[0].name,
            to: assetOperations[1].name,
        }]));

        expect(mockedTradeManagerService.getTrades).toHaveBeenCalledTimes(1);
        expect(mockedTradeManagerService.getTrades).toHaveBeenNthCalledWith(1);

        expect(mockedAssetOperationService.getAssetOperations).toHaveBeenCalledTimes(1);
        expect(mockedAssetOperationService.getAssetOperations).toHaveBeenNthCalledWith(1);
    });

    it('should compute a graph with transformations and consolidations', async () => {
        const result = await graphService.computeGraph(assetOperations[4].outputMaterial.id, true);

        expect(result.nodes).toEqual(expect.arrayContaining([assetOperations[4], assetOperations[3], assetOperations[2], assetOperations[1], assetOperations[0]]));
        expect(result.edges).toEqual(expect.arrayContaining([
            {
                trade: trades[3],
                from: assetOperations[3].name,
                to: assetOperations[4].name,
            },
            {
                trade: trades[2],
                from: assetOperations[2].name,
                to: assetOperations[3].name,
            }]));

        expect(mockedTradeManagerService.getTrades).toHaveBeenCalledTimes(1);
        expect(mockedTradeManagerService.getTrades).toHaveBeenNthCalledWith(1);

        expect(mockedAssetOperationService.getAssetOperations).toHaveBeenCalledTimes(1);
        expect(mockedAssetOperationService.getAssetOperations).toHaveBeenNthCalledWith(1);
    });

    it('should compute a graph with a consolidation based on a pure material', async () => {
        const result = await graphService.computeGraph(assetOperations[5].outputMaterial.id, true);

        expect(result).toEqual({
            nodes: [
                assetOperations[5],
            ],
            edges: [],
        });
    });

    it('should compute a graph and return when the same node is already in the graph', async () => {
        const result = await graphService.computeGraph(7, true);

        expect(result.nodes).toEqual(expect.arrayContaining([assetOperations[3]]));
        expect(result.edges).toEqual(expect.arrayContaining([{
            trade: trades[2],
            from: assetOperations[2].name,
            to: assetOperations[3].name,
        }]));
    });

    it('should compute an empty graph when the material is not found', async () => {
        const result = await graphService.computeGraph(42, true);

        expect(result).toEqual({
            nodes: [],
            edges: [],
        });
    });

    // it('should compute a graph containing consolidations and return when the same edge is found twice', async () => {
    //     const result = await graphService.computeGraph(assetOperations[4].outputMaterial.id,true);
    //
    //     expect(result.nodes).toEqual(expect.arrayContaining([assetOperations[4]]));
    //     expect(result.edges).toEqual(expect.arrayContaining([
    //         {
    //             trade: trades[3],
    //             from: assetOperations[4].name,
    //             to: assetOperations[4].name
    //         },]));
    //
    // });
});
