import {JsonRpcProvider} from "@ethersproject/providers";
import {ethers, Signer, Wallet} from "ethers";
import {TradeManagerService} from "../services/TradeManagerService";
import {AssetOperationDriver} from "../drivers/AssetOperationDriver";
import {AssetOperationService} from "../services/AssetOperationService";
import {MaterialService} from "../services/MaterialService";
import {MaterialDriver} from "../drivers/MaterialDriver";
import {GraphService} from "../services/GraphService";
import {
    ASSET_OPERATION_MANAGER_CONTRACT_ADDRESS,
    MATERIAL_MANAGER_CONTRACT_ADDRESS,
    NETWORK,
    PRODUCT_CATEGORY_CONTRACT_ADDRESS,
    TRADE_MANAGER_CONTRACT_ADDRESS
} from "./config";
import {TradeManagerDriver} from "../drivers/TradeManagerDriver";
import {Material} from "../entities/Material";
import {ProductCategory} from "../entities/ProductCategory";
import {ProductCategoryService} from "../services/ProductCategoryService";
import {ProductCategoryDriver} from "../drivers/ProductCategoryDriver";
import {serial} from "../utils/utils";
import {AssetOperation} from "../entities/AssetOperation";
import {TradeType} from "../types/TradeType";
import {Line, LineRequest, Trade} from "../entities/Trade";
import {OrderLine, OrderLinePrice, OrderLineRequest, OrderTrade} from "../entities/OrderTrade";
import {BasicTrade} from "../entities/BasicTrade";
import {IConcreteTradeService} from "../services/IConcreteTradeService";
import {BasicTradeService} from "../services/BasicTradeService";
import {BasicTradeDriver} from "../drivers/BasicTradeDriver";
import {OrderTradeService} from "../services/OrderTradeService";
import {OrderTradeDriver} from "../drivers/OrderTradeDriver";

