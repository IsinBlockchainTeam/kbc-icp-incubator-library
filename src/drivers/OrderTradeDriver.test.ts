import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { OrderTradeDriver } from './OrderTradeDriver';
import { Trade as TradeContract } from '../smart-contracts/contracts/OrderTrade';
import {
    OrderTrade as OrderTradeContract,
    // eslint-disable-next-line camelcase
    Trade__factory,
    OrderTrade__factory,
    MaterialManager,
    ProductCategoryManager,
    MaterialManager__factory,
    ProductCategoryManager__factory,
} from '../smart-contracts';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { EntityBuilder } from '../utils/EntityBuilder';
import { OrderLine, OrderLineRequest } from '../entities/OrderTradeInfo';

describe('OrderTradeDriver', () => {
    let orderTradeDriver: OrderTradeDriver;
    const contractAddress: string = Wallet.createRandom().address;

    const tradeId: number = 1;
    const supplier: string = Wallet.createRandom().address;
    const customer: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const externalUrl: string = 'externalUrl';

    const line: TradeContract.LineStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(2),
        materialId: BigNumber.from(3),
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
    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(2),
        exists: true,
    } as MaterialManager.MaterialStructOutput;
    const productCategoryStruct: ProductCategoryManager.ProductCategoryStructOutput = {
        id: BigNumber.from(2),
        name: 'category1',
        quality: 85,
        description: 'description',
        exists: true,
    } as ProductCategoryManager.ProductCategoryStructOutput;

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
    const mockedMaterialManagerConnect = jest.fn();
    const mockedProductCategoryManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedUpdateLine = jest.fn();
    const mockedAssignMaterial = jest.fn();
    const mockedGetTrade = jest.fn();
    const mockedGetLineCounter = jest.fn();
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

    const mockedGetMaterial = jest.fn();
    const mockedGetProductCategory = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedUpdateLine.mockResolvedValue({
        wait: mockedWait,
    });
    mockedAssignMaterial.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetTrade.mockResolvedValue(
        [BigNumber.from(tradeId), supplier, customer, commissioner, externalUrl, lineIds, hasSupplierSigned, hasCommissionerSigned, BigNumber.from(paymentDeadline), BigNumber.from(documentDeliveryDeadline), arbiter, BigNumber.from(shippingDeadline), BigNumber.from(deliveryDeadline), escrow],
    );
    mockedGetLineCounter.mockResolvedValue(BigNumber.from(1));
    mockedGetLine.mockResolvedValue([line, orderLine]);
    mockedGetLineExists.mockResolvedValue(true);
    mockedGetNegotiationStatus.mockResolvedValue(NegotiationStatus.INITIALIZED);
    mockedQueryFilter.mockResolvedValue([{ event: 'eventName' }]);

    const mockedContract = createMock<OrderTradeContract>({
        getTrade: mockedGetTrade,
        getLineCounter: mockedGetLineCounter,
        getLine: mockedGetLine,
        addLine: mockedWriteFunction,
        updateLine: mockedWriteFunction,
        assignMaterial: mockedAssignMaterial,
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

    mockedGetMaterial.mockReturnValue(materialStruct);
    mockedGetProductCategory.mockReturnValue(productCategoryStruct);
    const mockedMaterialContract = createMock<MaterialManager>({
        getMaterial: mockedGetMaterial,
    });
    const mockedProductCategoryContract = createMock<ProductCategoryManager>({
        getProductCategory: mockedGetProductCategory,
    });

    beforeAll(() => {
        mockedOrderTradeConnect.mockReturnValue(mockedContract);
        const mockedOrderTradeContract = createMock<OrderTradeContract>({
            connect: mockedOrderTradeConnect,
        });
        mockedMaterialManagerConnect.mockReturnValue(mockedMaterialContract);
        const mockedMaterialManagerContract = createMock<MaterialManager>({
            connect: mockedMaterialManagerConnect,
        });
        mockedProductCategoryManagerConnect.mockReturnValue(mockedProductCategoryContract);
        const mockedProductCategoryManagerContract = createMock<ProductCategoryManager>({
            connect: mockedProductCategoryManagerConnect,
        });

        jest.spyOn(Trade__factory, 'connect')
            .mockReturnValue(mockedOrderTradeContract);
        jest.spyOn(OrderTrade__factory, 'connect')
            .mockReturnValue(mockedOrderTradeContract);
        jest.spyOn(MaterialManager__factory, 'connect')
            .mockReturnValue(mockedMaterialManagerContract);
        jest.spyOn(ProductCategoryManager__factory, 'connect')
            .mockReturnValue(mockedProductCategoryManagerContract);

        mockedSigner = createMock<Signer>();
        orderTradeDriver = new OrderTradeDriver(mockedSigner, contractAddress, Wallet.createRandom().address, Wallet.createRandom().address);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly retrieve the order trade', async () => {
        const result = await orderTradeDriver.getTrade();

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
            .toHaveBeenNthCalledWith(1, { blockTag: undefined });
        expect(mockedGetTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineCounter)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineCounter)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetLineCounter)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve line', async () => {
        const result = await orderTradeDriver.getLine(line.id.toNumber());

        expect(result)
            .toEqual(EntityBuilder.buildOrderLine(line, orderLine, productCategoryStruct, materialStruct));

        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, line.id.toNumber(), { blockTag: undefined });
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly add a order line', async () => {
        mockedGetMaterial.mockReturnValueOnce(undefined);
        mockedWait.mockResolvedValueOnce({
            events: [{
                event: 'OrderLineAdded',
                args: [line.id],
            }],
        });
        const newLine: OrderLineRequest = new OrderLineRequest(productCategoryStruct.id.toNumber(), 2, EntityBuilder.buildOrderLinePrice(price));
        const result: OrderLine = await orderTradeDriver.addLine(newLine);

        expect(result).toEqual(new OrderLine(line.id.toNumber(), undefined, EntityBuilder.buildProductCategory(productCategoryStruct), newLine.quantity, newLine.price));
        expect(mockedContract.addLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.addLine)
            .toHaveBeenNthCalledWith(1, newLine.productCategoryId, newLine.quantity, price);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, line.id, { blockTag: undefined });
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update an existing line', async () => {
        const newPrice: OrderTradeContract.OrderLinePriceStructOutput = {
            amount: BigNumber.from(20),
            decimals: BigNumber.from(0),
            fiat: 'Pandarmato',
        } as OrderTradeContract.OrderLinePriceStructOutput;
        const updatedLineStruct: TradeContract.LineStructOutput = {
            id: BigNumber.from(0),
            productCategoryId: BigNumber.from(4),
            materialId: BigNumber.from(5),
            exists: true,
        } as TradeContract.LineStructOutput;
        const updatedOrderLineStruct: OrderTradeContract.OrderLineStructOutput = {
            quantity: BigNumber.from(3),
            price: newPrice,
        } as OrderTradeContract.OrderLineStructOutput;
        const updatedLine: OrderLine = EntityBuilder.buildOrderLine(updatedLineStruct, updatedOrderLineStruct, productCategoryStruct, materialStruct);
        mockedGetLine.mockResolvedValueOnce([updatedLineStruct, updatedOrderLineStruct]);

        expect(await orderTradeDriver.updateLine(updatedLine)).toEqual(updatedLine);
        expect(mockedContract.updateLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateLine)
            .toHaveBeenNthCalledWith(1, updatedLine.id, updatedLine.productCategory.id, updatedLine.quantity, newPrice);
        expect(mockedContract.assignMaterial)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.assignMaterial)
            .toHaveBeenNthCalledWith(1, updatedLine.id, updatedLine.material!.id);
        expect(mockedWait)
            .toHaveBeenCalledTimes(2);
        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, updatedLine.id, { blockTag: undefined });
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

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
