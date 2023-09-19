import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
import OrderService from '../services/OrderService';
import { TradeDriver, TradeEvents } from '../drivers/TradeDriver';
import {
    CUSTOMER_INVOKER_ADDRESS,
    CUSTOMER_INVOKER_PRIVATE_KEY, DOCUMENT_MANAGER_CONTRACT_ADDRESS,
    NETWORK,
    ORDER_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_INVOKER_ADDRESS,
    SUPPLIER_INVOKER_PRIVATE_KEY,
} from './config';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { NegotiationStatus } from '../types/NegotiationStatus';
import DocumentService from '../services/DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';

describe('Order lifecycle', () => {
    let orderService: OrderService;
    let orderDriver: TradeDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;

    let documentService: DocumentService;
    let documentDriver: DocumentDriver;

    let orderCounterId = 0;
    let orderLineCounterId = 0;
    let orderStatus: NegotiationStatus;
    const externalUrl = 'externalUrl';
    const deadline = new Date('2030-10-10');
    const arbiter = 'arbiter 1', shipper = 'shipper 1', deliveryPort = 'delivery port', shippingPort = 'shipping port';

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        orderDriver = new TradeDriver(
            signer,
            ORDER_MANAGER_CONTRACT_ADDRESS,
        );
        orderService = new OrderService(orderDriver);
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        _defineSender(SUPPLIER_INVOKER_PRIVATE_KEY);
        documentDriver = new DocumentDriver(
            signer,
            DOCUMENT_MANAGER_CONTRACT_ADDRESS,
        );
        documentService = new DocumentService(documentDriver);
    });

    it('Should correctly register and retrieve a order with a line', async () => {
        const orderLine: OrderLine = new OrderLine(0, 'CategoryA', 20, new OrderLinePrice(10.25, 'USD'));

        await orderService.registerTrade(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, externalUrl);
        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        await orderService.addOrderLines(SUPPLIER_INVOKER_ADDRESS, orderCounterId, [orderLine]);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];

        const savedOrder = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(savedOrder).toBeDefined();
        expect(savedOrder.id).toEqual(orderCounterId);
        expect(savedOrder.supplier).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedOrder.customer).toEqual(CUSTOMER_INVOKER_ADDRESS);
        expect(savedOrder.offeree).toEqual(CUSTOMER_INVOKER_ADDRESS);
        expect(savedOrder.offeror).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedOrder.offereeSigned).toBeFalsy();
        expect(savedOrder.offerorSigned).toBeFalsy();
        expect(savedOrder.lineIds).toEqual([orderLineCounterId]);
        expect(savedOrder.incoterms).toBeUndefined();
        expect(savedOrder.paymentDeadline).toBeUndefined();
        expect(savedOrder.documentDeliveryDeadline).toBeUndefined();
        expect(savedOrder.shipper).toBeUndefined();
        expect(savedOrder.arbiter).toBeUndefined();
        expect(savedOrder.shippingPort).toBeUndefined();
        expect(savedOrder.shippingDeadline).toBeUndefined();
        expect(savedOrder.deliveryPort).toBeUndefined();
        expect(savedOrder.deliveryDeadline).toBeUndefined();
        expect(savedOrder.status).toBeUndefined();

        const savedOrderLine = await orderService.getTradeLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);
        expect(savedOrderLine.id).toEqual(orderLineCounterId);
        expect(savedOrderLine.price).toEqual(orderLine.price);
        expect(savedOrderLine.quantity).toEqual(orderLine.quantity);
        expect(savedOrderLine.productCategory).toEqual(orderLine.productCategory);
    });

    it('Should check if an order exists', async () => {
        const exists = await orderService.orderExists(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(exists).toBeDefined();
        expect(exists).toBeTruthy();
    });

    it('Should throw error while getting an order if supplier is not an address', async () => {
        const fn = async () => orderService.getOrderInfo('address', 1);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('Should check that the order status is INITIALIZED (no signatures)', async () => {
        await orderService.registerTrade(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, externalUrl);
        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        orderStatus = await orderService.getNegotiationStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(NegotiationStatus.INITIALIZED);
    });

    it('Should alter an order by setting some constraints and check that the status is PENDING', async () => {
        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        await orderService.setOrderIncoterms(SUPPLIER_INVOKER_ADDRESS, orderCounterId, 'FOB');
        await orderService.setOrderDocumentDeliveryDeadline(SUPPLIER_INVOKER_ADDRESS, orderCounterId, deadline);
        await orderService.setOrderArbiter(SUPPLIER_INVOKER_ADDRESS, orderCounterId, arbiter);
        await orderService.setOrderDeliveryPort(SUPPLIER_INVOKER_ADDRESS, orderCounterId, deliveryPort);

        orderStatus = await orderService.getNegotiationStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(NegotiationStatus.PENDING);
    });

    it('Should add a line to an order as a supplier and check that the status is still PENDING', async () => {
        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        const line = new OrderLine(0, 'CategoryB', 20, new OrderLinePrice(10.25, 'USD'));

        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, line.productCategory, line.quantity, line.price);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];

        const savedLine = await orderService.getTradeLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);
        line.id = orderLineCounterId;
        expect(savedLine).toEqual(line);

        orderStatus = await orderService.getNegotiationStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(NegotiationStatus.PENDING);
    });

    it('Should add a line to a new order as a customer and status again in PENDING', async () => {
        _defineSender(CUSTOMER_INVOKER_PRIVATE_KEY);

        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        const line = new OrderLine(0, 'CategoryA', 50, new OrderLinePrice(50.5, 'USD'));

        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, line.productCategory, line.quantity, line.price);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];

        const savedLine = await orderService.getTradeLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);
        line.id = orderLineCounterId;
        expect(savedLine).toEqual(line);

        orderStatus = await orderService.getNegotiationStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(NegotiationStatus.PENDING);
    });

    it('Should try to confirm an order as supplier, fails because not all constraints are set', async () => {
        _defineSender(SUPPLIER_INVOKER_PRIVATE_KEY);
        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        const fn = async () => orderService.confirmOrder(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        await expect(fn).rejects.toThrowError(/Cannot confirm an order if all constraints have not been defined/);
    });

    it('Should add a document, fails because the order is not already confirmed', async () => {
        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        const fn = async () => orderService.addDocument(SUPPLIER_INVOKER_ADDRESS, orderCounterId, 'shipped', 'document name', 'Bill of lading', 'external url');
        await expect(fn).rejects.toThrowError(/The order is not already confirmed, cannot add document/);
    });

    it('Should add remaining constraints as customer', async () => {
        _defineSender(CUSTOMER_INVOKER_PRIVATE_KEY);

        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        await orderService.setOrderPaymentDeadline(SUPPLIER_INVOKER_ADDRESS, orderCounterId, deadline);
        await orderService.setOrderShipper(SUPPLIER_INVOKER_ADDRESS, orderCounterId, shipper);
        await orderService.setOrderShippingPort(SUPPLIER_INVOKER_ADDRESS, orderCounterId, shippingPort);
        await orderService.setOrderShippingDeadline(SUPPLIER_INVOKER_ADDRESS, orderCounterId, deadline);
        await orderService.setOrderDeliveryDeadline(SUPPLIER_INVOKER_ADDRESS, orderCounterId, deadline);
    });

    it('Should confirm as supplier the order updated by the customer', async () => {
        _defineSender(SUPPLIER_INVOKER_PRIVATE_KEY);

        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        await orderService.confirmOrder(SUPPLIER_INVOKER_ADDRESS, orderCounterId);

        orderStatus = await orderService.getNegotiationStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(NegotiationStatus.COMPLETED);
    });

    it('Should add a document, fails because the document type is wrong', async () => {
        await documentService.addOrderManager(ORDER_MANAGER_CONTRACT_ADDRESS);
        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        const fn = async () => orderService.addDocument(SUPPLIER_INVOKER_ADDRESS, orderCounterId, 'shipped', 'document name', 'custom doc type', 'external url');
        await expect(fn).rejects.toThrowError(/The document type isn't registered/);
    });

    it('should try to add a line to a negotiated order', async () => {
        const orderLine = new OrderLine(0, 'CategoryA', 50, new OrderLinePrice(50, 'USD'));
        // updates cannot be possible because the order has been confirmed by both parties
        const fn = async () => orderService.updateOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, orderLine.productCategory, orderLine.quantity, orderLine.price);
        await expect(fn).rejects.toThrowError(/The order has been confirmed, it cannot be changed/);
    });

    it('should negotiate an order and get its history by navigating with block numbers', async () => {
        await orderService.registerTrade(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, externalUrl);
        orderCounterId = await orderService.getTradeCounter(SUPPLIER_INVOKER_ADDRESS);
        const orderVersion1 = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, 'CategoryA', 50, new OrderLinePrice(50, 'USD'));
        const orderVersion2 = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);

        _defineSender(CUSTOMER_INVOKER_PRIVATE_KEY);

        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, 'CategoryB', 10, new OrderLinePrice(20, 'USD'));
        const orderVersion3 = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];
        const orderLineVersion1 = await orderService.getTradeLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);

        _defineSender(SUPPLIER_INVOKER_PRIVATE_KEY);

        await orderService.updateOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, 'CategoryA Superior', 40, new OrderLinePrice(20, 'USD'));
        const orderVersion4 = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        const orderLineVersion2 = await orderService.getTradeLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);

        const eventsBlockNumbers = await orderService.getBlockNumbersByOrderId(orderCounterId);
        expect(await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId, eventsBlockNumbers.get(TradeEvents.OrderRegistered)![0])).toEqual(orderVersion1);
        expect(await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![0])).toEqual(orderVersion2);
        expect(await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![1])).toEqual(orderVersion3);
        expect(await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineUpdated)![0])).toEqual(orderVersion4);

        // the order line added has been updated, so there is another version of it and we can access by the specific block number obtained by searching from "OrderLineAdded" and "OrderLineUpdated" event
        expect(await orderService.getTradeLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![1])).toEqual(orderLineVersion1);
        expect(await orderService.getTradeLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineUpdated)![0])).toEqual(orderLineVersion2);
    });
});
