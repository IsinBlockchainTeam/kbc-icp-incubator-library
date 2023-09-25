import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
import { GraphService } from '../services/GraphService';
import { Transformation } from '../entities/Transformation';
import TradeService from '../services/TradeService';
import { SupplyChainService } from '../services/SupplyChainService';
import { TradeDriver } from '../drivers/TradeDriver';
import { SupplyChainDriver } from '../drivers/SupplyChainDriver';
import {
    CUSTOMER_ADDRESS,
    NETWORK, SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY,
    SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS,
    TRADE_MANAGER_CONTRACT_ADDRESS,
} from './config';
import { TradeLine } from '../entities/TradeLine';
import { serial } from '../utils/utils';

describe('GraphService lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeService: TradeService;
    let tradeDriver: TradeDriver;

    let supplyChainService: SupplyChainService;
    let supplyChainDriver: SupplyChainDriver;

    const tradeIds: number[] = [];
    const externalUrl = 'metadataUrl';

    let graphService: GraphService;

    beforeAll(() => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        signer = new ethers.Wallet(SUPPLIER_PRIVATE_KEY, provider);

        supplyChainDriver = new SupplyChainDriver(
            signer,
            SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS,
        );
        supplyChainService = new SupplyChainService(supplyChainDriver);
        tradeDriver = new TradeDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
        );
        tradeService = new TradeService(tradeDriver);

        graphService = new GraphService(tradeService, supplyChainService);
    });

    it('should handle an empty graph', async () => {
        const result = await graphService.computeGraph(SUPPLIER_ADDRESS, 12);
        expect(result).toEqual({ nodes: [], edges: [] });
    });

    it('should add data that is then used to compute the graph', async () => {
        const trades = [
            { supplier: SUPPLIER_ADDRESS, customer: CUSTOMER_ADDRESS, name: 'trade1', externalUrl },
            { supplier: SUPPLIER_ADDRESS, customer: CUSTOMER_ADDRESS, name: 'trade2', externalUrl },
            { supplier: SUPPLIER_ADDRESS, customer: CUSTOMER_ADDRESS, name: 'trade3', externalUrl },
            { supplier: SUPPLIER_ADDRESS, customer: CUSTOMER_ADDRESS, name: 'trade4', externalUrl },
            { supplier: SUPPLIER_ADDRESS, customer: CUSTOMER_ADDRESS, name: 'trade5', externalUrl },
        ];
        const tradeLines = [
            new TradeLine(0, [2, 7], 'CategoryA'),
            new TradeLine(0, [4, 8], 'CategoryB'),
            new TradeLine(0, [6, 11], 'CategoryA Superior'),
            new TradeLine(0, [14, 15], 'CategoryA Superior'),
            new TradeLine(0, [9, 10], 'CategoryA Superior'),
            new TradeLine(0, [6, 11], 'CategoryA'),
        ];
        const transformations = [
            new Transformation(0, 'transformation', [1], 2, SUPPLIER_ADDRESS),
            new Transformation(0, 'transformation', [3], 4, SUPPLIER_ADDRESS),
            new Transformation(0, 'transformation', [5], 6, SUPPLIER_ADDRESS),
            new Transformation(0, 'transformation', [7, 8], 9, SUPPLIER_ADDRESS),
            new Transformation(0, 'transformation', [10, 11], 12, SUPPLIER_ADDRESS),
            new Transformation(0, 'transformation', [13], 14, SUPPLIER_ADDRESS),
            new Transformation(0, 'transformation', [15], 16, SUPPLIER_ADDRESS),
        ];

        // add trades
        const registerTradesFn = trades.map((t) => async () => {
            await tradeService.registerBasicTrade(t.supplier, t.customer, t.name, t.externalUrl);
            tradeIds.push(await tradeService.getTradeCounter(SUPPLIER_ADDRESS));
        });
        await serial(registerTradesFn);

        // add lines to relative trades
        await tradeService.addTradeLines(SUPPLIER_ADDRESS, tradeIds[0], [tradeLines[0]]);
        await tradeService.addTradeLines(SUPPLIER_ADDRESS, tradeIds[1], [tradeLines[1]]);
        await tradeService.addTradeLines(SUPPLIER_ADDRESS, tradeIds[2], [tradeLines[2]]);
        await tradeService.addTradeLines(SUPPLIER_ADDRESS, tradeIds[2], [tradeLines[3]]);
        await tradeService.addTradeLines(SUPPLIER_ADDRESS, tradeIds[3], [tradeLines[4]]);
        await tradeService.addTradeLines(SUPPLIER_ADDRESS, tradeIds[4], [tradeLines[5]]);

        // add transformations
        const registerTransformationsFn = transformations.map((t) => async () => supplyChainService.registerTransformation(t.owner, t.name, t.inputMaterialsIds, t.outputMaterialId));
        await serial(registerTransformationsFn);
    });

    it('should compute a graph', async () => {
        const result = await graphService.computeGraph(SUPPLIER_ADDRESS, 12);
        expect(result).toEqual({
            nodes: [
                { resourceId: `${SUPPLIER_ADDRESS}_5` },
                { resourceId: `${SUPPLIER_ADDRESS}_4` },
                { resourceId: `${SUPPLIER_ADDRESS}_1` },
                { resourceId: `${SUPPLIER_ADDRESS}_2` },
                { resourceId: `${SUPPLIER_ADDRESS}_3` },
            ],
            edges: [
                { resourcesIds: [`${SUPPLIER_ADDRESS}_4`], from: `${SUPPLIER_ADDRESS}_4`, to: `${SUPPLIER_ADDRESS}_5` },
                { resourcesIds: [`${SUPPLIER_ADDRESS}_1`], from: `${SUPPLIER_ADDRESS}_1`, to: `${SUPPLIER_ADDRESS}_4` },
                { resourcesIds: [`${SUPPLIER_ADDRESS}_2`], from: `${SUPPLIER_ADDRESS}_2`, to: `${SUPPLIER_ADDRESS}_4` },
                { resourcesIds: [`${SUPPLIER_ADDRESS}_3`, `${SUPPLIER_ADDRESS}_5`], from: `${SUPPLIER_ADDRESS}_3`, to: `${SUPPLIER_ADDRESS}_5` },
            ],
        });
    });

    it('should throw an error if it finds multiple transformation with the same output material', async () => {
        await supplyChainService.registerTransformation(SUPPLIER_ADDRESS, 'transformation', [3], 2);
        expect(() => graphService.computeGraph(SUPPLIER_ADDRESS, 12)).toThrowError('Multiple transformations found for material id 2');
    });

    it('should throw an error if it finds no transformation with specific output material', async () => {
        await tradeService.addTradeLine(SUPPLIER_ADDRESS, tradeIds[3], [-1, 10], 'CategoryA');
        expect(() => graphService.computeGraph(SUPPLIER_ADDRESS, 12)).toThrowError('No transformations found for material id -1');
    });
});
