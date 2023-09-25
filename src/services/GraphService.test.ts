import { createMock } from 'ts-auto-mock';
import { GraphService } from './GraphService';
import { Transformation } from '../entities/Transformation';
import { Trade } from '../entities/Trade';
import TradeService from './TradeService';
import { SupplyChainService } from './SupplyChainService';
import { TradeLine } from '../entities/TradeLine';

describe('GraphService', () => {
    let graphService: GraphService;

    const trades = [
        new Trade(1, 'supplier', 'customer', 'externalUrl', [2, 7]),
        new Trade(2, 'supplier', 'customer', 'externalUrl', [4, 8]),
    ];
    const tradeLines = [
        new TradeLine(2, [2, 1], 'categoryA'),
        new TradeLine(7, [3, 4], 'categoryB'),
        new TradeLine(4, [8, 7], 'categoryC'),
    ];
    const transformations = [
        new Transformation(1, 'transformation', [1], 2, 'transformationOwner'),
        new Transformation(2, 'transformation', [3], 4, 'transformationOwner'),
    ];

    const supplier = '0xsupplier_address';

    const findTransformationsByMaterialOutputSpy = jest.spyOn(GraphService.prototype, 'findTransformationsByMaterialOutput');
    const findTradesByMaterialOutputSpy = jest.spyOn(GraphService.prototype, 'findTradesByMaterialOutput');

    const mockedTradeService = createMock<TradeService>({
        getGeneralTrades: jest.fn().mockResolvedValue(trades),
        getTradeLines: jest.fn().mockResolvedValue(tradeLines),
    });
    const mockedSupplyChainService = createMock<SupplyChainService>({
        getTransformations: jest.fn().mockResolvedValue(transformations),
    });

    beforeAll(() => {
        graphService = new GraphService(mockedTradeService, mockedSupplyChainService);
    });

    it('findTransformationsByMaterialOutput', async () => {
        await graphService.findTransformationsByMaterialOutput(supplier, 2);

        expect(mockedSupplyChainService.getTransformations).toHaveBeenCalledTimes(1);
        expect(mockedSupplyChainService.getTransformations).toHaveBeenNthCalledWith(1, supplier);
    });

    it('findTradesByMaterialOutput', async () => {
        await graphService.findTradesByMaterialOutput(supplier, 2);

        expect(mockedTradeService.getGeneralTrades).toHaveBeenCalledTimes(1);
        expect(mockedTradeService.getGeneralTrades).toHaveBeenNthCalledWith(1, supplier);

        expect(mockedTradeService.getTradeLines).toHaveBeenCalledTimes(trades.length);
        trades.forEach((t, index) => expect(mockedTradeService.getTradeLines).toHaveBeenNthCalledWith(index + 1, supplier, t.id));
    });

    it('computeGraph', async () => {
        findTransformationsByMaterialOutputSpy.mockResolvedValue([transformations[1]]);
        findTradesByMaterialOutputSpy.mockResolvedValue(new Map().set(trades[0], [tradeLines[0], tradeLines[1]]));
        await graphService.computeGraph(supplier, 2);

        expect(findTransformationsByMaterialOutputSpy).toHaveBeenCalledTimes(1);
        expect(findTransformationsByMaterialOutputSpy).toHaveBeenNthCalledWith(1, supplier, 2);

        expect(findTradesByMaterialOutputSpy).toHaveBeenCalledTimes(1);
        expect(findTradesByMaterialOutputSpy).toHaveBeenNthCalledWith(1, supplier, transformations[1].inputMaterialsIds[0]);
    });
});
