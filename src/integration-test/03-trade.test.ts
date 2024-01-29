import * as dotenv from 'dotenv';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer, Wallet } from 'ethers';
import {
    CUSTOMER_ADDRESS,
    MATERIAL_MANAGER_CONTRACT_ADDRESS,
    MY_TOKEN_CONTRACT_ADDRESS,
    NETWORK,
    OTHER_ADDRESS, OTHER_PRIVATE_KEY, PRODUCT_CATEGORY_CONTRACT_ADDRESS,
    SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY,
    TRADE_MANAGER_CONTRACT_ADDRESS,
} from './config';
import { MaterialService } from '../services/MaterialService';
import { MaterialDriver } from '../drivers/MaterialDriver';
import { TradeManagerService } from '../services/TradeManagerService';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { OrderTradeService } from '../services/OrderTradeService';
import {
    OrderTradeDriver,
} from '../drivers/OrderTradeDriver';
import {
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
    OrderTrade,
} from '../entities/OrderTrade';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { BasicTradeService } from '../services/BasicTradeService';
import { Line, LineRequest } from '../entities/Trade';
import { BasicTradeDriver } from '../drivers/BasicTradeDriver';
import { BasicTrade } from '../entities/BasicTrade';
import {ProductCategoryService} from "../services/ProductCategoryService";
import {ProductCategoryDriver} from "../drivers/ProductCategoryDriver";
import {Material} from "../entities/Material";
import {ProductCategory} from "../entities/ProductCategory";

dotenv.config();

