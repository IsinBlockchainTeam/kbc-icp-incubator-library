import * as dotenv from 'dotenv';

import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
import { IPFSService, PinataIPFSDriver } from '@blockchain-lib/common';
import TradeService from '../services/TradeService';
import { TradeDriver, TradeEvents } from '../drivers/TradeDriver';
import {
    CUSTOMER_ADDRESS,
    CUSTOMER_PRIVATE_KEY,
    DOCUMENT_MANAGER_CONTRACT_ADDRESS,
    NETWORK,
    TRADE_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY,
    MATERIAL_MANAGER_CONTRACT_ADDRESS,
} from './config';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { NegotiationStatus } from '../types/NegotiationStatus';
import DocumentService from '../services/DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { MaterialService } from '../services/MaterialService';
import { MaterialDriver } from '../drivers/MaterialDriver';
import { TradeLine } from '../entities/TradeLine';

dotenv.config();

describe('Trade lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeService: TradeService;
    let tradeDriver: TradeDriver;

    let documentService: DocumentService;
    let documentDriver: DocumentDriver;

    let materialService: MaterialService;
    let materialDriver: MaterialDriver;

    let pinataDriver: PinataIPFSDriver;
    let pinataService: IPFSService;

    let tradeCounterId = 0;
    let tradeLineCounterId = 0;
    let supplierMaterialsCounter = 0;
    let customerMaterialsCounter = 0;

    let orderStatus: NegotiationStatus;
    const tradeName = 'trade custom name';
    const externalUrl = 'externalUrl';
    const deadline = new Date('2030-10-10');
    const arbiter = 'arbiter 1';
    const orderMetadata = {
        incoterms: 'incoterms',
        shipper: 'shipper 1',
        shippingPort: 'shipping port 1',
        deliveryPort: 'delivery port',
    };
    const basicTradeMetadata = { issueDate: new Date() };
    const productCategories = ['Arabic 85', 'Excelsa 88'];

    const _defineSender = (privateKey: string, ipfsService?: IPFSService) => {
        signer = new ethers.Wallet(privateKey, provider);
        tradeDriver = new TradeDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
        );
        tradeService = new TradeService(tradeDriver, ipfsService);
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);

        pinataDriver = new PinataIPFSDriver(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_API_KEY!, process.env.PINATA_GATEWAY_URL!, process.env.PINATA_GATEWAY_TOKEN!);
        pinataService = new IPFSService(pinataDriver);

        _defineSender(SUPPLIER_PRIVATE_KEY, pinataService);
        documentDriver = new DocumentDriver(
            signer,
            DOCUMENT_MANAGER_CONTRACT_ADDRESS,
        );
        documentService = new DocumentService(documentDriver);

        materialDriver = new MaterialDriver(
            signer,
            MATERIAL_MANAGER_CONTRACT_ADDRESS,
        );
        materialService = new MaterialService(materialDriver);
    });

    it('Should register some materials (created two times with two names to simulate material mapping for companies)', async () => {
        const supplierMaterialName = 'material 1 supplier';
        const customerMaterialName = 'material 1 customer';
        await materialService.registerMaterial(SUPPLIER_ADDRESS, supplierMaterialName);
        supplierMaterialsCounter = await materialService.getMaterialsCounter();

        await materialService.registerMaterial(CUSTOMER_ADDRESS, customerMaterialName);
        customerMaterialsCounter = await materialService.getMaterialsCounter();

        const supplierMaterial = await materialService.getMaterial(supplierMaterialsCounter);
        expect(supplierMaterial.id).toEqual(supplierMaterialsCounter);
        expect(supplierMaterial.name).toEqual(supplierMaterialName);
        expect(supplierMaterial.owner).toEqual(SUPPLIER_ADDRESS);

        const customerMaterial = await materialService.getMaterial(customerMaterialsCounter);
        expect(customerMaterial.id).toEqual(customerMaterialsCounter);
        expect(customerMaterial.name).toEqual(customerMaterialName);
        expect(customerMaterial.owner).toEqual(CUSTOMER_ADDRESS);
    });

    describe('Order scenario', () => {
        it('Should correctly register and retrieve a order with a line', async () => {
            const orderLine: OrderLine = new OrderLine(0, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 20, new OrderLinePrice(10.25, 'USD'));

            const metadataUrl = await pinataService.storeJSON(orderMetadata);
            await tradeService.registerOrder(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, metadataUrl);

            tradeCounterId = await tradeService.getCounter();
            await tradeService.addOrderOfferee(tradeCounterId, CUSTOMER_ADDRESS);
            await tradeService.addOrderLines(tradeCounterId, [orderLine]);
            const { lineIds } = await tradeService.getOrderInfo(tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];

            const savedOrderInfo = await tradeService.getOrderInfo(tradeCounterId);
            const savedOrder = await tradeService.getCompleteOrder(savedOrderInfo);
            expect(savedOrder).toBeDefined();
            expect(savedOrderInfo).toBeDefined();
            expect(savedOrder.id).toEqual(tradeCounterId);
            expect(savedOrder.supplier).toEqual(SUPPLIER_ADDRESS);
            expect(savedOrder.customer).toEqual(CUSTOMER_ADDRESS);
            expect(savedOrder.offeree).toEqual(CUSTOMER_ADDRESS);
            expect(savedOrder.offeror).toEqual(SUPPLIER_ADDRESS);
            expect(savedOrder.offereeSigned).toBeFalsy();
            expect(savedOrder.offerorSigned).toBeFalsy();
            expect(savedOrder.lineIds).toEqual([tradeLineCounterId]);
            expect(savedOrder.paymentDeadline).toBeUndefined();
            expect(savedOrder.documentDeliveryDeadline).toBeUndefined();
            expect(savedOrder.arbiter).toBeUndefined();
            expect(savedOrder.shippingDeadline).toBeUndefined();
            expect(savedOrder.deliveryDeadline).toBeUndefined();
            // metadata
            expect(savedOrder.incoterms).toEqual(orderMetadata.incoterms);
            expect(savedOrder.shipper).toEqual(orderMetadata.shipper);
            expect(savedOrder.shippingPort).toEqual(orderMetadata.shippingPort);
            expect(savedOrder.deliveryPort).toEqual(orderMetadata.deliveryPort);

            const savedOrderLine = await tradeService.getOrderLine(tradeCounterId, tradeLineCounterId);
            expect(savedOrderLine.id).toEqual(tradeLineCounterId);
            expect(savedOrderLine.price).toEqual(orderLine.price);
            expect(savedOrderLine.quantity).toEqual(orderLine.quantity);
            expect(savedOrderLine.materialIds).toEqual([customerMaterialsCounter, supplierMaterialsCounter]);
            expect(savedOrderLine.productCategory).toEqual(orderLine.productCategory);
        }, 30000);

        it('Should check if an order exists', async () => {
            const exists = await tradeService.tradeExists(tradeCounterId);
            expect(exists).toBeDefined();
            expect(exists).toBeTruthy();
        });

        it('Should try to add an order line to a trade, fails because an order line must be added to an order', async () => {
            await tradeService.registerBasicTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, tradeName, externalUrl);
            tradeCounterId = await tradeService.getCounter();

            const fn = async () => tradeService.addOrderLine(tradeCounterId, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 5, new OrderLinePrice(10.25, 'USD'));
            await expect(fn).rejects.toThrowError(/Can't perform this operation if not ORDER/);
        });

        it('Should check that the order status is INITIALIZED (no signatures)', async () => {
            await tradeService.registerOrder(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, externalUrl);
            tradeCounterId = await tradeService.getCounter();
            await tradeService.addOrderOfferee(tradeCounterId, CUSTOMER_ADDRESS);
            orderStatus = await tradeService.getNegotiationStatus(tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.INITIALIZED);
        });

        it('Should alter an order by setting some constraints and check that the status is PENDING', async () => {
            tradeCounterId = await tradeService.getCounter();
            await tradeService.setOrderDocumentDeliveryDeadline(tradeCounterId, deadline);
            await tradeService.setOrderArbiter(tradeCounterId, arbiter);

            orderStatus = await tradeService.getNegotiationStatus(tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.PENDING);
        });

        it('Should add a line to an order as a supplier and check that the status is still PENDING', async () => {
            // add other materials
            await materialService.registerMaterial(SUPPLIER_ADDRESS, 'material 2 supplier');
            await materialService.registerMaterial(CUSTOMER_ADDRESS, 'material 2 customer');
            supplierMaterialsCounter = await materialService.getMaterialsCounter();
            customerMaterialsCounter = await materialService.getMaterialsCounter();

            tradeCounterId = await tradeService.getCounter();
            const line = new OrderLine(0, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[1], 20, new OrderLinePrice(10.25, 'USD'));

            await tradeService.addOrderLine(tradeCounterId, [customerMaterialsCounter, supplierMaterialsCounter], line.productCategory, line.quantity, line.price);
            const { lineIds } = await tradeService.getOrderInfo(tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];

            const savedLine = await tradeService.getOrderLine(tradeCounterId, tradeLineCounterId);
            line.id = tradeLineCounterId;
            expect(savedLine).toEqual(line);

            orderStatus = await tradeService.getNegotiationStatus(tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.PENDING);
        });

        it('Should add a line to a new order as a customer and status again in PENDING', async () => {
            _defineSender(CUSTOMER_PRIVATE_KEY);
            // add other materials
            await materialService.registerMaterial(SUPPLIER_ADDRESS, 'material 3 supplier');
            await materialService.registerMaterial(CUSTOMER_ADDRESS, 'material 3 customer');
            supplierMaterialsCounter = await materialService.getMaterialsCounter();
            customerMaterialsCounter = await materialService.getMaterialsCounter();

            tradeCounterId = await tradeService.getCounter();
            const line = new OrderLine(0, [supplierMaterialsCounter, customerMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50.5, 'USD'));

            await tradeService.addOrderLine(tradeCounterId, [supplierMaterialsCounter, customerMaterialsCounter], line.productCategory, line.quantity, line.price);
            const { lineIds } = await tradeService.getOrderInfo(tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];

            const savedLine = await tradeService.getOrderLine(tradeCounterId, tradeLineCounterId);
            line.id = tradeLineCounterId;
            expect(savedLine).toEqual(line);

            orderStatus = await tradeService.getNegotiationStatus(tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.PENDING);
        });

        it('Should try to confirm an order as supplier, fails because not all constraints are set', async () => {
            _defineSender(SUPPLIER_PRIVATE_KEY);
            tradeCounterId = await tradeService.getCounter();
            const fn = async () => tradeService.confirmOrder(tradeCounterId);
            await expect(fn).rejects.toThrowError(/Cannot confirm an order if all constraints have not been defined/);
        });

        it('Should add remaining constraints as customer', async () => {
            _defineSender(CUSTOMER_PRIVATE_KEY);

            tradeCounterId = await tradeService.getCounter();
            await tradeService.setOrderPaymentDeadline(tradeCounterId, deadline);
            await tradeService.setOrderShippingDeadline(tradeCounterId, deadline);
            await tradeService.setOrderDeliveryDeadline(tradeCounterId, deadline);
        });

        it('Should confirm as supplier the order updated by the customer', async () => {
            _defineSender(SUPPLIER_PRIVATE_KEY);

            tradeCounterId = await tradeService.getCounter();
            await tradeService.confirmOrder(tradeCounterId);

            orderStatus = await tradeService.getNegotiationStatus(tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.COMPLETED);
        });

        it('Should add a document, fails because the document type is wrong', async () => {
            await documentService.addOrderManager(TRADE_MANAGER_CONTRACT_ADDRESS);
            tradeCounterId = await tradeService.getCounter();
            const fn = async () => tradeService.addDocument(tradeCounterId, 'document name', 'custom doc type', 'external url');
            await expect(fn).rejects.toThrowError(/The document type isn't registered/);
        });

        it('should try to add a line to a negotiated order', async () => {
            const orderLine = new OrderLine(0, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50, 'USD'));
            // updates cannot be possible because the order has been confirmed by both parties
            const fn = async () => tradeService.updateOrderLine(tradeCounterId, tradeLineCounterId, orderLine.materialIds, orderLine.productCategory, orderLine.quantity, orderLine.price);
            await expect(fn).rejects.toThrowError(/The order has been confirmed, it cannot be changed/);
        });

        it('should negotiate an order and get its history by navigating with block numbers', async () => {
            await tradeService.registerOrder(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, externalUrl);
            tradeCounterId = await tradeService.getCounter();

            const orderVersion1 = await tradeService.getOrderInfo(tradeCounterId);
            await tradeService.addOrderOfferee(tradeCounterId, CUSTOMER_ADDRESS);
            await tradeService.addOrderLine(tradeCounterId, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50, 'USD'));
            const orderVersion2 = await tradeService.getOrderInfo(tradeCounterId);

            _defineSender(CUSTOMER_PRIVATE_KEY);

            await tradeService.addOrderLine(tradeCounterId, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[1], 10, new OrderLinePrice(20, 'USD'));
            const orderVersion3 = await tradeService.getOrderInfo(tradeCounterId);
            const { lineIds } = await tradeService.getOrderInfo(tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];
            const orderLineVersion1 = await tradeService.getOrderLine(tradeCounterId, tradeLineCounterId);

            _defineSender(SUPPLIER_PRIVATE_KEY);

            await tradeService.updateOrderLine(tradeCounterId, tradeLineCounterId, [supplierMaterialsCounter, customerMaterialsCounter], 'Arabic 85 Superior', 40, new OrderLinePrice(20, 'USD'));
            const orderVersion4 = await tradeService.getOrderInfo(tradeCounterId);
            const orderLineVersion2 = await tradeService.getOrderLine(tradeCounterId, tradeLineCounterId);

            const eventsBlockNumbers = await tradeService.getBlockNumbersByOrderId(tradeCounterId);
            expect(await tradeService.getOrderInfo(tradeCounterId, eventsBlockNumbers.get(TradeEvents.TradeRegistered)![0])).toEqual(orderVersion1);
            expect(await tradeService.getOrderInfo(tradeCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![0])).toEqual(orderVersion2);
            expect(await tradeService.getOrderInfo(tradeCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![1])).toEqual(orderVersion3);
            expect(await tradeService.getOrderInfo(tradeCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineUpdated)![0])).toEqual(orderVersion4);

            // the order line added has been updated, so there is another version of it and we can access by the specific block number obtained by searching from "OrderLineAdded" and "OrderLineUpdated" event
            expect(await tradeService.getOrderLine(tradeCounterId, tradeLineCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![1])).toEqual(orderLineVersion1);
            expect(await tradeService.getOrderLine(tradeCounterId, tradeLineCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineUpdated)![0])).toEqual(orderLineVersion2);
        });
    });

    describe('Trade scenario', () => {
        it('Should correctly register and retrieve a basic trade with a line', async () => {
            _defineSender(SUPPLIER_PRIVATE_KEY, pinataService);
            const tradeLine: TradeLine = new TradeLine(0, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0]);

            const metadataUrl = await pinataService.storeJSON(basicTradeMetadata);
            await tradeService.registerBasicTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, tradeName, metadataUrl);

            tradeCounterId = await tradeService.getCounter();
            await tradeService.addTradeLines(tradeCounterId, [tradeLine]);
            const { lineIds } = await tradeService.getBasicTradeInfo(tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];

            const savedBasicTradeInfo = await tradeService.getBasicTradeInfo(tradeCounterId);
            const savedBasicTrade = await tradeService.getCompleteBasicTrade(savedBasicTradeInfo);
            expect(savedBasicTrade).toBeDefined();
            expect(savedBasicTradeInfo).toBeDefined();
            expect(savedBasicTrade!.id).toEqual(tradeCounterId);
            expect(savedBasicTrade!.supplier).toEqual(SUPPLIER_ADDRESS);
            expect(savedBasicTrade!.customer).toEqual(CUSTOMER_ADDRESS);
            expect(savedBasicTrade!.name).toEqual(tradeName);
            expect(savedBasicTrade!.lineIds).toEqual([tradeLineCounterId]);
            // metadata
            expect(savedBasicTrade!.issueDate).toEqual(basicTradeMetadata.issueDate);

            const savedTradeLine = await tradeService.getTradeLine(tradeCounterId, tradeLineCounterId);
            expect(savedTradeLine.id).toEqual(tradeLineCounterId);
            expect(savedTradeLine.materialIds).toEqual([customerMaterialsCounter, supplierMaterialsCounter]);
            expect(savedTradeLine.productCategory).toEqual(tradeLine.productCategory);
        }, 30000);

        it('Should check if a trade exists', async () => {
            const exists = await tradeService.tradeExists(tradeCounterId);
            expect(exists).toBeDefined();
            expect(exists).toBeTruthy();
        });
    });
});
