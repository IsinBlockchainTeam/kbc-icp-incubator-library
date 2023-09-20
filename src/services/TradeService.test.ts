describe('OrderService', () => {
    // const supplier = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    // const customer = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
    // const externalUrl = 'https://externalurl.com';
    //
    // const productCategory = 'categoryA';
    // const quantity = 100;
    // const price = new OrderLinePrice(100.25, 'CHF');
    // const orderLine = new OrderLine(0, productCategory, quantity, price);
    // const deadline = new Date('2030-10-10');
    //
    // const mockedOrderDriver: TradeDriver = createMock<TradeDriver>({
    //     registerTrade: jest.fn(),
    //     addOrderLines: jest.fn(),
    //     getTradeCounter: jest.fn(),
    //     setOrderIncoterms: jest.fn(),
    //     setOrderPaymentDeadline: jest.fn(),
    //     setOrderDocumentDeliveryDeadline: jest.fn(),
    //     setOrderShipper: jest.fn(),
    //     setOrderArbiter: jest.fn(),
    //     setOrderShippingPort: jest.fn(),
    //     setOrderShippingDeadline: jest.fn(),
    //     setOrderDeliveryPort: jest.fn(),
    //     setOrderDeliveryDeadline: jest.fn(),
    //     getOrderInfo: jest.fn(),
    //     isSupplierOrCustomer: jest.fn(),
    //     orderExists: jest.fn(),
    //     getNegotiationStatus: jest.fn(),
    //     confirmOrder: jest.fn(),
    //     addDocument: jest.fn(),
    //     getTradeLine: jest.fn(),
    //     addOrderLine: jest.fn(),
    //     updateOrderLine: jest.fn(),
    //     getBlockNumbersByTradeId: jest.fn(),
    //     addAdmin: jest.fn(),
    //     removeAdmin: jest.fn(),
    // });
    //
    // const orderService = new TradeService(
    //     mockedOrderDriver,
    // );
    //
    // afterAll(() => {
    //     jest.restoreAllMocks();
    // });
    //
    // it.each([
    //     {
    //         serviceFunctionName: 'registerTrade',
    //         serviceFunction: () => orderService.registerTrade(supplier, customer, customer, externalUrl),
    //         expectedMockedFunction: mockedOrderDriver.registerTrade,
    //         expectedMockedFunctionArgs: [supplier, customer, customer, externalUrl],
    //     },
    //     {
    //         serviceFunctionName: 'addOrderLines',
    //         serviceFunction: () => orderService.addOrderLines(supplier, 1, [orderLine]),
    //         expectedMockedFunction: mockedOrderDriver.addOrderLines,
    //         expectedMockedFunctionArgs: [supplier, 1, [orderLine]],
    //     },
    //     {
    //         serviceFunctionName: 'getTradeCounter',
    //         serviceFunction: () => orderService.getTradeCounter(supplier),
    //         expectedMockedFunction: mockedOrderDriver.getTradeCounter,
    //         expectedMockedFunctionArgs: [supplier],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderIncoterms',
    //         serviceFunction: () => orderService.setOrderIncoterms(supplier, 1, 'FOB'),
    //         expectedMockedFunction: mockedOrderDriver.setOrderIncoterms,
    //         expectedMockedFunctionArgs: [supplier, 1, 'FOB'],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderPaymentDeadline',
    //         serviceFunction: () => orderService.setOrderPaymentDeadline(supplier, 1, deadline),
    //         expectedMockedFunction: mockedOrderDriver.setOrderPaymentDeadline,
    //         expectedMockedFunctionArgs: [supplier, 1, deadline],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderDocumentDeliveryDeadline',
    //         serviceFunction: () => orderService.setOrderDocumentDeliveryDeadline(supplier, 1, deadline),
    //         expectedMockedFunction: mockedOrderDriver.setOrderDocumentDeliveryDeadline,
    //         expectedMockedFunctionArgs: [supplier, 1, deadline],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderShipper',
    //         serviceFunction: () => orderService.setOrderShipper(supplier, 1, 'shipper'),
    //         expectedMockedFunction: mockedOrderDriver.setOrderShipper,
    //         expectedMockedFunctionArgs: [supplier, 1, 'shipper'],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderArbiter',
    //         serviceFunction: () => orderService.setOrderArbiter(supplier, 1, 'arbiter'),
    //         expectedMockedFunction: mockedOrderDriver.setOrderArbiter,
    //         expectedMockedFunctionArgs: [supplier, 1, 'arbiter'],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderShippingPort',
    //         serviceFunction: () => orderService.setOrderShippingPort(supplier, 1, 'shipping port'),
    //         expectedMockedFunction: mockedOrderDriver.setOrderShippingPort,
    //         expectedMockedFunctionArgs: [supplier, 1, 'shipping port'],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderShippingDeadline',
    //         serviceFunction: () => orderService.setOrderShippingDeadline(supplier, 1, deadline),
    //         expectedMockedFunction: mockedOrderDriver.setOrderShippingDeadline,
    //         expectedMockedFunctionArgs: [supplier, 1, deadline],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderDeliveryPort',
    //         serviceFunction: () => orderService.setOrderDeliveryPort(supplier, 1, 'delivery port'),
    //         expectedMockedFunction: mockedOrderDriver.setOrderDeliveryPort,
    //         expectedMockedFunctionArgs: [supplier, 1, 'delivery port'],
    //     },
    //     {
    //         serviceFunctionName: 'setOrderDeliveryDeadline',
    //         serviceFunction: () => orderService.setOrderDeliveryDeadline(supplier, 1, deadline),
    //         expectedMockedFunction: mockedOrderDriver.setOrderDeliveryDeadline,
    //         expectedMockedFunctionArgs: [supplier, 1, deadline],
    //     },
    //     {
    //         serviceFunctionName: 'getOrderInfo',
    //         serviceFunction: () => orderService.getOrderInfo(supplier, 0),
    //         expectedMockedFunction: mockedOrderDriver.getOrderInfo,
    //         expectedMockedFunctionArgs: [supplier, 0, undefined],
    //     },
    //     {
    //         serviceFunctionName: 'getOrderInfo',
    //         serviceFunction: () => orderService.getOrderInfo(supplier, 0, 20),
    //         expectedMockedFunction: mockedOrderDriver.getOrderInfo,
    //         expectedMockedFunctionArgs: [supplier, 0, 20],
    //     },
    //     {
    //         serviceFunctionName: 'isSupplierOrCustomer',
    //         serviceFunction: () => orderService.isSupplierOrCustomer(supplier, 0, customer),
    //         expectedMockedFunction: mockedOrderDriver.isSupplierOrCustomer,
    //         expectedMockedFunctionArgs: [supplier, 0, customer],
    //     },
    //     {
    //         serviceFunctionName: 'orderExists',
    //         serviceFunction: () => orderService.orderExists(supplier, 0),
    //         expectedMockedFunction: mockedOrderDriver.orderExists,
    //         expectedMockedFunctionArgs: [supplier, 0],
    //     },
    //     {
    //         serviceFunctionName: 'getNegotiationStatus',
    //         serviceFunction: () => orderService.getNegotiationStatus(supplier, 0),
    //         expectedMockedFunction: mockedOrderDriver.getNegotiationStatus,
    //         expectedMockedFunctionArgs: [supplier, 0],
    //     },
    //     {
    //         serviceFunctionName: 'confirmOrder',
    //         serviceFunction: () => orderService.confirmOrder(supplier, 0),
    //         expectedMockedFunction: mockedOrderDriver.confirmOrder,
    //         expectedMockedFunctionArgs: [supplier, 0],
    //     },
    //     {
    //         serviceFunctionName: 'addDocument',
    //         serviceFunction: () => orderService.addDocument(supplier, 0, 'status', 'doc name', 'doc type', externalUrl),
    //         expectedMockedFunction: mockedOrderDriver.addDocument,
    //         expectedMockedFunctionArgs: [supplier, 0, 'status', 'doc name', 'doc type', externalUrl],
    //     },
    //     {
    //         serviceFunctionName: 'getTradeLine',
    //         serviceFunction: () => orderService.getTradeLine(supplier, 0, 0),
    //         expectedMockedFunction: mockedOrderDriver.getTradeLine,
    //         expectedMockedFunctionArgs: [supplier, 0, 0, undefined],
    //     },
    //     {
    //         serviceFunctionName: 'getTradeLine',
    //         serviceFunction: () => orderService.getTradeLine(supplier, 0, 0, 25),
    //         expectedMockedFunction: mockedOrderDriver.getTradeLine,
    //         expectedMockedFunctionArgs: [supplier, 0, 0, 25],
    //     },
    //     {
    //         serviceFunctionName: 'addOrderLine',
    //         serviceFunction: () => orderService.addOrderLine(supplier, 0, productCategory, quantity, price),
    //         expectedMockedFunction: mockedOrderDriver.addOrderLine,
    //         expectedMockedFunctionArgs: [supplier, 0, productCategory, quantity, price],
    //     },
    //     {
    //         serviceFunctionName: 'updateOrderLine',
    //         serviceFunction: () => orderService.updateOrderLine(supplier, 0, 0, productCategory, quantity, price),
    //         expectedMockedFunction: mockedOrderDriver.updateOrderLine,
    //         expectedMockedFunctionArgs: [supplier, 0, 0, productCategory, quantity, price],
    //     },
    //     {
    //         serviceFunctionName: 'getBlockNumbersByOrderId',
    //         serviceFunction: () => orderService.getBlockNumbersByOrderId(1),
    //         expectedMockedFunction: mockedOrderDriver.getBlockNumbersByTradeId,
    //         expectedMockedFunctionArgs: [1],
    //     },
    //     {
    //         serviceFunctionName: 'addAdmin',
    //         serviceFunction: () => orderService.addAdmin('testAddress'),
    //         expectedMockedFunction: mockedOrderDriver.addAdmin,
    //         expectedMockedFunctionArgs: ['testAddress'],
    //     },
    //     {
    //         serviceFunctionName: 'removeAdmin',
    //         serviceFunction: () => orderService.removeAdmin('testAddress'),
    //         expectedMockedFunction: mockedOrderDriver.removeAdmin,
    //         expectedMockedFunctionArgs: ['testAddress'],
    //     },
    // ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
    //     await serviceFunction();
    //
    //     expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
    //     expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    // });
    //
    // it('should get all orders', async () => {
    //     const address = 'testAddress';
    //     mockedOrderDriver.getTradeCounter = jest.fn().mockResolvedValue(2);
    //     await orderService.getOrders(address);
    //
    //     expect(mockedOrderDriver.getTradeCounter).toHaveBeenCalledTimes(1);
    //     expect(mockedOrderDriver.getTradeCounter).toHaveBeenNthCalledWith(1, address);
    //
    //     expect(mockedOrderDriver.getOrderInfo).toHaveBeenCalledTimes(2);
    //     expect(mockedOrderDriver.getOrderInfo).toHaveBeenNthCalledWith(1, address, 1, undefined);
    //     expect(mockedOrderDriver.getOrderInfo).toHaveBeenNthCalledWith(2, address, 2, undefined);
    // });
    //
    // it('should get all order lines', async () => {
    //     const address = 'testAddress';
    //     mockedOrderDriver.getOrderInfo = jest.fn().mockResolvedValue({ lineIds: [1, 2] });
    //     await orderService.getOrderLines(address, 1);
    //
    //     expect(mockedOrderDriver.getOrderInfo).toHaveBeenCalledTimes(1);
    //     expect(mockedOrderDriver.getOrderInfo).toHaveBeenNthCalledWith(1, address, 1, undefined);
    //
    //     expect(mockedOrderDriver.getTradeLine).toHaveBeenCalledTimes(2);
    //     expect(mockedOrderDriver.getTradeLine).toHaveBeenNthCalledWith(1, address, 1, 1, undefined);
    //     expect(mockedOrderDriver.getTradeLine).toHaveBeenNthCalledWith(2, address, 1, 2, undefined);
    // });
});
