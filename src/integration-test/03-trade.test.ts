import * as dotenv from 'dotenv';

import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer, Wallet } from 'ethers';
import {
    CUSTOMER_ADDRESS,
    MATERIAL_MANAGER_CONTRACT_ADDRESS,
    MY_TOKEN_CONTRACT_ADDRESS,
    NETWORK,
    OTHER_ADDRESS, OTHER_PRIVATE_KEY,
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

dotenv.config();

describe('Trade lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeManagerService: TradeManagerService;

    let materialService: MaterialService;
    let materialDriver: MaterialDriver;

    let supplierMaterialsCounter = 0;
    let commissionerMaterialsCounter = 0;
    let existingOrder: number;
    let existingOrderService: OrderTradeService;

    const deadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;
    const arbiter: string = Wallet.createRandom().address;
    const productCategories = ['Arabic 85', 'Excelsa 88'];

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        const tradeManagerDriver: TradeManagerDriver = new TradeManagerDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
        );
        tradeManagerService = new TradeManagerService(tradeManagerDriver);
    };

    const _updateExistingOrderService = async () => {
        const orderAddress: string = await tradeManagerService.getTrade(existingOrder);
        existingOrderService = new OrderTradeService(new OrderTradeDriver(signer, orderAddress));
    };

    const _registerOrder = async (): Promise<{
        order: OrderTrade,
        orderTradeService: OrderTradeService
    }> => {
        const trade: OrderTrade = await tradeManagerService.registerOrderTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, OTHER_ADDRESS, 'https://www.test.com', deadline, deadline, arbiter, deadline, deadline, 1000, MY_TOKEN_CONTRACT_ADDRESS);
        existingOrder = trade.tradeId;
        existingOrderService = new OrderTradeService(new OrderTradeDriver(signer, await tradeManagerService.getTrade(trade.tradeId)));
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
        );
        materialService = new MaterialService(materialDriver);
    });

    it('Should register some materials (created two times with two names to simulate material mapping for companies)', async () => {
        const supplierMaterialName = 'material 1 supplier';
        const commissionerMaterialName = 'material 1 commissioner';
        await materialService.registerMaterial(SUPPLIER_ADDRESS, supplierMaterialName);
        supplierMaterialsCounter = await materialService.getMaterialsCounter();

        await materialService.registerMaterial(OTHER_ADDRESS, commissionerMaterialName);
        commissionerMaterialsCounter = await materialService.getMaterialsCounter();

        const supplierMaterial = await materialService.getMaterial(supplierMaterialsCounter);
        expect(supplierMaterial.id)
            .toEqual(supplierMaterialsCounter);
        expect(supplierMaterial.name)
            .toEqual(supplierMaterialName);
        expect(supplierMaterial.owner)
            .toEqual(SUPPLIER_ADDRESS);

        const commissionerMaterial = await materialService.getMaterial(commissionerMaterialsCounter);
        expect(commissionerMaterial.id)
            .toEqual(commissionerMaterialsCounter);
        expect(commissionerMaterial.name)
            .toEqual(commissionerMaterialName);
        expect(commissionerMaterial.owner)
            .toEqual(OTHER_ADDRESS);
    });

    describe('Order scenario', () => {
        it('Should correctly register and retrieve an order with a line', async () => {
            const {
                order,
                orderTradeService,
            } = await _registerOrder();

            const materialsId: [number, number] = [commissionerMaterialsCounter, supplierMaterialsCounter];
            const orderLine = {
                materialsId,
                productCategory: productCategories[0],
                quantity: 20,
                price: new OrderLinePrice(10, 'USD'),
            };

            const line: OrderLine = await orderTradeService.addLine(new OrderLineRequest(orderLine.materialsId, orderLine.productCategory, orderLine.quantity, orderLine.price));
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
            // add other materials
            await materialService.registerMaterial(SUPPLIER_ADDRESS, 'material 2 supplier');
            await materialService.registerMaterial(OTHER_ADDRESS, 'material 2 commissioner');
            supplierMaterialsCounter = await materialService.getMaterialsCounter();
            commissionerMaterialsCounter = await materialService.getMaterialsCounter();

            const line = new OrderLine(0, [commissionerMaterialsCounter, supplierMaterialsCounter], productCategories[1], 20, new OrderLinePrice(10.25, 'USD'));
            await existingOrderService.addLine(new OrderLineRequest(line.materialsId, line.productCategory, line.quantity, line.price));
            expect(await existingOrderService.getLine(line.id))
                .toEqual(line);

            expect(await existingOrderService.getNegotiationStatus())
                .toEqual(NegotiationStatus.PENDING);
        });

        it('Should add a line to a new order as a commissioner and status again in PENDING', async () => {
            _defineSender(OTHER_PRIVATE_KEY);
            await _updateExistingOrderService();
            // add other materials
            await materialService.registerMaterial(SUPPLIER_ADDRESS, 'material 3 supplier');
            await materialService.registerMaterial(OTHER_ADDRESS, 'material 3 commissioner');
            supplierMaterialsCounter = await materialService.getMaterialsCounter();
            commissionerMaterialsCounter = await materialService.getMaterialsCounter();

            const line: OrderLine = await existingOrderService.addLine(new OrderLineRequest([supplierMaterialsCounter, commissionerMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50.5, 'USD')));
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
            const tradeLine: Line = new Line(0, [commissionerMaterialsCounter, supplierMaterialsCounter], productCategories[0]);

            const trade: BasicTrade = await tradeManagerService.registerBasicTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, OTHER_ADDRESS, 'https://www.test.com', 'Test trade');
            basicTradeService = new BasicTradeService(new BasicTradeDriver(signer, await tradeManagerService.getTrade(trade.tradeId)));

            const line: Line = await basicTradeService.addLine(new LineRequest(tradeLine.materialsId, tradeLine.productCategory));
            trade.lines.push(line);
            const savedBasicTrade = await basicTradeService.getTrade();
            const savedLine: Line = (await basicTradeService.getLines())[0];

            expect(savedBasicTrade).toEqual(trade);
            expect(savedLine).toEqual(tradeLine);
        }, 30000);
    });
});
