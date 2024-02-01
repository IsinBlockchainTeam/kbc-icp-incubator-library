import {createMock} from 'ts-auto-mock';
import {GraphService} from './GraphService';
import {AssetOperation} from '../entities/AssetOperation';
import {Line} from '../entities/Trade';
import {TradeManagerService} from "./TradeManagerService";
import {Material} from '../entities/Material';
import {AssetOperationService} from './AssetOperationService';
import {ProductCategory} from "../entities/ProductCategory";
import {TradeType} from "../types/TradeType";
import {BasicTrade} from "../entities/BasicTrade";
import {OrderLine, OrderLinePrice, OrderTrade} from "../entities/OrderTrade";
import {Signer} from "ethers";
import {BasicTradeDriver} from "../drivers/BasicTradeDriver";
import {OrderTradeDriver} from "../drivers/OrderTradeDriver";

jest.mock('../drivers/BasicTradeDriver');
jest.mock('../drivers/OrderTradeDriver');

describe('GraphService', () => {
    let graphService: GraphService;

    const productCategories: ProductCategory[] = [
        new ProductCategory(0, 'categoryA', 80, '1st category'),
        new ProductCategory(1, 'categoryB', 85, '2nd category'),
        new ProductCategory(2, 'categoryC', 90, '3rd category'),
    ];
    const materials = [
        new Material(0, productCategories[0]),
        new Material(1, productCategories[1]),
        new Material(2, productCategories[2]),
        new Material(3, productCategories[2]),
    ];
    const tradeTypes: TradeType[] = [TradeType.BASIC, TradeType.ORDER, TradeType.BASIC];
    const trades = [
        new BasicTrade(0, '0xsupplier_address', 'customer', 'commissioner', 'externalUrl', [new Line(0, materials[0], productCategories[0])], 'name'),
        new OrderTrade(1, '0xsupplier_address', 'customer', 'commissioner', 'externalUrl', [new OrderLine(0, materials[1],
            productCategories[1], 10, new OrderLinePrice(10.4, 'USD')), new OrderLine(1, materials[2], productCategories[2], 20,
                new OrderLinePrice(20, 'CHF'))], false, false, 100, 200, 'arbiter', 300,
            400, 'escrow'),
        new BasicTrade(2, 'non_supplier_address', 'customer', 'commissioner', 'externalUrl', [], 'name')
    ];
    const tradeLines = [
        new Line(0, materials[0], productCategories[0]),
        new OrderLine(0, materials[1], productCategories[1], 10, new OrderLinePrice(10.4, 'USD')),
        new OrderLine(1, materials[2], productCategories[2], 20, new OrderLinePrice(20, 'CHF')),
    ];
    const assetOperations = [
        new AssetOperation(0, 'transformation', [materials[0], materials[1]], materials[2]),
        new AssetOperation(1, 'consolidation', [materials[3]], materials[3]),
    ];

    const supplier = '0xsupplier_address';

    const findAssetOperationsByMaterialOutputSpy = jest.spyOn(GraphService.prototype, 'findTradesByMaterial');
    const findTradesByMaterialOutputSpy = jest.spyOn(GraphService.prototype, 'computeGraph');

    let tradeCounter: number = 0;
    let typeCounter: number = 0;
    const mockedTradeManagerService: TradeManagerService = createMock<TradeManagerService>({
        getTradeIdsOfSupplier: jest.fn().mockResolvedValue([trades[0].tradeId, trades[1].tradeId]),
        getTrade: jest.fn().mockImplementation(() => {
            const trade = trades[tradeCounter++];
            return Promise.resolve(trade);
        }),
        getTradeType: jest.fn().mockImplementation(() => {
            const tradeType = tradeTypes[typeCounter++];
            return Promise.resolve(tradeType);
        }),
    });
    const mockedAssetOperationService: AssetOperationService = createMock<AssetOperationService>({
        getAssetOperationsOfCreator: jest.fn().mockReturnValue(assetOperations.filter((a) => a.outputMaterial.id === 2)),
    });

    const mockedBasicGetTrade = jest.fn().mockResolvedValue(trades[0]);
    const mockedBasicGetLines = jest.fn().mockResolvedValue([tradeLines[0]]);
    (BasicTradeDriver as jest.Mock).mockImplementation(() => {
        return createMock<BasicTradeDriver>({
            getTrade: mockedBasicGetTrade,
            getLines: mockedBasicGetLines,
        });
    });
    const mockedOrderGetTrade = jest.fn().mockResolvedValue(trades[1]);
    const mockedOrderGetLines = jest.fn().mockResolvedValue(tradeLines.slice(1, 3));
    (OrderTradeDriver as jest.Mock).mockImplementation(() => {
        return createMock<OrderTradeDriver>({
            getTrade: mockedOrderGetTrade,
            getLines: mockedOrderGetLines,
        })
    });

    beforeAll(() => {
        graphService = new GraphService(createMock<Signer>(), mockedTradeManagerService, mockedAssetOperationService);
    });

    it('findTradesByMaterialOutput', async () => {
        await graphService.findTradesByMaterial(2);

        expect(mockedTradeManagerService.getTradeIdsOfSupplier).toHaveBeenCalledTimes(1);
        expect(mockedTradeManagerService.getTradeIdsOfSupplier).toHaveBeenNthCalledWith(1, supplier);

        expect(mockedTradeManagerService.getTrade).toHaveBeenCalledTimes(2);
        expect(mockedTradeManagerService.getTrade).toHaveBeenNthCalledWith(1, 0);
        expect(mockedTradeManagerService.getTrade).toHaveBeenNthCalledWith(2, 1);

        expect(mockedTradeManagerService.getTradeType).toHaveBeenCalledTimes(2);
        expect(mockedTradeManagerService.getTradeType).toHaveBeenNthCalledWith(1, 0);
        expect(mockedTradeManagerService.getTradeType).toHaveBeenNthCalledWith(2, 1);

        expect(mockedBasicGetLines).toHaveBeenCalledTimes(1);
        expect(mockedBasicGetLines).toHaveBeenNthCalledWith(1);

        expect(mockedBasicGetTrade).toHaveBeenCalledTimes(0);

        expect(mockedOrderGetLines).toHaveBeenCalledTimes(1);
        expect(mockedOrderGetLines).toHaveBeenNthCalledWith(1);

        expect(mockedOrderGetTrade).toHaveBeenCalledTimes(1);
        expect(mockedOrderGetTrade).toHaveBeenNthCalledWith(1, undefined);
    });

    // it('computeGraph', async () => {
    //     findAssetOperationsByMaterialOutputSpy.mockResolvedValue([assetOperations[1]]);
    //     findTradesByMaterialOutputSpy.mockResolvedValue(new Map().set(trades[0], [tradeLines[0], tradeLines[1]]));
    //     await graphService.computeGraph(supplier, 2);
    //
    //     expect(findAssetOperationsByMaterialOutputSpy).toHaveBeenCalledTimes(1);
    //     expect(findAssetOperationsByMaterialOutputSpy).toHaveBeenNthCalledWith(1, supplier, 2);
    //
    //     expect(findTradesByMaterialOutputSpy).toHaveBeenCalledTimes(1);
    //     expect(findTradesByMaterialOutputSpy).toHaveBeenNthCalledWith(1, supplier, assetOperations[1].inputMaterials[0].id);
    // });
});
