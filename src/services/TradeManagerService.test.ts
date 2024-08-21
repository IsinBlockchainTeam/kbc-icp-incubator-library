// import { createMock } from 'ts-auto-mock';
// import { FileHelpers } from '@blockchain-lib/common';
// import { TradeManagerService } from './TradeManagerService';
// import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
// import { BasicTrade, BasicTradeMetadata } from '../entities/BasicTrade';
// import { OrderTrade, OrderTradeMetadata } from '../entities/OrderTrade';
// import { NegotiationStatus } from '../types/NegotiationStatus';
// import { URLStructure } from '../types/URLStructure';
// import { ICPFileDriver } from '../drivers/ICPFileDriver';
// import { URL_SEGMENTS } from '../constants/ICP';
//
// describe('TradeManagerService', () => {
//     let tradeManagerService: TradeManagerService;
//
//     let mockedTradeManagerDriver: TradeManagerDriver;
//     const mockedInstance = {
//         registerBasicTrade: jest
//             .fn()
//             .mockResolvedValue([1, '0xcontract_address', 'transaction_hash']),
//         registerOrderTrade: jest
//             .fn()
//             .mockResolvedValue([1, '0xcontract_address', 'transaction_hash']),
//         getTradeCounter: jest.fn(),
//         getTrades: jest.fn(),
//         getTradesAndTypes: jest.fn(),
//         getTrade: jest.fn(),
//         getTradesByMaterial: jest.fn(),
//         getTradeType: jest.fn(),
//         getTradeIdsOfSupplier: jest.fn(),
//         getTradeIdsOfCommissioner: jest.fn()
//     };
//     const mockedIcpFileDriver: ICPFileDriver = createMock<ICPFileDriver>({
//         create: jest.fn()
//     });
//
//     const basicTrade: BasicTrade = new BasicTrade(
//         1,
//         'supplier',
//         'customer',
//         'commissioner',
//         'externalUrl',
//         [],
//         'name'
//     );
//     const orderTrade: OrderTrade = new OrderTrade(
//         1,
//         'supplier',
//         'customer',
//         'commissioner',
//         'externalUrl',
//         [],
//         true,
//         false,
//         1000,
//         2000,
//         'arbiter',
//         3000,
//         4000,
//         NegotiationStatus.PENDING,
//         300,
//         'tokenAddress'
//     );
//     const agreedAmount: number = 1000;
//     const tokenAddress: string = 'tokenAddress';
//     const basicTradeMetadata: BasicTradeMetadata = { issueDate: new Date() };
//     const orderTradeMetadata: OrderTradeMetadata = {
//         incoterms: 'incoterms',
//         shipper: 'shipper',
//         shippingPort: 'shippingPort',
//         deliveryPort: 'deliveryPort'
//     };
//     const urlStructure: URLStructure = {
//         prefix: 'prefix',
//         organizationId: 1
//     };
//     const delegatedOrganizationIds: number[] = [1, 2];
//
//     describe('Without storage driver', () => {
//         beforeAll(() => {
//             mockedTradeManagerDriver = createMock<TradeManagerDriver>(mockedInstance);
//
//             tradeManagerService = new TradeManagerService({
//                 tradeManagerDriver: mockedTradeManagerDriver
//             });
//         });
//
//         afterAll(() => jest.restoreAllMocks());
//
//         it.each([
//             {
//                 serviceFunctionName: 'getTradeCounter',
//                 serviceFunction: () => tradeManagerService.getTradeCounter(),
//                 expectedMockedFunction: mockedInstance.getTradeCounter,
//                 expectedMockedFunctionArgs: []
//             },
//             {
//                 serviceFunctionName: 'getTrades',
//                 serviceFunction: () => tradeManagerService.getTrades(),
//                 expectedMockedFunction: mockedInstance.getTrades,
//                 expectedMockedFunctionArgs: []
//             },
//             {
//                 serviceFunctionName: 'getTradesAndTypes',
//                 serviceFunction: () => tradeManagerService.getTradesAndTypes(),
//                 expectedMockedFunction: mockedInstance.getTradesAndTypes,
//                 expectedMockedFunctionArgs: []
//             },
//             {
//                 serviceFunctionName: 'getTrade',
//                 serviceFunction: () => tradeManagerService.getTrade(basicTrade.tradeId),
//                 expectedMockedFunction: mockedInstance.getTrade,
//                 expectedMockedFunctionArgs: [basicTrade.tradeId]
//             },
//             {
//                 serviceFunctionName: 'getTradeType',
//                 serviceFunction: () => tradeManagerService.getTradeType(basicTrade.tradeId),
//                 expectedMockedFunction: mockedInstance.getTradeType,
//                 expectedMockedFunctionArgs: [basicTrade.tradeId]
//             },
//             {
//                 serviceFunctionName: 'getTradesByMaterial',
//                 serviceFunction: () => tradeManagerService.getTradesByMaterial(basicTrade.tradeId),
//                 expectedMockedFunction: mockedInstance.getTradesByMaterial,
//                 expectedMockedFunctionArgs: [basicTrade.tradeId]
//             },
//             {
//                 serviceFunctionName: 'getTradeIdsOfSupplier',
//                 serviceFunction: () =>
//                     tradeManagerService.getTradeIdsOfSupplier(basicTrade.supplier),
//                 expectedMockedFunction: mockedInstance.getTradeIdsOfSupplier,
//                 expectedMockedFunctionArgs: [basicTrade.supplier]
//             },
//             {
//                 serviceFunctionName: 'getTradeIdsOfCommissioner',
//                 serviceFunction: () =>
//                     tradeManagerService.getTradeIdsOfCommissioner(basicTrade.commissioner),
//                 expectedMockedFunction: mockedInstance.getTradeIdsOfCommissioner,
//                 expectedMockedFunctionArgs: [basicTrade.commissioner]
//             }
//         ])(
//             'service should call driver $serviceFunctionName',
//             async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
//                 await serviceFunction();
//
//                 expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
//                 expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
//             }
//         );
//     });
//
//     describe('With storage driver', () => {
//         beforeAll(() => {
//             mockedTradeManagerDriver = createMock<TradeManagerDriver>(mockedInstance);
//             tradeManagerService = new TradeManagerService({
//                 tradeManagerDriver: mockedTradeManagerDriver,
//                 icpFileDriver: mockedIcpFileDriver
//             });
//         });
//
//         afterAll(() => jest.restoreAllMocks());
//
//         it.each([
//             {
//                 serviceFunctionName: 'registerBasicTrade',
//                 serviceFunction: () =>
//                     tradeManagerService.registerBasicTrade(
//                         basicTrade.supplier,
//                         basicTrade.customer,
//                         basicTrade.commissioner,
//                         basicTrade.name,
//                         basicTradeMetadata,
//                         urlStructure,
//                         delegatedOrganizationIds
//                     ),
//                 expectedMockedFunction: mockedIcpFileDriver.create,
//                 expectedMockedFunctionArgs: [
//                     FileHelpers.getBytesFromObject(basicTradeMetadata),
//                     {
//                         name: `${
//                             FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
//                             URL_SEGMENTS.ORGANIZATION +
//                             urlStructure.organizationId
//                         }/${URL_SEGMENTS.TRANSACTION}${1}/${URL_SEGMENTS.FILE}metadata.json`,
//                         type: 'application/json'
//                     },
//                     delegatedOrganizationIds
//                 ]
//             },
//             {
//                 serviceFunctionName: 'registerOrderTrade',
//                 serviceFunction: () =>
//                     tradeManagerService.registerOrderTrade(
//                         orderTrade.supplier,
//                         orderTrade.customer,
//                         orderTrade.commissioner,
//                         orderTrade.paymentDeadline,
//                         orderTrade.documentDeliveryDeadline,
//                         orderTrade.arbiter,
//                         orderTrade.shippingDeadline,
//                         orderTrade.deliveryDeadline,
//                         agreedAmount,
//                         tokenAddress,
//                         orderTradeMetadata,
//                         urlStructure,
//                         delegatedOrganizationIds
//                     ),
//                 expectedMockedFunction: mockedIcpFileDriver.create,
//                 expectedMockedFunctionArgs: [
//                     FileHelpers.getBytesFromObject(orderTradeMetadata),
//                     {
//                         name: `${
//                             FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
//                             URL_SEGMENTS.ORGANIZATION +
//                             urlStructure.organizationId
//                         }/${URL_SEGMENTS.TRANSACTION}${1}/${URL_SEGMENTS.FILE}metadata.json`,
//                         type: 'application/json'
//                     },
//                     delegatedOrganizationIds
//                 ]
//             }
//         ])(
//             'service should call driver $serviceFunctionName',
//             async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
//                 await serviceFunction();
//
//                 expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
//                 expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
//             }
//         );
//     });
//
//     it('should fail to register a trade without storage driver', async () => {
//         tradeManagerService = new TradeManagerService({
//             tradeManagerDriver: mockedTradeManagerDriver
//         });
//
//         await expect(
//             tradeManagerService.registerBasicTrade(
//                 basicTrade.supplier,
//                 basicTrade.customer,
//                 basicTrade.commissioner,
//                 basicTrade.name,
//                 basicTradeMetadata,
//                 urlStructure,
//                 delegatedOrganizationIds
//             )
//         ).rejects.toThrow(new Error('TradeManagerService: ICPFileDriver has not been set'));
//
//         await expect(
//             tradeManagerService.registerOrderTrade(
//                 orderTrade.supplier,
//                 orderTrade.customer,
//                 orderTrade.commissioner,
//                 orderTrade.paymentDeadline,
//                 orderTrade.documentDeliveryDeadline,
//                 orderTrade.arbiter,
//                 orderTrade.shippingDeadline,
//                 orderTrade.deliveryDeadline,
//                 agreedAmount,
//                 tokenAddress,
//                 orderTradeMetadata,
//                 urlStructure,
//                 delegatedOrganizationIds
//             )
//         ).rejects.toThrow(new Error('TradeManagerService: ICPFileDriver has not been set'));
//     });
// });
