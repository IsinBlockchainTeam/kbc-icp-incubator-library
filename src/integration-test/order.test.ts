import { IdentityEthersDriver } from '@blockchain-lib/common';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import OrderService from '../services/OrderService';
import { OrderDriver, OrderEvents } from '../drivers/OrderDriver';
import {
    CUSTOMER_INVOKER_ADDRESS,
    CUSTOMER_INVOKER_PRIVATE_KEY,
    NETWORK,
    ORDER_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_INVOKER_ADDRESS,
    SUPPLIER_INVOKER_PRIVATE_KEY,
} from './config';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { OrderStatus } from '../types/OrderStatus';

describe('Order lifecycle', () => {
    let orderService: OrderService;
    let orderDriver: OrderDriver;
    let identityDriver: IdentityEthersDriver;
    let provider: JsonRpcProvider;
    let orderCounterId = 0;
    let orderLineCounterId = 0;
    let orderStatus: OrderStatus;
    const externalUrl = 'externalUrl';

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        identityDriver = new IdentityEthersDriver(SUPPLIER_INVOKER_PRIVATE_KEY, provider);
        orderDriver = new OrderDriver(
            identityDriver,
            provider,
            ORDER_MANAGER_CONTRACT_ADDRESS,
        );
        orderService = new OrderService(orderDriver);
    });

    it('Should correctly register and retrieve a order with a line', async () => {
        const orderLine: OrderLine = new OrderLine(0, 'CategoryA', 20, new OrderLinePrice(10.25, 'USD'));

        await orderService.registerOrder(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, externalUrl, [orderLine]);
        orderCounterId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];

        const savedOrder = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(savedOrder).toBeDefined();
        expect(savedOrder.id).toEqual(orderCounterId);
        expect(savedOrder.supplier).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedOrder.customer).toEqual(CUSTOMER_INVOKER_ADDRESS);
        expect(savedOrder.externalUrl).toEqual(externalUrl);
        expect(savedOrder.offeree).toEqual(CUSTOMER_INVOKER_ADDRESS);
        expect(savedOrder.offeror).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedOrder.offereeSigned).toBeFalsy();
        expect(savedOrder.offerorSigned).toBeFalsy();

        const savedOrderLine = await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);
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
        await orderService.registerOrder(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, externalUrl);
        orderCounterId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        orderStatus = await orderService.getOrderStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(OrderStatus.INITIALIZED);
    });

    it('Should add a line to a order as a supplier', async () => {
        orderCounterId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        const line = new OrderLine(0, 'CategoryB', 20, new OrderLinePrice(10.25, 'USD'));

        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, line.productCategory, line.quantity, line.price);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];

        const savedLine = await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);
        line.id = orderLineCounterId;
        expect(savedLine).toEqual(line);

        orderStatus = await orderService.getOrderStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(OrderStatus.PENDING);
    });

    it('Should add a line to a new order as a customer', async () => {
        identityDriver = new IdentityEthersDriver(CUSTOMER_INVOKER_PRIVATE_KEY, provider);
        orderDriver = new OrderDriver(identityDriver, provider, ORDER_MANAGER_CONTRACT_ADDRESS);
        orderService = new OrderService(orderDriver);

        orderCounterId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        const line = new OrderLine(0, 'CategoryA', 50, new OrderLinePrice(50.5, 'USD'));

        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, line.productCategory, line.quantity, line.price);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];

        const savedLine = await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);
        line.id = orderLineCounterId;
        expect(savedLine).toEqual(line);

        orderStatus = await orderService.getOrderStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(OrderStatus.PENDING);
    });

    it('should confirm as supplier the order updated by the customer', async () => {
        identityDriver = new IdentityEthersDriver(SUPPLIER_INVOKER_PRIVATE_KEY, provider);
        orderDriver = new OrderDriver(identityDriver, provider, ORDER_MANAGER_CONTRACT_ADDRESS);
        orderService = new OrderService(orderDriver);

        orderCounterId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        await orderService.confirmOrder(SUPPLIER_INVOKER_ADDRESS, orderCounterId);

        orderStatus = await orderService.getOrderStatus(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(orderStatus).toEqual(OrderStatus.COMPLETED);
    });

    it('should try to add a line to a negotiated order', async () => {
        const orderLine = new OrderLine(0, 'CategoryA', 50, new OrderLinePrice(50, 'USD'));
        // updates cannot be possible because the order has been confirmed by both parties
        const fn = async () => orderService.updateOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, orderLine.productCategory, orderLine.quantity, orderLine.price);
        await expect(fn).rejects.toThrowError(/The order has been confirmed, it cannot be changed/);
    });

    it('should negotiate an order and get its history by navigating with block numbers', async () => {
        await orderService.registerOrder(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, externalUrl);
        orderCounterId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        const orderVersion1 = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, 'CategoryA', 50, new OrderLinePrice(50, 'USD'));
        const orderVersion2 = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);

        identityDriver = new IdentityEthersDriver(CUSTOMER_INVOKER_PRIVATE_KEY, provider);
        orderDriver = new OrderDriver(identityDriver, provider, ORDER_MANAGER_CONTRACT_ADDRESS);
        orderService = new OrderService(orderDriver);

        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, 'CategoryB', 10, new OrderLinePrice(20, 'USD'));
        const orderVersion3 = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];
        const orderLineVersion1 = await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);

        identityDriver = new IdentityEthersDriver(SUPPLIER_INVOKER_PRIVATE_KEY, provider);
        orderDriver = new OrderDriver(identityDriver, provider, ORDER_MANAGER_CONTRACT_ADDRESS);
        orderService = new OrderService(orderDriver);

        await orderService.updateOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, 'CategoryUpdated', 40, new OrderLinePrice(20, 'USD'));
        const orderVersion4 = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        const orderLineVersion2 = await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);

        const eventsBlockNumbers = await orderService.getBlockNumbersByOrderId(orderCounterId);
        expect(await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId, eventsBlockNumbers.get(OrderEvents.OrderRegistered)![0])).toEqual(orderVersion1);
        expect(await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId, eventsBlockNumbers.get(OrderEvents.OrderLineAdded)![0])).toEqual(orderVersion2);
        expect(await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId, eventsBlockNumbers.get(OrderEvents.OrderLineAdded)![1])).toEqual(orderVersion3);
        expect(await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId, eventsBlockNumbers.get(OrderEvents.OrderLineUpdated)![0])).toEqual(orderVersion4);

        // the order line added has been updated, so there is another version of it and we can access by the specific block number obtained by searching from "OrderLineAdded" and "OrderLineUpdated" event
        expect(await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, eventsBlockNumbers.get(OrderEvents.OrderLineAdded)![1])).toEqual(orderLineVersion1);
        expect(await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, eventsBlockNumbers.get(OrderEvents.OrderLineUpdated)![0])).toEqual(orderLineVersion2);
    });
});
