/* eslint-disable camelcase */
import { JsonRpcProvider } from '@ethersproject/providers';
import { createMock } from 'ts-auto-mock';
import { IdentityEthersDriver } from '@blockchain-lib/common';
import { BigNumber, ethers } from 'ethers';
import { OrderManager, OrderManager__factory } from '../smart-contracts';
import { OrderDriver } from './OrderDriver';
import { Order } from '../entities/Order';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { EntityBuilder } from '../utils/EntityBuilder';
import {
    OrderLineAddedEventFilter,
    OrderLineUpdatedEventFilter,
    OrderRegisteredEventFilter,
} from '../smart-contracts/contracts/OrderManager';
import orderService from '../services/OrderService';

describe('OrderDriver', () => {
    let orderDriver: OrderDriver;

    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';

    let mockedIdentityDriver: IdentityEthersDriver;
    let mockedProvider: JsonRpcProvider;

    const mockedOrderConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();
    const mockedRegisterOrder = jest.fn();
    const mockedGetOrderInfo = jest.fn();
    const mockedIsSupplierOrCustomer = jest.fn();
    const mockedGetOrderStatus = jest.fn();
    const mockedGetOrderCounter = jest.fn();
    const mockedGetOrderLineCounter = jest.fn();
    const mockedOrderExists = jest.fn();
    const mockedConfirmOrder = jest.fn();
    const mockedGetOrderLine = jest.fn();
    const mockedAddOrderLine = jest.fn();
    const mockedUpdateOrderLine = jest.fn();
    const mockedAddAdmin = jest.fn();
    const mockedRemoveAdmin = jest.fn();
    const mockedDecodeEventLog = jest.fn();

    const mockedQueryFilter = jest.fn();
    const mockedOrderRegisteredEventFilter = jest.fn();
    const mockedOrderLineAddedEventFilter = jest.fn();
    const mockedOrderLineUpdatedEventFilter = jest.fn();

    const supplier = ethers.Wallet.createRandom();
    const customer = ethers.Wallet.createRandom();
    const externalUrl = 'https://testurl.ch';

    const mockedOrder = createMock<Order>();
    const mockedOrderLine = createMock<OrderLine>();
    const mockedOrderLinePrice = createMock<OrderLinePrice>();

    beforeAll(() => {
        mockedRegisterOrder.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'OrderRegistered' }] }),
        }));
        mockedGetOrderCounter.mockReturnValue(Promise.resolve({
            toNumber: mockedToNumber,
        }));
        mockedGetOrderStatus.mockReturnValue(Promise.resolve({
            wait: mockedWait,
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
        mockedUpdateOrderLine.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedOrderExists.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedConfirmOrder.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedAddAdmin.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedRemoveAdmin.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedQueryFilter.mockResolvedValue([{ event: 'eventName' }]);

        mockedOrderConnect.mockReturnValue({
            registerOrder: mockedRegisterOrder,
            getOrderInfo: mockedGetOrderInfo,
            isSupplierOrCustomer: mockedIsSupplierOrCustomer,
            getOrderCounter: mockedGetOrderCounter,
            orderExists: mockedOrderExists,
            confirmOrder: mockedConfirmOrder,
            getOrderStatus: mockedGetOrderStatus,
            getOrderLine: mockedGetOrderLine,
            getOrderLineCounter: mockedGetOrderLineCounter,
            addOrderLine: mockedAddOrderLine,
            updateOrderLine: mockedUpdateOrderLine,
            addAdmin: mockedAddAdmin,
            removeAdmin: mockedRemoveAdmin,
            interface: { decodeEventLog: mockedDecodeEventLog },
            queryFilter: mockedQueryFilter,
            filters: {
                OrderRegistered: mockedOrderRegisteredEventFilter,
                OrderLineAdded: mockedOrderLineAddedEventFilter,
                OrderLineUpdated: mockedOrderLineUpdatedEventFilter,
            },
        });
        const mockedOrderManager = createMock<OrderManager>({
            connect: mockedOrderConnect,
        });
        jest.spyOn(OrderManager__factory, 'connect').mockReturnValue(mockedOrderManager);

        const buildOrderSpy = jest.spyOn(EntityBuilder, 'buildOrder');
        buildOrderSpy.mockReturnValue(mockedOrder);
        const buildOrderLineSpy = jest.spyOn(EntityBuilder, 'buildOrderLine');
        buildOrderLineSpy.mockReturnValue(mockedOrderLine);
        const buildOrderLinePriceSpy = jest.spyOn(EntityBuilder, 'buildOrderLinePrice');
        buildOrderLinePriceSpy.mockReturnValue(mockedOrderLinePrice);

        mockedIdentityDriver = createMock<IdentityEthersDriver>();
        mockedProvider = createMock<JsonRpcProvider>({
            _isProvider: true,
        });
        orderDriver = new OrderDriver(
            mockedIdentityDriver,
            mockedProvider,
            testAddress,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('registerOrder', () => {
        it('should call and wait for register order', async () => {
            await orderDriver.registerOrder(supplier.address, customer.address, customer.address, externalUrl);

            expect(mockedRegisterOrder).toHaveBeenCalledTimes(1);
            expect(mockedRegisterOrder).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                customer.address,
                customer.address,
                externalUrl,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for register order with order lines', async () => {
            const price = {
                amount: 10025,
                decimals: 2,
                fiat: 'CHF',
            };
            const orderLine = new OrderLine(4, 'categoryA', 100, new OrderLinePrice(100.25, price.fiat));

            mockedRegisterOrder.mockReturnValue(Promise.resolve({
                wait: mockedWait.mockReturnValue({ events: [{ event: 'OrderRegistered', data: { id: 1 } }] }),
            }));
            mockedDecodeEventLog.mockImplementation((eventName: string, data: Order, topics: string[]) => ({ id: BigNumber.from(data.id) }));

            await orderDriver.registerOrder(supplier.address, customer.address, customer.address, externalUrl, [orderLine]);
            expect(mockedRegisterOrder).toHaveBeenCalledTimes(1);
            expect(mockedRegisterOrder).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                customer.address,
                customer.address,
                externalUrl,
            );
            expect(mockedAddOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedAddOrderLine).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                orderLine.productCategory,
                orderLine.quantity,
                price,
            );
            expect(mockedWait).toHaveBeenCalledTimes(2);
        });

        it('should call and wait for register order - transaction fails', async () => {
            mockedRegisterOrder.mockRejectedValue(new Error(errorMessage));

            const fn = async () => orderDriver.registerOrder(supplier.address, customer.address, customer.address, externalUrl);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for register order - fails for supplier address', async () => {
            const fn = async () => orderDriver.registerOrder('0xaddress', customer.address, customer.address, externalUrl);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });

        it('should call and wait for register order - fails for customer address', async () => {
            const fn = async () => orderDriver.registerOrder(supplier.address, '0xaddress', customer.address, externalUrl);
            await expect(fn).rejects.toThrowError(new Error('Customer not an address'));
        });

        it('should call and wait for register order - fails for offeree address', async () => {
            const fn = async () => orderDriver.registerOrder(supplier.address, customer.address, '0xaddress', externalUrl);
            await expect(fn).rejects.toThrowError(new Error('Offeree not an address'));
        });
    });

    describe('orderExists', () => {
        it('should check if order exists', async () => {
            await orderDriver.orderExists(supplier.address, 1);
            expect(mockedOrderExists).toHaveBeenCalledTimes(1);
            expect(mockedOrderExists).toHaveBeenNthCalledWith(1, supplier.address, 1);
        });

        it('should check if order exists', async () => {
            const fn = async () => orderDriver.orderExists('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getOrderCounter', () => {
        it('should get the order counter ids', async () => {
            await orderDriver.getOrderCounter(supplier.address);
            expect(mockedGetOrderCounter).toHaveBeenCalledTimes(1);
            expect(mockedGetOrderCounter).toHaveBeenNthCalledWith(1, supplier.address);
        });

        it('should get the order counter ids - fails for address', async () => {
            const fn = async () => orderDriver.getOrderCounter('0xaddress');
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('confirmOrder', () => {
        it('should confirm the order', async () => {
            await orderDriver.confirmOrder(supplier.address, 1);
            expect(mockedConfirmOrder).toHaveBeenCalledTimes(1);
            expect(mockedConfirmOrder).toHaveBeenNthCalledWith(1, supplier.address, 1);
        });

        it('should confirm the order - fails for address', async () => {
            const fn = async () => orderDriver.confirmOrder('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getOrderInfo', () => {
        it('should retrieve order', async () => {
            mockedGetOrderInfo.mockResolvedValue(mockedOrder);

            const resp = await orderDriver.getOrderInfo(supplier.address, 1);

            expect(resp).toEqual(mockedOrder);

            expect(mockedGetOrderInfo).toHaveBeenCalledTimes(1);
            expect(mockedGetOrderInfo).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                { blockTag: undefined },
            );
        });

        it('should retrieve order with block number', async () => {
            mockedGetOrderInfo.mockResolvedValue(mockedOrder);

            await orderDriver.getOrderInfo(supplier.address, 1, 15);

            expect(mockedGetOrderInfo).toHaveBeenCalledTimes(1);
            expect(mockedGetOrderInfo).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                { blockTag: 15 },
            );
        });

        it('should retrieve order - transaction fails', async () => {
            mockedGetOrderInfo.mockRejectedValue(new Error(errorMessage));

            const fn = async () => orderDriver.getOrderInfo(supplier.address, 1);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve order - not an address', async () => {
            const fn = async () => orderDriver.getOrderInfo('test', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderIncoterms', () => {
        it('should set order incoterms', async () => {

        });
    });

    describe('isSupplierOrCustomer', () => {
        it('should check if the sender is supplier or customer', async () => {
            await orderDriver.isSupplierOrCustomer(supplier.address, 1, customer.address);
            expect(mockedIsSupplierOrCustomer).toHaveBeenCalledTimes(1);
            expect(mockedIsSupplierOrCustomer).toHaveBeenNthCalledWith(1, supplier.address, 1, customer.address);
        });

        it('should check if the sender is supplier or customer - supplier not an address', async () => {
            const fn = async () => orderDriver.isSupplierOrCustomer('0xaddress', 1, customer.address);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });

        it('should check if the sender is supplier or customer - sender not an address', async () => {
            const fn = async () => orderDriver.isSupplierOrCustomer(supplier.address, 1, '0xaddress');
            await expect(fn).rejects.toThrowError(new Error('Sender not an address'));
        });
    });

    describe('getOrderLine', () => {
        it('should retrieve order line', async () => {
            const orderLine = new OrderLine(3, 'categoryA', 100, new OrderLinePrice(100.25, 'CHF'));
            mockedGetOrderLine.mockResolvedValue(mockedOrderLine);

            const resp = await orderDriver.getOrderLine(supplier.address, 1, orderLine.id as number);
            expect(resp).toEqual(mockedOrderLine);

            expect(mockedGetOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedGetOrderLine).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                orderLine.id as number,
                { blockTag: undefined },
            );
        });

        it('should retrieve order line with block number', async () => {
            const orderLine = new OrderLine(3, 'categoryA', 100, new OrderLinePrice(100.25, 'CHF'));
            mockedGetOrderLine.mockResolvedValue(mockedOrderLine);

            await orderDriver.getOrderLine(supplier.address, 1, orderLine.id as number, 15);

            expect(mockedGetOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedGetOrderLine).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                orderLine.id as number,
                { blockTag: 15 },
            );
        });

        it('should retrieve order line - transaction fails', async () => {
            mockedGetOrderLine.mockRejectedValue(new Error(errorMessage));

            const fn = async () => orderDriver.getOrderLine(supplier.address, 1, 2);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve order line - not an address', async () => {
            const fn = async () => orderDriver.getOrderLine('test', 1, 2);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('addOrderLine', () => {
        it('should call and wait for add order line', async () => {
            const price = new OrderLinePrice(100.25, 'CHF');
            await orderDriver.addOrderLine(supplier.address, 1, 'categoryA', 100, price);
            expect(mockedAddOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedAddOrderLine).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                'categoryA',
                100,
                {
                    amount: price.amount * 100,
                    decimals: 2,
                    fiat: price.fiat,
                },
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for add order line - fails', async () => {
            const price = new OrderLinePrice(100.25, 'CHF');
            mockedAddOrderLine.mockRejectedValue(new Error(errorMessage));

            const fn = async () => orderDriver.addOrderLine(supplier.address, 1, 'categoryA', 100, price);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for add order line - fails for address', async () => {
            const price = new OrderLinePrice(100.25, 'CHF');
            const fn = async () => orderDriver.addOrderLine('0xaddress', 1, 'categoryA', 100, price);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('updateOrderLine', () => {
        it('should call and wait for update order line', async () => {
            const price = new OrderLinePrice(100.25, 'CHF');
            await orderDriver.updateOrderLine(supplier.address, 1, 2, 'categoryUpdated', 100, price);
            expect(mockedUpdateOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedUpdateOrderLine).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                2,
                'categoryUpdated',
                100,
                {
                    amount: price.amount * 100,
                    decimals: 2,
                    fiat: price.fiat,
                },
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for update order line - fails', async () => {
            const price = new OrderLinePrice(100.25, 'CHF');
            mockedUpdateOrderLine.mockRejectedValue(new Error(errorMessage));

            const fn = async () => orderDriver.updateOrderLine(supplier.address, 1, 2, 'categoryUpdated', 100, price);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for update order line - fails for address', async () => {
            const price = new OrderLinePrice(100.25, 'CHF');

            const fn = async () => orderDriver.updateOrderLine('0xaddress', 1, 2, 'categoryUpdated', 100, price);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getOrderStatus', () => {
        it('should get the order status', async () => {
            await orderDriver.getOrderStatus(supplier.address, 1);
            expect(mockedGetOrderStatus).toHaveBeenCalledTimes(1);
            expect(mockedGetOrderStatus).toHaveBeenNthCalledWith(1, supplier.address, 1);
        });

        it('should get the order status - fail due to wrong address', async () => {
            const fn = async () => orderDriver.getOrderStatus('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    it('should get block numbers per each event name by order id', async () => {
        const orderId = 1;
        await orderDriver.getBlockNumbersByOrderId(orderId);
        expect(mockedQueryFilter).toHaveBeenCalledTimes(3);

        expect(mockedOrderRegisteredEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderRegisteredEventFilter).toHaveBeenNthCalledWith(1, orderId);

        expect(mockedOrderLineAddedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineAddedEventFilter).toHaveBeenNthCalledWith(1, orderId);

        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenNthCalledWith(1, orderId);
    });

    describe('addAdmin', () => {
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
    });

    describe('removeAdmin', () => {
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
});
