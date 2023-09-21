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
    SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS,
} from './config';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { NegotiationStatus } from '../types/NegotiationStatus';
import DocumentService from '../services/DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { SupplyChainService } from '../services/SupplyChainService';
import { SupplyChainDriver } from '../drivers/SupplyChainDriver';
import { TradeLine } from '../entities/TradeLine';

dotenv.config();

describe('Trade lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeService: TradeService;
    let tradeDriver: TradeDriver;

    let documentService: DocumentService;
    let documentDriver: DocumentDriver;

    let supplyChainService: SupplyChainService;
    let supplyChainDriver: SupplyChainDriver;

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
    const productCategories = ['CategoryA', 'CategoryB'];

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

        supplyChainDriver = new SupplyChainDriver(
            signer,
            SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS,
        );
        supplyChainService = new SupplyChainService(supplyChainDriver);
    });

    it('Should register some materials (created two times with two names to simulate material mapping for companies)', async () => {
        const supplierMaterialName = 'material 1 supplier';
        const customerMaterialName = 'material 1 customer';
        await supplyChainService.registerMaterial(SUPPLIER_ADDRESS, supplierMaterialName);
        await supplyChainService.registerMaterial(CUSTOMER_ADDRESS, customerMaterialName);

        supplierMaterialsCounter = await supplyChainService.getMaterialsCounter(SUPPLIER_ADDRESS);
        customerMaterialsCounter = await supplyChainService.getMaterialsCounter(CUSTOMER_ADDRESS);
        expect(supplierMaterialsCounter).toEqual(1);
        expect(customerMaterialsCounter).toEqual(1);

        const supplierMaterial = await supplyChainService.getMaterial(SUPPLIER_ADDRESS, supplierMaterialsCounter);
        expect(supplierMaterial.id).toEqual(supplierMaterialsCounter);
        expect(supplierMaterial.name).toEqual(supplierMaterialName);
        expect(supplierMaterial.owner).toEqual(SUPPLIER_ADDRESS);

        const customerMaterial = await supplyChainService.getMaterial(CUSTOMER_ADDRESS, customerMaterialsCounter);
        expect(customerMaterial.id).toEqual(customerMaterialsCounter);
        expect(customerMaterial.name).toEqual(customerMaterialName);
        expect(customerMaterial.owner).toEqual(CUSTOMER_ADDRESS);
    });

    describe('Order scenario', () => {
        it('Should correctly register and retrieve a order with a line', async () => {
            const orderLine: OrderLine = new OrderLine(0, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 20, new OrderLinePrice(10.25, 'USD'));

            const metadataUrl = await pinataService.storeJSON(orderMetadata);
            await tradeService.registerOrder(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, metadataUrl);

            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            await tradeService.addOrderOfferee(SUPPLIER_ADDRESS, tradeCounterId, CUSTOMER_ADDRESS);
            await tradeService.addOrderLines(SUPPLIER_ADDRESS, tradeCounterId, [orderLine]);
            const { lineIds } = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];

            const savedOrderInfo = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);
            const savedOrder = await tradeService.getCompleteOrder(savedOrderInfo);
            expect(savedOrder).toBeDefined();
            expect(savedOrderInfo).toBeDefined();
            expect(savedOrder!.id).toEqual(tradeCounterId);
            expect(savedOrder!.supplier).toEqual(SUPPLIER_ADDRESS);
            expect(savedOrder!.customer).toEqual(CUSTOMER_ADDRESS);
            expect(savedOrder!.offeree).toEqual(CUSTOMER_ADDRESS);
            expect(savedOrder!.offeror).toEqual(SUPPLIER_ADDRESS);
            expect(savedOrder!.offereeSigned).toBeFalsy();
            expect(savedOrder!.offerorSigned).toBeFalsy();
            expect(savedOrder!.lineIds).toEqual([tradeLineCounterId]);
            expect(savedOrder!.paymentDeadline).toBeUndefined();
            expect(savedOrder!.documentDeliveryDeadline).toBeUndefined();
            expect(savedOrder!.arbiter).toBeUndefined();
            expect(savedOrder!.shippingDeadline).toBeUndefined();
            expect(savedOrder!.deliveryDeadline).toBeUndefined();
            // metadata
            expect(savedOrder!.incoterms).toEqual(orderMetadata.incoterms);
            expect(savedOrder!.shipper).toEqual(orderMetadata.shipper);
            expect(savedOrder!.shippingPort).toEqual(orderMetadata.shippingPort);
            expect(savedOrder!.deliveryPort).toEqual(orderMetadata.deliveryPort);

            const savedOrderLine = await tradeService.getOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId);
            expect(savedOrderLine.id).toEqual(tradeLineCounterId);
            expect(savedOrderLine.price).toEqual(orderLine.price);
            expect(savedOrderLine.quantity).toEqual(orderLine.quantity);
            expect(savedOrderLine.materialIds).toEqual([customerMaterialsCounter, supplierMaterialsCounter]);
            expect(savedOrderLine.productCategory).toEqual(orderLine.productCategory);
        }, 20000);

        it('Should check if an order exists', async () => {
            const exists = await tradeService.tradeExists(SUPPLIER_ADDRESS, tradeCounterId);
            expect(exists).toBeDefined();
            expect(exists).toBeTruthy();
        });

        it('Should throw error while getting an order if supplier is not an address', async () => {
            const fn = async () => tradeService.getOrderInfo('address', 1);
            await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
        });

        it('Should try to add an order line to a trade, fails because an order line must be added to an order', async () => {
            await tradeService.registerBasicTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, tradeName, externalUrl);
            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);

            const fn = async () => tradeService.addOrderLine(SUPPLIER_ADDRESS, tradeCounterId, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 5, new OrderLinePrice(10.25, 'USD'));
            await expect(fn).rejects.toThrowError(/Can't perform this operation if not ORDER/);
        });

        it('Should check that the order status is INITIALIZED (no signatures)', async () => {
            await tradeService.registerOrder(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, externalUrl);
            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            await tradeService.addOrderOfferee(SUPPLIER_ADDRESS, tradeCounterId, CUSTOMER_ADDRESS);
            orderStatus = await tradeService.getNegotiationStatus(SUPPLIER_ADDRESS, tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.INITIALIZED);
        });

        it('Should alter an order by setting some constraints and check that the status is PENDING', async () => {
            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            await tradeService.setOrderDocumentDeliveryDeadline(SUPPLIER_ADDRESS, tradeCounterId, deadline);
            await tradeService.setOrderArbiter(SUPPLIER_ADDRESS, tradeCounterId, arbiter);

            orderStatus = await tradeService.getNegotiationStatus(SUPPLIER_ADDRESS, tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.PENDING);
        });

        it('Should add a line to an order as a supplier and check that the status is still PENDING', async () => {
            // add other materials
            await supplyChainService.registerMaterial(SUPPLIER_ADDRESS, 'material 2 supplier');
            await supplyChainService.registerMaterial(CUSTOMER_ADDRESS, 'material 2 customer');
            supplierMaterialsCounter = await supplyChainService.getMaterialsCounter(SUPPLIER_ADDRESS);
            customerMaterialsCounter = await supplyChainService.getMaterialsCounter(CUSTOMER_ADDRESS);

            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            const line = new OrderLine(0, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[1], 20, new OrderLinePrice(10.25, 'USD'));

            await tradeService.addOrderLine(SUPPLIER_ADDRESS, tradeCounterId, [customerMaterialsCounter, supplierMaterialsCounter], line.productCategory, line.quantity, line.price);
            const { lineIds } = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];

            const savedLine = await tradeService.getOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId);
            line.id = tradeLineCounterId;
            expect(savedLine).toEqual(line);

            orderStatus = await tradeService.getNegotiationStatus(SUPPLIER_ADDRESS, tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.PENDING);
        });

        it('Should add a line to a new order as a customer and status again in PENDING', async () => {
            _defineSender(CUSTOMER_PRIVATE_KEY);
            // add other materials
            await supplyChainService.registerMaterial(SUPPLIER_ADDRESS, 'material 3 supplier');
            await supplyChainService.registerMaterial(CUSTOMER_ADDRESS, 'material 3 customer');
            supplierMaterialsCounter = await supplyChainService.getMaterialsCounter(SUPPLIER_ADDRESS);
            customerMaterialsCounter = await supplyChainService.getMaterialsCounter(CUSTOMER_ADDRESS);

            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            const line = new OrderLine(0, [supplierMaterialsCounter, customerMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50.5, 'USD'));

            await tradeService.addOrderLine(SUPPLIER_ADDRESS, tradeCounterId, [supplierMaterialsCounter, customerMaterialsCounter], line.productCategory, line.quantity, line.price);
            const { lineIds } = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];

            const savedLine = await tradeService.getOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId);
            line.id = tradeLineCounterId;
            expect(savedLine).toEqual(line);

            orderStatus = await tradeService.getNegotiationStatus(SUPPLIER_ADDRESS, tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.PENDING);
        });

        it('Should try to confirm an order as supplier, fails because not all constraints are set', async () => {
            _defineSender(SUPPLIER_PRIVATE_KEY);
            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            const fn = async () => tradeService.confirmOrder(SUPPLIER_ADDRESS, tradeCounterId);
            await expect(fn).rejects.toThrowError(/Cannot confirm an order if all constraints have not been defined/);
        });

        it('Should add a document, fails because the order is not already confirmed', async () => {
            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            const fn = async () => tradeService.addDocument(SUPPLIER_ADDRESS, tradeCounterId, 'document name', 'Bill of lading', 'external url');
            await expect(fn).rejects.toThrowError(/The order is not already confirmed, cannot add document/);
        });

        it('Should add remaining constraints as customer', async () => {
            _defineSender(CUSTOMER_PRIVATE_KEY);

            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            await tradeService.setOrderPaymentDeadline(SUPPLIER_ADDRESS, tradeCounterId, deadline);
            await tradeService.setOrderShippingDeadline(SUPPLIER_ADDRESS, tradeCounterId, deadline);
            await tradeService.setOrderDeliveryDeadline(SUPPLIER_ADDRESS, tradeCounterId, deadline);
        });

        it('Should confirm as supplier the order updated by the customer', async () => {
            _defineSender(SUPPLIER_PRIVATE_KEY);

            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            await tradeService.confirmOrder(SUPPLIER_ADDRESS, tradeCounterId);

            orderStatus = await tradeService.getNegotiationStatus(SUPPLIER_ADDRESS, tradeCounterId);
            expect(orderStatus).toEqual(NegotiationStatus.COMPLETED);
        });

        it('Should add a document, fails because the document type is wrong', async () => {
            await documentService.addOrderManager(TRADE_MANAGER_CONTRACT_ADDRESS);
            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            const fn = async () => tradeService.addDocument(SUPPLIER_ADDRESS, tradeCounterId, 'document name', 'custom doc type', 'external url');
            await expect(fn).rejects.toThrowError(/The document type isn't registered/);
        });

        it('should try to add a line to a negotiated order', async () => {
            const orderLine = new OrderLine(0, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50, 'USD'));
            // updates cannot be possible because the order has been confirmed by both parties
            const fn = async () => tradeService.updateOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId, orderLine.materialIds, orderLine.productCategory, orderLine.quantity, orderLine.price);
            await expect(fn).rejects.toThrowError(/The order has been confirmed, it cannot be changed/);
        });

        it('should negotiate an order and get its history by navigating with block numbers', async () => {
            await tradeService.registerOrder(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, externalUrl);
            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);

            const orderVersion1 = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);
            await tradeService.addOrderOfferee(SUPPLIER_ADDRESS, tradeCounterId, CUSTOMER_ADDRESS);
            await tradeService.addOrderLine(SUPPLIER_ADDRESS, tradeCounterId, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50, 'USD'));
            const orderVersion2 = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);

            _defineSender(CUSTOMER_PRIVATE_KEY);

            await tradeService.addOrderLine(SUPPLIER_ADDRESS, tradeCounterId, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[1], 10, new OrderLinePrice(20, 'USD'));
            const orderVersion3 = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);
            const { lineIds } = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];
            const orderLineVersion1 = await tradeService.getOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId);

            _defineSender(SUPPLIER_PRIVATE_KEY);

            await tradeService.updateOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId, [supplierMaterialsCounter, customerMaterialsCounter], 'CategoryA Superior', 40, new OrderLinePrice(20, 'USD'));
            const orderVersion4 = await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId);
            const orderLineVersion2 = await tradeService.getOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId);

            const eventsBlockNumbers = await tradeService.getBlockNumbersByOrderId(tradeCounterId);
            expect(await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId, eventsBlockNumbers.get(TradeEvents.TradeRegistered)![0])).toEqual(orderVersion1);
            expect(await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![0])).toEqual(orderVersion2);
            expect(await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![1])).toEqual(orderVersion3);
            expect(await tradeService.getOrderInfo(SUPPLIER_ADDRESS, tradeCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineUpdated)![0])).toEqual(orderVersion4);

            // the order line added has been updated, so there is another version of it and we can access by the specific block number obtained by searching from "OrderLineAdded" and "OrderLineUpdated" event
            expect(await tradeService.getOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineAdded)![1])).toEqual(orderLineVersion1);
            expect(await tradeService.getOrderLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId, eventsBlockNumbers.get(TradeEvents.OrderLineUpdated)![0])).toEqual(orderLineVersion2);
        });
    });

    describe('Trade scenario', () => {
        it('Should correctly register and retrieve a basic trade with a line', async () => {
            _defineSender(SUPPLIER_PRIVATE_KEY, pinataService);
            const tradeLine: TradeLine = new TradeLine(0, [customerMaterialsCounter, supplierMaterialsCounter], productCategories[0]);

            const metadataUrl = await pinataService.storeJSON(basicTradeMetadata);
            await tradeService.registerBasicTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, tradeName, metadataUrl);

            tradeCounterId = await tradeService.getTradeCounter(SUPPLIER_ADDRESS);
            await tradeService.addTradeLines(SUPPLIER_ADDRESS, tradeCounterId, [tradeLine]);
            const { lineIds } = await tradeService.getBasicTradeInfo(SUPPLIER_ADDRESS, tradeCounterId);
            tradeLineCounterId = lineIds.splice(-1)[0];

            const savedBasicTradeInfo = await tradeService.getBasicTradeInfo(SUPPLIER_ADDRESS, tradeCounterId);
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

            const savedTradeLine = await tradeService.getTradeLine(SUPPLIER_ADDRESS, tradeCounterId, tradeLineCounterId);
            expect(savedTradeLine.id).toEqual(tradeLineCounterId);
            expect(savedTradeLine.materialIds).toEqual([customerMaterialsCounter, supplierMaterialsCounter]);
            expect(savedTradeLine.productCategory).toEqual(tradeLine.productCategory);
        });

        it('Should check if a trade exists', async () => {
            const exists = await tradeService.tradeExists(SUPPLIER_ADDRESS, tradeCounterId);
            expect(exists).toBeDefined();
            expect(exists).toBeTruthy();
        });
    });
});
