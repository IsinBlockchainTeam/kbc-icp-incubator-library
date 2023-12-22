import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { OrderTradeDriver } from './OrderTradeDriver';
import { Trade as TradeContract } from '../smart-contracts/contracts/OrderTrade';
import {
    OrderTrade as OrderTradeContract,
    // eslint-disable-next-line camelcase
    Trade__factory, OrderTrade__factory,
} from '../smart-contracts';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { EntityBuilder } from '../utils/EntityBuilder';
import { OrderLine } from '../entities/OrderTrade';

describe('OrderTradeDriver', () => {
    let orderTradeDriver: OrderTradeDriver;
    const contractAddress: string = Wallet.createRandom().address;

    const tradeId: number = 1;
    const supplier: string = Wallet.createRandom().address;
    const customer: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const externalUrl: string = 'externalUrl';

    const line: TradeContract.LineStructOutput = {
        id: BigNumber.from(0),
        materialsId: [BigNumber.from(1), BigNumber.from(2)],
        productCategory: 'category1',
        exists: true,
    } as TradeContract.LineStructOutput;
    const price: OrderTradeContract.OrderLinePriceStructOutput = {
        amount: BigNumber.from(10),
        decimals: BigNumber.from(0),
        fiat: 'fiat',
    } as OrderTradeContract.OrderLinePriceStructOutput;
    const orderLine: OrderTradeContract.OrderLineStructOutput = {
        quantity: BigNumber.from(2),
        price,
    } as OrderTradeContract.OrderLineStructOutput;

    const lineIds: BigNumber[] = [BigNumber.from(line.id)];
    const hasSupplierSigned: boolean = true;
    const hasCommissionerSigned: boolean = false;
    const paymentDeadline: number = 100;
    const documentDeliveryDeadline: number = 200;
    const arbiter: string = 'arbiter';
    const shippingDeadline: number = 300;
    const deliveryDeadline: number = 400;
    const escrow: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedOrderTradeConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetTrade = jest.fn();
    const mockedGetLines = jest.fn();
    const mockedGetLine = jest.fn();
    const mockedGetLineExists = jest.fn();
    const mockedGetNegotiationStatus = jest.fn();

    const mockedDecodeEventLog = jest.fn();
    const mockedQueryFilter = jest.fn();
    const mockedTradeRegisteredEventFilter = jest.fn();
    const mockedTradeLineAddedEventFilter = jest.fn();
    const mockedTradeLineUpdatedEventFilter = jest.fn();
    const mockedOrderLineAddedEventFilter = jest.fn();
    const mockedOrderLineUpdatedEventFilter = jest.fn();
    const mockOrderConfirmedEventFilter = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetTrade.mockReturnValue(Promise.resolve(
        [BigNumber.from(tradeId), supplier, customer, commissioner, externalUrl, lineIds, hasSupplierSigned, hasCommissionerSigned, BigNumber.from(paymentDeadline), BigNumber.from(documentDeliveryDeadline), arbiter, BigNumber.from(shippingDeadline), BigNumber.from(deliveryDeadline), escrow],
    ));
    mockedGetLines.mockResolvedValue([[line], [orderLine]]);
    mockedGetLine.mockReturnValue(Promise.resolve(line));
    mockedGetLineExists.mockReturnValue(Promise.resolve(true));
    mockedGetNegotiationStatus.mockReturnValue(Promise.resolve(NegotiationStatus.INITIALIZED));
    mockedQueryFilter.mockResolvedValue([{ event: 'eventName' }]);

    const mockedContract = createMock<OrderTradeContract>({
        getTrade: mockedGetTrade,
        getLines: mockedGetLines,
        getLine: mockedGetLine,
        addLine: mockedWriteFunction,
        updateLine: mockedWriteFunction,
        getNegotiationStatus: mockedGetNegotiationStatus,
        updatePaymentDeadline: mockedWriteFunction,
        updateDocumentDeliveryDeadline: mockedWriteFunction,
        updateArbiter: mockedWriteFunction,
        updateShippingDeadline: mockedWriteFunction,
        updateDeliveryDeadline: mockedWriteFunction,
        confirmOrder: mockedWriteFunction,

        interface: { decodeEventLog: mockedDecodeEventLog },
        queryFilter: mockedQueryFilter,
        filters: {
            TradeLineAdded: mockedTradeRegisteredEventFilter,
            TradeLineUpdated: mockedTradeLineAddedEventFilter,
            OrderLineAdded: mockedTradeLineUpdatedEventFilter,
            OrderLineUpdated: mockedOrderLineAddedEventFilter,
            OrderSignatureAffixed: mockedOrderLineUpdatedEventFilter,
            OrderConfirmed: mockOrderConfirmedEventFilter,
        },

    });

    beforeAll(() => {
        mockedOrderTradeConnect.mockReturnValue(mockedContract);
        const mockedOrderTradeContract = createMock<OrderTradeContract>({
            connect: mockedOrderTradeConnect,
        });
        jest.spyOn(Trade__factory, 'connect')
            .mockReturnValue(mockedOrderTradeContract);
        jest.spyOn(OrderTrade__factory, 'connect')
            .mockReturnValue(mockedOrderTradeContract);

        mockedSigner = createMock<Signer>();
        orderTradeDriver = new OrderTradeDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly retrieve the order trade', async () => {
        const result = await orderTradeDriver.getTrade();
        const expectedMap: Map<number, OrderLine> = new Map<number, OrderLine>();
        expectedMap.set(line.id.toNumber(), EntityBuilder.buildOrderLine(line, orderLine));

        expect(result.tradeId)
            .toEqual(tradeId);
        expect(result.supplier)
            .toEqual(supplier);
        expect(result.customer)
            .toEqual(customer);
        expect(result.commissioner)
            .toEqual(commissioner);
        expect(result.externalUrl)
            .toEqual(externalUrl);
        expect(result.lines)
            .toEqual(expectedMap);
        expect(result.hasSupplierSigned)
            .toEqual(hasSupplierSigned);
        expect(result.hasCommissionerSigned)
            .toEqual(hasCommissionerSigned);
        expect(result.paymentDeadline)
            .toEqual(paymentDeadline);
        expect(result.documentDeliveryDeadline)
            .toEqual(documentDeliveryDeadline);
        expect(result.arbiter)
            .toEqual(arbiter);
        expect(result.shippingDeadline)
            .toEqual(shippingDeadline);
        expect(result.deliveryDeadline)
            .toEqual(deliveryDeadline);
        expect(result.escrow)
            .toEqual(escrow);

        expect(mockedContract.getTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTrade)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLines)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLines)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetLines)
            .toHaveBeenCalledTimes(1);
    });

    // it('should correctly retrieve lines', async () => {
    //     const result = await orderTradeDriver.getLines();
    //
    //     expect(result)
    //         .toEqual([EntityBuilder.buildOrderLine(line, orderLine)]);
    //
    //     expect(mockedContract.getLines)
    //         .toHaveBeenCalledTimes(1);
    //     expect(mockedContract.getLines)
    //         .toHaveBeenNthCalledWith(1);
    //     expect(mockedGetLines)
    //         .toHaveBeenCalledTimes(1);
    //
    //     expect(mockedContract.getOrderLines)
    //         .toHaveBeenCalledTimes(1);
    //     expect(mockedContract.getOrderLines)
    //         .toHaveBeenNthCalledWith(1);
    //     expect(mockedGetOrderLines)
    //         .toHaveBeenCalledTimes(1);
    // });
    //
    // it('should correctly retrieve line', async () => {
    //     const result = await orderTradeDriver.getLine(line.id.toNumber());
    //
    //     expect(result)
    //         .toEqual(EntityBuilder.buildOrderLine(line, orderLine));
    //
    //     expect(mockedContract.getOrderLine)
    //         .toHaveBeenCalledTimes(1);
    //     expect(mockedContract.getOrderLine)
    //         .toHaveBeenNthCalledWith(1, line.id.toNumber(), { blockTag: undefined });
    //     expect(mockedGetLine)
    //         .toHaveBeenCalledTimes(1);
    // });

    // it('should correctly add a order line', async () => {
    //     await orderTradeDriver.addOrderLine([0, 1], 'test category', 100, EntityBuilder.buildOrderLinePrice(price));
    //
    //     expect(mockedContract.addOrderLine)
    //         .toHaveBeenCalledTimes(1);
    //     expect(mockedContract.addOrderLine)
    //         .toHaveBeenNthCalledWith(1, [0, 1], 'test category', 100, price);
    //     expect(mockedWait)
    //         .toHaveBeenCalledTimes(1);
    // });
    //
    // it('should correctly update a order line', async () => {
    //     const newPrice: OrderTradeContract.OrderLinePriceStructOutput = {
    //         amount: BigNumber.from(20),
    //         decimals: BigNumber.from(0),
    //         fiat: 'Pandarmato',
    //     } as OrderTradeContract.OrderLinePriceStructOutput;
    //     await orderTradeDriver.updateOrderLine(1, [1, 2], 'category1', 100, EntityBuilder.buildOrderLinePrice(newPrice));
    //
    //     expect(mockedContract.updateOrderLine)
    //         .toHaveBeenCalledTimes(1);
    //     expect(mockedContract.updateOrderLine)
    //         .toHaveBeenNthCalledWith(1, 1, 100, newPrice);
    //     expect(mockedWait)
    //         .toHaveBeenCalledTimes(1);
    // });

    it('should correctly retrieve the negotiation status - INITIALIZED', async () => {
        const result = await orderTradeDriver.getNegotiationStatus();

        expect(result)
            .toEqual(NegotiationStatus.INITIALIZED);

        expect(mockedContract.getNegotiationStatus)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getNegotiationStatus)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetNegotiationStatus)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the negotiation status - PENDING', async () => {
        mockedGetNegotiationStatus.mockReturnValue(Promise.resolve(NegotiationStatus.PENDING));
        const result = await orderTradeDriver.getNegotiationStatus();

        expect(result)
            .toEqual(NegotiationStatus.PENDING);

        expect(mockedContract.getNegotiationStatus)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getNegotiationStatus)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetNegotiationStatus)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the negotiation status - COMPLETED', async () => {
        mockedGetNegotiationStatus.mockReturnValue(Promise.resolve(NegotiationStatus.COMPLETED));
        const result = await orderTradeDriver.getNegotiationStatus();

        expect(result)
            .toEqual(NegotiationStatus.COMPLETED);

        expect(mockedContract.getNegotiationStatus)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getNegotiationStatus)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetNegotiationStatus)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the negotiation status - FAIL(Invalid state)', async () => {
        mockedGetNegotiationStatus.mockReturnValue(Promise.resolve(42));
        await expect(orderTradeDriver.getNegotiationStatus())
            .rejects
            .toThrowError(new Error('Invalid state'));

        expect(mockedContract.getNegotiationStatus)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getNegotiationStatus)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetNegotiationStatus)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update the payment deadline', async () => {
        await orderTradeDriver.updatePaymentDeadline(0);

        expect(mockedContract.updatePaymentDeadline)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updatePaymentDeadline)
            .toHaveBeenNthCalledWith(1, 0);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update the document delivery deadline', async () => {
        await orderTradeDriver.updateDocumentDeliveryDeadline(0);

        expect(mockedContract.updateDocumentDeliveryDeadline)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateDocumentDeliveryDeadline)
            .toHaveBeenNthCalledWith(1, 0);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update the document delivery deadline', async () => {
        await orderTradeDriver.updateArbiter('new arbiter');

        expect(mockedContract.updateArbiter)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateArbiter)
            .toHaveBeenNthCalledWith(1, 'new arbiter');
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update the shipping deadline', async () => {
        await orderTradeDriver.updateShippingDeadline(0);

        expect(mockedContract.updateShippingDeadline)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateShippingDeadline)
            .toHaveBeenNthCalledWith(1, 0);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update the delivery deadline', async () => {
        await orderTradeDriver.updateDeliveryDeadline(0);

        expect(mockedContract.updateDeliveryDeadline)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateDeliveryDeadline)
            .toHaveBeenNthCalledWith(1, 0);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly confirm the order', async () => {
        await orderTradeDriver.confirmOrder();

        expect(mockedContract.confirmOrder)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.confirmOrder)
            .toHaveBeenNthCalledWith(1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should get block numbers per each event name by order id', async () => {
        await orderTradeDriver.getEmittedEvents();

        expect(mockedQueryFilter).toHaveBeenCalledTimes(6);

        /*
        const mockedTradeRegisteredEventFilter = jest.fn();
        const mockedTradeLineAddedEventFilter = jest.fn();
        const mockedTradeLineUpdatedEventFilter = jest.fn();
        const mockedOrderLineAddedEventFilter = jest.fn();
        const mockedOrderLineUpdatedEventFilter = jest.fn();
        const mockOrderConfirmedEventFilter = jest.fn();
         */

        expect(mockedTradeRegisteredEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedTradeRegisteredEventFilter).toHaveBeenNthCalledWith(1);

        expect(mockedTradeLineAddedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedTradeLineAddedEventFilter).toHaveBeenNthCalledWith(1);

        expect(mockedTradeLineUpdatedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenNthCalledWith(1);

        expect(mockedOrderLineAddedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineAddedEventFilter).toHaveBeenNthCalledWith(1);

        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenNthCalledWith(1);

        expect(mockOrderConfirmedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockOrderConfirmedEventFilter).toHaveBeenNthCalledWith(1);

        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenCalledTimes(1);
        expect(mockedOrderLineUpdatedEventFilter).toHaveBeenNthCalledWith(1);
    });
});
