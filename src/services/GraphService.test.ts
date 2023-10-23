import { createMock } from 'ts-auto-mock';
import { GraphService } from './GraphService';
import { Transformation } from '../entities/Transformation';
import { Trade, TradeType } from '../entities/Trade';
import TradeService from './TradeService';
import { TradeLine } from '../entities/TradeLine';
import { Material } from '../entities/Material';
import { TransformationService } from './TransformationService';

describe('GraphService', () => {
    let graphService: GraphService;

    const materials = [
        new Material(1, 'material1', 'owner'),
        new Material(2, 'material2', 'owner'),
        new Material(3, 'material3', 'owner'),
        new Material(4, 'material4', 'owner'),
    ];
    const trades = [
        new Trade(1, 'supplier', 'customer', 'externalUrl', [2, 7], TradeType.TRADE),
        new Trade(2, 'supplier', 'customer', 'externalUrl', [4, 8], TradeType.ORDER),
    ];
    const tradeLines = [
        new TradeLine(2, [2, 1], 'categoryA'),
        new TradeLine(7, [3, 4], 'categoryB'),
        new TradeLine(4, [8, 7], 'categoryC'),
    ];
    const transformations = [
        new Transformation(1, 'transformation', [materials[0]], 2, 'transformationOwner'),
        new Transformation(2, 'transformation', [materials[2]], 4, 'transformationOwner'),
    ];

    const supplier = '0xsupplier_address';

    const findTransformationsByMaterialOutputSpy = jest.spyOn(GraphService.prototype, 'findTransformationsByMaterialOutput');
    const findTradesByMaterialOutputSpy = jest.spyOn(GraphService.prototype, 'findTradesByMaterialOutput');

    const mockedTradeService = createMock<TradeService>({
        getGeneralTrades: jest.fn().mockResolvedValue(trades),
        getTradeLines: jest.fn().mockResolvedValue(tradeLines),
    });
    const mockedTransformationService = createMock<TransformationService>({
        getTransformations: jest.fn().mockResolvedValue(transformations),
    });

    beforeAll(() => {
        graphService = new GraphService(mockedTradeService, mockedTransformationService);
    });

    it('findTransformationsByMaterialOutput', async () => {
        await graphService.findTransformationsByMaterialOutput(supplier, 2);

        expect(mockedTransformationService.getTransformations).toHaveBeenCalledTimes(1);
        expect(mockedTransformationService.getTransformations).toHaveBeenNthCalledWith(1, supplier);
    });

    it('findTradesByMaterialOutput', async () => {
        await graphService.findTradesByMaterialOutput(supplier, 2);

        expect(mockedTradeService.getGeneralTrades).toHaveBeenCalledTimes(1);
        expect(mockedTradeService.getGeneralTrades).toHaveBeenNthCalledWith(1, supplier);

        expect(mockedTradeService.getTradeLines).toHaveBeenCalledTimes(1);
        expect(mockedTradeService.getTradeLines).toHaveBeenNthCalledWith(1, trades[0].id);

        expect(mockedTradeService.getOrderLines).toHaveBeenCalledTimes(1);
        expect(mockedTradeService.getOrderLines).toHaveBeenNthCalledWith(1, trades[1].id);
    });

    it('computeGraph', async () => {
        findTransformationsByMaterialOutputSpy.mockResolvedValue([transformations[1]]);
        findTradesByMaterialOutputSpy.mockResolvedValue(new Map().set(trades[0], [tradeLines[0], tradeLines[1]]));
        await graphService.computeGraph(supplier, 2);

        expect(findTransformationsByMaterialOutputSpy).toHaveBeenCalledTimes(1);
        expect(findTransformationsByMaterialOutputSpy).toHaveBeenNthCalledWith(1, supplier, 2);

        expect(findTradesByMaterialOutputSpy).toHaveBeenCalledTimes(1);
        expect(findTradesByMaterialOutputSpy).toHaveBeenNthCalledWith(1, supplier, transformations[1].inputMaterials[0].id);
    });
});
