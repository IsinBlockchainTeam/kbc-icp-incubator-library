import { createMock } from 'ts-auto-mock';
import { OrderTradeDriver } from '../drivers/OrderTradeDriver';
import { OrderTradeService } from './OrderTradeService';
import {
    OrderLine,
    OrderLinePrice,
    OrderLineRequest, OrderTradeInfo,
} from '../entities/OrderTradeInfo';
import { Material } from '../entities/Material';
import { ProductCategory } from '../entities/ProductCategory';
import { IStorageMetadataDriver, OperationType } from '../drivers/IStorageMetadataDriver';
import { IStorageDocumentDriver } from '../drivers/IStorageDocumentDriver';
import { SolidMetadataSpec } from '../drivers/SolidMetadataDriver';
import { SolidDocumentSpec } from '../drivers/SolidDocumentDriver';

describe('OrderTradeService', () => {
    const mockedOrderTradeDriver: OrderTradeDriver = createMock<OrderTradeDriver>({
        getTrade: jest.fn().mockResolvedValue(createMock<OrderTradeInfo>()),
        getLines: jest.fn(),
        getLine: jest.fn(),
        addLine: jest.fn(),
        updateLine: jest.fn(),
        assignMaterial: jest.fn(),
        getNegotiationStatus: jest.fn(),
        updatePaymentDeadline: jest.fn(),
        updateDocumentDeliveryDeadline: jest.fn(),
        updateArbiter: jest.fn(),
        updateShippingDeadline: jest.fn(),
        updateDeliveryDeadline: jest.fn(),
        confirmOrder: jest.fn(),
        getEmittedEvents: jest.fn(),
    });
    const mockedStorageMetadataDriver = createMock<IStorageMetadataDriver<SolidMetadataSpec>>({
        create: jest.fn(),
    });
    const metadataSpec: SolidMetadataSpec = {
        entireResourceUrl: 'metadataExternalUrl',
    };
    const mockedStorageDocumentDriver = createMock<IStorageDocumentDriver<SolidDocumentSpec>>({
        create: jest.fn(),
    });

    let orderTradeService = new OrderTradeService({
        tradeDriver: mockedOrderTradeDriver,
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getTrade',
            serviceFunction: () => orderTradeService.getTrade(),
            expectedMockedFunction: mockedOrderTradeDriver.getTrade,
            expectedMockedFunctionArgs: [undefined],
        },
        {
            serviceFunctionName: 'getLines',
            serviceFunction: () => orderTradeService.getLines(),
            expectedMockedFunction: mockedOrderTradeDriver.getLines,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getLine',
            serviceFunction: () => orderTradeService.getLine(1),
            expectedMockedFunction: mockedOrderTradeDriver.getLine,
            expectedMockedFunctionArgs: [1, undefined],
        },
        {
            serviceFunctionName: 'addLine',
            serviceFunction: () => orderTradeService.addLine(new OrderLineRequest(1, 10, new OrderLinePrice(10.2, 'CHF'))),
            expectedMockedFunction: mockedOrderTradeDriver.addLine,
            expectedMockedFunctionArgs: [new OrderLineRequest(1, 10, new OrderLinePrice(10.2, 'CHF'))],
        },
        {
            serviceFunctionName: 'updateLine',
            serviceFunction: () => orderTradeService.updateLine(new OrderLine(1, new Material(1, new ProductCategory(2, 'test', 10, 'description')), new ProductCategory(2, 'test', 10, 'description'), 10, new OrderLinePrice(10.2, 'CHF'))),
            expectedMockedFunction: mockedOrderTradeDriver.updateLine,
            expectedMockedFunctionArgs: [new OrderLine(1, new Material(1, new ProductCategory(2, 'test', 10, 'description')), new ProductCategory(2, 'test', 10, 'description'), 10, new OrderLinePrice(10.2, 'CHF'))],
        },
        {
            serviceFunctionName: 'assignMaterial',
            serviceFunction: () => orderTradeService.assignMaterial(1, 1),
            expectedMockedFunction: mockedOrderTradeDriver.assignMaterial,
            expectedMockedFunctionArgs: [1, 1],
        },
        {
            serviceFunctionName: 'getNegotiationStatus',
            serviceFunction: () => orderTradeService.getNegotiationStatus(),
            expectedMockedFunction: mockedOrderTradeDriver.getNegotiationStatus,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'updatePaymentDeadline',
            serviceFunction: () => orderTradeService.updatePaymentDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updatePaymentDeadline,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'updateDocumentDeliveryDeadline',
            serviceFunction: () => orderTradeService.updateDocumentDeliveryDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateDocumentDeliveryDeadline,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'updateArbiter',
            serviceFunction: () => orderTradeService.updateArbiter('new arbiter'),
            expectedMockedFunction: mockedOrderTradeDriver.updateArbiter,
            expectedMockedFunctionArgs: ['new arbiter'],
        },
        {
            serviceFunctionName: 'updateShippingDeadline',
            serviceFunction: () => orderTradeService.updateShippingDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateShippingDeadline,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'updateDeliveryDeadline',
            serviceFunction: () => orderTradeService.updateDeliveryDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateDeliveryDeadline,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'confirmOrder',
            serviceFunction: () => orderTradeService.confirmOrder(),
            expectedMockedFunction: mockedOrderTradeDriver.confirmOrder,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getEmittedEvents',
            serviceFunction: () => orderTradeService.getEmittedEvents(),
            expectedMockedFunction: mockedOrderTradeDriver.getEmittedEvents,
            expectedMockedFunctionArgs: [],
        },
    ])('should call driver $serviceFunctionName', async ({
        serviceFunction,
        expectedMockedFunction,
        expectedMockedFunctionArgs,
    }) => {
        await serviceFunction();

        expect(expectedMockedFunction)
            .toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction)
            .toHaveBeenCalledWith(...expectedMockedFunctionArgs);
    });

    it('should get complete order trade from external storage', async () => {
        orderTradeService = new OrderTradeService({
            tradeDriver: mockedOrderTradeDriver,
            storageDocumentDriver: mockedStorageDocumentDriver,
            storageMetadataDriver: mockedStorageMetadataDriver,
        });
        mockedStorageMetadataDriver.read = jest.fn().mockResolvedValue({ incoterms: 'FOB', shipper: 'shipper', shippingPort: 'port', deliveryPort: 'port' });
        await orderTradeService.getCompleteTrade(metadataSpec);

        expect(mockedStorageMetadataDriver.read).toHaveBeenCalledTimes(1);
        expect(mockedStorageMetadataDriver.read).toHaveBeenNthCalledWith(1, OperationType.TRANSACTION, metadataSpec);
    });

    it('should get complete order trade retrieved from external storage - FAIL', async () => {
        orderTradeService = new OrderTradeService({
            tradeDriver: mockedOrderTradeDriver,
            storageDocumentDriver: mockedStorageDocumentDriver,
            storageMetadataDriver: mockedStorageMetadataDriver,
        });
        mockedStorageMetadataDriver.read = jest.fn().mockRejectedValueOnce(new Error('error'));

        const fn = async () => orderTradeService.getCompleteTrade(metadataSpec);
        await expect(fn).rejects.toThrowError(new Error('Error while retrieve order trade from external storage: error'));
    });

    it('should throw error if try to get complete order trade retrieved from external storage, without passing storage drivers to constructor', async () => {
        orderTradeService = new OrderTradeService({
            tradeDriver: mockedOrderTradeDriver,
        });
        const fn = async () => orderTradeService.getCompleteTrade(metadataSpec);
        await expect(fn).rejects.toThrowError(new Error('Storage metadata driver is not available'));
    });
});
