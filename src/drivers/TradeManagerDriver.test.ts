// import { BigNumber, Signer, Wallet } from 'ethers';
// import { createMock } from 'ts-auto-mock';
// import { TradeManagerDriver } from './TradeManagerDriver';
// import {
//     BasicTrade as BasicTradeContract,
//     OrderTrade as OrderTradeContract,
//     BasicTrade__factory,
//     Trade__factory,
//     TradeManager,
//     TradeManager__factory,
//     OrderTrade__factory,
//     MaterialManager__factory,
//     ProductCategoryManager__factory,
//     MaterialManager,
//     ProductCategoryManager
// } from '../smart-contracts';
// import { TradeType } from '../types/TradeType';
//
// import * as utilsModule from '../utils/utils';
// import { BasicTrade } from '../entities/BasicTrade';
// import { Trade } from '../entities/Trade';
//
// describe('TradeManagerDriver', () => {
//     let tradeManagerDriver: TradeManagerDriver;
//     const contractAddress: string = Wallet.createRandom().address;
//     const supplier: string = Wallet.createRandom().address;
//     const customer: string = Wallet.createRandom().address;
//     const commissioner: string = Wallet.createRandom().address;
//     const externalUrl: string = 'http://external.url';
//     const metadataHash: string = 'metadataHash';
//     const name: string = 'name';
//     const paymentDeadline: number = 1;
//     const documentDeliveryDeadline: number = 2;
//     const arbiter: string = Wallet.createRandom().address;
//     const shippingDeadline: number = 3;
//     const deliveryDeadline: number = 4;
//     const agreedAmount: number = 5;
//     const tokenAddress: string = Wallet.createRandom().address;
//     const mockedContractAddress: string = Wallet.createRandom().address;
//
//     let mockedSigner: Signer;
//
//     const mockedTradeManagerConnect = jest.fn();
//     const mockedWait = jest.fn();
//
//     const mockedWriteFunction = jest.fn();
//     const mockedGetTradeCounter = jest.fn();
//     const mockedGetTrade = jest.fn();
//     const mockedGetTradeType = jest.fn();
//     const mockedGetTradeIdsOfEntity = jest.fn();
//
//     const mockedGetBasicTrade = jest.fn();
//     const mockedGetOrderTrade = jest.fn();
//
//     const getTradeTypeByIndexSpy = jest.spyOn(utilsModule, 'getTradeTypeByIndex');
//     getTradeTypeByIndexSpy.mockReturnValue(TradeType.BASIC);
//
//     const mockEvents = [
//         {
//             event: 'BasicTradeRegistered',
//             args: { id: BigNumber.from(1), contractAddress: mockedContractAddress }
//         },
//         {
//             event: 'OrderTradeRegistered',
//             args: { id: BigNumber.from(2), contractAddress: mockedContractAddress }
//         }
//     ];
//     const transactionHash = '0x1234567890';
//     mockedWait.mockResolvedValue({
//         events: mockEvents,
//         transactionHash
//     });
//     mockedGetTradeCounter.mockReturnValue(BigNumber.from(1));
//     mockedGetTradeType.mockReturnValue(BigNumber.from(0));
//     mockedWriteFunction.mockResolvedValue({
//         wait: mockedWait
//     });
//     mockedGetTrade.mockResolvedValue(mockedContractAddress);
//     mockedGetTradeIdsOfEntity.mockResolvedValue([BigNumber.from(0)]);
//
//     mockedGetBasicTrade.mockReturnValue([
//         BigNumber.from(0),
//         supplier,
//         customer,
//         commissioner,
//         externalUrl,
//         undefined,
//         name
//     ]);
//     mockedGetOrderTrade.mockReturnValue([
//         BigNumber.from(1),
//         supplier,
//         customer,
//         commissioner,
//         externalUrl,
//         undefined,
//         false,
//         false,
//         BigNumber.from(paymentDeadline),
//         BigNumber.from(documentDeliveryDeadline),
//         arbiter,
//         BigNumber.from(shippingDeadline),
//         BigNumber.from(deliveryDeadline),
//         tokenAddress
//     ]);
//
//     const mockedContract = createMock<TradeManager>({
//         registerBasicTrade: mockedWriteFunction,
//         registerOrderTrade: mockedWriteFunction,
//         getTradeCounter: mockedGetTradeCounter,
//         getTrade: mockedGetTrade,
//         getTradeType: mockedGetTradeType,
//         getTradeIdsOfSupplier: mockedGetTradeIdsOfEntity,
//         getTradeIdsOfCommissioner: mockedGetTradeIdsOfEntity
//     });
//
//     beforeAll(() => {
//         mockedTradeManagerConnect.mockReturnValue(mockedContract);
//         const mockedTradeManager = createMock<TradeManager>({
//             connect: mockedTradeManagerConnect
//         });
//         const mockedBasicTradeContract = createMock<BasicTradeContract>({
//             connect: jest.fn().mockReturnValue(
//                 createMock<BasicTradeContract>({
//                     getTrade: mockedGetBasicTrade
//                 })
//             )
//         });
//         const mockedOrderTradeContract = createMock<OrderTradeContract>({
//             connect: jest.fn().mockReturnValue(
//                 createMock<OrderTradeContract>({
//                     getTrade: mockedGetOrderTrade
//                 })
//             )
//         });
//
//         jest.spyOn(TradeManager__factory, 'connect').mockReturnValue(mockedTradeManager);
//         jest.spyOn(Trade__factory, 'connect').mockReturnValue(mockedBasicTradeContract);
//         jest.spyOn(BasicTrade__factory, 'connect').mockReturnValue(mockedBasicTradeContract);
//         jest.spyOn(OrderTrade__factory, 'connect').mockReturnValue(mockedOrderTradeContract);
//         jest.spyOn(MaterialManager__factory, 'connect').mockReturnValue(
//             createMock<MaterialManager>({
//                 connect: jest.fn()
//             })
//         );
//         jest.spyOn(ProductCategoryManager__factory, 'connect').mockReturnValue(
//             createMock<ProductCategoryManager>({
//                 connect: jest.fn()
//             })
//         );
//
//         mockedSigner = createMock<Signer>();
//         tradeManagerDriver = new TradeManagerDriver(
//             mockedSigner,
//             contractAddress,
//             Wallet.createRandom().address,
//             Wallet.createRandom().address
//         );
//     });
//
//     afterEach(() => jest.clearAllMocks());
//
//     it('should correctly register a basic trade', async () => {
//         const [tradeId, tradeAddress, txHash] = await tradeManagerDriver.registerBasicTrade(
//             supplier,
//             customer,
//             commissioner,
//             externalUrl,
//             metadataHash,
//             name
//         );
//         expect(tradeId).toEqual(1);
//         expect(tradeAddress).toEqual(mockedContractAddress);
//         expect(txHash).toEqual(transactionHash);
//
//         expect(mockedContract.registerBasicTrade).toHaveBeenCalledTimes(1);
//         expect(mockedContract.registerBasicTrade).toHaveBeenNthCalledWith(
//             1,
//             supplier,
//             customer,
//             commissioner,
//             externalUrl,
//             metadataHash,
//             name
//         );
//         expect(mockedWait).toHaveBeenCalled();
//     });
//
//     it('should register a basic trade - FAIL(Error during basic trade registration, no events found)', async () => {
//         mockedWait.mockResolvedValueOnce({
//             events: undefined
//         });
//
//         await expect(
//             tradeManagerDriver.registerBasicTrade(
//                 supplier,
//                 customer,
//                 commissioner,
//                 externalUrl,
//                 metadataHash,
//                 name
//             )
//         ).rejects.toThrow('Error during basic trade registration, no events found');
//     });
//
//     it('should correctly register a basic trade - FAIL(Not an address)', async () => {
//         await expect(
//             tradeManagerDriver.registerBasicTrade(
//                 'not an address',
//                 customer,
//                 commissioner,
//                 externalUrl,
//                 metadataHash,
//                 name
//             )
//         ).rejects.toThrow('Not an address');
//
//         expect(mockedContract.registerBasicTrade).toHaveBeenCalledTimes(0);
//         expect(mockedWait).not.toHaveBeenCalled();
//     });
//
//     it('should correctly register an order trade', async () => {
//         const [tradeId, tradeAddress, txHash] = await tradeManagerDriver.registerOrderTrade(
//             supplier,
//             customer,
//             commissioner,
//             externalUrl,
//             metadataHash,
//             paymentDeadline,
//             documentDeliveryDeadline,
//             arbiter,
//             shippingDeadline,
//             deliveryDeadline,
//             agreedAmount,
//             tokenAddress
//         );
//         expect(tradeId).toEqual(2);
//         expect(tradeAddress).toEqual(mockedContractAddress);
//         expect(txHash).toEqual(transactionHash);
//
//         expect(mockedContract.registerOrderTrade).toHaveBeenCalledTimes(1);
//         expect(mockedContract.registerOrderTrade).toHaveBeenNthCalledWith(
//             1,
//             supplier,
//             customer,
//             commissioner,
//             externalUrl,
//             metadataHash,
//             paymentDeadline,
//             documentDeliveryDeadline,
//             arbiter,
//             shippingDeadline,
//             deliveryDeadline,
//             agreedAmount,
//             tokenAddress
//         );
//         expect(mockedWait).toHaveBeenCalled();
//     });
//
//     it('should register an order trade - FAIL(Error during order trade registration, no events found)', async () => {
//         mockedWait.mockResolvedValueOnce({
//             events: undefined
//         });
//
//         await expect(
//             tradeManagerDriver.registerOrderTrade(
//                 supplier,
//                 customer,
//                 commissioner,
//                 externalUrl,
//                 metadataHash,
//                 paymentDeadline,
//                 documentDeliveryDeadline,
//                 arbiter,
//                 shippingDeadline,
//                 deliveryDeadline,
//                 agreedAmount,
//                 tokenAddress
//             )
//         ).rejects.toThrow('Error during order registration, no events found');
//     });
//
//     it('should correctly register an order trade - FAIL(Not an address)', async () => {
//         await expect(
//             tradeManagerDriver.registerOrderTrade(
//                 'not an address',
//                 customer,
//                 commissioner,
//                 externalUrl,
//                 metadataHash,
//                 paymentDeadline,
//                 documentDeliveryDeadline,
//                 arbiter,
//                 shippingDeadline,
//                 deliveryDeadline,
//                 agreedAmount,
//                 tokenAddress
//             )
//         ).rejects.toThrow('Not an address');
//
//         expect(mockedContract.registerOrderTrade).toHaveBeenCalledTimes(0);
//         expect(mockedWait).not.toHaveBeenCalled();
//     });
//
//     it('should correctly get trades', async () => {
//         const response: Trade[] = await tradeManagerDriver.getTrades();
//
//         expect(response).toEqual([
//             new BasicTrade(0, supplier, customer, commissioner, externalUrl, [], name)
//         ]);
//
//         expect(mockedContract.getTradeCounter).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTradeCounter).toHaveBeenNthCalledWith(1);
//         expect(mockedGetTradeCounter).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTrade).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTrade).toHaveBeenNthCalledWith(1, 1);
//         expect(mockedGetTrade).toHaveBeenCalledTimes(1);
//     });
//
//     it('should correctly get trades and types', async () => {
//         const response: Map<string, TradeType> = await tradeManagerDriver.getTradesAndTypes();
//         const expected: Map<string, TradeType> = new Map<string, TradeType>();
//         expected.set(mockedContractAddress, TradeType.BASIC);
//
//         expect(response).toEqual(expected);
//
//         expect(mockedContract.getTradeCounter).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTradeCounter).toHaveBeenNthCalledWith(1);
//         expect(mockedGetTradeCounter).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTradeType).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTradeType).toHaveBeenNthCalledWith(1, 1);
//         expect(mockedGetTradeType).toHaveBeenCalledTimes(1);
//         expect(getTradeTypeByIndexSpy).toHaveBeenCalledTimes(1);
//     });
//
//     it('should correctly get a trade', async () => {
//         const response = await tradeManagerDriver.getTrade(0);
//
//         expect(response).toEqual(mockedContractAddress);
//
//         expect(mockedContract.getTrade).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTrade).toHaveBeenNthCalledWith(1, 0);
//         expect(mockedGetTrade).toHaveBeenCalledTimes(1);
//     });
//
//     it('should get trades by material', async () => {
//         const response = await tradeManagerDriver.getTradesByMaterial(42);
//
//         expect(response).toEqual([]);
//     });
//
//     it('should correctly get a trade type', async () => {
//         const response = await tradeManagerDriver.getTradeType(1);
//
//         expect(response).toEqual(TradeType.BASIC);
//
//         expect(mockedContract.getTradeType).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTradeType).toHaveBeenNthCalledWith(1, 1);
//         expect(mockedGetTradeType);
//     });
//
//     it('should correctly get trade ids of supplier', async () => {
//         const response = await tradeManagerDriver.getTradeIdsOfSupplier(supplier);
//
//         expect(response).toEqual([0]);
//
//         expect(mockedContract.getTradeIdsOfCommissioner).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTradeIdsOfCommissioner).toHaveBeenNthCalledWith(1, supplier);
//         expect(mockedGetTradeIdsOfEntity).toHaveBeenCalledTimes(1);
//     });
//
//     it('should correctly get trade ids of commissioner', async () => {
//         const response = await tradeManagerDriver.getTradeIdsOfCommissioner(commissioner);
//
//         expect(response).toEqual([0]);
//
//         expect(mockedContract.getTradeIdsOfCommissioner).toHaveBeenCalledTimes(1);
//         expect(mockedContract.getTradeIdsOfCommissioner).toHaveBeenNthCalledWith(1, commissioner);
//         expect(mockedGetTradeIdsOfEntity).toHaveBeenCalledTimes(1);
//     });
// });
