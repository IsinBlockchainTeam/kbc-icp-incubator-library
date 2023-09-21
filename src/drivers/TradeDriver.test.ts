/* eslint-disable camelcase */

import { BigNumber, ethers, Signer } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { TradeDriver } from './TradeDriver';
import { OrderInfo } from '../entities/OrderInfo';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { TradeManager, TradeManager__factory } from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { BasicTradeInfo } from '../entities/BasicTradeInfo';
import { TradeType } from '../entities/Trade';

describe('TradeDriver', () => {
    let tradeDriver: TradeDriver;

    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';

    let mockedSigner: Signer;
    let mockedContract: TradeManager;

    const mockedTradeConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedRegisterTrade = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedDecodeEventLog = jest.fn();

    const mockedQueryFilter = jest.fn();
    const mockedTradeRegisteredEventFilter = jest.fn();
    const mockedTradeLineAddedEventFilter = jest.fn();
    const mockedTradeLineUpdatedEventFilter = jest.fn();
    const mockedOrderLineAddedEventFilter = jest.fn();
    const mockedOrderLineUpdatedEventFilter = jest.fn();

    const supplier = ethers.Wallet.createRandom();
    const customer = ethers.Wallet.createRandom();
    const tradeName = 'trade 1';
    const externalUrl = 'https://testurl.ch';

    const buildOrderSpy = jest.spyOn(EntityBuilder, 'buildOrderInfo');
    const buildOrderLineSpy = jest.spyOn(EntityBuilder, 'buildOrderLine');
    const buildOrderLinePriceSpy = jest.spyOn(EntityBuilder, 'buildOrderLinePrice');
    const buildBasicTradeInfoSpy = jest.spyOn(EntityBuilder, 'buildBasicTradeInfo');

    const mockedOrderInfo = createMock<OrderInfo>();
    const mockedOrderLine = createMock<OrderLine>();
    const mockedOrderLinePrice = createMock<OrderLinePrice>();
    const mockedBasicTradeInfo = createMock<BasicTradeInfo>();

    beforeAll(() => {
        mockedWriteFunction.mockResolvedValue({
            wait: mockedWait,
        });
        mockedReadFunction.mockResolvedValue({
            toNumber: jest.fn(),
        });
        mockedRegisterTrade.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'TradeRegistered' }] }),
        }));
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedQueryFilter.mockResolvedValue([{ event: 'eventName' }]);

        mockedContract = createMock<TradeManager>({
            registerTrade: mockedRegisterTrade,
            tradeExists: mockedReadFunction,
            getTradeInfo: mockedReadFunction,
            getTradeCounter: mockedReadFunction,
            addTradeLine: mockedWriteFunction,
            updateTradeLine: mockedWriteFunction,
            getTradeLine: mockedReadFunction,
            tradeLineExists: mockedReadFunction,

            addOrderOfferee: mockedWriteFunction,
            setOrderPaymentDeadline: mockedWriteFunction,
            setOrderDocumentDeliveryDeadline: mockedWriteFunction,
            setOrderArbiter: mockedWriteFunction,
            setOrderShippingDeadline: mockedWriteFunction,
            setOrderDeliveryDeadline: mockedWriteFunction,
            confirmOrder: mockedWriteFunction,
            addDocument: mockedWriteFunction,
            getNegotiationStatus: mockedReadFunction,
            getOrderInfo: mockedReadFunction,
            isSupplierOrCustomer: mockedReadFunction,
            addOrderLine: mockedWriteFunction,
            updateOrderLine: mockedWriteFunction,
            getOrderLine: mockedReadFunction,

            addAdmin: mockedWriteFunction,
            removeAdmin: mockedWriteFunction,
            interface: { decodeEventLog: mockedDecodeEventLog },
            queryFilter: mockedQueryFilter,
            filters: {
                TradeRegistered: mockedTradeRegisteredEventFilter,
                TradeLineAdded: mockedTradeLineAddedEventFilter,
                TradeLineUpdated: mockedTradeLineUpdatedEventFilter,
                OrderLineAdded: mockedOrderLineAddedEventFilter,
                OrderLineUpdated: mockedOrderLineUpdatedEventFilter,
            },
        });

        mockedTradeConnect.mockReturnValue(mockedContract);
        const mockedTradeManager = createMock<TradeManager>({
            connect: mockedTradeConnect,
        });
        jest.spyOn(TradeManager__factory, 'connect').mockReturnValue(mockedTradeManager);

        buildOrderSpy.mockReturnValue(mockedOrderInfo);
        buildOrderLineSpy.mockReturnValue(mockedOrderLine);

        buildOrderLinePriceSpy.mockReturnValue(mockedOrderLinePrice);

        buildBasicTradeInfoSpy.mockReturnValue(mockedBasicTradeInfo);

        mockedSigner = createMock<Signer>();
        tradeDriver = new TradeDriver(
            mockedSigner,
            testAddress,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('registerTrade', () => {
        it('should call and wait for register a trade', async () => {
            await tradeDriver.registerBasicTrade(supplier.address, customer.address, tradeName, externalUrl);

            expect(mockedRegisterTrade).toHaveBeenCalledTimes(1);
            expect(mockedRegisterTrade).toHaveBeenNthCalledWith(1, TradeType.TRADE, supplier.address, customer.address, tradeName, externalUrl);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for register a trade - transaction fails', async () => {
            mockedRegisterTrade.mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.registerBasicTrade(supplier.address, customer.address, tradeName, externalUrl);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for register a trade - fails for supplier address', async () => {
            const fn = async () => tradeDriver.registerBasicTrade('0xaddress', customer.address, tradeName, externalUrl);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });

        it('should call and wait for register order - fails for customer address', async () => {
            const fn = async () => tradeDriver.registerBasicTrade(supplier.address, '0xaddress', tradeName, externalUrl);
            await expect(fn).rejects.toThrowError(new Error('Customer not an address'));
        });
    });

    describe('tradeExists', () => {
        it('should check if a trade exists', async () => {
            await tradeDriver.tradeExists(supplier.address, 1);
            expect(mockedContract.tradeExists).toHaveBeenCalledTimes(1);
            expect(mockedContract.tradeExists).toHaveBeenNthCalledWith(1, supplier.address, 1);
        });

        it('should check if a trade exists - fails for supplier address', async () => {
            const fn = async () => tradeDriver.tradeExists('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getTradeInfo', () => {
        it('should retrieve a trade', async () => {
            mockedContract.getTradeInfo = jest.fn().mockResolvedValue('rawTrade');

            const resp = await tradeDriver.getBasicTradeInfo(supplier.address, 1);

            expect(buildBasicTradeInfoSpy).toHaveBeenCalledTimes(1);
            expect(buildBasicTradeInfoSpy).toHaveBeenNthCalledWith(1, 'rawTrade');
            expect(resp).toEqual(mockedBasicTradeInfo);

            expect(mockedContract.getTradeInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getTradeInfo).toHaveBeenNthCalledWith(1, supplier.address, 1, { blockTag: undefined });
        });

        it('should retrieve a trade with block number', async () => {
            await tradeDriver.getBasicTradeInfo(supplier.address, 1, 15);

            expect(mockedContract.getTradeInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getTradeInfo).toHaveBeenNthCalledWith(1, supplier.address, 1, { blockTag: 15 });
        });

        it('should retrieve a trade - transaction fails', async () => {
            mockedContract.getTradeInfo = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.getBasicTradeInfo(supplier.address, 1);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve a trade - fails for supplier address', async () => {
            const fn = async () => tradeDriver.getBasicTradeInfo('test', 1);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('getTradeCounter', () => {
        it('should get the order counter ids', async () => {
            await tradeDriver.getTradeCounter(supplier.address);
            expect(mockedContract.getTradeCounter).toHaveBeenCalledTimes(1);
            expect(mockedContract.getTradeCounter).toHaveBeenNthCalledWith(1, supplier.address);
        });

        it('should get the order counter ids - fails for supplier address', async () => {
            const fn = async () => tradeDriver.getTradeCounter('0xaddress');
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('addTradeLine', () => {
        it('should add trade line', async () => {
            // mockedRegisterTrade.mockReturnValue(Promise.resolve({
            //     wait: mockedWait.mockReturnValue({ events: [{ event: 'OrderRegistered', data: { id: 1 } }] }),
            // }));
            // mockedDecodeEventLog.mockImplementation((eventName: string, data: Order, topics: string[]) => ({ id: BigNumber.from(data.id) }));

            await tradeDriver.addTradeLine(supplier.address, 1, [1, 2], 'categoryA');
            expect(mockedContract.addTradeLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.addTradeLine).toHaveBeenNthCalledWith(1, supplier.address, 1, [1, 2], 'categoryA');
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should add trade line - fails for supplier address', async () => {
            const fn = async () => tradeDriver.addTradeLine('0xaddress', 1, [1, 2], 'categoryA');
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('updateTradeLine', () => {
        it('should call and wait for update trade line', async () => {
            await tradeDriver.updateTradeLine(supplier.address, 1, 2, [2, 3], 'categoryUpdated');
            expect(mockedContract.updateTradeLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.updateTradeLine).toHaveBeenNthCalledWith(1, supplier.address, 1, 2, [2, 3], 'categoryUpdated');
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for update trade line - fails', async () => {
            mockedContract.updateTradeLine = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.updateTradeLine(supplier.address, 1, 2, [2, 3], 'categoryUpdated');
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for update trade line - fails for supplier address', async () => {
            const fn = async () => tradeDriver.updateTradeLine('0xaddress', 1, 2, [2, 3], 'categoryUpdated');
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('getTradeLine', () => {
        it('should retrieve a trade line', async () => {
            mockedContract.getTradeLine = jest.fn().mockResolvedValue('rawTradeLine');

            const resp = await tradeDriver.getTradeLine(supplier.address, 1, 2);

            expect(buildOrderSpy).toHaveBeenCalledTimes(1);
            expect(buildOrderSpy).toHaveBeenNthCalledWith(1, 'rawTradeLine');
            expect(resp).toEqual(mockedOrderLine);

            expect(mockedContract.getTradeLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.getTradeLine).toHaveBeenNthCalledWith(1, supplier.address, 1, 2, { blockTag: undefined });
        });

        it('should retrieve trade line with block number', async () => {
            await tradeDriver.getTradeLine(supplier.address, 1, 2, 15);

            expect(mockedContract.getTradeLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.getTradeLine).toHaveBeenNthCalledWith(1, supplier.address, 1, 2, { blockTag: 15 });
        });

        it('should retrieve order line - transaction fails', async () => {
            mockedContract.getTradeLine = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.getTradeLine(supplier.address, 1, 2);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve order line - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.getTradeLine('0xaddress', 1, 2);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('tradeLineExists', () => {
        it('should check if trade line exists', async () => {
            await tradeDriver.tradeLineExists(supplier.address, 1, 2);

            expect(mockedContract.tradeLineExists).toHaveBeenCalledTimes(1);
            expect(mockedContract.tradeLineExists).toHaveBeenNthCalledWith(1, supplier.address, 1, 2);
        });

        it('should check if trade line exists - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.tradeLineExists('0xaddress', 1, 2);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('registerOrder', () => {
        it('should call and wait for register order', async () => {
            await tradeDriver.registerOrder(supplier.address, customer.address, externalUrl);

            expect(mockedRegisterTrade).toHaveBeenCalledTimes(1);
            expect(mockedRegisterTrade).toHaveBeenNthCalledWith(1, TradeType.ORDER, supplier.address, customer.address, externalUrl);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for register order - transaction fails', async () => {
            mockedRegisterTrade.mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.registerOrder(supplier.address, customer.address, externalUrl);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for register order - fails for supplier address', async () => {
            const fn = async () => tradeDriver.registerOrder('0xaddress', customer.address, externalUrl);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });

        it('should call and wait for register order - fails for customer address', async () => {
            const fn = async () => tradeDriver.registerOrder(supplier.address, '0xaddress', externalUrl);
            await expect(fn).rejects.toThrowError(new Error('Customer not an address'));
        });
    });

    describe('addOrderOfferee', () => {
        it('should call and wait for add offeree to an order', async () => {
            await tradeDriver.addOrderOfferee(supplier.address, 1, 'offeree');

            expect(mockedContract.addOrderOfferee).toHaveBeenCalledTimes(1);
            expect(mockedContract.addOrderOfferee).toHaveBeenNthCalledWith(1, supplier.address, 1, 'offeree');
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for add offeree to an order - transaction fails', async () => {
            const fn = async () => tradeDriver.addOrderOfferee(supplier.address, 1, 'offeree');
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for add offeree to an order - fails for supplier address', async () => {
            const fn = async () => tradeDriver.addOrderOfferee('0xaddress', 1, 'offeree');
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('setOrderPaymentDeadline', () => {
        const deadline = new Date('2030-10-10');
        it('should set order payment deadline', async () => {
            await tradeDriver.setOrderPaymentDeadline(supplier.address, 1, deadline);
            expect(mockedContract.setOrderPaymentDeadline).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderPaymentDeadline).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                deadline.getTime(),
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order payment deadline - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.setOrderPaymentDeadline('0xaddress', 1, deadline);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('setOrderDocumentDeliveryDeadline', () => {
        const deadline = new Date('2030-10-10');
        it('should set order document delivery pipeline', async () => {
            await tradeDriver.setOrderDocumentDeliveryDeadline(supplier.address, 1, deadline);
            expect(mockedContract.setOrderDocumentDeliveryDeadline).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderDocumentDeliveryDeadline).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                deadline.getTime(),
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order document delivery pipeline - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.setOrderDocumentDeliveryDeadline('0xaddress', 1, deadline);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('setOrderArbiter', () => {
        const arbiter = 'arbiter 1';
        it('should set order arbiter', async () => {
            await tradeDriver.setOrderArbiter(supplier.address, 1, arbiter);
            expect(mockedContract.setOrderArbiter).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderArbiter).toHaveBeenNthCalledWith(
                1,
                supplier.address,
                1,
                arbiter,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order arbiter - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.setOrderArbiter('0xaddress', 1, arbiter);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('setOrderShippingDeadline', () => {
        const deadline = new Date('2030-10-10');
        it('should set order shipping deadline', async () => {
            await tradeDriver.setOrderShippingDeadline(supplier.address, 1, deadline);
            expect(mockedContract.setOrderShippingDeadline).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderShippingDeadline).toHaveBeenNthCalledWith(1, supplier.address, 1, deadline.getTime());
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order shipping deadline - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.setOrderShippingDeadline('0xaddress', 1, deadline);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('setOrderDeliveryDeadline', () => {
        const deadline = new Date('2030-10-10');
        it('should set order delivery deadline', async () => {
            await tradeDriver.setOrderDeliveryDeadline(supplier.address, 1, deadline);
            expect(mockedContract.setOrderDeliveryDeadline).toHaveBeenCalledTimes(1);
            expect(mockedContract.setOrderDeliveryDeadline).toHaveBeenNthCalledWith(1, supplier.address, 1, deadline.getTime());
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should set order delivery deadline - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.setOrderDeliveryDeadline('0xaddress', 1, deadline);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('confirmOrder', () => {
        it('should confirm the order', async () => {
            await tradeDriver.confirmOrder(supplier.address, 1);
            expect(mockedContract.confirmOrder).toHaveBeenCalledTimes(1);
            expect(mockedContract.confirmOrder).toHaveBeenNthCalledWith(1, supplier.address, 1);

            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should confirm the order - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.confirmOrder('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('addDocument', () => {
        it('should add document to an order', async () => {
            await tradeDriver.addDocument(supplier.address, 1, 'doc name', 'doc type', 'external url');
            expect(mockedContract.addDocument).toHaveBeenCalledTimes(1);
            expect(mockedContract.addDocument).toHaveBeenNthCalledWith(1, supplier.address, 1, 'doc name', 'doc type', 'external url');

            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should add document to an order - transaction fails', async () => {
            mockedContract.addDocument = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.addDocument(supplier.address, 1, 'doc name', 'doc type', 'external url');
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should add document to an order - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.addDocument('0xaddress', 1, 'doc name', 'doc type', 'external url');
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('getNegotiationStatus', () => {
        it('should get the order status', async () => {
            await tradeDriver.getNegotiationStatus(supplier.address, 1);
            expect(mockedContract.getNegotiationStatus).toHaveBeenCalledTimes(1);
            expect(mockedContract.getNegotiationStatus).toHaveBeenNthCalledWith(1, supplier.address, 1);
        });

        it('should get the order status - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.getNegotiationStatus('0xaddress', 1);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('getOrderInfo', () => {
        it('should retrieve an order', async () => {
            mockedContract.getOrderInfo = jest.fn().mockResolvedValue('rawOrder');

            const resp = await tradeDriver.getOrderInfo(supplier.address, 1);
            expect(buildOrderSpy).toHaveBeenCalledTimes(1);
            expect(buildOrderSpy).toHaveBeenNthCalledWith(1, 'rawOrder');
            expect(resp).toEqual(mockedOrderInfo);

            expect(mockedContract.getOrderInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderInfo).toHaveBeenNthCalledWith(1, supplier.address, 1, { blockTag: undefined });
        });

        it('should retrieve an order with block number', async () => {
            await tradeDriver.getOrderInfo(supplier.address, 1, 15);

            expect(mockedContract.getOrderInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderInfo).toHaveBeenNthCalledWith(1, supplier.address, 1, { blockTag: 15 });
        });

        it('should retrieve an order - transaction fails', async () => {
            mockedContract.getOrderInfo = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.getOrderInfo(supplier.address, 1);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve an order - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.getOrderInfo('test', 1);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('isSupplierOrCustomer', () => {
        it('should check if the sender is supplier or customer', async () => {
            await tradeDriver.isSupplierOrCustomer(supplier.address, 1, customer.address);
            expect(mockedContract.isSupplierOrCustomer).toHaveBeenCalledTimes(1);
            expect(mockedContract.isSupplierOrCustomer).toHaveBeenNthCalledWith(1, supplier.address, 1, customer.address);
        });

        it('should check if the sender is supplier or customer - supplier not an address', async () => {
            const fn = async () => tradeDriver.isSupplierOrCustomer('0xaddress', 1, customer.address);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });

        it('should check if the sender is supplier or customer - sender not an address', async () => {
            const fn = async () => tradeDriver.isSupplierOrCustomer(supplier.address, 1, '0xaddress');
            await expect(fn).rejects.toThrowError(new Error('Sender not an address'));
        });
    });

    describe('addOrderLine', () => {
        it('should add order line', async () => {
            const price = {
                amount: 10025,
                decimals: 2,
                fiat: 'CHF',
            };
            await tradeDriver.addOrderLine(supplier.address, 1, [1, 2], 'categoryA', 100, new OrderLinePrice(100.25, price.fiat));
            expect(mockedContract.addOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.addOrderLine).toHaveBeenNthCalledWith(1, supplier.address, 1, 'categoryA', 100, price);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for add order line - fails', async () => {
            mockedContract.addOrderLine = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.addOrderLine(supplier.address, 1, [1, 2], 'categoryA', 100, new OrderLinePrice(100.25, 'CHF'));
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for add order line - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.addOrderLine('0xaddress', 1, [1, 2], 'categoryA', 100, new OrderLinePrice(100.25, 'CHF'));
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    describe('updateOrderLine', () => {
        it('should call and wait for update order line', async () => {
            const price = new OrderLinePrice(100.25, 'CHF');
            await tradeDriver.updateOrderLine(supplier.address, 1, 2, [3, 4], 'categoryUpdated', 100, price);
            expect(mockedContract.updateOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.updateOrderLine).toHaveBeenNthCalledWith(1, supplier.address, 1, 2, [3, 4], 'categoryUpdated', 100, {
                amount: price.amount * 100,
                decimals: 2,
                fiat: price.fiat,
            },
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for update order line - fails', async () => {
            mockedContract.updateOrderLine = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.updateOrderLine(supplier.address, 1, 2, [3, 4], 'categoryUpdated', 100, new OrderLinePrice(100.25, 'CHF'));
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for update order line - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.updateOrderLine('0xaddress', 1, 2, [3, 4], 'categoryUpdated', 100, new OrderLinePrice(100.25, 'CHF'));
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('getOrderLine', () => {
        it('should retrieve order line', async () => {
            mockedContract.getOrderLine = jest.fn().mockResolvedValue('rawOrderLine');

            const resp = await tradeDriver.getOrderLine(supplier.address, 1, 3);
            expect(buildOrderLineSpy).toHaveBeenCalledTimes(1);
            expect(buildOrderLineSpy).toHaveBeenNthCalledWith(1, 'rawOrderLine');
            expect(resp).toEqual(mockedOrderLine);

            expect(mockedContract.getOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderLine).toHaveBeenNthCalledWith(1, supplier.address, 1, 3, { blockTag: undefined });
        });

        it('should retrieve order line with block number', async () => {
            await tradeDriver.getOrderLine(supplier.address, 1, 3, 15);

            expect(mockedContract.getOrderLine).toHaveBeenCalledTimes(1);
            expect(mockedContract.getOrderLine).toHaveBeenNthCalledWith(1, supplier.address, 1, 3, { blockTag: 15 });
        });

        it('should retrieve order line - transaction fails', async () => {
            mockedContract.getOrderLine = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => tradeDriver.getOrderLine(supplier.address, 1, 2);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve order line - fails for supplier not an address', async () => {
            const fn = async () => tradeDriver.getOrderLine('0xaddress', 1, 2);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });
    });

    it('should get block numbers per each event name by order id', async () => {
        const tradeId = 1;
        await tradeDriver.getBlockNumbersByTradeId(tradeId);
        expect(mockedQueryFilter).toHaveBeenCalledTimes(3);

        expect(mockedTradeRegisteredEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedTradeRegisteredEventFilter).toHaveBeenNthCalledWith(1, tradeId);

        expect(mockedOrderLineAddedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineAddedEventFilter).toHaveBeenNthCalledWith(1, tradeId);

        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenNthCalledWith(1, tradeId);

        expect(mockedOrderLineAddedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineAddedEventFilter).toHaveBeenNthCalledWith(1, tradeId);

        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenNthCalledWith(1, tradeId);
    });

    describe('addAdmin', () => {
        it('should call and wait for add admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await tradeDriver.addAdmin(address);

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

            const fn = async () => tradeDriver.addAdmin(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for add admin - fails for address', async () => {
            const address = '123';

            const fn = async () => tradeDriver.addAdmin(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('removeAdmin', () => {
        it('should call and wait for remove admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await tradeDriver.removeAdmin(address);

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

            const fn = async () => tradeDriver.removeAdmin(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for remove admin - fails for address', async () => {
            const address = '123';

            const fn = async () => tradeDriver.removeAdmin(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });
});
