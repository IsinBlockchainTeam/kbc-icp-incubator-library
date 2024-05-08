import { createMock } from 'ts-auto-mock';
import { SolidStorageACR } from '@blockchain-lib/common';
import { TradeManagerService } from './TradeManagerService';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { BasicTrade } from '../entities/BasicTrade';

import { OrderTradeInfo } from '../entities/OrderTradeInfo';
import { IStorageMetadataDriver } from '../drivers/IStorageMetadataDriver';
import { SolidMetadataSpec } from '../drivers/SolidMetadataDriver';
import { NegotiationStatus } from '../types/NegotiationStatus';

describe('TradeManagerService', () => {
    let tradeManagerService: TradeManagerService<SolidMetadataSpec, SolidStorageACR>;

    let mockedTradeManagerDriver: TradeManagerDriver;
    let mockedStorageMetadataDriver: IStorageMetadataDriver<SolidMetadataSpec, SolidStorageACR>;
    const mockedInstance = {
        registerBasicTrade: jest.fn(),
        registerOrderTrade: jest.fn(),
        getTradeCounter: jest.fn(),
        getTrades: jest.fn(),
        getTradesAndTypes: jest.fn(),
        getTrade: jest.fn(),
        getTradesByMaterial: jest.fn(),
        getTradeType: jest.fn(),
        getTradeIdsOfSupplier: jest.fn(),
        getTradeIdsOfCommissioner: jest.fn(),
    };
    const mockedStorageMetadataInstance = {
        create: jest.fn(),
    };

    const basicTrade: BasicTrade = new BasicTrade(1, 'supplier', 'customer', 'commissioner', 'externalUrl', [], 'name');
    const orderTrade: OrderTradeInfo = new OrderTradeInfo(1, 'supplier', 'customer', 'commissioner', 'externalUrl', [], true, false, 1000, 2000, 'arbiter', 3000, 4000, NegotiationStatus.PENDING, 200, 'tokenAddr', 'tokenAddress');
    const agreedAmount: number = 1000;
    const tokenAddress: string = 'tokenAddress';
    const metadata = { metadata: 'metadata' };
    const metadataSpec = {
        bcResourceId: 'bcResourceId',
    };

    describe('Without storage metadata driver', () => {
        beforeAll(() => {
            mockedTradeManagerDriver = createMock<TradeManagerDriver>(mockedInstance);

            tradeManagerService = new TradeManagerService(mockedTradeManagerDriver);
        });

        afterAll(() => jest.restoreAllMocks());

        it.each([
            {
                serviceFunctionName: 'registerBasicTrade',
                serviceFunction: () => tradeManagerService.registerBasicTrade(basicTrade.supplier, basicTrade.customer, basicTrade.commissioner, basicTrade.name),
                expectedMockedFunction: mockedInstance.registerBasicTrade,
                expectedMockedFunctionArgs: [basicTrade.supplier, basicTrade.customer, basicTrade.commissioner, '', basicTrade.name],
            },
            {
                serviceFunctionName: 'registerOrderTrade',
                serviceFunction: () => tradeManagerService.registerOrderTrade(orderTrade.supplier, orderTrade.customer, orderTrade.commissioner, orderTrade.paymentDeadline, orderTrade.documentDeliveryDeadline, orderTrade.arbiter, orderTrade.shippingDeadline, orderTrade.deliveryDeadline, agreedAmount, tokenAddress),
                expectedMockedFunction: mockedInstance.registerOrderTrade,
                expectedMockedFunctionArgs: [orderTrade.supplier, orderTrade.customer, orderTrade.commissioner, '', orderTrade.paymentDeadline, orderTrade.documentDeliveryDeadline, orderTrade.arbiter, orderTrade.shippingDeadline, orderTrade.deliveryDeadline, agreedAmount, tokenAddress],
            },
            {
                serviceFunctionName: 'getTradeCounter',
                serviceFunction: () => tradeManagerService.getTradeCounter(),
                expectedMockedFunction: mockedInstance.getTradeCounter,
                expectedMockedFunctionArgs: [],
            },
            {
                serviceFunctionName: 'getTrades',
                serviceFunction: () => tradeManagerService.getTrades(),
                expectedMockedFunction: mockedInstance.getTrades,
                expectedMockedFunctionArgs: [],
            },
            {
                serviceFunctionName: 'getTradesAndTypes',
                serviceFunction: () => tradeManagerService.getTradesAndTypes(),
                expectedMockedFunction: mockedInstance.getTradesAndTypes,
                expectedMockedFunctionArgs: [],
            },
            {
                serviceFunctionName: 'getTrade',
                serviceFunction: () => tradeManagerService.getTrade(basicTrade.tradeId),
                expectedMockedFunction: mockedInstance.getTrade,
                expectedMockedFunctionArgs: [basicTrade.tradeId],
            },
            {
                serviceFunctionName: 'getTradeType',
                serviceFunction: () => tradeManagerService.getTradeType(basicTrade.tradeId),
                expectedMockedFunction: mockedInstance.getTradeType,
                expectedMockedFunctionArgs: [basicTrade.tradeId],
            },
            {
                serviceFunctionName: 'getTradesByMaterial',
                serviceFunction: () => tradeManagerService.getTradesByMaterial(basicTrade.tradeId),
                expectedMockedFunction: mockedInstance.getTradesByMaterial,
                expectedMockedFunctionArgs: [basicTrade.tradeId],
            },
            {
                serviceFunctionName: 'getTradeIdsOfSupplier',
                serviceFunction: () => tradeManagerService.getTradeIdsOfSupplier(basicTrade.supplier),
                expectedMockedFunction: mockedInstance.getTradeIdsOfSupplier,
                expectedMockedFunctionArgs: [basicTrade.supplier],
            },
            {
                serviceFunctionName: 'getTradeIdsOfCommissioner',
                serviceFunction: () => tradeManagerService.getTradeIdsOfCommissioner(basicTrade.commissioner),
                expectedMockedFunction: mockedInstance.getTradeIdsOfCommissioner,
                expectedMockedFunctionArgs: [basicTrade.commissioner],
            },
        ])('service should call driver $serviceFunctionName', async ({
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
    });

    // TODO: fix this tests
    // describe('With storage metadata driver', () => {
    //     beforeAll(() => {
    //         mockedTradeManagerDriver = createMock<TradeManagerDriver>(mockedInstance);
    //         mockedStorageMetadataDriver = createMock<IStorageMetadataDriver<SolidMetadataSpec, SolidStorageACR>>(mockedStorageMetadataInstance);
    //
    //         tradeManagerService = new TradeManagerService(mockedTradeManagerDriver, mockedStorageMetadataDriver);
    //     });
    //
    //     afterAll(() => jest.restoreAllMocks());
    //
    //     it.each([
    //         {
    //             serviceFunctionName: 'registerBasicTrade - with ACL rules',
    //             serviceFunction: () => tradeManagerService.registerBasicTrade(basicTrade.supplier, basicTrade.customer, basicTrade.commissioner, basicTrade.name, { spec: metadataSpec, value: metadata, aclRules: [] }),
    //             expectedMockedFunction: mockedStorageMetadataInstance.create,
    //             expectedMockedFunctionArgs: [StorageOperationType.TRANSACTION, metadata, [], metadataSpec],
    //         },
    //         {
    //             serviceFunctionName: 'registerOrderTrade - without ACL rules',
    //             serviceFunction: () => tradeManagerService.registerOrderTrade(orderTrade.supplier, orderTrade.customer, orderTrade.commissioner, orderTrade.paymentDeadline, orderTrade.documentDeliveryDeadline, orderTrade.arbiter, orderTrade.shippingDeadline, orderTrade.deliveryDeadline, agreedAmount, tokenAddress, { spec: metadataSpec, value: metadata }),
    //             expectedMockedFunction: mockedStorageMetadataInstance.create,
    //             expectedMockedFunctionArgs: [StorageOperationType.TRANSACTION, metadata, undefined, metadataSpec],
    //         },
    //     ])('service should call driver $serviceFunctionName', async ({
    //         serviceFunction,
    //         expectedMockedFunction,
    //         expectedMockedFunctionArgs,
    //     }) => {
    //         await serviceFunction();
    //
    //         expect(expectedMockedFunction)
    //             .toHaveBeenCalledTimes(1);
    //         expect(expectedMockedFunction)
    //             .toHaveBeenCalledWith(...expectedMockedFunctionArgs);
    //     });
    // });
});
