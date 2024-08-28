import { createMock } from 'ts-auto-mock';
import { FileHelpers } from '@blockchain-lib/common';
import { TradeManagerService } from './TradeManagerService';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { BasicTrade, BasicTradeMetadata } from '../entities/BasicTrade';
import { OrderTrade, OrderTradeMetadata } from '../entities/OrderTrade';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { URLStructure } from '../types/URLStructure';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { URL_SEGMENTS } from '../constants/ICP';
import { RoleProof } from '../types/RoleProof';

describe('TradeManagerService', () => {
    let tradeManagerService: TradeManagerService;

    let mockedTradeManagerDriver: TradeManagerDriver;
    const mockedInstance = {
        registerBasicTrade: jest
            .fn()
            .mockResolvedValue([1, '0xcontract_address', 'transaction_hash']),
        registerOrderTrade: jest
            .fn()
            .mockResolvedValue([1, '0xcontract_address', 'transaction_hash']),
        getTradeCounter: jest.fn(),
        getTrades: jest.fn(),
        getTradesAndTypes: jest.fn(),
        getTrade: jest.fn(),
        getTradesByMaterial: jest.fn(),
        getTradeType: jest.fn(),
        getTradeIdsOfSupplier: jest.fn(),
        getTradeIdsOfCommissioner: jest.fn()
    };
    const mockedIcpFileDriver: ICPFileDriver = createMock<ICPFileDriver>({
        create: jest.fn()
    });

    const basicTrade: BasicTrade = new BasicTrade(
        1,
        'supplier',
        'customer',
        'commissioner',
        'externalUrl',
        [],
        'name'
    );
    const orderTrade: OrderTrade = new OrderTrade(
        1,
        'supplier',
        'customer',
        'commissioner',
        'externalUrl',
        [],
        true,
        false,
        1000,
        2000,
        'arbiter',
        3000,
        4000,
        NegotiationStatus.PENDING,
        300,
        'tokenAddress'
    );
    const agreedAmount: number = 1000;
    const tokenAddress: string = 'tokenAddress';
    const basicTradeMetadata: BasicTradeMetadata = { issueDate: new Date() };
    const orderTradeMetadata: OrderTradeMetadata = {
        incoterms: 'incoterms',
        shipper: 'shipper',
        shippingPort: 'shippingPort',
        deliveryPort: 'deliveryPort'
    };
    const urlStructure: URLStructure = {
        prefix: 'prefix',
        organizationId: 1
    };
    const delegatedOrganizationIds: number[] = [1, 2];

    const roleProof: RoleProof = {
        signedProof: 'signedProof',
        delegator: 'delegator'
    };

    describe('Without storage driver', () => {
        beforeAll(() => {
            mockedTradeManagerDriver = createMock<TradeManagerDriver>(mockedInstance);

            tradeManagerService = new TradeManagerService({
                tradeManagerDriver: mockedTradeManagerDriver
            });
        });

        afterAll(() => jest.restoreAllMocks());

        it.each([
            {
                serviceFunctionName: 'getTradeCounter',
                serviceFunction: () => tradeManagerService.getTradeCounter(roleProof),
                expectedMockedFunction: mockedInstance.getTradeCounter,
                expectedMockedFunctionArgs: [roleProof]
            },
            {
                serviceFunctionName: 'getTrades',
                serviceFunction: () => tradeManagerService.getTrades(roleProof),
                expectedMockedFunction: mockedInstance.getTrades,
                expectedMockedFunctionArgs: [roleProof]
            },
            {
                serviceFunctionName: 'getTradesAndTypes',
                serviceFunction: () => tradeManagerService.getTradesAndTypes(roleProof),
                expectedMockedFunction: mockedInstance.getTradesAndTypes,
                expectedMockedFunctionArgs: [roleProof]
            },
            {
                serviceFunctionName: 'getTrade',
                serviceFunction: () => tradeManagerService.getTrade(roleProof, basicTrade.tradeId),
                expectedMockedFunction: mockedInstance.getTrade,
                expectedMockedFunctionArgs: [roleProof, basicTrade.tradeId]
            },
            {
                serviceFunctionName: 'getTradeType',
                serviceFunction: () =>
                    tradeManagerService.getTradeType(roleProof, basicTrade.tradeId),
                expectedMockedFunction: mockedInstance.getTradeType,
                expectedMockedFunctionArgs: [roleProof, basicTrade.tradeId]
            },
            {
                serviceFunctionName: 'getTradesByMaterial',
                serviceFunction: () =>
                    tradeManagerService.getTradesByMaterial(roleProof, basicTrade.tradeId),
                expectedMockedFunction: mockedInstance.getTradesByMaterial,
                expectedMockedFunctionArgs: [roleProof, basicTrade.tradeId]
            },
            {
                serviceFunctionName: 'getTradeIdsOfSupplier',
                serviceFunction: () =>
                    tradeManagerService.getTradeIdsOfSupplier(roleProof, basicTrade.supplier),
                expectedMockedFunction: mockedInstance.getTradeIdsOfSupplier,
                expectedMockedFunctionArgs: [roleProof, basicTrade.supplier]
            },
            {
                serviceFunctionName: 'getTradeIdsOfCommissioner',
                serviceFunction: () =>
                    tradeManagerService.getTradeIdsOfCommissioner(
                        roleProof,
                        basicTrade.commissioner
                    ),
                expectedMockedFunction: mockedInstance.getTradeIdsOfCommissioner,
                expectedMockedFunctionArgs: [roleProof, basicTrade.commissioner]
            }
        ])(
            'service should call driver $serviceFunctionName',
            async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
                await serviceFunction();

                expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
                expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
            }
        );
    });

    describe('With storage driver', () => {
        beforeAll(() => {
            mockedTradeManagerDriver = createMock<TradeManagerDriver>(mockedInstance);
            tradeManagerService = new TradeManagerService({
                tradeManagerDriver: mockedTradeManagerDriver,
                icpFileDriver: mockedIcpFileDriver
            });
        });

        afterAll(() => jest.restoreAllMocks());

        it.each([
            {
                serviceFunctionName: 'registerBasicTrade',
                serviceFunction: () =>
                    tradeManagerService.registerBasicTrade(
                        roleProof,
                        basicTrade.supplier,
                        basicTrade.customer,
                        basicTrade.commissioner,
                        basicTrade.name,
                        basicTradeMetadata,
                        urlStructure,
                        delegatedOrganizationIds
                    ),
                expectedMockedFunction: mockedIcpFileDriver.create,
                expectedMockedFunctionArgs: [
                    FileHelpers.getBytesFromObject(basicTradeMetadata),
                    {
                        name: `${
                            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
                            URL_SEGMENTS.ORGANIZATION +
                            urlStructure.organizationId
                        }/${URL_SEGMENTS.TRANSACTION}${1}/${URL_SEGMENTS.FILE}metadata.json`,
                        type: 'application/json'
                    },
                    delegatedOrganizationIds
                ]
            },
            {
                serviceFunctionName: 'registerOrderTrade',
                serviceFunction: () =>
                    tradeManagerService.registerOrderTrade(
                        roleProof,
                        orderTrade.supplier,
                        orderTrade.customer,
                        orderTrade.commissioner,
                        orderTrade.paymentDeadline,
                        orderTrade.documentDeliveryDeadline,
                        orderTrade.arbiter,
                        orderTrade.shippingDeadline,
                        orderTrade.deliveryDeadline,
                        agreedAmount,
                        tokenAddress,
                        orderTradeMetadata,
                        urlStructure,
                        delegatedOrganizationIds
                    ),
                expectedMockedFunction: mockedIcpFileDriver.create,
                expectedMockedFunctionArgs: [
                    FileHelpers.getBytesFromObject(orderTradeMetadata),
                    {
                        name: `${
                            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
                            URL_SEGMENTS.ORGANIZATION +
                            urlStructure.organizationId
                        }/${URL_SEGMENTS.TRANSACTION}${1}/${URL_SEGMENTS.FILE}metadata.json`,
                        type: 'application/json'
                    },
                    delegatedOrganizationIds
                ]
            }
        ])(
            'service should call driver $serviceFunctionName',
            async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
                await serviceFunction();

                expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
                expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
            }
        );
    });

    it('should fail to register a trade without storage driver', async () => {
        tradeManagerService = new TradeManagerService({
            tradeManagerDriver: mockedTradeManagerDriver
        });

        await expect(
            tradeManagerService.registerBasicTrade(
                roleProof,
                basicTrade.supplier,
                basicTrade.customer,
                basicTrade.commissioner,
                basicTrade.name,
                basicTradeMetadata,
                urlStructure,
                delegatedOrganizationIds
            )
        ).rejects.toThrow(new Error('TradeManagerService: ICPFileDriver has not been set'));

        await expect(
            tradeManagerService.registerOrderTrade(
                roleProof,
                orderTrade.supplier,
                orderTrade.customer,
                orderTrade.commissioner,
                orderTrade.paymentDeadline,
                orderTrade.documentDeliveryDeadline,
                orderTrade.arbiter,
                orderTrade.shippingDeadline,
                orderTrade.deliveryDeadline,
                agreedAmount,
                tokenAddress,
                orderTradeMetadata,
                urlStructure,
                delegatedOrganizationIds
            )
        ).rejects.toThrow(new Error('TradeManagerService: ICPFileDriver has not been set'));
    });
});
