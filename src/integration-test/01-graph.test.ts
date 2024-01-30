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
import {AssetOperationType} from "../types/AssetOperationType";


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

    let productCategories: ProductCategory[];
    let materials: Material[];
    let assetOperations: AssetOperation[];
    let trades: Trade[];
    let tradeLines: Line[];
    let tradeIds: number[];

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

    const _registerProductCategories = async (productCategories: ProductCategory[]) => {
        await serial(productCategories.map((category) => async () => {
            await productCategoryService.registerProductCategory(category.name, category.quality, category.description);
        }));
    }

    const _registerMaterials = async (materials: Material[]) => {
        await serial(materials.map((material) => async () => {
            await materialService.registerMaterial(material.productCategory.id);
        }));
    }

    const _registerAssetOperations = async (assetOperations: AssetOperation[]) => {
        await serial(assetOperations.map((assetOperation) => async () => {
            await assetOperationService.registerAssetOperation(assetOperation.name, assetOperation.inputMaterials.map((m) => m.id), assetOperation.outputMaterial.id);
        }));
    }

    beforeAll(() => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);

        _defineSender(company1.privateKey);
        graphService = new GraphService(signer, tradeManagerService, assetOperationService);
    });

    const _addLineAndAssignMaterialToTrade = async (privateKey: string, tradeType: TradeType, tradeId: number, line: Line) => {
        _defineSender(privateKey);
        let tradeService: IConcreteTradeService = tradeType === TradeType.BASIC ?
            new BasicTradeService(
                new BasicTradeDriver(
                    signer,
                    await tradeManagerService.getTrade(tradeId),
                    MATERIAL_MANAGER_CONTRACT_ADDRESS,
                    PRODUCT_CATEGORY_CONTRACT_ADDRESS
                ),
            ) :
            new OrderTradeService(
                new OrderTradeDriver(
                    signer,
                    await tradeManagerService.getTrade(tradeId),
                    MATERIAL_MANAGER_CONTRACT_ADDRESS,
                    PRODUCT_CATEGORY_CONTRACT_ADDRESS
                ),
            );

        const lineRequest: LineRequest = tradeType === TradeType.BASIC ?
            new LineRequest(line.productCategory.id) :
            new OrderLineRequest(line.productCategory.id, (line as OrderLine).quantity, (line as OrderLine).price);
        const newLine: Line = await tradeService.addLine(lineRequest);
        await tradeService.assignMaterial(newLine.id, line.material!.id);
    }

    // it('should handle an empty graph', async () => {
    //     const result = await graphService.computeGraph(12);
    //     expect(result).toEqual({ nodes: [], edges: [] });
    // });

    it('should add data that is then used to compute the graph', async () => {
        productCategories = [
            new ProductCategory(1, 'raw coffee beans', 85, "first category"),
            new ProductCategory(2, 'green coffee beans', 90, "second category"),
            new ProductCategory(3, 'processed coffee beans', 82, "third category"),
            new ProductCategory(4, 'ground roasted coffee', 80, "fourth category"),
            new ProductCategory(5, 'sea water', 20, "fifth category"),
            new ProductCategory(6, 'purified water', 50, "sixth category"),
            new ProductCategory(7, 'final coffee', 90, "eighth category"),
        ];
        await _registerProductCategories(productCategories);

        materials = [
            new Material(1, productCategories[0]),
            new Material(2, productCategories[1]),
            new Material(3, productCategories[2]),
            new Material(4, productCategories[3]),
            new Material(5, productCategories[4]),
            new Material(6, productCategories[5]),
            new Material(7, productCategories[6]),
        ];
        await _registerMaterials(materials);

        assetOperations = [
            new AssetOperation(1, 'TRANSFORMATION: coffee beans processing', [materials[0], materials[1]], materials[2]),
            new AssetOperation(2, 'TRANSFORMATION: coffee grinding', [materials[2]], materials[3]),
            new AssetOperation(3, 'TRANSFORMATION: water purification', [materials[4]], materials[5]),
            new AssetOperation(4, 'TRANSFORMATION: final coffee production', [materials[3], materials[5]], materials[6]),
        ];
        await _registerAssetOperations(assetOperations);

        tradeIds = [];
        trades = [
            new BasicTrade(1, company1.address, customer, company2.address, externalUrl, [], 'shipping processed coffee'),
            new OrderTrade(2, company2.address, customer, company3.address, externalUrl, [], false, false, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, escrow),
            new BasicTrade(3, company1.address, customer, company3.address, externalUrl, [], 'shipping purified water'),
            new OrderTrade(4, company3.address, customer, company4.address, externalUrl, [], false, false, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, escrow),
        ];
        tradeLines = [
            new Line(1, materials[2], productCategories[2]),
            new OrderLine(2, materials[3], productCategories[3], 100, new OrderLinePrice(50, 'CHF')),
            new Line(3, materials[5], productCategories[5]),
            new OrderLine(4, materials[6], productCategories[6], 200, new OrderLinePrice(10, 'EUR')),
        ];
        const registerTradesFn = trades.map((t) => async () => {
            _defineSender(_getPrivateKey(t.supplier));
            if (t instanceof BasicTrade) {
                await tradeManagerService.registerBasicTrade(t.supplier, customer, t.commissioner, t.name, t.externalUrl);
            } else {
                await tradeManagerService.registerOrderTrade(t.supplier, customer, t.commissioner, t.externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
            }
            tradeIds.push(await tradeManagerService.getTradeCounter());
        });
        await serial(registerTradesFn);

        await _addLineAndAssignMaterialToTrade(company1.privateKey, TradeType.BASIC, tradeIds[0], tradeLines[0]);
        await _addLineAndAssignMaterialToTrade(company2.privateKey, TradeType.ORDER, tradeIds[1], tradeLines[1]);
        await _addLineAndAssignMaterialToTrade(company1.privateKey, TradeType.BASIC, tradeIds[2], tradeLines[2]);
        await _addLineAndAssignMaterialToTrade(company3.privateKey, TradeType.ORDER, tradeIds[3], tradeLines[3]);
    }, 30000);

    it('should generate a graph containing a consolidation', async () => {
        const newAssetOperation: AssetOperation = new AssetOperation(8, 'CONSOLIDATION: sea water transfer', [materials[4]], materials[4]);
        await _registerAssetOperations([newAssetOperation]);
        expect(newAssetOperation.type).toEqual(AssetOperationType.CONSOLIDATION);

        const newTrade: BasicTrade = await tradeManagerService.registerBasicTrade(company2.address, customer, company1.address, externalUrl, 'Sea water purchase');
        await _addLineAndAssignMaterialToTrade(company2.privateKey, TradeType.BASIC, newTrade.tradeId, new Line(1, materials[4], productCategories[4]));

        const result = await graphService.computeGraph(materials[4].id);
        result.nodes.sort(({ resourceId: a }, { resourceId: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
        result.edges.sort(({ from: a }, { from: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));

        expect(result).toEqual({
            nodes: [
                { resourceId: 'CONSOLIDATION: sea water transfer' },
            ],
            edges: [],
        });
    }, 30000);

    // it('should get a map of trades with lines containing a specific material', async () => {
    //     const result = await graphService.findTradesByMaterialOutput(materials[6].id);
    //
    //     expect(result.size).toEqual(1);
    //     const trade: Trade = result.keys().next().value;
    //     const line: Line = result.get(trade)![0];
    //
    //     expect(trade.tradeId).toEqual(tradeIds[3]);
    //     expect(trade.supplier).toEqual(company3.address);
    //     expect(trade.commissioner).toEqual(company4.address);
    //     expect(trade.lines.length).toEqual(1);
    //
    //     expect(line.material!.id).toEqual(tradeLines[3].material!.id);
    //     expect(line.productCategory.id).toEqual(tradeLines[3].productCategory.id);
    // });
    //
    // it('should compute a graph', async () => {
    //     const result = await graphService.computeGraph(7);
    //     result.nodes.sort(({ resourceId: a }, { resourceId: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
    //     result.edges.sort(({ from: a }, { from: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
    //
    //     expect(result).toEqual({
    //         nodes: [
    //             { resourceId: 'TRANSFORMATION: coffee grinding' },
    //             { resourceId: 'TRANSFORMATION: coffee beans processing' },
    //             { resourceId: 'TRANSFORMATION: final coffee production' },
    //             { resourceId: 'TRANSFORMATION: water purification' },
    //         ],
    //         edges: [
    //             { resourcesIds: [`${company2.address}_trade_2`], from: 'TRANSFORMATION: coffee grinding', to: 'TRANSFORMATION: final coffee production' },
    //             { resourcesIds: [`${company1.address}_trade_1`], from: 'TRANSFORMATION: coffee beans processing', to: 'TRANSFORMATION: coffee grinding' },
    //             { resourcesIds: [`${company1.address}_trade_3`], from: 'TRANSFORMATION: water purification', to: 'TRANSFORMATION: final coffee production' },
    //         ],
    //     });
    // }, 30000);
    //
    // it('should compute a graph where a material was used as input in two different asset operations. Only one branch of the newly created materials should be shown', async () => {
    //     const newProductCategories: ProductCategory[] = [
    //         new ProductCategory(8, "Small coffee bag", 90, "Final coffee packed in a small bag"),
    //         new ProductCategory(9, "Medium coffee bag", 90, "Final coffee packed in a medium bag"),
    //     ];
    //     await _registerProductCategories(newProductCategories);
    //
    //     const newMaterials: Material[] = [
    //         new Material(8, newProductCategories[0]),
    //         new Material(9, newProductCategories[1]),
    //     ];
    //     await _registerMaterials(newMaterials);
    //
    //     const assetOperations: AssetOperation[] = [
    //         new AssetOperation(6, "TRANSFORMATION: small coffee packaging", [materials[6]], newMaterials[0]),
    //         new AssetOperation(7, "TRANSFORMATION: medium coffee packaging", [materials[6]], newMaterials[1])
    //     ]
    //     await _registerAssetOperations(assetOperations);
    //
    //     const newTrade: BasicTrade = await tradeManagerService.registerBasicTrade(company3.address, customer, company4.address, externalUrl, 'Packaging');
    //     await _addLineAndAssignMaterialToTrade(company3.privateKey, TradeType.BASIC, newTrade.tradeId, new Line(1, newMaterials[0], newProductCategories[0]));
    //
    //     const result = await graphService.computeGraph(newMaterials[0].id);
    //     result.nodes.sort(({ resourceId: a }, { resourceId: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
    //     result.edges.sort(({ from: a }, { from: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
    //
    //     expect(result).toEqual({
    //         nodes: [
    //             { resourceId: 'TRANSFORMATION: small coffee packaging' },
    //             { resourceId: 'TRANSFORMATION: coffee grinding' },
    //             { resourceId: 'TRANSFORMATION: coffee beans processing' },
    //             { resourceId: 'TRANSFORMATION: final coffee production' },
    //             { resourceId: 'TRANSFORMATION: water purification' },
    //         ],
    //         edges: [
    //             { resourcesIds: [`${company2.address}_trade_2`], from: 'TRANSFORMATION: coffee grinding', to: 'TRANSFORMATION: final coffee production' },
    //             { resourcesIds: [`${company1.address}_trade_1`], from: 'TRANSFORMATION: coffee beans processing', to: 'TRANSFORMATION: coffee grinding' },
    //             { resourcesIds: [`${company3.address}_trade_4`], from: 'TRANSFORMATION: final coffee production', to: 'TRANSFORMATION: small coffee packaging' },
    //             { resourcesIds: [`${company1.address}_trade_3`], from: 'TRANSFORMATION: water purification', to: 'TRANSFORMATION: final coffee production' },
    //         ],
    //     });
    // }, 30000);

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

