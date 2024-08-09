import { createMock } from 'ts-auto-mock';
import { TextEncoder } from 'util';
import { OrderTradeDriver } from '../drivers/OrderTradeDriver';
import { OrderLine, OrderLinePrice, OrderLineRequest, OrderTrade } from '../entities/OrderTrade';
import { OrderTradeService } from './OrderTradeService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { ProductCategory } from '../entities/ProductCategory';
import { Material } from '../entities/Material';

describe('OrderTradeService', () => {
    const externalUrl = 'externalUrl';
    const mockedOrderTradeDriver: OrderTradeDriver = createMock<OrderTradeDriver>({
        getTrade: jest.fn().mockResolvedValue(
            createMock<OrderTrade>({
                externalUrl
            })
        ),
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
        haveDeadlinesExpired: jest.fn(),
        enforceDeadlines: jest.fn(),
        confirmOrder: jest.fn(),
        getEmittedEvents: jest.fn()
    });
    const mockedDocumentDriver: DocumentDriver = createMock<DocumentDriver>({
        getDocumentById: jest.fn()
    });
    const mockedIcpFileDriver: ICPFileDriver = createMock<ICPFileDriver>({
        create: jest.fn()
    });
    const units = ['kg', 'g', 'l', 'm'];
    const productCategory = new ProductCategory(1, 'category', 85, 'description');
    const material = new Material(1, productCategory);
    const orderLinePrice = new OrderLinePrice(10, 'usd');

    let orderTradeService = new OrderTradeService(
        mockedOrderTradeDriver,
        mockedDocumentDriver,
        mockedIcpFileDriver
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getTrade',
            serviceFunction: () => orderTradeService.getTrade(),
            expectedMockedFunction: mockedOrderTradeDriver.getTrade,
            expectedMockedFunctionArgs: [undefined]
        },
        {
            serviceFunctionName: 'getLines',
            serviceFunction: () => orderTradeService.getLines(),
            expectedMockedFunction: mockedOrderTradeDriver.getLines,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getLine',
            serviceFunction: () => orderTradeService.getLine(1),
            expectedMockedFunction: mockedOrderTradeDriver.getLine,
            expectedMockedFunctionArgs: [1, undefined]
        },
        {
            serviceFunctionName: 'addLine',
            serviceFunction: () =>
                orderTradeService.addLine(new OrderLineRequest(1, 10, units[0], orderLinePrice)),
            expectedMockedFunction: mockedOrderTradeDriver.addLine,
            expectedMockedFunctionArgs: [new OrderLineRequest(1, 10, units[0], orderLinePrice)]
        },
        {
            serviceFunctionName: 'updateLine',
            serviceFunction: () =>
                orderTradeService.updateLine(
                    new OrderLine(1, material, productCategory, 10, units[1], orderLinePrice)
                ),
            expectedMockedFunction: mockedOrderTradeDriver.updateLine,
            expectedMockedFunctionArgs: [
                new OrderLine(1, material, productCategory, 10, units[1], orderLinePrice)
            ]
        },
        {
            serviceFunctionName: 'assignMaterial',
            serviceFunction: () => orderTradeService.assignMaterial(1, 1),
            expectedMockedFunction: mockedOrderTradeDriver.assignMaterial,
            expectedMockedFunctionArgs: [1, 1]
        },
        {
            serviceFunctionName: 'getNegotiationStatus',
            serviceFunction: () => orderTradeService.getNegotiationStatus(),
            expectedMockedFunction: mockedOrderTradeDriver.getNegotiationStatus,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'updatePaymentDeadline',
            serviceFunction: () => orderTradeService.updatePaymentDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updatePaymentDeadline,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'updateDocumentDeliveryDeadline',
            serviceFunction: () => orderTradeService.updateDocumentDeliveryDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateDocumentDeliveryDeadline,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'updateArbiter',
            serviceFunction: () => orderTradeService.updateArbiter('new arbiter'),
            expectedMockedFunction: mockedOrderTradeDriver.updateArbiter,
            expectedMockedFunctionArgs: ['new arbiter']
        },
        {
            serviceFunctionName: 'updateShippingDeadline',
            serviceFunction: () => orderTradeService.updateShippingDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateShippingDeadline,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'updateDeliveryDeadline',
            serviceFunction: () => orderTradeService.updateDeliveryDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateDeliveryDeadline,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'updateAgreedAmount',
            serviceFunction: () => orderTradeService.updateAgreedAmount(200),
            expectedMockedFunction: mockedOrderTradeDriver.updateAgreedAmount,
            expectedMockedFunctionArgs: [200]
        },
        {
            serviceFunctionName: 'updateTokenAddress',
            serviceFunction: () => orderTradeService.updateTokenAddress('token'),
            expectedMockedFunction: mockedOrderTradeDriver.updateTokenAddress,
            expectedMockedFunctionArgs: ['token']
        },
        {
            serviceFunctionName: 'haveDeadlinesExpired',
            serviceFunction: () => orderTradeService.haveDeadlinesExpired(),
            expectedMockedFunction: mockedOrderTradeDriver.haveDeadlinesExpired,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'enforceDeadlines',
            serviceFunction: () => orderTradeService.enforceDeadlines(),
            expectedMockedFunction: mockedOrderTradeDriver.enforceDeadlines,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'confirmOrder',
            serviceFunction: () => orderTradeService.confirmOrder(),
            expectedMockedFunction: mockedOrderTradeDriver.confirmOrder,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getWhoSigned',
            serviceFunction: () => orderTradeService.getWhoSigned(),
            expectedMockedFunction: mockedOrderTradeDriver.getWhoSigned,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getEmittedEvents',
            serviceFunction: () => orderTradeService.getEmittedEvents(),
            expectedMockedFunction: mockedOrderTradeDriver.getEmittedEvents,
            expectedMockedFunctionArgs: []
        }
    ])(
        'should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
        }
    );

    it('should get complete order trade from external storage', async () => {
        orderTradeService = new OrderTradeService(
            mockedOrderTradeDriver,
            mockedDocumentDriver,
            mockedIcpFileDriver
        );
        mockedIcpFileDriver.read = jest.fn().mockResolvedValue(
            new TextEncoder().encode(
                JSON.stringify({
                    incoterms: 'FOB',
                    shipper: 'shipper',
                    shippingPort: 'port',
                    deliveryPort: 'port'
                })
            )
        );
        await orderTradeService.getCompleteTrade();

        expect(mockedOrderTradeDriver.getTrade).toHaveBeenCalledTimes(1);
        expect(mockedIcpFileDriver.read).toHaveBeenCalledTimes(1);
        expect(mockedIcpFileDriver.read).toHaveBeenNthCalledWith(
            1,
            `${externalUrl}/files/metadata.json`
        );
    });

    it('should throw error if try to get complete order trade retrieved from external storage, without passing storage drivers to constructor', async () => {
        orderTradeService = new OrderTradeService(mockedOrderTradeDriver);
        const fn = async () => orderTradeService.getCompleteTrade();
        await expect(fn).rejects.toThrow(
            new Error('OrderTradeService: ICPFileDriver has not been set')
        );
    });
});
