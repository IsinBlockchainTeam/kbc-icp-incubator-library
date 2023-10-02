import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
import { IPFSService } from '@blockchain-lib/common';
import { GraphService } from '../services/GraphService';
import { Transformation } from '../entities/Transformation';
import TradeService from '../services/TradeService';
import { SupplyChainService } from '../services/SupplyChainService';
import { TradeDriver } from '../drivers/TradeDriver';
import { SupplyChainDriver } from '../drivers/SupplyChainDriver';
import {
    NETWORK,
    SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY,
    SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS,
    TRADE_MANAGER_CONTRACT_ADDRESS,
} from './config';
import { TradeLine } from '../entities/TradeLine';
import { serial } from '../utils/utils';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { TradeType } from '../entities/Trade';
import { Material } from '../entities/Material';

describe('GraphService lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeService: TradeService;
    let tradeDriver: TradeDriver;

    let supplyChainService: SupplyChainService;
    let supplyChainDriver: SupplyChainDriver;

    const tradeIds: number[] = [];
    const orderIds: number[] = [];
    const externalUrl = 'metadataUrl';
    const company1Address = {
        address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    };
    const company2Address = {
        address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    };
    const company3Address = {
        address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    };

    let graphService: GraphService;

    const _defineSender = (privateKey: string, ipfsService?: IPFSService) => {
        signer = new ethers.Wallet(privateKey, provider);
        tradeDriver = new TradeDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
        );
        tradeService = new TradeService(tradeDriver, ipfsService);
    };

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
            { supplier: company1Address, customer: company2Address, name: 'basicTrade1', externalUrl, type: TradeType.TRADE },
            { supplier: company2Address, customer: company3Address, externalUrl, type: TradeType.ORDER },
            { supplier: company2Address, customer: company3Address, name: 'basicTrade2', externalUrl, type: TradeType.TRADE },
        ];
        const tradeLines = [
            new TradeLine(0, [3, 2], 'CategoryA'),
            new TradeLine(0, [6, 5], 'CategoryB'),
        ];
        const orderLines = [
            new OrderLine(0, [6, 5], 'CategoryA', 100, new OrderLinePrice(50, 'CHF')),
        ];

        const materials = [
            new Material(1, 'Material 1', company1Address.address),
            new Material(2, 'Material 2', company1Address.address),
            new Material(3, 'Material 3', company2Address.address),
            new Material(4, 'Material 4', company2Address.address),
            new Material(5, 'Material 5', company2Address.address),
            new Material(6, 'Material 6', company3Address.address),
            new Material(7, 'Material 7', company3Address.address),
            new Material(8, 'Material 8', company3Address.address),
        ];

        const transformations = [
            new Transformation(0, 'transformation', [materials[0]], 2, SUPPLIER_ADDRESS),
            new Transformation(0, 'transformation', [materials[2], materials[3]], 5, SUPPLIER_ADDRESS),
            new Transformation(0, 'transformation', [materials[5], materials[6]], 12, SUPPLIER_ADDRESS),
        ];

        // add materials
        const registerMaterialsFn = materials.map((m) => async () => {
            await supplyChainService.registerMaterial(m.owner, m.name);
        });
        await serial(registerMaterialsFn);

        // add trades and orders
        const registerTradesFn = trades.map((t) => async () => {
            _defineSender(t.supplier.privateKey);
            if (t.type === TradeType.TRADE) {
                await tradeService.registerBasicTrade(t.supplier.address, t.customer.address, t.name!, t.externalUrl);
                tradeIds.push(await tradeService.getCounter());
            } else if (t.type === TradeType.ORDER) {
                await tradeService.registerOrder(t.supplier.address, t.customer.address, t.externalUrl);
                orderIds.push(await tradeService.getCounter());
            }
        });
        await serial(registerTradesFn);

        // add lines to relative trades and orders
        await tradeService.addTradeLines(tradeIds[0], [tradeLines[0]]);
        await tradeService.addTradeLines(tradeIds[1], [tradeLines[1]]);

        await tradeService.addOrderLines(orderIds[0], [orderLines[0]]);

        // add transformations
        const registerTransformationsFn = transformations.map((t) => async () => supplyChainService.registerTransformation(t.owner, t.name, t.inputMaterials.map((m) => m.id), t.outputMaterialId));
        await serial(registerTransformationsFn);
    }, 20000);

    it('should compute a graph', async () => {
        const result = await graphService.computeGraph(company3Address.address, 8);
        result.nodes.sort(({ resourceId: a }, { resourceId: b }) => a.localeCompare(b));
        result.edges.sort(({ from: a }, { from: b }) => a.localeCompare(b));

        expect(result).toEqual({
            nodes: [
                { resourceId: `${company1Address}_1` },
                { resourceId: `${company2Address}_2` },
                { resourceId: `${company2Address}_3` },
                { resourceId: `${company3Address}_4` },
                { resourceId: `${company3Address}_5` },
            ],
            edges: [
                { resourcesIds: [`${company1Address}_1`], from: `${company1Address}_1`, to: `${company3Address}_4` },
                { resourcesIds: [`${company2Address}_2`], from: `${company2Address}_2`, to: `${company3Address}_4` },
                { resourcesIds: [`${company2Address}_3`, `${company3Address}_5`], from: `${company2Address}_3`, to: `${company3Address}_5` },
                { resourcesIds: [`${company3Address}_4`], from: `${company3Address}_4`, to: `${company3Address}_5` },
            ],
        });
    });

    it('should throw an error if it finds multiple transformation with the same output material', async () => {
        await supplyChainService.registerTransformation(SUPPLIER_ADDRESS, 'transformation', [3], 2);
        const fn = async () => graphService.computeGraph(SUPPLIER_ADDRESS, 8);
        await expect(fn).rejects.toThrowError('Multiple transformations found for material id 2');
    });

    it('should throw an error if it finds no transformation with specific output material', async () => {
        await tradeService.addTradeLine(tradeIds[3], [100, 10], 'CategoryA');
        const fn = async () => graphService.computeGraph(SUPPLIER_ADDRESS, 8);
        await expect(fn).rejects.toThrowError('No transformations found for material id 100');
    });
});
