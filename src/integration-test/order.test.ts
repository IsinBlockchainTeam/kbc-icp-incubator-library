import { IdentityEthersDriver } from '@blockchain-lib/common';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import OrderService from '../services/OrderService';
import { OrderDriver } from '../drivers/OrderDriver';
import {
    CUSTOMER_INVOKER_ADDRESS,
    CUSTOMER_INVOKER_PRIVATE_KEY,
    NETWORK, ORDER_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_INVOKER_ADDRESS,
    SUPPLIER_INVOKER_PRIVATE_KEY,
} from './config';
import { Order } from '../entities/Order';
import { OrderLine } from '../entities/OrderLine';
import { OrderStatus } from '../types/OrderStatus';

describe('Order lifecycle', () => {
    let orderService: OrderService;
    let orderDriver: OrderDriver;
    let identityDriver: IdentityEthersDriver;
    let provider: JsonRpcProvider;
    let orderCounterId = 0;
    let orderLineCounterId = 0;
    let orderStatus: OrderStatus;
    let externalUrl = 'externalUrl';

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
        const orderLine: OrderLine = new OrderLine('CategoryA', 20, {
            amount: 5.2,
            fiat: 'USD',
        });

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

    it('Should check if a order exists', async () => {
        const exists = await orderService.orderExists(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(exists).toBeDefined();
        expect(exists).toBeTruthy();
    });

    it('Should throw error while getting a order if supplier is not an address', async () => {
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
        const line = new OrderLine('CategoryB', 20, {
            amount: 5.2,
            fiat: 'USD',
        });

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
        const line = new OrderLine('CategoryA', 50, {
            amount: 50.5,
            fiat: 'USD',
        });

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
        const orderLine = new OrderLine('CategoryA', 50, {
            amount: 50.5,
            fiat: 'USD',
        });
        // updates cannot be possible because the order has been confirmed by both parties
        const fn = async () => orderService.updateOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId, orderLine.productCategory, orderLine.quantity, orderLine.price);
        await expect(fn).rejects.toThrowError(/The order has been confirmed, it cannot be changed/);
    });
});
