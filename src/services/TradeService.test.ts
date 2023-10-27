import { createMock } from 'ts-auto-mock';
import { IPFSService } from '@blockchain-lib/common';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { TradeDriver } from '../drivers/TradeDriver';
import TradeService from './TradeService';
import { BasicTradeInfo } from '../entities/BasicTradeInfo';
import { TradeLine } from '../entities/TradeLine';
import { OrderInfo } from '../entities/OrderInfo';

describe('TradeService', () => {
    const supplier = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const customer = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
    const externalUrl = 'https://externalurl.com';
    const tradeName = 'trade 1';
    const productCategory = 'Arabic 85';
    const quantity = 100;
    const price = new OrderLinePrice(100.25, 'CHF');
    const deadline = new Date('2030-10-10');

    const basicTradeInfo = new BasicTradeInfo(0, 'supplier', 'customer', 'externalUrl', [1, 2], 'tradeName');
    const orderInfo = new OrderInfo(0, 'supplier', 'customer', externalUrl, 'offeree', 'offeror', [1, 2], deadline, deadline, 'arbiter', deadline, deadline);

    const mockedIPFSService: IPFSService = createMock<IPFSService>({
        storeJSON: jest.fn(),
        storeFile: jest.fn(),
        retrieveJSON: jest.fn(),
        retrieveFile: jest.fn(),
        delete: jest.fn(),
    });

    const mockedTradeDriver: TradeDriver = createMock<TradeDriver>({
        registerBasicTrade: jest.fn(),
        tradeExists: jest.fn(),
        getCounter: jest.fn(),
        getGeneralTrade: jest.fn(),
        getBasicTradeInfo: jest.fn(),
        getTradeIds: jest.fn(),
        addTradeLine: jest.fn(),
        updateTradeLine: jest.fn(),
        getTradeLine: jest.fn(),
        tradeLineExists: jest.fn(),
        registerOrder: jest.fn(),
        addOrderOfferee: jest.fn(),
        setOrderPaymentDeadline: jest.fn(),
        setOrderDocumentDeliveryDeadline: jest.fn(),
        setOrderArbiter: jest.fn(),
        setOrderShippingDeadline: jest.fn(),
        setOrderDeliveryDeadline: jest.fn(),
        confirmOrder: jest.fn(),
        addDocument: jest.fn(),
        getNegotiationStatus: jest.fn(),
        getOrderInfo: jest.fn(),
        isSupplierOrCustomer: jest.fn(),
        addOrderLine: jest.fn(),
        updateOrderLine: jest.fn(),
        getOrderLine: jest.fn(),
        getBlockNumbersByTradeId: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
    });

    const tradeService = new TradeService(
        mockedTradeDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerBasicTrade',
            serviceFunction: () => tradeService.registerBasicTrade(supplier, customer, tradeName, externalUrl),
            expectedMockedFunction: mockedTradeDriver.registerBasicTrade,
            expectedMockedFunctionArgs: [supplier, customer, tradeName, externalUrl],
        },
        {
            serviceFunctionName: 'tradeExists',
            serviceFunction: () => tradeService.tradeExists(1),
            expectedMockedFunction: mockedTradeDriver.tradeExists,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getCounter',
            serviceFunction: () => tradeService.getCounter(),
            expectedMockedFunction: mockedTradeDriver.getCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getGeneralTrade',
            serviceFunction: () => tradeService.getGeneralTrade(1),
            expectedMockedFunction: mockedTradeDriver.getGeneralTrade,
            expectedMockedFunctionArgs: [1, undefined],
        },
        {
            serviceFunctionName: 'getGeneralTrade',
            serviceFunction: () => tradeService.getGeneralTrade(1, 15),
            expectedMockedFunction: mockedTradeDriver.getGeneralTrade,
            expectedMockedFunctionArgs: [1, 15],
        },
        {
            serviceFunctionName: 'getBasicTradeInfo',
            serviceFunction: () => tradeService.getBasicTradeInfo(1),
            expectedMockedFunction: mockedTradeDriver.getBasicTradeInfo,
            expectedMockedFunctionArgs: [1, undefined],
        },
        {
            serviceFunctionName: 'getTradeIds',
            serviceFunction: () => tradeService.getTradeIds(supplier),
            expectedMockedFunction: mockedTradeDriver.getTradeIds,
            expectedMockedFunctionArgs: [supplier],
        },
        {
            serviceFunctionName: 'addTradeLine',
            serviceFunction: () => tradeService.addTradeLine(1, [1, 2], productCategory),
            expectedMockedFunction: mockedTradeDriver.addTradeLine,
            expectedMockedFunctionArgs: [1, [1, 2], productCategory],
        },
        {
            serviceFunctionName: 'updateTradeLine',
            serviceFunction: () => tradeService.updateTradeLine(1, 2, [3, 4], productCategory),
            expectedMockedFunction: mockedTradeDriver.updateTradeLine,
            expectedMockedFunctionArgs: [1, 2, [3, 4], productCategory],
        },
        {
            serviceFunctionName: 'getTradeLine',
            serviceFunction: () => tradeService.getTradeLine(1, 2),
            expectedMockedFunction: mockedTradeDriver.getTradeLine,
            expectedMockedFunctionArgs: [1, 2],
        },
        {
            serviceFunctionName: 'tradeLineExists',
            serviceFunction: () => tradeService.tradeLineExists(1, 2),
            expectedMockedFunction: mockedTradeDriver.tradeLineExists,
            expectedMockedFunctionArgs: [1, 2],
        },
        {
            serviceFunctionName: 'registerOrder',
            serviceFunction: () => tradeService.registerOrder(supplier, customer, externalUrl),
            expectedMockedFunction: mockedTradeDriver.registerOrder,
            expectedMockedFunctionArgs: [supplier, customer, externalUrl],
        },
        {
            serviceFunctionName: 'addOrderOfferee',
            serviceFunction: () => tradeService.addOrderOfferee(1, 'offeree'),
            expectedMockedFunction: mockedTradeDriver.addOrderOfferee,
            expectedMockedFunctionArgs: [1, 'offeree'],
        },
        {
            serviceFunctionName: 'setOrderPaymentDeadline',
            serviceFunction: () => tradeService.setOrderPaymentDeadline(1, deadline),
            expectedMockedFunction: mockedTradeDriver.setOrderPaymentDeadline,
            expectedMockedFunctionArgs: [1, deadline],
        },
        {
            serviceFunctionName: 'setOrderDocumentDeliveryDeadline',
            serviceFunction: () => tradeService.setOrderDocumentDeliveryDeadline(1, deadline),
            expectedMockedFunction: mockedTradeDriver.setOrderDocumentDeliveryDeadline,
            expectedMockedFunctionArgs: [1, deadline],
        },
        {
            serviceFunctionName: 'setOrderArbiter',
            serviceFunction: () => tradeService.setOrderArbiter(1, 'arbiter'),
            expectedMockedFunction: mockedTradeDriver.setOrderArbiter,
            expectedMockedFunctionArgs: [1, 'arbiter'],
        },
        {
            serviceFunctionName: 'setOrderShippingDeadline',
            serviceFunction: () => tradeService.setOrderShippingDeadline(1, deadline),
            expectedMockedFunction: mockedTradeDriver.setOrderShippingDeadline,
            expectedMockedFunctionArgs: [1, deadline],
        },
        {
            serviceFunctionName: 'setOrderDeliveryDeadline',
            serviceFunction: () => tradeService.setOrderDeliveryDeadline(1, deadline),
            expectedMockedFunction: mockedTradeDriver.setOrderDeliveryDeadline,
            expectedMockedFunctionArgs: [1, deadline],
        },
        {
            serviceFunctionName: 'confirmOrder',
            serviceFunction: () => tradeService.confirmOrder(1),
            expectedMockedFunction: mockedTradeDriver.confirmOrder,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'addDocument',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', 'doc type', externalUrl),
            expectedMockedFunction: mockedTradeDriver.addDocument,
            expectedMockedFunctionArgs: [1, 'doc name', 'doc type', externalUrl, undefined],
        },
        {
            serviceFunctionName: 'getNegotiationStatus',
            serviceFunction: () => tradeService.getNegotiationStatus(1),
            expectedMockedFunction: mockedTradeDriver.getNegotiationStatus,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getOrderInfo',
            serviceFunction: () => tradeService.getOrderInfo(1, 15),
            expectedMockedFunction: mockedTradeDriver.getOrderInfo,
            expectedMockedFunctionArgs: [1, 15],
        },
        {
            serviceFunctionName: 'isSupplierOrCustomer',
            serviceFunction: () => tradeService.isSupplierOrCustomer(1, customer),
            expectedMockedFunction: mockedTradeDriver.isSupplierOrCustomer,
            expectedMockedFunctionArgs: [1, customer],
        },
        {
            serviceFunctionName: 'addOrderLine',
            serviceFunction: () => tradeService.addOrderLine(1, [1, 2], productCategory, quantity, price),
            expectedMockedFunction: mockedTradeDriver.addOrderLine,
            expectedMockedFunctionArgs: [1, [1, 2], productCategory, quantity, price],
        },
        {
            serviceFunctionName: 'updateOrderLine',
            serviceFunction: () => tradeService.updateOrderLine(1, 2, [1, 2], productCategory, quantity, price),
            expectedMockedFunction: mockedTradeDriver.updateOrderLine,
            expectedMockedFunctionArgs: [1, 2, [1, 2], productCategory, quantity, price],
        },
        {
            serviceFunctionName: 'getOrderLine',
            serviceFunction: () => tradeService.getOrderLine(1, 2),
            expectedMockedFunction: mockedTradeDriver.getOrderLine,
            expectedMockedFunctionArgs: [1, 2, undefined],
        },
        {
            serviceFunctionName: 'getBlockNumbersByOrderId',
            serviceFunction: () => tradeService.getBlockNumbersByOrderId(1),
            expectedMockedFunction: mockedTradeDriver.getBlockNumbersByTradeId,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => tradeService.addAdmin('testAddress'),
            expectedMockedFunction: mockedTradeDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => tradeService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedTradeDriver.removeAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });

    it('should get complete basic trade', async () => {
        const tradeServiceWithIPFS = new TradeService(mockedTradeDriver, mockedIPFSService);
        await tradeServiceWithIPFS.getCompleteBasicTrade(basicTradeInfo);

        expect(mockedIPFSService.retrieveJSON).toHaveBeenCalledTimes(1);
        expect(mockedIPFSService.retrieveJSON).toHaveBeenNthCalledWith(1, basicTradeInfo.externalUrl);
    });

    it('should get complete basic trade - FAIL (IPFS Service not available)', async () => {
        const fn = async () => tradeService.getCompleteBasicTrade(basicTradeInfo);
        await expect(fn).rejects.toThrowError(new Error('IPFS Service not available'));
    });

    it('should get general trades', async () => {
        mockedTradeDriver.getTradeIds = jest.fn().mockResolvedValue([1, 2]);
        await tradeService.getGeneralTrades(supplier);

        expect(mockedTradeDriver.getTradeIds).toHaveBeenCalledTimes(1);
        expect(mockedTradeDriver.getTradeIds).toHaveBeenNthCalledWith(1, supplier);
        expect(mockedTradeDriver.getGeneralTrade).toHaveBeenCalledTimes(2);
        expect(mockedTradeDriver.getGeneralTrade).toHaveBeenNthCalledWith(1, 1, undefined);
        expect(mockedTradeDriver.getGeneralTrade).toHaveBeenNthCalledWith(2, 2, undefined);
    });

    it('should add trade lines', async () => {
        const lines = [
            new TradeLine(0, [1, 2], 'Arabic 85'),
            new TradeLine(0, [3, 4], 'Excelsa 88'),
        ];
        await tradeService.addTradeLines(1, lines);

        expect(mockedTradeDriver.addTradeLine).toHaveBeenCalledTimes(2);
        expect(mockedTradeDriver.addTradeLine).toHaveBeenNthCalledWith(1, 1, lines[0].materialIds, lines[0].productCategory);
        expect(mockedTradeDriver.addTradeLine).toHaveBeenNthCalledWith(2, 1, lines[1].materialIds, lines[1].productCategory);
    });

    it('should get trade lines', async () => {
        const lineIds = [1, 2];
        mockedTradeDriver.getBasicTradeInfo = jest.fn().mockResolvedValue({ lineIds });
        await tradeService.getTradeLines(1);

        expect(mockedTradeDriver.getBasicTradeInfo).toHaveBeenCalledTimes(1);
        expect(mockedTradeDriver.getBasicTradeInfo).toHaveBeenNthCalledWith(1, 1, undefined);

        expect(mockedTradeDriver.getTradeLine).toHaveBeenCalledTimes(2);
        expect(mockedTradeDriver.getTradeLine).toHaveBeenNthCalledWith(1, 1, lineIds[0]);
        expect(mockedTradeDriver.getTradeLine).toHaveBeenNthCalledWith(2, 1, lineIds[1]);
    });

    it('should get complete order', async () => {
        const tradeServiceWithIPFS = new TradeService(mockedTradeDriver, mockedIPFSService);
        mockedIPFSService.retrieveJSON = jest.fn().mockResolvedValue({ incoterms: 'FOB', shipper: 'shipper', shippingPort: 'port', deliveryPort: 'port' });
        await tradeServiceWithIPFS.getCompleteOrder(orderInfo);

        expect(mockedIPFSService.retrieveJSON).toHaveBeenCalledTimes(1);
        expect(mockedIPFSService.retrieveJSON).toHaveBeenNthCalledWith(1, orderInfo.externalUrl);
    });

    it('should get complete order - FAIL', async () => {
        const tradeServiceWithIPFS = new TradeService(mockedTradeDriver, mockedIPFSService);
        mockedIPFSService.retrieveJSON = jest.fn().mockRejectedValueOnce(new Error('error'));

        const fn = async () => tradeServiceWithIPFS.getCompleteOrder(orderInfo);
        await expect(fn).rejects.toThrowError(new Error('Error while retrieving order metadata file from IPFS: error'));
    });

    it('should get complete order - FAIL (IPFS Service not available)', async () => {
        const fn = async () => tradeService.getCompleteOrder(orderInfo);
        await expect(fn).rejects.toThrowError(new Error('IPFS Service not available'));
    });

    it('should add order lines', async () => {
        const lines = [
            new OrderLine(0, [1, 2], 'Arabic 85', 100, price),
            new OrderLine(0, [3, 4], 'Excelsa 88', 55, price),
        ];
        await tradeService.addOrderLines(1, lines);

        expect(mockedTradeDriver.addOrderLine).toHaveBeenCalledTimes(2);
        expect(mockedTradeDriver.addOrderLine).toHaveBeenNthCalledWith(1, 1, lines[0].materialIds, lines[0].productCategory, lines[0].quantity, lines[0].price);
        expect(mockedTradeDriver.addOrderLine).toHaveBeenNthCalledWith(2, 1, lines[1].materialIds, lines[1].productCategory, lines[1].quantity, lines[1].price);
    });

    it('should get all order lines', async () => {
        mockedTradeDriver.getOrderInfo = jest.fn().mockResolvedValue({ lineIds: [1, 2] });
        await tradeService.getOrderLines(1);

        expect(mockedTradeDriver.getOrderInfo).toHaveBeenCalledTimes(1);
        expect(mockedTradeDriver.getOrderInfo).toHaveBeenNthCalledWith(1, 1, undefined);

        expect(mockedTradeDriver.getOrderLine).toHaveBeenCalledTimes(2);
        expect(mockedTradeDriver.getOrderLine).toHaveBeenNthCalledWith(1, 1, 1, undefined);
        expect(mockedTradeDriver.getOrderLine).toHaveBeenNthCalledWith(2, 1, 2, undefined);
    });
});
