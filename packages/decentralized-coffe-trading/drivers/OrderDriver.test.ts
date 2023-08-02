/* eslint-disable camelcase */
import { JsonRpcProvider } from '@ethersproject/providers';
import { createMock } from 'ts-auto-mock';
import { IdentityEthersDriver } from '@blockchain-lib/common';
import { BigNumber, ethers } from 'ethers';
import { OrderManager, OrderManager__factory } from '../smart-contracts';
import { OrderDriver } from './OrderDriver';
import { Order } from '../entities/Order';
import { OrderLine } from '../entities/OrderLine';

describe('OrderDriver', () => {
    let orderDriver: OrderDriver;
    let order: Order;

    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';

    let mockedIdentityDriver: IdentityEthersDriver;
    let mockedProvider: JsonRpcProvider;

    const mockedOrderConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();
    const mockedRegisterOrder = jest.fn();
    const mockedGetOrderInfo = jest.fn();
    const mockedGetOrderCounter = jest.fn();
    const mockedGetOrderLineCounter = jest.fn();
    const mockedOrderExists = jest.fn();
    const mockedGetOrderLine = jest.fn();
    const mockedAddOrderLine = jest.fn();
    const mockedAddAdmin = jest.fn();
    const mockedRemoveAdmin = jest.fn();
    const mockedDecodeEventLog = jest.fn();

    const supplier = ethers.Wallet.createRandom();

    beforeAll(() => {
        mockedRegisterOrder.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'OrderRegistered' }] }),
        }));
        mockedGetOrderCounter.mockReturnValue(Promise.resolve({
            toNumber: mockedToNumber,
        }));
        mockedGetOrderLineCounter.mockReturnValue(Promise.resolve({
            toNumber: mockedToNumber,
        }));
        mockedAddOrderLine.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedGetOrderLine.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedOrderExists.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedAddAdmin.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedRemoveAdmin.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedOrderConnect.mockReturnValue({
            registerOrder: mockedRegisterOrder,
            getOrderInfo: mockedGetOrderInfo,
            getOrderCounter: mockedGetOrderCounter,
            orderExists: mockedOrderExists,
            getOrderLine: mockedGetOrderLine,
            getOrderLineCounter: mockedGetOrderLineCounter,
            addOrderLine: mockedAddOrderLine,
            addAdmin: mockedAddAdmin,
            removeAdmin: mockedRemoveAdmin,
            interface: { decodeEventLog: mockedDecodeEventLog },
        });
        const mockedOrderManager = createMock<OrderManager>({
            connect: mockedOrderConnect,
        });
        jest.spyOn(OrderManager__factory, 'connect').mockReturnValue(mockedOrderManager);

        mockedIdentityDriver = createMock<IdentityEthersDriver>();
        mockedProvider = createMock<JsonRpcProvider>({
            _isProvider: true,
        });
        orderDriver = new OrderDriver(
            mockedIdentityDriver,
            mockedProvider,
            testAddress,
        );

        order = new Order(1, supplier.address, 1, 'externalUrl');
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should call and wait for register order', async () => {
        await orderDriver.registerOrder(order);

        expect(mockedRegisterOrder).toHaveBeenCalledTimes(1);
        expect(mockedRegisterOrder).toHaveBeenNthCalledWith(
            1,
            order.supplier,
            order.contractId,
            order.externalUrl,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for register order with order lines', async () => {
        const orderLine: OrderLine = new OrderLine(1, 50);
        const order2 = new Order(1, supplier.address, 1, 'https://testurl.ch', [1], [orderLine]);

        mockedRegisterOrder.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'OrderRegistered', data: order2 }] }),
        }));
        mockedDecodeEventLog.mockImplementation((eventName: string, data: Order, topics: string[]) => ({ id: BigNumber.from(data.id) }));

        await orderDriver.registerOrder(order2);
        const rawOrderLine: OrderManager.OrderLineStruct = {
            id: 0,
            contractLineId: orderLine.contractLineId,
            quantity: orderLine.quantity,
            exists: true,
        };
        expect(mockedRegisterOrder).toHaveBeenCalledTimes(1);
        expect(mockedRegisterOrder).toHaveBeenNthCalledWith(
            1,
            order2.supplier,
            order2.contractId,
            order2.externalUrl,
        );
        expect(mockedAddOrderLine).toHaveBeenCalledTimes(1);
        expect(mockedAddOrderLine).toHaveBeenNthCalledWith(
            1,
            order2.supplier,
            order2.id,
            rawOrderLine,
        );
        expect(mockedWait).toHaveBeenCalledTimes(2);
    });

    it('should call and wait for register order - transaction fails', async () => {
        mockedRegisterOrder.mockRejectedValue(new Error(errorMessage));

        const fn = async () => orderDriver.registerOrder(order);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should call and wait for register order - fails for address', async () => {
        const order3 = new Order(1, '0xaddress', 1, 'https://testurl.ch');

        const fn = async () => orderDriver.registerOrder(order3);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('should check if order exists', async () => {
        await orderDriver.orderExists(order.supplier, 1);
        expect(mockedOrderExists).toHaveBeenCalledTimes(1);
        expect(mockedOrderExists).toHaveBeenNthCalledWith(1, order.supplier, 1);
    });

    it('should get the order counter ids', async () => {
        await orderDriver.getOrderCounter(order.supplier);
        expect(mockedGetOrderCounter).toHaveBeenCalledTimes(1);
        expect(mockedGetOrderCounter).toHaveBeenNthCalledWith(1, order.supplier);
    });

    it('should retrieve order', async () => {
        mockedGetOrderInfo.mockResolvedValue({
            id: { toNumber: () => order.id },
            supplier: order.supplier,
            contractId: { toNumber: () => order.contractId },
            externalUrl: order.externalUrl,
            lineIds: order.lineIds,
        });

        const resp = await orderDriver.getOrderInfo(order.supplier, 1);

        expect(resp).toEqual(order);

        expect(mockedGetOrderInfo).toHaveBeenCalledTimes(1);
        expect(mockedGetOrderInfo).toHaveBeenNthCalledWith(
            1,
            order.supplier,
            1,
        );
    });

    it('should retrieve order - transaction fails', async () => {
        mockedGetOrderInfo.mockRejectedValue(new Error(errorMessage));

        const fn = async () => orderDriver.getOrderInfo(order.supplier, 1);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should retrieve order - not an address', async () => {
        const fn = async () => orderDriver.getOrderInfo('test', 1);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('should retrieve order line', async () => {
        const orderLine = new OrderLine(3, 1, 100);
        mockedGetOrderLine.mockResolvedValue({
            id: { toNumber: () => orderLine.id },
            contractLineId: { toNumber: () => orderLine.contractLineId },
            quantity: { toNumber: () => orderLine.quantity },
            exists: true,
        });

        const resp = await orderDriver.getOrderLine(order.supplier, 1, orderLine.id as number);
        expect(resp).toEqual(orderLine);

        expect(mockedGetOrderLine).toHaveBeenCalledTimes(1);
        expect(mockedGetOrderLine).toHaveBeenNthCalledWith(
            1,
            order.supplier,
            1,
            orderLine.id as number,
        );
    });

    it('should retrieve order line - transaction fails', async () => {
        mockedGetOrderLine.mockRejectedValue(new Error(errorMessage));

        const fn = async () => orderDriver.getOrderLine(order.supplier, 1, 2);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should retrieve order line - not an address', async () => {
        const fn = async () => orderDriver.getOrderLine('test', 1, 2);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('should call and wait for add order line', async () => {
        const orderLine = new OrderLine(4, 2, 50);
        await orderDriver.addOrderLine(supplier.address, order.id as number, orderLine);
        const rawOrderLine: OrderManager.OrderLineStruct = {
            id: 0,
            contractLineId: orderLine.contractLineId,
            quantity: orderLine.quantity,
            exists: true,
        };
        expect(mockedAddOrderLine).toHaveBeenCalledTimes(1);
        expect(mockedAddOrderLine).toHaveBeenNthCalledWith(
            1,
            order.supplier,
            order.id,
            rawOrderLine,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for add order line - fails', async () => {
        const orderLine = new OrderLine(3, 4, 80);
        mockedAddOrderLine.mockRejectedValue(new Error(errorMessage));

        const fn = async () => orderDriver.addOrderLine(supplier.address, order.id as number, orderLine);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should call and wait for add admin', async () => {
        const { address } = ethers.Wallet.createRandom();
        await orderDriver.addAdmin(address);

        expect(mockedAddAdmin).toHaveBeenCalledTimes(1);
        expect(mockedAddAdmin).toHaveBeenNthCalledWith(
            1,
            address,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for add admin - transaction fails', async () => {
        const { address } = ethers.Wallet.createRandom();
        mockedAddAdmin.mockRejectedValue(new Error(errorMessage));

        const fn = async () => orderDriver.addAdmin(address);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should call and wait for add admin - fails for address', async () => {
        const address = '123';

        const fn = async () => orderDriver.addAdmin(address);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('should call and wait for remove admin', async () => {
        const { address } = ethers.Wallet.createRandom();
        await orderDriver.removeAdmin(address);

        expect(mockedRemoveAdmin).toHaveBeenCalledTimes(1);
        expect(mockedRemoveAdmin).toHaveBeenNthCalledWith(
            1,
            address,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for remove admin - transaction fails', async () => {
        const { address } = ethers.Wallet.createRandom();
        mockedRemoveAdmin.mockRejectedValue(new Error(errorMessage));

        const fn = async () => orderDriver.removeAdmin(address);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should call and wait for remove admin - fails for address', async () => {
        const address = '123';

        const fn = async () => orderDriver.removeAdmin(address);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });
});
