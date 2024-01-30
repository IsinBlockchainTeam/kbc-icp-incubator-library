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

    let productCategories: ProductCategory[];
    let materials: Material[];
    let assetOperations: AssetOperation[];
    let trades: Trade[];
    let tradeLines: Line[];

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

    it('should handle an empty graph', async () => {
        const result = await graphService.computeGraph(company1.address, 12);
        expect(result).toEqual({ nodes: [], edges: [] });
    });

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
        const registerProductCategoriesFn = productCategories.map((p) => async () => {
            await productCategoryService.registerProductCategory(p.name, p.quality, p.description);
        });
        await serial(registerProductCategoriesFn);

        materials = [
            new Material(1, productCategories[0]),
            new Material(2, productCategories[1]),
            new Material(3, productCategories[2]),
            new Material(4, productCategories[3]),
            new Material(5, productCategories[4]),
            new Material(6, productCategories[5]),
            new Material(7, productCategories[6]),
        ];
        const registerMaterialFn = materials.map((m) => async () => {
            await materialService.registerMaterial(m.productCategory.id);
        });
        await serial(registerMaterialFn);

        assetOperations = [
            new AssetOperation(1, 'TRANSFORMATION: coffee beans processing', [materials[0], materials[1]], materials[2]),
            new AssetOperation(2, 'TRANSFORMATION: coffee grinding', [materials[2]], materials[3]),
            new AssetOperation(3, 'TRANSFORMATION: water purification', [materials[4]], materials[5]),
            new AssetOperation(4, 'TRANSFORMATION: final coffee production', [materials[3], materials[5]], materials[6]),
        ];
        const registerAssetOperationFn = assetOperations.map((a) =>
            async () => assetOperationService.registerAssetOperation(a.name, a.inputMaterials.map((m) => m.id), a.outputMaterial.id)
        );
        await serial(registerAssetOperationFn);

        const tradeIds: number[] = [];
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

    // it('should compute a graph', async () => {
    //     const result = await graphService.computeGraph(company3.address, 8);
    //     result.nodes.sort(({ resourceId: a }, { resourceId: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
    //     result.edges.sort(({ from: a }, { from: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
    //
    //     expect(result).toEqual({
    //         nodes: [
    //             { resourceId: 'coffee grinding' },
    //             { resourceId: 'coffee beans processing' },
    //             { resourceId: 'final coffee production' },
    //             { resourceId: 'water purification' },
    //         ],
    //         edges: [
    //             { resourcesIds: [`${company2.address}_trade_2`], from: 'coffee grinding', to: 'final coffee production' },
    //             { resourcesIds: [`${company1.address}_trade_1`], from: 'coffee beans processing', to: 'coffee grinding' },
    //             { resourcesIds: [`${company1.address}_trade_3`], from: 'water purification', to: 'final coffee production' },
    //         ],
    //     });
    // }, 30000);
    //
    // it('should compute a graph with 2 trades with same line', async () => {
    //     await tradeManagerService.registerBasicTrade(company2.address, company3.address, 'basicTrade2', externalUrl);
    //     const tradeId = await tradeManagerService.getCounter();
    //     await tradeManagerService.addTradeLines(tradeId, [new TradeLine(0, [5, 6], 'Excelsa 88')]);
    //
    //     const result = await graphService.computeGraph(company3.address, 8);
    //     result.nodes.sort(({ resourceId: a }, { resourceId: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
    //     result.edges.sort(({ from: a }, { from: b }) => a.charAt(a.length - 1).localeCompare(b.charAt(b.length - 1)));
    //
    //     expect(result).toEqual({
    //         nodes: [
    //             { resourceId: 'coffee grinding' },
    //             { resourceId: 'coffee beans processing' },
    //             { resourceId: 'final coffee production' },
    //             { resourceId: 'water purification' },
    //         ],
    //         edges: [
    //             { resourcesIds: [`${company2.address}_trade_2`, `${company2.address}_trade_5`], from: 'coffee grinding', to: 'final coffee production' },
    //             { resourcesIds: [`${company1.address}_trade_1`], from: 'coffee beans processing', to: 'coffee grinding' },
    //             { resourcesIds: [`${company1.address}_trade_3`], from: 'water purification', to: 'final coffee production' },
    //         ],
    //     });
    // });
    //
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

