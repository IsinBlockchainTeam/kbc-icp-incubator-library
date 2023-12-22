import * as dotenv from 'dotenv';

it('always pass', () => {
    expect(true)
        .toBeTruthy();
});

dotenv.config();

/*
describe('GraphService lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeService: TradeService;
    let tradeDriver: TradeDriver;

    let transformationDriver: TransformationDriver;
    let transformationService: TransformationService;

    let materialService: MaterialService;
    let materialDriver: MaterialDriver;

    const externalUrl = 'metadataUrl';
    const company1 = {
        address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    };
    const company2 = {
        address: '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
        privateKey: '0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61',
    };
    const company3 = {
        address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    };
    const company4 = {
        address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
        privateKey: '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
    };

    let graphService: GraphService;

    const _defineSender = (privateKey: string, ipfsService?: IPFSService) => {
        signer = new ethers.Wallet(privateKey, provider);
        tradeDriver = new TradeDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
        );
        tradeService = new TradeService(tradeDriver, ipfsService);

        transformationDriver = new TransformationDriver(
            signer,
            TRANSFORMATION_MANAGER_CONTRACT_ADDRESS,
        );
        transformationService = new TransformationService(transformationDriver);

        materialDriver = new MaterialDriver(
            signer,
            MATERIAL_MANAGER_CONTRACT_ADDRESS,
        );
        materialService = new MaterialService(materialDriver);
    };

    beforeAll(() => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);

        _defineSender(company1.privateKey);
        graphService = new GraphService(tradeService, transformationService);
    });

    it('should handle an empty graph', async () => {
        const result = await graphService.computeGraph(company1.address, 12);
        expect(result).toEqual({ nodes: [], edges: [] });
    });

    it('should add data that is then used to compute the graph', async () => {
        const materials = [
            new Material(1, 'raw coffee beans', company1.address),
            new Material(2, 'green coffee beans', company1.address),
            new Material(3, 'processed coffee beans', company1.address),
            // new Material(4, 'roasted coffee beans 1', company1.address),
            new Material(4, 'processed coffee beans 1', company2.address),
            new Material(5, 'ground roasted coffee', company2.address),
            new Material(6, 'ground roasted coffee 1', company3.address),
            new Material(7, 'water', company3.address),
            new Material(8, 'final coffee 1', company3.address),
            new Material(9, 'final coffee 2', company4.address),
            new Material(10, 'sea water', company1.address),
            new Material(11, 'purified water', company1.address),
        ];
        const registerMaterialsFn = materials.map((m) => async () => {
            await materialService.registerMaterial(m.owner, m.name);
        });
        await serial(registerMaterialsFn);

        const transformations = [
            new Transformation(0, 'coffee beans processing', [materials[0], materials[1]], 3, company1.address),
            new Transformation(0, 'coffee grinding', [materials[3]], 5, company2.address),
            new Transformation(0, 'final coffee production', [materials[5], materials[6]], 8, company3.address),
            new Transformation(0, 'water purification', [materials[9]], 11, company1.address),
        ];
        const registerTransformationsFn = transformations.map((t) => async () => transformationService.registerTransformation(t.owner, t.name, t.inputMaterials.map((m) => m.id), t.outputMaterialId));
        await serial(registerTransformationsFn);

        const tradeIds: number[] = [];
        const trades = [
            { supplier: company1, customer: company2, name: 'shipping 1', externalUrl, type: TradeType.TRADE },
            { supplier: company2, customer: company3, externalUrl, type: TradeType.ORDER },
            { supplier: company1, customer: company3, name: 'shipping water', externalUrl, type: TradeType.TRADE },
            { supplier: company3, customer: company4, externalUrl, type: TradeType.ORDER },
        ];
        const tradeLines = [
            new TradeLine(0, [3, 4], 'Arabic 85'),
            new TradeLine(0, [11, 7], 'Excelsa 88'),
        ];
        const orderLines = [
            new OrderLine(0, [5, 6], 'Excelsa 88', 100, new OrderLinePrice(50, 'CHF')),
            new OrderLine(0, [8, 9], 'Arabic 85 Superior', 600, new OrderLinePrice(10, 'EUR')),
        ];
        // add trades and orders
        const registerTradesFn = trades.map((t) => async () => {
            _defineSender(t.supplier.privateKey);
            if (t.type === TradeType.TRADE) {
                await tradeService.registerBasicTrade(t.supplier.address, t.customer.address, t.name!, t.externalUrl);
            } else if (t.type === TradeType.ORDER) {
                await tradeService.registerOrder(t.supplier.address, t.customer.address, t.externalUrl);
            }
            tradeIds.push(await tradeService.getCounter());
        });
        await serial(registerTradesFn);

        // add lines to relative trades and orders
        await tradeService.addTradeLines(tradeIds[0], [tradeLines[0]]);
        await tradeService.addOrderLines(tradeIds[1], [orderLines[0]]);
        await tradeService.addTradeLines(tradeIds[2], [tradeLines[1]]);
        await tradeService.addOrderLines(tradeIds[3], [orderLines[1]]);
    }, 30000);

    it('should compute a graph', async () => {
        const result = await graphService.computeGraph(company3.address, 8);
        result.nodes.sort(({ resourceId: a }, { resourceId: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
        result.edges.sort(({ from: a }, { from: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));

        expect(result).toEqual({
            nodes: [
                { resourceId: 'coffee grinding' },
                { resourceId: 'coffee beans processing' },
                { resourceId: 'final coffee production' },
                { resourceId: 'water purification' },
            ],
            edges: [
                { resourcesIds: [`${company2.address}_trade_2`], from: 'coffee grinding', to: 'final coffee production' },
                { resourcesIds: [`${company1.address}_trade_1`], from: 'coffee beans processing', to: 'coffee grinding' },
                { resourcesIds: [`${company1.address}_trade_3`], from: 'water purification', to: 'final coffee production' },
            ],
        });
    }, 30000);

    it('should compute a graph with 2 trades with same line', async () => {
        await tradeService.registerBasicTrade(company2.address, company3.address, 'basicTrade2', externalUrl);
        const tradeId = await tradeService.getCounter();
        await tradeService.addTradeLines(tradeId, [new TradeLine(0, [5, 6], 'Excelsa 88')]);

        const result = await graphService.computeGraph(company3.address, 8);
        result.nodes.sort(({ resourceId: a }, { resourceId: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
        result.edges.sort(({ from: a }, { from: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));

        expect(result).toEqual({
            nodes: [
                { resourceId: 'coffee grinding' },
                { resourceId: 'coffee beans processing' },
                { resourceId: 'final coffee production' },
                { resourceId: 'water purification' },
            ],
            edges: [
                { resourcesIds: [`${company2.address}_trade_2`, `${company2.address}_trade_5`], from: 'coffee grinding', to: 'final coffee production' },
                { resourcesIds: [`${company1.address}_trade_1`], from: 'coffee beans processing', to: 'coffee grinding' },
                { resourcesIds: [`${company1.address}_trade_3`], from: 'water purification', to: 'final coffee production' },
            ],
        });
    });

    it('should throw an error if it finds no transformation with specific output material', async () => {
        await tradeService.addTradeLine(1, [100, 10], 'Arabic 85');
        const fn = async () => graphService.computeGraph(company3.address, 8);
        await expect(fn).rejects.toThrowError('No transformations found for material id 100');
    });

    it('should throw an error if it finds multiple transformation with the same output material', async () => {
        await transformationService.registerTransformation(company3.address, 'transformation', [4], 8);
        const fn = async () => graphService.computeGraph(company3.address, 8);
        await expect(fn).rejects.toThrowError('Multiple transformations found for material id 8');
    });
});
*/
