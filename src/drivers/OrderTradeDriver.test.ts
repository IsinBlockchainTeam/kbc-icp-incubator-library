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
    ProductCategoryManager__factory
} from '../smart-contracts';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { EntityBuilder } from '../utils/EntityBuilder';
import { OrderLine, OrderLineRequest } from '../entities/OrderTrade';
import { RoleProof } from '../types/RoleProof';
import {zeroAddress} from "../utils/constants";

describe('OrderTradeDriver', () => {
    let orderTradeDriver: OrderTradeDriver;
    const contractAddress: string = Wallet.createRandom().address;

    const roleProof: RoleProof = createMock<RoleProof>();

    const tradeId: number = 1;
    const supplier: string = Wallet.createRandom().address;
    const customer: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const externalUrl: string = 'externalUrl';
    const units = ['KGM', 'BG'];

    const line: TradeContract.LineStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(2),
        quantity: BigNumber.from(2),
        unit: units[0],
        materialId: BigNumber.from(3),
        exists: true
    } as TradeContract.LineStructOutput;
    const price: OrderTradeContract.OrderLinePriceStructOutput = {
        amount: BigNumber.from(10),
        decimals: BigNumber.from(0),
        fiat: 'fiat'
    } as OrderTradeContract.OrderLinePriceStructOutput;
    const orderLine: OrderTradeContract.OrderLineStructOutput = {
        price
    } as OrderTradeContract.OrderLineStructOutput;
    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(2),
        exists: true
    } as MaterialManager.MaterialStructOutput;
    const productCategoryStruct: ProductCategoryManager.ProductCategoryStructOutput = {
        id: BigNumber.from(2),
        name: 'category1',
        quality: 85,
        description: 'description',
        exists: true
    } as ProductCategoryManager.ProductCategoryStructOutput;

    const lineIds: BigNumber[] = [BigNumber.from(line.id)];
    const hasSupplierSigned: boolean = true;
    const hasCommissionerSigned: boolean = false;
    const paymentDeadline: number = 100;
    const documentDeliveryDeadline: number = 200;
    const arbiter: string = 'arbiter';
    const shippingDeadline: number = 300;
    const deliveryDeadline: number = 400;
    const agreedAmount: number = 1000;
    const tokenAddress: string = Wallet.createRandom().address;
    const shipment: string = Wallet.createRandom().address;
    const escrow: string = Wallet.createRandom().address;
    // const metadata: OrderTradeMetadata = {
    //     incoterms: 'incoterms',
    //     shipper: 'shipper',
    //     shippingPort: 'shippingPort',
    //     deliveryPort: 'deliveryPort'
    // };

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
    const mockedHaveDeadlinesExpired = jest.fn();
    const mockedGetWhoSigned = jest.fn();

    const mockedGetShipment = jest.fn();
    const mockedGetEscrow = jest.fn();

    const mockedDecodeEventLog = jest.fn();
    const mockedQueryFilter = jest.fn();

    const mockedEventFilter = {
        TradeLineAdded: jest.fn(),
        TradeLineUpdated: jest.fn(),
        OrderLineAdded: jest.fn(),
        OrderLineUpdated: jest.fn(),
        OrderSignatureAffixed: jest.fn(),
        OrderConfirmed: jest.fn(),
        OrderExpired: jest.fn()
    };

    const mockedGetMaterial = jest.fn();
    const mockedGetProductCategory = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait
    });
    mockedUpdateLine.mockResolvedValue({
        wait: mockedWait
    });
    mockedAssignMaterial.mockResolvedValue({
        wait: mockedWait
    });
    mockedGetTrade.mockResolvedValue([
        BigNumber.from(tradeId),
        supplier,
        customer,
        commissioner,
        externalUrl,
        lineIds,
        hasSupplierSigned,
        hasCommissionerSigned,
        BigNumber.from(paymentDeadline),
        BigNumber.from(documentDeliveryDeadline),
        arbiter,
        BigNumber.from(shippingDeadline),
        BigNumber.from(deliveryDeadline),
        NegotiationStatus.PENDING,
        BigNumber.from(agreedAmount),
        tokenAddress
    ]);
    mockedGetLineCounter.mockResolvedValue(BigNumber.from(1));
    mockedGetLine.mockResolvedValue([line, orderLine]);
    mockedGetLineExists.mockResolvedValue(true);
    mockedGetNegotiationStatus.mockResolvedValue(NegotiationStatus.INITIALIZED);
    mockedHaveDeadlinesExpired.mockReturnValue(false);
    mockedGetWhoSigned.mockResolvedValue([supplier, commissioner]);
    mockedQueryFilter.mockResolvedValue([{ event: 'eventName' }]);
    mockedGetShipment.mockResolvedValue(shipment);
    mockedGetEscrow.mockResolvedValue(escrow);

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
        updateAgreedAmount: mockedWriteFunction,
        updateTokenAddress: mockedWriteFunction,
        haveDeadlinesExpired: mockedHaveDeadlinesExpired,
        enforceDeadlines: mockedWriteFunction,
        getWhoSigned: mockedGetWhoSigned,
        confirmOrder: mockedWriteFunction,
        getShipment: mockedGetShipment,
        getEscrow: mockedGetEscrow,

        interface: { decodeEventLog: mockedDecodeEventLog },
        queryFilter: mockedQueryFilter,
        filters: {
            TradeLineAdded: mockedEventFilter.TradeLineAdded,
            TradeLineUpdated: mockedEventFilter.TradeLineUpdated,
            OrderLineAdded: mockedEventFilter.OrderLineAdded,
            OrderLineUpdated: mockedEventFilter.OrderLineUpdated,
            OrderSignatureAffixed: mockedEventFilter.OrderSignatureAffixed,
            OrderConfirmed: mockedEventFilter.OrderConfirmed,
            OrderExpired: mockedEventFilter.OrderExpired
        }
    });

    mockedGetMaterial.mockReturnValue(materialStruct);
    mockedGetProductCategory.mockReturnValue(productCategoryStruct);
    const mockedMaterialContract = createMock<MaterialManager>({
        getMaterial: mockedGetMaterial
    });
    const mockedProductCategoryContract = createMock<ProductCategoryManager>({
        getProductCategory: mockedGetProductCategory
    });

    beforeAll(() => {
        mockedOrderTradeConnect.mockReturnValue(mockedContract);
        const mockedOrderTradeContract = createMock<OrderTradeContract>({
            connect: mockedOrderTradeConnect
        });
        mockedMaterialManagerConnect.mockReturnValue(mockedMaterialContract);
        const mockedMaterialManagerContract = createMock<MaterialManager>({
            connect: mockedMaterialManagerConnect
        });
        mockedProductCategoryManagerConnect.mockReturnValue(mockedProductCategoryContract);
        const mockedProductCategoryManagerContract = createMock<ProductCategoryManager>({
            connect: mockedProductCategoryManagerConnect
        });

        jest.spyOn(Trade__factory, 'connect').mockReturnValue(mockedOrderTradeContract);
        jest.spyOn(OrderTrade__factory, 'connect').mockReturnValue(mockedOrderTradeContract);
        jest.spyOn(MaterialManager__factory, 'connect').mockReturnValue(
            mockedMaterialManagerContract
        );
        jest.spyOn(ProductCategoryManager__factory, 'connect').mockReturnValue(
            mockedProductCategoryManagerContract
        );

        mockedSigner = createMock<Signer>();
        orderTradeDriver = new OrderTradeDriver(
            mockedSigner,
            contractAddress,
            Wallet.createRandom().address,
            Wallet.createRandom().address
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly retrieve the order trade', async () => {
        const result = await orderTradeDriver.getTrade(roleProof);

        expect(result.tradeId).toEqual(tradeId);
        expect(result.supplier).toEqual(supplier);
        expect(result.customer).toEqual(customer);
        expect(result.commissioner).toEqual(commissioner);
        expect(result.externalUrl).toEqual(externalUrl);
        expect(result.hasSupplierSigned).toEqual(hasSupplierSigned);
        expect(result.hasCommissionerSigned).toEqual(hasCommissionerSigned);
        expect(result.paymentDeadline).toEqual(paymentDeadline);
        expect(result.documentDeliveryDeadline).toEqual(documentDeliveryDeadline);
        expect(result.arbiter).toEqual(arbiter);
        expect(result.shippingDeadline).toEqual(shippingDeadline);
        expect(result.deliveryDeadline).toEqual(deliveryDeadline);
        expect(result.negotiationStatus).toEqual(NegotiationStatus.PENDING);
        expect(result.agreedAmount).toEqual(agreedAmount);
        expect(result.tokenAddress).toEqual(tokenAddress);

        expect(mockedContract.getTrade).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTrade).toHaveBeenNthCalledWith(1, roleProof, {
            blockTag: undefined
        });
        expect(mockedGetTrade).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineCounter).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineCounter).toHaveBeenNthCalledWith(1, roleProof);
        expect(mockedGetLineCounter).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve lines', async () => {
        const result = await orderTradeDriver.getLines(roleProof);

        expect(result).toEqual([
            EntityBuilder.buildOrderLine(line, orderLine, productCategoryStruct, materialStruct)
        ]);

        expect(mockedContract.getLineCounter).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine).toHaveBeenNthCalledWith(1, roleProof, line.id.toNumber(), {
            blockTag: undefined
        });
        expect(mockedGetLine).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve line', async () => {
        const result = await orderTradeDriver.getLine(roleProof, line.id.toNumber());

        expect(result).toEqual(
            EntityBuilder.buildOrderLine(line, orderLine, productCategoryStruct, materialStruct)
        );

        expect(mockedContract.getLine).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine).toHaveBeenNthCalledWith(1, roleProof, line.id.toNumber(), {
            blockTag: undefined
        });
        expect(mockedGetLine).toHaveBeenCalledTimes(1);
    });

    it('should correctly add a order line', async () => {
        mockedGetMaterial.mockReturnValueOnce(undefined);
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'OrderLineAdded',
                    args: [line.id]
                }
            ]
        });
        const newLine: OrderLineRequest = new OrderLineRequest(
            productCategoryStruct.id.toNumber(),
            2,
            units[0],
            EntityBuilder.buildOrderLinePrice(price)
        );
        const newOrderLineId = await orderTradeDriver.addLine(roleProof, newLine);
        const result = await orderTradeDriver.getLine(roleProof, newOrderLineId);

        expect(result).toEqual(
            new OrderLine(
                line.id.toNumber(),
                undefined,
                EntityBuilder.buildProductCategory(productCategoryStruct),
                newLine.quantity,
                units[0],
                newLine.price
            )
        );
        expect(mockedContract.addLine).toHaveBeenCalledTimes(1);
        expect(mockedContract.addLine).toHaveBeenNthCalledWith(
            1,
            roleProof,
            newLine.productCategoryId,
            newLine.quantity,
            newLine.unit,
            price
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine).toHaveBeenNthCalledWith(1, roleProof, line.id, {
            blockTag: undefined
        });
        expect(mockedGetLine).toHaveBeenCalledTimes(1);
    });

    it('should correctly update an existing line', async () => {
        const newPrice: OrderTradeContract.OrderLinePriceStructOutput = {
            amount: BigNumber.from(20),
            decimals: BigNumber.from(0),
            fiat: 'USD'
        } as OrderTradeContract.OrderLinePriceStructOutput;
        const updatedLineStruct: TradeContract.LineStructOutput = {
            id: BigNumber.from(0),
            productCategoryId: BigNumber.from(4),
            quantity: BigNumber.from(3),
            unit: units[1],
            materialId: BigNumber.from(5),
            exists: true
        } as TradeContract.LineStructOutput;
        const updatedOrderLineStruct: OrderTradeContract.OrderLineStructOutput = {
            price: newPrice
        } as OrderTradeContract.OrderLineStructOutput;
        const updatedLine: OrderLine = EntityBuilder.buildOrderLine(
            updatedLineStruct,
            updatedOrderLineStruct,
            productCategoryStruct,
            materialStruct
        );
        await orderTradeDriver.updateLine(roleProof, updatedLine);

        expect(mockedContract.updateLine).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateLine).toHaveBeenNthCalledWith(
            1,
            roleProof,
            updatedLine.id,
            updatedLine.productCategory.id,
            updatedLine.quantity,
            updatedLine.unit,
            newPrice
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should assign a material to a line', async () => {
        const materialId = 1;
        await orderTradeDriver.assignMaterial(roleProof, line.id.toNumber(), materialId);

        expect(mockedContract.assignMaterial).toHaveBeenCalledTimes(1);
        expect(mockedContract.assignMaterial).toHaveBeenNthCalledWith(
            1,
            roleProof,
            line.id.toNumber(),
            materialId
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the negotiation status - INITIALIZED', async () => {
        const result = await orderTradeDriver.getNegotiationStatus();

        expect(result).toEqual(NegotiationStatus.INITIALIZED);

        expect(mockedContract.getNegotiationStatus).toHaveBeenCalledTimes(1);
        expect(mockedContract.getNegotiationStatus).toHaveBeenNthCalledWith(1);
        expect(mockedGetNegotiationStatus).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the negotiation status - PENDING', async () => {
        mockedGetNegotiationStatus.mockReturnValue(Promise.resolve(NegotiationStatus.PENDING));
        const result = await orderTradeDriver.getNegotiationStatus();

        expect(result).toEqual(NegotiationStatus.PENDING);

        expect(mockedContract.getNegotiationStatus).toHaveBeenCalledTimes(1);
        expect(mockedContract.getNegotiationStatus).toHaveBeenNthCalledWith(1);
        expect(mockedGetNegotiationStatus).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the negotiation status - COMPLETED', async () => {
        mockedGetNegotiationStatus.mockReturnValue(Promise.resolve(NegotiationStatus.CONFIRMED));
        const result = await orderTradeDriver.getNegotiationStatus();

        expect(result).toEqual(NegotiationStatus.CONFIRMED);

        expect(mockedContract.getNegotiationStatus).toHaveBeenCalledTimes(1);
        expect(mockedContract.getNegotiationStatus).toHaveBeenNthCalledWith(1);
        expect(mockedGetNegotiationStatus).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the negotiation status - FAIL(Invalid state)', async () => {
        mockedGetNegotiationStatus.mockReturnValue(Promise.resolve(42));
        await expect(orderTradeDriver.getNegotiationStatus()).rejects.toThrow(
            new Error('Invalid state')
        );

        expect(mockedContract.getNegotiationStatus).toHaveBeenCalledTimes(1);
        expect(mockedContract.getNegotiationStatus).toHaveBeenNthCalledWith(1);
        expect(mockedGetNegotiationStatus).toHaveBeenCalledTimes(1);
    });

    it('should correctly update the payment deadline', async () => {
        await orderTradeDriver.updatePaymentDeadline(roleProof, 0);

        expect(mockedContract.updatePaymentDeadline).toHaveBeenCalledTimes(1);
        expect(mockedContract.updatePaymentDeadline).toHaveBeenNthCalledWith(1, roleProof, 0);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly update the document delivery deadline', async () => {
        await orderTradeDriver.updateDocumentDeliveryDeadline(roleProof, 0);

        expect(mockedContract.updateDocumentDeliveryDeadline).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateDocumentDeliveryDeadline).toHaveBeenNthCalledWith(
            1,
            roleProof,
            0
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly update the document delivery deadline', async () => {
        await orderTradeDriver.updateArbiter(roleProof, 'new arbiter');

        expect(mockedContract.updateArbiter).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateArbiter).toHaveBeenNthCalledWith(1, roleProof, 'new arbiter');
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly update the shipping deadline', async () => {
        await orderTradeDriver.updateShippingDeadline(roleProof, 0);

        expect(mockedContract.updateShippingDeadline).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateShippingDeadline).toHaveBeenNthCalledWith(1, roleProof, 0);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly update the delivery deadline', async () => {
        await orderTradeDriver.updateDeliveryDeadline(roleProof, 0);

        expect(mockedContract.updateDeliveryDeadline).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateDeliveryDeadline).toHaveBeenNthCalledWith(1, roleProof, 0);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly update the agreed amount', async () => {
        await orderTradeDriver.updateAgreedAmount(roleProof, 1000);

        expect(mockedContract.updateAgreedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateAgreedAmount).toHaveBeenNthCalledWith(1, roleProof, 1000);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly update the token address', async () => {
        await orderTradeDriver.updateTokenAddress(roleProof, tokenAddress);

        expect(mockedContract.updateTokenAddress).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateTokenAddress).toHaveBeenNthCalledWith(
            1,
            roleProof,
            tokenAddress
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly check if deadlines have expired', async () => {
        const result = await orderTradeDriver.haveDeadlinesExpired();

        expect(result).toEqual(false);

        expect(mockedContract.haveDeadlinesExpired).toHaveBeenCalledTimes(1);
        expect(mockedContract.haveDeadlinesExpired).toHaveBeenNthCalledWith(1);
        expect(mockedHaveDeadlinesExpired).toHaveBeenCalledTimes(1);
    });

    it('should correctly enforce deadlines', async () => {
        await orderTradeDriver.enforceDeadlines();

        expect(mockedContract.enforceDeadlines).toHaveBeenCalledTimes(1);
        expect(mockedContract.enforceDeadlines).toHaveBeenNthCalledWith(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly get who has signed', async () => {
        const result = await orderTradeDriver.getWhoSigned(roleProof);

        expect(result).toEqual([supplier, commissioner]);
        expect(mockedContract.getWhoSigned).toHaveBeenCalledTimes(1);
    });

    it('should correctly confirm the order', async () => {
        await orderTradeDriver.confirmOrder(roleProof);

        expect(mockedContract.confirmOrder).toHaveBeenCalledTimes(1);
        expect(mockedContract.confirmOrder).toHaveBeenNthCalledWith(1, roleProof);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should get block numbers per each event name by order id', async () => {
        await orderTradeDriver.getEmittedEvents();

        expect(mockedQueryFilter).toHaveBeenCalledTimes(Object.keys(mockedEventFilter).length);

        expect(mockedEventFilter.TradeLineAdded).toHaveBeenCalledTimes(1);
        expect(mockedEventFilter.TradeLineAdded).toHaveBeenNthCalledWith(1);

        expect(mockedEventFilter.TradeLineUpdated).toHaveBeenCalledTimes(1);
        expect(mockedEventFilter.TradeLineUpdated).toHaveBeenNthCalledWith(1);

        expect(mockedEventFilter.OrderLineAdded).toHaveBeenCalledTimes(1);
        expect(mockedEventFilter.OrderLineAdded).toHaveBeenNthCalledWith(1);

        expect(mockedEventFilter.OrderLineUpdated).toHaveBeenCalledTimes(1);
        expect(mockedEventFilter.OrderLineUpdated).toHaveBeenNthCalledWith(1);

        expect(mockedEventFilter.OrderSignatureAffixed).toHaveBeenCalledTimes(1);
        expect(mockedEventFilter.OrderSignatureAffixed).toHaveBeenNthCalledWith(1);

        expect(mockedEventFilter.OrderConfirmed).toHaveBeenCalledTimes(1);
        expect(mockedEventFilter.OrderConfirmed).toHaveBeenNthCalledWith(1);

        expect(mockedEventFilter.OrderExpired).toHaveBeenCalledTimes(1);
        expect(mockedEventFilter.OrderExpired).toHaveBeenNthCalledWith(1);
    });

    it('should correctly retrieve shipment address', async () => {
        mockedGetShipment.mockResolvedValueOnce(shipment);
        let shipmentAddress = await orderTradeDriver.getShipmentAddress(roleProof);

        expect(shipmentAddress).toEqual(shipment);

        mockedGetShipment.mockResolvedValueOnce(zeroAddress);
        shipmentAddress = await orderTradeDriver.getShipmentAddress(roleProof);

        expect(shipmentAddress).toBeUndefined();
    });
    it('should correctly retrieve escrow address', async () => {
        mockedGetEscrow.mockResolvedValueOnce(escrow);
        let escrowAddress = await orderTradeDriver.getEscrowAddress(roleProof);

        expect(escrowAddress).toEqual(escrow);

        mockedGetEscrow.mockResolvedValueOnce(zeroAddress);
        escrowAddress = await orderTradeDriver.getEscrowAddress(roleProof);

        expect(escrowAddress).toBeUndefined();
    });
});