describe('Trade lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeManagerService: TradeManagerService;

    let materialService: MaterialService;
    let materialDriver: MaterialDriver;

    let existingOrder: number;
    let existingOrderService: OrderTradeService;

    const deadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;
    const arbiter: string = Wallet.createRandom().address;

    const productCategoryIds: number[] = [];
    const materialIds: number[] = [];

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        const tradeManagerDriver: TradeManagerDriver = new TradeManagerDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
            MATERIAL_MANAGER_CONTRACT_ADDRESS,
            PRODUCT_CATEGORY_CONTRACT_ADDRESS
        );
        tradeManagerService = new TradeManagerService(tradeManagerDriver);
    };

    const _updateExistingOrderService = async () => {
        const orderAddress: string = await tradeManagerService.getTrade(existingOrder);
        existingOrderService = new OrderTradeService(new OrderTradeDriver(signer, orderAddress, MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
    };

    const _registerOrder = async (): Promise<{
        order: OrderTrade,
        orderTradeService: OrderTradeService
    }> => {
        const trade: OrderTrade = await tradeManagerService.registerOrderTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, OTHER_ADDRESS, 'https://www.test.com', deadline, deadline, arbiter, deadline, deadline, 1000, MY_TOKEN_CONTRACT_ADDRESS);
        existingOrder = trade.tradeId;
        existingOrderService = new OrderTradeService(new OrderTradeDriver(signer, await tradeManagerService.getTrade(trade.tradeId), MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
        return {
            order: trade,
            orderTradeService: existingOrderService,
        };
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);

        _defineSender(SUPPLIER_PRIVATE_KEY);

        materialDriver = new MaterialDriver(
            signer,
            MATERIAL_MANAGER_CONTRACT_ADDRESS,
            PRODUCT_CATEGORY_CONTRACT_ADDRESS
        );
        materialService = new MaterialService(materialDriver);
    });

    it('Should register two product categories and four materials (two per product category to simulate mapping)', async () => {
        const productCategoryService: ProductCategoryService = new ProductCategoryService(new ProductCategoryDriver(signer, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
        productCategoryIds.push((await productCategoryService.registerProductCategory('Coffee Arabica', 85, 'very good coffee')).id);
        productCategoryIds.push((await productCategoryService.registerProductCategory('Coffee Nordic', 90, 'even better coffee')).id);

        const materialService: MaterialService = new MaterialService(new MaterialDriver(signer, MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
        materialIds.push((await materialService.registerMaterial(productCategoryIds[0])).id);
        materialIds.push((await materialService.registerMaterial(productCategoryIds[1])).id);
        materialIds.push((await materialService.registerMaterial(productCategoryIds[0])).id);
        materialIds.push((await materialService.registerMaterial(productCategoryIds[1])).id);

        expect(await materialService.getMaterial(materialIds[0])).toEqual(new Material(materialIds[0], await productCategoryService.getProductCategory(productCategoryIds[0])));
        expect(await materialService.getMaterial(materialIds[1])).toEqual(new Material(materialIds[1], new ProductCategory(productCategoryIds[1], 'Coffee Nordic', 90, 'even better coffee')));
    });

    describe('Order scenario', () => {
        it('Should correctly register and retrieve an order with a line', async () => {
            const {
                order,
                orderTradeService,
            } = await _registerOrder();

            const line: OrderLine = await orderTradeService.addLine(new OrderLineRequest(productCategoryIds[0], 20, new OrderLinePrice(10, 'USD')));
            order.lines.push(line);

            const orderData = await orderTradeService.getTrade();
            expect(orderData)
                .toBeDefined();
            expect(orderData.tradeId)
                .toEqual(order.tradeId);
            expect(orderData.supplier)
                .toEqual(SUPPLIER_ADDRESS);
            expect(orderData.customer)
                .toEqual(CUSTOMER_ADDRESS);
            expect(orderData.commissioner)
                .toEqual(OTHER_ADDRESS);
            expect(orderData.externalUrl)
                .toEqual('https://www.test.com');
            expect(orderData.paymentDeadline)
                .toEqual(deadline);
            expect(orderData.documentDeliveryDeadline)
                .toEqual(deadline);
            expect(orderData.arbiter)
                .toEqual(arbiter);
            expect(orderData.shippingDeadline)
                .toEqual(deadline);
            expect(orderData.deliveryDeadline)
                .toEqual(deadline);
            expect(orderData.lines)
                .toEqual([line]);
        }, 30000);

        it('should check that the order status is INITIALIZED (no signatures)', async () => {
            const { orderTradeService } = await _registerOrder();
            expect(await orderTradeService.getNegotiationStatus())
                .toEqual(NegotiationStatus.INITIALIZED);
        });

        it('Should alter an order by setting some constraints and check that the status is PENDING', async () => {
            await existingOrderService.updateDocumentDeliveryDeadline(deadline + 60 * 60 * 24);
            expect(await existingOrderService.getNegotiationStatus())
                .toEqual(NegotiationStatus.PENDING);
        });

        it('Should add a line to an order as a supplier and check that the status is still PENDING', async () => {
            const line: OrderLine = await existingOrderService.addLine(new OrderLineRequest(productCategoryIds[1], 30, new OrderLinePrice(10.25, 'USD')));
            expect(await existingOrderService.getLine(line.id))
                .toEqual(line);

            expect(await existingOrderService.getNegotiationStatus())
                .toEqual(NegotiationStatus.PENDING);
        });

        it('Should add a line to a new order as a commissioner and status again is PENDING', async () => {
            _defineSender(OTHER_PRIVATE_KEY);
            await _updateExistingOrderService();

            const line: OrderLine = await existingOrderService.addLine(new OrderLineRequest(productCategoryIds[0], 50, new OrderLinePrice(50.5, 'USD')));
            expect(await existingOrderService.getLine(line.id))
                .toEqual(line);

            expect(await existingOrderService.getNegotiationStatus())
                .toEqual(NegotiationStatus.PENDING);
        });

        it('Should confirm as supplier the order updated by the customer', async () => {
            _defineSender(SUPPLIER_PRIVATE_KEY);
            await _updateExistingOrderService();

            await existingOrderService.confirmOrder();

            expect(await existingOrderService.getNegotiationStatus())
                .toEqual(NegotiationStatus.COMPLETED);
        });

        it('should try to add a line to an already negotiated order and fail', async () => {
            // updates cannot be possible because the order has been confirmed by both parties
            await expect(existingOrderService.updateShippingDeadline(0))
                .rejects
                .toThrow(/OrderTrade: The order has already been confirmed, therefore it cannot be changed/);
        });

        // NOTE: this test suddenly stopped to work unexpectedly because the chain can't be fetched correctly using block numbers
        // it('should negotiate an order and get its history by navigating with block numbers', async () => {
        //     _defineSender(SUPPLIER_PRIVATE_KEY);
        //     await _updateExistingOrderService();
        //
        //     const { orderTradeService } = await _registerOrder();
        //
        //     await orderTradeService.addLine(new OrderLineRequest([commissionerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50, 'USD')));
        //     const firstEditStatus = await orderTradeService.getTrade();
        //
        //     _defineSender(OTHER_PRIVATE_KEY);
        //     await _updateExistingOrderService();
        //
        //     const firstLineVersion: OrderLine = await orderTradeService.addLine(new OrderLineRequest([commissionerMaterialsCounter, supplierMaterialsCounter], productCategories[1], 10, new OrderLinePrice(20, 'USD')));
        //     const secondEditStatus = await orderTradeService.getTrade();
        //
        //     _defineSender(SUPPLIER_PRIVATE_KEY);
        //     await _updateExistingOrderService();
        //
        //     const secondLineVersion: OrderLine = await orderTradeService.updateLine(new OrderLine(firstLineVersion.id, [supplierMaterialsCounter, commissionerMaterialsCounter], 'Arabic 85 Superior', 40, new OrderLinePrice(20, 'USD')));
        //     const thirdEditStatus = await orderTradeService.getTrade();
        //
        //     const eventsBlockNumbers = await orderTradeService.getEmittedEvents();
        //
        //     expect(await orderTradeService.getTrade(eventsBlockNumbers.get(OrderTradeEvents.OrderLineAdded)![0]))
        //         .toEqual(firstEditStatus);
        //     expect(await orderTradeService.getTrade(eventsBlockNumbers.get(OrderTradeEvents.OrderLineAdded)![1]))
        //         .toEqual(secondEditStatus);
        //     expect(await orderTradeService.getTrade(eventsBlockNumbers.get(OrderTradeEvents.OrderLineUpdated)![0]))
        //         .toEqual(thirdEditStatus);
        //
        //     expect(await orderTradeService.getLine(firstLineVersion.id, eventsBlockNumbers.get(OrderTradeEvents.OrderLineAdded)![1]))
        //         .toEqual(firstLineVersion);
        //     expect(await orderTradeService.getLine(secondLineVersion.id, eventsBlockNumbers.get(OrderTradeEvents.OrderLineUpdated)![0]))
        //         .toEqual(secondLineVersion);
        // });
    });

    describe('Basic trade scenario', () => {
        let basicTradeService: BasicTradeService;

        it('Should correctly register and retrieve a basic trade with a line', async () => {
            _defineSender(SUPPLIER_PRIVATE_KEY);

            const trade: BasicTrade = await tradeManagerService.registerBasicTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, OTHER_ADDRESS, 'https://www.test.com', 'Test trade');
            basicTradeService = new BasicTradeService(new BasicTradeDriver(signer, await tradeManagerService.getTrade(trade.tradeId), MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS));

            const line: Line = await basicTradeService.addLine(new LineRequest(productCategoryIds[0]));
            trade.lines.push(line);
            const savedBasicTrade = await basicTradeService.getTrade();
            expect(savedBasicTrade.lines.length).toEqual(1)
            const savedLine: Line = (await basicTradeService.getLines())[0];

            expect(savedBasicTrade).toEqual(trade);
            expect(savedLine).toEqual(line);
        }, 30000);
    });
});
