import {createMock} from 'ts-auto-mock';
import {GraphService} from './GraphService';
import {AssetOperation} from '../entities/AssetOperation';
import {Line, Trade} from '../entities/Trade';
import {TradeManagerService} from "./TradeManagerService";
import {Material} from '../entities/Material';
import {AssetOperationService} from './AssetOperationService';
import {ProductCategory} from "../entities/ProductCategory";
import {TradeType} from "../types/TradeType";
import {BasicTrade} from "../entities/BasicTrade";
import {OrderLine, OrderLinePrice, OrderTrade} from "../entities/OrderTrade";
import {Signer} from "ethers";
import {BasicTradeService} from "./BasicTradeService";
import {OrderTradeService} from "./OrderTradeService";

jest.mock('./TradeManagerService');
jest.mock('./AssetOperationService');
jest.mock('./MaterialService');
jest.mock('./ProductCategoryService');
jest.mock('./BasicTradeService');
jest.mock('./OrderTradeService');

describe('GraphService', () => {
    let graphService: GraphService;

    const productCategories: ProductCategory[] = [
        new ProductCategory(1, 'Raw coffee beans', 85, "first category"),
        new ProductCategory(2, 'Green coffee beans', 90, "second category"),
        new ProductCategory(3, 'Processed coffee beans', 82, "third category"),
        new ProductCategory(4, 'Ground roasted coffee', 80, "fourth category"),
        new ProductCategory(5, 'Sea water', 20, "fifth category"),
        new ProductCategory(6, 'Purified water', 50, "sixth category"),
        new ProductCategory(7, 'Final coffee', 90, "eighth category"),
    ];
    const materials: Material[] = [
        new Material(1, productCategories[0]),
        new Material(2, productCategories[1]),
        new Material(3, productCategories[2]),
        new Material(4, productCategories[3]),
        new Material(5, productCategories[4]),
        new Material(6, productCategories[5]),
        new Material(7, productCategories[6]),
    ];
    const assetOperations: AssetOperation[] = [
        new AssetOperation(1, 'Coffee beans processing', [materials[0], materials[1]], materials[2]),
        new AssetOperation(2, 'Coffee grinding', [materials[2]], materials[3]),
        new AssetOperation(3, 'Water purification', [materials[4]], materials[5]),
        new AssetOperation(4, 'Final coffee production', [materials[3], materials[5]], materials[6]),
        new AssetOperation(5, 'Final coffee consolidation', [materials[6]], materials[6]),
        new AssetOperation(4, 'Doubled material', [materials[5], materials[5]], materials[6]),
    ];

    const tradeTypes: TradeType[] = [TradeType.BASIC, TradeType.ORDER, TradeType.BASIC, TradeType.BASIC, TradeType.BASIC];
    const trades: Trade[] = [
        new BasicTrade(1, 'company1', 'customer', 'company2', 'externalUrl', [new Line(1, materials[2], productCategories[2])], 'shipping processed coffee'),
        new OrderTrade(2, 'company2', 'customer', 'company3', 'externalUrl', [new OrderLine(1, materials[3], productCategories[3], 100, new OrderLinePrice(50, 'CHF'))], false, false, 100, 200, 'arbiter', 300, 400, 'escrow'),
        new BasicTrade(3, 'company1', 'customer', 'company3', 'externalUrl', [new Line(1, materials[5], productCategories[5])], 'shipping purified water'),
        new BasicTrade(4, 'company3', 'customer', 'company1', 'externalUrl', [new Line(1, materials[6], productCategories[6])], 'shipping final coffee'),
        new BasicTrade(5, 'company1', 'customer', 'company3', 'externalUrl', [new Line(1, materials[0], productCategories[0])], 'shipping raw coffee beans'),
    ];

    const mockGetTradesByMaterial = jest.fn();
    const mockGetAssetOperationsByOutputMaterial = jest.fn();

    const mockedTradeManagerService: TradeManagerService = createMock<TradeManagerService>({
        getTradesByMaterial: mockGetTradesByMaterial.mockReturnValue([trades[2]]),
        getTrade: jest.fn().mockImplementation((id: number) => {
            return Promise.resolve(trades[id]);
        }),
        getTradeType: jest.fn().mockImplementation((id: number) => {
            return Promise.resolve(tradeTypes[id]);
        }),
    });
    const mockedAssetOperationService: AssetOperationService = createMock<AssetOperationService>({
        getAssetOperationsByOutputMaterial: mockGetAssetOperationsByOutputMaterial,
    });

    const mockedBasicGetTrade = jest.fn().mockResolvedValue(trades[0]);
    const mockedBasicGetLines = jest.fn().mockResolvedValue([trades[0].lines]);
    (BasicTradeService as jest.Mock).mockImplementation(() => {
        return createMock<BasicTradeService>({
            getTrade: mockedBasicGetTrade,
            getLines: mockedBasicGetLines,
        });
    });
    const mockedOrderGetTrade = jest.fn().mockResolvedValue(trades[1]);
    const mockedOrderGetLines = jest.fn().mockResolvedValue(trades[1].lines);
    (OrderTradeService as jest.Mock).mockImplementation(() => {
        return createMock<OrderTradeService>({
            getTrade: mockedOrderGetTrade,
            getLines: mockedOrderGetLines,
        })
    });

    beforeAll(() => {
        graphService = new GraphService(createMock<Signer>(), mockedTradeManagerService, mockedAssetOperationService);
    });

    afterEach(() => jest.clearAllMocks())

    it('should call findTradesByMaterial', async () => {
        const result = await graphService.findTradesByMaterial(6);

        expect(result).toEqual(new Map<Trade, Line[]>([
            [trades[2], [trades[2].lines[0]]]
        ]));


        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenCalledTimes(1);
        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenNthCalledWith(1, 6);
    });

    it('should compute a graph with transformations', async () => {
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[3]]);
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[2]]);
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([]);

        const result = await graphService.computeGraph(7);

        expect(result.nodes).toEqual(expect.arrayContaining([assetOperations[3]]));
        expect(result.edges).toEqual(expect.arrayContaining([{
            trade: trades[2],
            from: assetOperations[2].name,
            to: assetOperations[3].name
        }]));

        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenCalledTimes(2);
        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenNthCalledWith(1, assetOperations[3].inputMaterials[0].id);
        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenNthCalledWith(2, assetOperations[3].inputMaterials[1].id);

        expect(mockedAssetOperationService.getAssetOperationsByOutputMaterial).toHaveBeenCalledTimes(3);
        expect(mockedAssetOperationService.getAssetOperationsByOutputMaterial).toHaveBeenNthCalledWith(1, assetOperations[3].outputMaterial.id);
        expect(mockedAssetOperationService.getAssetOperationsByOutputMaterial).toHaveBeenNthCalledWith(2, assetOperations[3].inputMaterials[1].id);
        expect(mockedAssetOperationService.getAssetOperationsByOutputMaterial).toHaveBeenNthCalledWith(3, assetOperations[3].inputMaterials[1].id);
    });

    it('should compute a graph with transformations and consolidations', async () => {
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[3], assetOperations[4]]);
        mockGetTradesByMaterial.mockReturnValueOnce([trades[3]]);
        mockGetTradesByMaterial.mockReturnValueOnce([]);
        mockGetTradesByMaterial.mockReturnValueOnce([trades[2]]);
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[2]]);
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([]);

        const result = await graphService.computeGraph(assetOperations[4].outputMaterial.id);

        expect(result.nodes).toEqual(expect.arrayContaining([assetOperations[3], assetOperations[4]]));
        expect(result.edges).toEqual(expect.arrayContaining([
            {
                trade: trades[3],
                from: assetOperations[3].name,
                to: assetOperations[4].name
            },
            {
                trade: trades[2],
                from: assetOperations[2].name,
                to: assetOperations[3].name
            }]));

        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenCalledTimes(3);
        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenNthCalledWith(1, assetOperations[4].inputMaterials[0].id);
        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenNthCalledWith(2, assetOperations[3].inputMaterials[0].id);
        expect(mockedTradeManagerService.getTradesByMaterial).toHaveBeenNthCalledWith(3, assetOperations[3].inputMaterials[1].id);

        expect(mockedAssetOperationService.getAssetOperationsByOutputMaterial).toHaveBeenCalledTimes(3);
        expect(mockedAssetOperationService.getAssetOperationsByOutputMaterial).toHaveBeenNthCalledWith(1, assetOperations[3].outputMaterial.id);
        expect(mockedAssetOperationService.getAssetOperationsByOutputMaterial).toHaveBeenNthCalledWith(2, assetOperations[3].inputMaterials[1].id);
        expect(mockedAssetOperationService.getAssetOperationsByOutputMaterial).toHaveBeenNthCalledWith(3, assetOperations[3].inputMaterials[1].id);
    });

    it('should compute a graph with a consolidation based on a pure material', async () => {
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[4]]);

        const result = await graphService.computeGraph(assetOperations[4].outputMaterial.id);

        expect(result).toEqual({
            nodes: [
                assetOperations[4]
            ],
            edges: []
        });
    });

    it('should compute a graph and return when the same node is already in the graph', async () => {
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[3]]);
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[2]]);
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[3]]);

        const result = await graphService.computeGraph(7);

        expect(result.nodes).toEqual(expect.arrayContaining([assetOperations[3]]));
        expect(result.edges).toEqual(expect.arrayContaining([{
            trade: trades[2],
            from: assetOperations[2].name,
            to: assetOperations[3].name
        }]));
    });

    it('should compute a graph containing consolidations and return when the same edge is found twice', async () => {
        mockGetAssetOperationsByOutputMaterial.mockReturnValueOnce([assetOperations[3], assetOperations[4], assetOperations[4]]);
        mockGetTradesByMaterial.mockReturnValue([trades[3]]);

        const result = await graphService.computeGraph(assetOperations[4].outputMaterial.id);

        expect(result.nodes).toEqual(expect.arrayContaining([assetOperations[4]]));
        expect(result.edges).toEqual(expect.arrayContaining([
            {
                trade: trades[3],
                from: assetOperations[4].name,
                to: assetOperations[4].name
            },]));

    });
});
