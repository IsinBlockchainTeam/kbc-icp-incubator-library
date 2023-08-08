import { IdentityEthersDriver } from '@blockchain-lib/common';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import OrderService from '../services/OrderService';
import { OrderDriver } from '../drivers/OrderDriver';
import {
    CONTRACT_MANAGER_CONTRACT_ADDRESS,
    CUSTOMER_INVOKER_ADDRESS,
    NETWORK,
    ORDER_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_INVOKER_ADDRESS,
    SUPPLIER_INVOKER_PRIVATE_KEY,
} from './config';
import { Order } from '../entities/Order';
import { Order } from '../entities/Order';
import { OrderDriver } from '../drivers/OrderDriver';
import ContractService from '../services/ContractService';
import { OrderLine } from '../entities/OrderLine';
import { OrderLine } from '../entities/OrderLine';

describe('Order lifecycle', () => {
    let contractService: ContractService;
    let contractDriver: OrderDriver;
    let orderService: OrderService;
    let orderDriver: OrderDriver;
    let identityDriver: IdentityEthersDriver;
    let provider: JsonRpcProvider;

    let contractCounterId = 0;
    let contractLineCounterId = 0;
    let orderCounterId = 0;
    let orderLineCounterId = 0;

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);

        identityDriver = new IdentityEthersDriver(SUPPLIER_INVOKER_PRIVATE_KEY, provider);
        contractDriver = new OrderDriver(
            identityDriver,
            provider,
            CONTRACT_MANAGER_CONTRACT_ADDRESS,
        );
        contractService = new ContractService(contractDriver);

        identityDriver = new IdentityEthersDriver(SUPPLIER_INVOKER_PRIVATE_KEY, provider);
        orderDriver = new OrderDriver(
            identityDriver,
            provider,
            ORDER_MANAGER_CONTRACT_ADDRESS,
        );
        orderService = new OrderService(orderDriver);

        const contractLine: OrderLine = new OrderLine('CategoryA', 20, {
            amount: 5.2,
            fiat: 'USD',
        });
        const contract: Order = new Order(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, 'externalUrl', CUSTOMER_INVOKER_ADDRESS);
        contract.lines = [contractLine];
        await contractService.registerContract(contract);
        contractCounterId = await contractService.getContractCounter(SUPPLIER_INVOKER_ADDRESS);
        const { lineIds } = await contractService.getContractInfo(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        contractLineCounterId = lineIds.splice(-1)[0];
    });

    it('Should correctly register and retrieve a order with a line', async () => {
        const orderLine: OrderLine = new OrderLine(contractLineCounterId, 50);
        const order: Order = new Order(SUPPLIER_INVOKER_ADDRESS, contractCounterId, 'externalUrl', [1], [orderLine]);

        await orderService.registerOrder(order);
        orderCounterId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        const { lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        orderLineCounterId = lineIds.splice(-1)[0];

        const savedOrder = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(savedOrder).toBeDefined();
        expect(savedOrder.id).toEqual(orderCounterId);
        expect(savedOrder.supplier).toEqual(order.supplier);
        expect(savedOrder.contractId).toEqual(order.contractId);
        expect(savedOrder.externalUrl).toEqual(order.externalUrl);

        const savedOrderLine = await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);
        expect(savedOrderLine.id).toEqual(orderLineCounterId);
        expect(savedOrderLine.contractLineId).toEqual(order.lines[0].contractLineId);
        expect(savedOrderLine.quantity).toEqual(order.lines[0].quantity);
    });

    it('Should check if an order exists', async () => {
        const exists = await orderService.orderExists(SUPPLIER_INVOKER_ADDRESS, orderCounterId);
        expect(exists).toBeDefined();
        expect(exists).toBeTruthy();
    });

    it('Should throw error while getting a order if supplier is not an address', async () => {
        const fn = async () => orderService.getOrderInfo('address', 1);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('Should add a line to an order', async () => {
        const otherContractLine: OrderLine = new OrderLine('CategoryB', 30, {
            amount: 20,
            fiat: 'USD',
        });
        await contractService.addContractLine(SUPPLIER_INVOKER_ADDRESS, contractCounterId, otherContractLine);
        let { lineIds } = await contractService.getContractInfo(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        contractLineCounterId = lineIds.splice(-1)[0];

        orderCounterId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        const orderLine: OrderLine = new OrderLine(contractLineCounterId, 70);

        await orderService.addOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLine);
        ({ lineIds } = await orderService.getOrderInfo(SUPPLIER_INVOKER_ADDRESS, orderCounterId));
        orderLineCounterId = lineIds.splice(-1)[0];

        const savedLine = await orderService.getOrderLine(SUPPLIER_INVOKER_ADDRESS, orderCounterId, orderLineCounterId);
        orderLine.id = orderLineCounterId;
        expect(savedLine).toEqual(orderLine);
    });
});
