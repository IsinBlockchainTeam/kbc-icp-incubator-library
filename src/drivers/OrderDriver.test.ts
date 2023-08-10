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
    OrderLineUpdatedEventFilter, OrderManagerInterface,
    OrderRegisteredEventFilter,
} from '../smart-contracts/contracts/OrderManager';
import orderService from '../services/OrderService';

describe('OrderDriver', () => {
    let orderDriver: OrderDriver;

    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';

    let mockedIdentityDriver: IdentityEthersDriver;
    let mockedProvider: JsonRpcProvider;
    let mockedContract: OrderManager;

    const mockedOrderConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedRegisterOrder = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
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
        mockedWriteFunction.mockResolvedValue({
            wait: mockedWait,
        });
        mockedReadFunction.mockResolvedValue({
            toNumber: jest.fn(),
        });
        mockedRegisterOrder.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'OrderRegistered' }] }),
        }));
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedQueryFilter.mockResolvedValue([{ event: 'eventName' }]);

        mockedContract = createMock<OrderManager>({
            registerOrder: mockedRegisterOrder,
            getOrderInfo: mockedReadFunction,
            isSupplierOrCustomer: mockedReadFunction,
            getOrderCounter: mockedReadFunction,
            setOrderIncoterms: mockedWriteFunction,
            setOrderPaymentDeadline: mockedWriteFunction,
            setOrderDocumentDeliveryDeadline: mockedWriteFunction,
            setOrderShipper: mockedWriteFunction,
            setOrderArbiter: mockedWriteFunction,
            setOrderShippingPort: mockedWriteFunction,
            setOrderShippingDeadline: mockedWriteFunction,
            setOrderDeliveryPort: mockedWriteFunction,
            setOrderDeliveryDeadline: mockedWriteFunction,
            orderExists: mockedReadFunction,
            confirmOrder: mockedWriteFunction,
            getOrderStatus: mockedReadFunction,
            getOrderLine: mockedReadFunction,
            addOrderLine: mockedWriteFunction,
            updateOrderLine: mockedWriteFunction,
            addAdmin: mockedWriteFunction,
            removeAdmin: mockedWriteFunction,
            interface: { decodeEventLog: mockedDecodeEventLog },
            queryFilter: mockedQueryFilter,
            filters: {
                OrderRegistered: mockedOrderRegisteredEventFilter,
                OrderLineAdded: mockedOrderLineAddedEventFilter,
                OrderLineUpdated: mockedOrderLineUpdatedEventFilter,
            },
        });

        mockedOrderConnect.mockReturnValue(mockedContract);
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
            expect(mockedContract.addOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.addOrderLine).toHaveBeenNthCalledWith(
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
            expect(mockedContract.orderExists).toHaveBeenCalledTimes(1);
            expect(mockedContract.orderExists).toHaveBeenNthCalledWith(1, supplier.address, 1);
        });

        it('should check if order exists', async () => {
            const fn = async () => orderDriver.orderExists('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getOrderCounter', () => {
        it('should get the order counter ids', async () => {
            await orderDriver.getOrderCounter(supplier.address);
            expect(mockedContract.getOrderCounter).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderCounter).toHaveBeenNthCalledWith(1, supplier.address);
        });

        it('should get the order counter ids - fails for address', async () => {
            const fn = async () => orderDriver.getOrderCounter('0xaddress');
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('confirmOrder', () => {
        it('should confirm the order', async () => {
            await orderDriver.confirmOrder(supplier.address, 1);
            expect(mockedContract.confirmOrder).toHaveBeenCalledTimes(1);
            expect(mockedContract.confirmOrder).toHaveBeenNthCalledWith(1, supplier.address, 1);

            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should confirm the order - fails for address', async () => {
            const fn = async () => orderDriver.confirmOrder('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getOrderInfo', () => {
        it('should retrieve order', async () => {
            mockedContract.getOrderInfo = jest.fn().mockResolvedValue(mockedOrder);

            const resp = await orderDriver.getOrderInfo(supplier.address, 1);

            expect(resp).toEqual(mockedOrder);

            expect(mockedContract.getOrderInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderInfo).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                { blockTag: undefined },
            );
        });

        it('should retrieve order with block number', async () => {
            mockedContract.getOrderInfo = jest.fn().mockResolvedValue(mockedOrder);

            await orderDriver.getOrderInfo(supplier.address, 1, 15);

            expect(mockedContract.getOrderInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderInfo).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                { blockTag: 15 },
            );
        });

        it('should retrieve order - transaction fails', async () => {
            mockedContract.getOrderInfo = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => orderDriver.getOrderInfo(supplier.address, 1);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve order - not an address', async () => {
            const fn = async () => orderDriver.getOrderInfo('test', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderIncoterms', () => {
        const incoterms = 'FOB';
        it('should set order incoterms', async () => {
            await orderDriver.setOrderIncoterms(supplier.address, 1, incoterms);
            expect(mockedContract.setOrderIncoterms).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderIncoterms).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                incoterms,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order incoterms - not an address', async () => {
            const fn = async () => orderDriver.setOrderIncoterms('0xaddress', 1, incoterms);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderPaymentDeadline', () => {
        const deadline = new Date('2030-10-10');
        it('should set order payment deadline', async () => {
            await orderDriver.setOrderPaymentDeadline(supplier.address, 1, deadline);
            expect(mockedContract.setOrderPaymentDeadline).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderPaymentDeadline).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                deadline.getTime(),
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order payment deadline - not an address', async () => {
            const fn = async () => orderDriver.setOrderPaymentDeadline('0xaddress', 1, deadline);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderDocumentDeliveryDeadline', () => {
        const deadline = new Date('2030-10-10');
        it('should set order document delivery pipeline', async () => {
            await orderDriver.setOrderDocumentDeliveryDeadline(supplier.address, 1, deadline);
            expect(mockedContract.setOrderDocumentDeliveryDeadline).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderDocumentDeliveryDeadline).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                deadline.getTime(),
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order document delivery pipeline - not an address', async () => {
            const fn = async () => orderDriver.setOrderDocumentDeliveryDeadline('0xaddress', 1, deadline);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderShipper', () => {
        const shipper = 'shipper 1';
        it('should set order shipper', async () => {
            await orderDriver.setOrderShipper(supplier.address, 1, shipper);
            expect(mockedContract.setOrderShipper).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderShipper).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                shipper,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order shipper - not an address', async () => {
            const fn = async () => orderDriver.setOrderShipper('0xaddress', 1, shipper);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderArbiter', () => {
        const arbiter = 'arbiter 1';
        it('should set order arbiter', async () => {
            await orderDriver.setOrderArbiter(supplier.address, 1, arbiter);
            expect(mockedContract.setOrderArbiter).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderArbiter).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                arbiter,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order arbiter - not an address', async () => {
            const fn = async () => orderDriver.setOrderArbiter('0xaddress', 1, arbiter);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderShippingPort', () => {
        const shippingPort = 'shipping port';
        it('should set order shipping port', async () => {
            await orderDriver.setOrderShippingPort(supplier.address, 1, shippingPort);
            expect(mockedContract.setOrderShippingPort).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderShippingPort).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                shippingPort,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order shipping port - not an address', async () => {
            const fn = async () => orderDriver.setOrderShippingPort('0xaddress', 1, shippingPort);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderShippingDeadline', () => {
        const deadline = new Date('2030-10-10');
        it('should set order shipping deadline', async () => {
            await orderDriver.setOrderShippingDeadline(supplier.address, 1, deadline);
            expect(mockedContract.setOrderShippingDeadline).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderShippingDeadline).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                deadline.getTime(),
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order shipping deadline - not an address', async () => {
            const fn = async () => orderDriver.setOrderShippingDeadline('0xaddress', 1, deadline);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderDeliveryPort', () => {
        const deliveryPort = 'delivery port';
        it('should set order delivery port', async () => {
            await orderDriver.setOrderDeliveryPort(supplier.address, 1, deliveryPort);
            expect(mockedContract.setOrderDeliveryPort).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderDeliveryPort).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                deliveryPort,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order delivery port - not an address', async () => {
            const fn = async () => orderDriver.setOrderDeliveryPort('0xaddress', 1, deliveryPort);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('setOrderDeliveryDeadline', () => {
        const deadline = new Date('2030-10-10');
        it('should set order delivery deadline', async () => {
            await orderDriver.setOrderDeliveryDeadline(supplier.address, 1, deadline);
            expect(mockedContract.setOrderDeliveryDeadline).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderDeliveryDeadline).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                deadline.getTime(),
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order delivery deadline - not an address', async () => {
            const fn = async () => orderDriver.setOrderDeliveryDeadline('0xaddress', 1, deadline);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('isSupplierOrCustomer', () => {
        it('should check if the sender is supplier or customer', async () => {
            await orderDriver.isSupplierOrCustomer(supplier.address, 1, customer.address);
            expect(mockedContract.isSupplierOrCustomer).toHaveBeenCalledTimes(1);
            expect(mockedContract.isSupplierOrCustomer).toHaveBeenNthCalledWith(1, supplier.address, 1, customer.address);
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
            mockedContract.getOrderLine = jest.fn().mockResolvedValue(mockedOrderLine);

            const resp = await orderDriver.getOrderLine(supplier.address, 1, orderLine.id as number);
            expect(resp).toEqual(mockedOrderLine);

            expect(mockedContract.getOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderLine).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                    orderLine.id as number,
                    { blockTag: undefined },
            );
        });

        it('should retrieve order line with block number', async () => {
            const orderLine = new OrderLine(3, 'categoryA', 100, new OrderLinePrice(100.25, 'CHF'));
            mockedContract.getOrderLine = jest.fn().mockResolvedValue(mockedOrderLine);

            await orderDriver.getOrderLine(supplier.address, 1, orderLine.id as number, 15);

            expect(mockedContract.getOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderLine).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                    orderLine.id as number,
                    { blockTag: 15 },
            );
        });

        it('should retrieve order line - transaction fails', async () => {
            mockedContract.getOrderLine = jest.fn().mockRejectedValue(new Error(errorMessage));

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
            expect(mockedContract.addOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.addOrderLine).toHaveBeenNthCalledWith(
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
            mockedContract.addOrderLine = jest.fn().mockRejectedValue(new Error(errorMessage));

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
            expect(mockedContract.updateOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.updateOrderLine).toHaveBeenNthCalledWith(
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
            mockedContract.updateOrderLine = jest.fn().mockRejectedValue(new Error(errorMessage));

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
            expect(mockedContract.getOrderStatus).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderStatus).toHaveBeenNthCalledWith(1, supplier.address, 1);
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

            expect(mockedContract.addAdmin).toHaveBeenCalledTimes(1);
            expect(mockedContract.addAdmin).toHaveBeenNthCalledWith(
                1,
                address,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for add admin - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.addAdmin = jest.fn().mockRejectedValue(new Error(errorMessage));

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

            expect(mockedContract.removeAdmin).toHaveBeenCalledTimes(1);
            expect(mockedContract.removeAdmin).toHaveBeenNthCalledWith(
                1,
                address,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for remove admin - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.removeAdmin = jest.fn().mockRejectedValue(new Error(errorMessage));

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