describe('GraphService lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeManagerService: TradeManagerService;

    let productCategoryService: ProductCategoryService;

    let materialService: MaterialService;

    let assetOperationService: AssetOperationService;

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

    const customer: string = Wallet.createRandom().address;
    const arbiter: string = Wallet.createRandom().address;
    const escrow: string = Wallet.createRandom().address;
    const agreedAmount: number = 100;
    const tokenAddress: string = Wallet.createRandom().address;
    const paymentDeadline: number = Date.now() + 1000 * 60 * 60 * 24 * 30;
    const documentDeliveryDeadline: number = Date.now() + 1000 * 60 * 60 * 24 * 30;
    const shippingDeadline: number = Date.now() + 1000 * 60 * 60 * 24 * 30;
    const deliveryDeadline: number = Date.now() + 1000 * 60 * 60 * 24 * 30;

    let graphService: GraphService;

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);

        tradeManagerService = new TradeManagerService(
            new TradeManagerDriver(
                signer,
                TRADE_MANAGER_CONTRACT_ADDRESS,
                MATERIAL_MANAGER_CONTRACT_ADDRESS,
                PRODUCT_CATEGORY_CONTRACT_ADDRESS
            ),
        );

        productCategoryService = new ProductCategoryService(
            new ProductCategoryDriver(
                signer,
                PRODUCT_CATEGORY_CONTRACT_ADDRESS
            )
        )

        assetOperationService = new AssetOperationService(
            new AssetOperationDriver(
                signer,
                ASSET_OPERATION_MANAGER_CONTRACT_ADDRESS,
                MATERIAL_MANAGER_CONTRACT_ADDRESS,
                PRODUCT_CATEGORY_CONTRACT_ADDRESS
            ),
        );

        materialService = new MaterialService(
            new MaterialDriver(
                signer,
                MATERIAL_MANAGER_CONTRACT_ADDRESS,
                PRODUCT_CATEGORY_CONTRACT_ADDRESS
            )
        );
    };

    const _getPrivateKey = (address: string): string => {
        switch (address) {
            case company1.address:
                return company1.privateKey;
            case company2.address:
                return company2.privateKey;
            case company3.address:
                return company3.privateKey;
            case company4.address:
                return company4.privateKey;
            default:
                return '';
        }
    }

    const _registerProductCategories = async (productCategories: ProductCategory[]): Promise<ProductCategory[]> => {
        const result: ProductCategory[] = [];
        await serial(productCategories.map((category) => async () => {
            result.push(await productCategoryService.registerProductCategory(category.name, category.quality, category.description));
        }));
        return result;
    }

    const _registerMaterials = async (materials: Material[]): Promise<Material[]> => {
        const result: Material[] = [];
        await serial(materials.map((material) => async () => {
            result.push(await materialService.registerMaterial(material.productCategory.id));
        }));
        return result;
    }

    const _registerAssetOperations = async (assetOperations: AssetOperation[]): Promise<AssetOperation[]> => {
        const result: AssetOperation[] = [];
        await serial(assetOperations.map((assetOperation) => async () => {
            result.push(await assetOperationService.registerAssetOperation(assetOperation.name, assetOperation.inputMaterials.map((m) => m.id), assetOperation.outputMaterial.id));
        }));
        return result;
    }

    const _registerTrade = async (trade: Trade, lines: Line[], tradeType: TradeType): Promise<Trade> => {
        _defineSender(_getPrivateKey(trade.supplier));
        let tradeService: IConcreteTradeService;

        if (tradeType === TradeType.BASIC) {
            trade = await tradeManagerService.registerBasicTrade(trade.supplier, customer, trade.commissioner, (trade as BasicTrade).name, trade.externalUrl);
            tradeService = new BasicTradeService(
                new BasicTradeDriver(
                    signer,
                    await tradeManagerService.getTrade(trade.tradeId),
                    MATERIAL_MANAGER_CONTRACT_ADDRESS,
                    PRODUCT_CATEGORY_CONTRACT_ADDRESS
                ),
            );
        } else {
            trade = await tradeManagerService.registerOrderTrade(trade.supplier, customer, trade.commissioner, trade.externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            tradeService = new OrderTradeService(
                new OrderTradeDriver(
                    signer,
                    await tradeManagerService.getTrade(trade.tradeId),
                    MATERIAL_MANAGER_CONTRACT_ADDRESS,
                    PRODUCT_CATEGORY_CONTRACT_ADDRESS
                ),
            );
        }

        await serial(lines.map((line) => async () => {
            const lineRequest: LineRequest = tradeType === TradeType.BASIC ?
                new LineRequest(line.productCategory.id) :
                new OrderLineRequest(line.productCategory.id, (line as OrderLine).quantity, (line as OrderLine).price);
            const newLine: Line = await tradeService.addLine(lineRequest);
            newLine.material = line.material;
            await tradeService.assignMaterial(newLine.id, newLine.material!.id);
            trade.lines.push(newLine);
            if(tradeType === TradeType.ORDER)
                (trade as OrderTrade).hasSupplierSigned = true;
        }));
        return trade;
    }

    beforeAll(() => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);

        _defineSender(company1.privateKey);
        graphService = new GraphService(signer, tradeManagerService, assetOperationService);
    });

    it('should handle an empty graph', async () => {
        const result = await graphService.computeGraph(42);
        expect(result).toEqual({nodes: [], edges: []});
    });

    describe('Transformations only scenario', () => {
        let productCategories: ProductCategory[] = [];
        let materials: Material[] = [];
        let assetOperations: AssetOperation[] = [];
        let trades: Trade[] = [];

        it('should add data that is then used to compute the graph', async () => {
            productCategories = await _registerProductCategories([
                new ProductCategory(0, 'Raw coffee beans', 85, "first category"),
                new ProductCategory(0, 'Green coffee beans', 90, "second category"),
                new ProductCategory(0, 'Processed coffee beans', 82, "third category"),
                new ProductCategory(0, 'Ground roasted coffee', 80, "fourth category"),
                new ProductCategory(0, 'Sea water', 20, "fifth category"),
                new ProductCategory(0, 'Purified water', 50, "sixth category"),
                new ProductCategory(0, 'Final coffee', 90, "eighth category"),
                new ProductCategory(0, "Small coffee bag", 90, "Final coffee packed in a small bag"),
                new ProductCategory(0, "Medium coffee bag", 90, "Final coffee packed in a medium bag"),
                new ProductCategory(0, "Batch of coffee bags", 90, "Batch of a small and a medium coffee bag")
            ]);

            materials = await _registerMaterials([
                new Material(0, productCategories[0]),
                new Material(0, productCategories[1]),
                new Material(0, productCategories[2]),
                new Material(0, productCategories[3]),
                new Material(0, productCategories[4]),
                new Material(0, productCategories[5]),
                new Material(0, productCategories[6]),
                new Material(0, productCategories[7]),
                new Material(0, productCategories[8]),
                new Material(0, productCategories[9])
            ]);

            assetOperations = await _registerAssetOperations([
                new AssetOperation(0, 'TRANSFORMATION: coffee beans processing', [materials[0], materials[1]], materials[2]),
                new AssetOperation(0, 'TRANSFORMATION: coffee grinding', [materials[2]], materials[3]),
                new AssetOperation(0, 'TRANSFORMATION: water purification', [materials[4]], materials[5]),
                new AssetOperation(0, 'TRANSFORMATION: final coffee production', [materials[3], materials[5]], materials[6]),
                new AssetOperation(0, "TRANSFORMATION: small coffee packaging", [materials[6]], materials[7]),
                new AssetOperation(0, "TRANSFORMATION: medium coffee packaging", [materials[6]], materials[8]),
                new AssetOperation(0, "TRANSFORMATION: coffee bags packaging", [materials[7], materials[8]], materials[9])
            ]);

            const newTrades: Trade[] = [
                new BasicTrade(0, company1.address, customer, company2.address, externalUrl, [], 'shipping processed coffee'),
                new OrderTrade(0, company2.address, customer, company3.address, externalUrl, [], false, false, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, escrow),
                new BasicTrade(0, company1.address, customer, company3.address, externalUrl, [], 'shipping purified water'),
                new OrderTrade(0, company3.address, customer, company4.address, externalUrl, [], false, false, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, escrow),
                new BasicTrade(0, company3.address, customer, company4.address, externalUrl, [], 'Small packaging'),
                new BasicTrade(0, company3.address, customer, company4.address, externalUrl, [], 'Medium packaging'),
                new BasicTrade(0, company4.address, customer, company1.address, externalUrl, [], 'shipping coffee batch'),
            ];
            const newTradeLines: Line[] = [
                new Line(0, materials[2], productCategories[2]),
                new OrderLine(0, materials[3], productCategories[3], 100, new OrderLinePrice(50, 'CHF')),
                new Line(0, materials[5], productCategories[5]),
                new OrderLine(0, materials[6], productCategories[6], 200, new OrderLinePrice(10, 'EUR')),
                new Line(0, materials[7], productCategories[7]),
                new Line(0, materials[8], productCategories[8]),
                new Line(0, materials[9], productCategories[9])
            ];

            trades.push(await _registerTrade(newTrades[0], [newTradeLines[0]], TradeType.BASIC));
            trades.push(await _registerTrade(newTrades[1], [newTradeLines[1]], TradeType.ORDER));
            trades.push(await _registerTrade(newTrades[2], [newTradeLines[2]], TradeType.BASIC));
            trades.push(await _registerTrade(newTrades[3], [newTradeLines[3]], TradeType.ORDER));
            trades.push(await _registerTrade(newTrades[4], [newTradeLines[4]], TradeType.BASIC));
            trades.push(await _registerTrade(newTrades[5], [newTradeLines[5]], TradeType.BASIC));
            trades.push(await _registerTrade(newTrades[6], [newTradeLines[6]], TradeType.BASIC));
        }, 30000);

        it('should get a map of trades with lines containing a specific material', async () => {
            const result = await graphService.findTradesByMaterial(materials[6].id);

            expect(result.size).toEqual(1);
            const trade: Trade = result.keys().next().value;
            const line: Line = result.get(trade)![0];

            expect(trade.tradeId).toEqual(trades[3].tradeId);
            expect(trade.supplier).toEqual(trades[3].supplier);
            expect(trade.commissioner).toEqual(trades[3].commissioner);
            expect(trade.lines.length).toEqual(1);

            expect([line]).toEqual(trades[3].lines);
        });

        it('should compute a graph', async () => {
            const result = await graphService.computeGraph(materials[6].id);

            expect(result.nodes).toEqual(expect.arrayContaining([
                assetOperations[3], assetOperations[1], assetOperations[2], assetOperations[0]
            ]));

            expect(result.edges).toEqual(expect.arrayContaining([
                {
                    trade: trades[1],
                    from: assetOperations[1].name,
                    to: assetOperations[3].name
                },
                {
                    trade: trades[2],
                    from: assetOperations[2].name,
                    to: assetOperations[3].name
                },
                {
                    trade: trades[0],
                    from: assetOperations[0].name,
                    to: assetOperations[1].name
                },
            ]));
        }, 30000);

        it('should compute a subgraph of the previous graph', async () => {
            const result = await graphService.computeGraph(materials[2].id);

            expect(result.nodes).toEqual(expect.arrayContaining([
                assetOperations[0]
            ]));

            expect(result.edges).toEqual([]);
        });

        it('should compute a graph where a material was used as input in two different asset operations. Only one branch of the newly created materials should be shown', async () => {
            const result = await graphService.computeGraph(materials[7].id);

            expect(result.nodes).toEqual(expect.arrayContaining([
                assetOperations[4], assetOperations[3], assetOperations[1], assetOperations[2], assetOperations[0]
            ]));

            expect(result.edges).toEqual(expect.arrayContaining([
                {
                    trade: trades[3],
                    from: assetOperations[3].name,
                    to: assetOperations[4].name
                },
                {
                    trade: trades[1],
                    from: assetOperations[1].name,
                    to: assetOperations[3].name
                },
                {
                    trade: trades[2],
                    from: assetOperations[2].name,
                    to: assetOperations[3].name
                },
                {
                    trade: trades[0],
                    from: assetOperations[0].name,
                    to: assetOperations[1].name
                },
            ]));
        }, 30000);

        it('should compute a graph where the material is the join of two forked branches', async () => {
            const result = await graphService.computeGraph(materials[9].id);

            expect(result.nodes).toEqual(expect.arrayContaining([
                assetOperations[6], assetOperations[5], assetOperations[4], assetOperations[3], assetOperations[2], assetOperations[1], assetOperations[0]
            ]));

            expect(result.edges).toEqual(expect.arrayContaining([
                {
                    trade: trades[5],
                    from: assetOperations[5].name,
                    to: assetOperations[6].name
                },
                {
                    trade: trades[4],
                    from: assetOperations[4].name,
                    to: assetOperations[6].name
                },
                {
                    trade: trades[3],
                    from: assetOperations[3].name,
                    to: assetOperations[4].name
                },
                {
                    trade: trades[1],
                    from: assetOperations[1].name,
                    to: assetOperations[3].name
                },
                {
                    trade: trades[2],
                    from: assetOperations[2].name,
                    to: assetOperations[3].name
                },
                {
                    trade: trades[0],
                    from: assetOperations[0].name,
                    to: assetOperations[1].name
                },
            ]))
        }, 30000);
    });

    describe('Consolidations scenario', () => {
        let productCategories: ProductCategory[] = [];
        let materials: Material[] = [];
        let assetOperations: AssetOperation[] = [];
        let trades: Trade[] = [];

        it('should add data that is then used to compute the graph', async () => {
            productCategories = await _registerProductCategories([
                new ProductCategory(0, "Arabica beans", 90, "Beans of Arabica coffee"),
                new ProductCategory(0, "Roasted Arabica beans", 85, "Roasted beans of Arabica coffee"),
            ]);

            materials = await _registerMaterials([
                new Material(0, productCategories[0]),
                new Material(0, productCategories[1]),
            ]);

            assetOperations = await _registerAssetOperations([
                new AssetOperation(0, "CONSOLIDATION: arabica beans transfer", [materials[0]], materials[0]),
                new AssetOperation(0, "TRANSFORMATION: arabica beans roasting", [materials[0]], materials[1]),
                new AssetOperation(0, "CONSOLIDATION: roasted arabica beans transfer", [materials[1]], materials[1]),
                new AssetOperation(0, "CONSOLIDATION: another roasted arabica beans transfer", [materials[1]], materials[1]),
            ]);

            const newTrades = [
                new BasicTrade(0, company1.address, customer, company2.address, externalUrl, [], 'Arabica beans purchase'),
                new BasicTrade(0, company2.address, customer, company3.address, externalUrl, [], 'Roasted arabica beans purchase'),
                new BasicTrade(0, company3.address, customer, company4.address, externalUrl, [], 'Another roasted arabica beans purchase'),
            ];
            const newTradeLines = [
                new Line(0, materials[0], productCategories[0]),
                new Line(0, materials[1], productCategories[1]),
                new Line(0, materials[1], productCategories[1])
            ]

            for (let i = 0; i < newTrades.length; i++) {
                trades.push(await _registerTrade(newTrades[i], [newTradeLines[i]], TradeType.BASIC));
            }
        });

        it('should generate a graph containing a consolidation', async () => {
            const result = await graphService.computeGraph(materials[0].id);

            expect(result).toEqual({
                nodes: [assetOperations[0]],
                edges: [],
            });
        }, 30000);

        it('should generate a graph containing a consolidation followed by a transformation and two consolidations', async () => {
            const result = await graphService.computeGraph(materials[1].id);

            expect(result).toEqual({
                nodes: [
                    assetOperations[3], assetOperations[2], assetOperations[1], assetOperations[0]
                ],
                edges: [
                    {
                        trade: trades[2],
                        from: assetOperations[2].name,
                        to: assetOperations[3].name
                    },
                    {
                        trade: trades[1],
                        from: assetOperations[1].name,
                        to: assetOperations[2].name
                    },
                    {
                        trade: trades[0],
                        from: assetOperations[0].name,
                        to: assetOperations[1].name
                    },
                ]
            });
        });
    });

    // it('should throw an error if it finds no transformation with specific output material', async () => {
    //     await tradeManagerService.addTradeLine(1, [100, 10], 'Arabic 85');
    //     const fn = async () => graphService.computeGraph(company3.address, 8);
    //     await expect(fn).rejects.toThrowError('No transformations found for material id 100');
    // });
    //
    // it('should throw an error if it finds multiple transformation with the same output material', async () => {
    //     await assetOperationService.registerTransformation(company3.address, 'transformation', [4], 8);
    //     const fn = async () => graphService.computeGraph(company3.address, 8);
    //     await expect(fn).rejects.toThrowError('Multiple transformations found for material id 8');
    // });
});

