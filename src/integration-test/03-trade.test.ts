import * as dotenv from 'dotenv';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer, Wallet } from 'ethers';
import { ICPResourceSpec } from '@blockchain-lib/common/index';
import {
    CUSTOMER_ADDRESS, DOCUMENT_MANAGER_CONTRACT_ADDRESS,
    MATERIAL_MANAGER_CONTRACT_ADDRESS,
    MY_TOKEN_CONTRACT_ADDRESS,
    NETWORK,
    OTHER_ADDRESS,
    PRODUCT_CATEGORY_CONTRACT_ADDRESS,
    SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY,
    TRADE_MANAGER_CONTRACT_ADDRESS,
} from './config';
import { MaterialService } from '../services/MaterialService';
import { MaterialDriver } from '../drivers/MaterialDriver';
import { TradeManagerService } from '../services/TradeManagerService';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { OrderTradeService } from '../services/OrderTradeService';
import { OrderTradeDriver } from '../drivers/OrderTradeDriver';
import { OrderTradeMetadata } from '../entities/OrderTrade';
import { URLStructure } from '../types/URLStructure';
import { OrderStatus } from '../types/OrderStatus';
import { DocumentType } from '../entities/DocumentInfo';
import { DocumentService } from '../services/DocumentService';
import { DocumentStatus } from '../entities/Document';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { serial } from '../utils/utils';

dotenv.config();

it('always passes', () => {
    expect(true).toBeTruthy();
});

describe('Trade lifecycle', () => {
    let provider: JsonRpcProvider;
    let signer: Signer;

    let tradeManagerService: TradeManagerService;

    let materialService: MaterialService;
    let materialDriver: MaterialDriver;

    let documentService: DocumentService;
    let documentDriver: DocumentDriver;

    let existingOrder: number;
    let existingOrderService: OrderTradeService;

    const deadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;
    const arbiter: string = Wallet.createRandom().address;

    const productCategoryIds: number[] = [];
    const materialIds: number[] = [];

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        const tradeManagerDriver: TradeManagerDriver = new TradeManagerDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
            MATERIAL_MANAGER_CONTRACT_ADDRESS,
            PRODUCT_CATEGORY_CONTRACT_ADDRESS,
        );
        tradeManagerService = new TradeManagerService({ tradeManagerDriver, icpFileDriver: {} as ICPFileDriver });
    };

    const _updateExistingOrderService = async () => {
        const orderAddress: string = await tradeManagerService.getTrade(existingOrder);
        existingOrderService = new OrderTradeService(new OrderTradeDriver(signer, orderAddress, MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
    };

    const _registerOrder = async (): Promise<{
        orderAddress: string,
        orderTradeService: OrderTradeService
    }> => {
        const metadata: OrderTradeMetadata = {
            incoterms: 'FOB',
            shipper: 'Shipper 1',
            shippingPort: 'Port 1',
            deliveryPort: 'Port 2',
        };
        const urlStructure: URLStructure = {
            prefix: 'prefix',
            organizationId: 1,
        };
        const [tradeId, tradeAddress] = await tradeManagerService.registerOrderTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, OTHER_ADDRESS, deadline, deadline, arbiter, deadline, deadline, 1000, MY_TOKEN_CONTRACT_ADDRESS, metadata, urlStructure, [1]);
        existingOrder = tradeId;
        existingOrderService = new OrderTradeService(new OrderTradeDriver(signer, await tradeManagerService.getTrade(tradeId), MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS), {} as DocumentDriver, {} as ICPFileDriver);
        return {
            orderAddress: tradeAddress,
            orderTradeService: existingOrderService,
        };
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);

        _defineSender(SUPPLIER_PRIVATE_KEY);

        materialDriver = new MaterialDriver(
            signer,
            MATERIAL_MANAGER_CONTRACT_ADDRESS,
            PRODUCT_CATEGORY_CONTRACT_ADDRESS,
        );
        materialService = new MaterialService(materialDriver);

        documentDriver = new DocumentDriver(
            signer,
            DOCUMENT_MANAGER_CONTRACT_ADDRESS,
        );
        documentService = new DocumentService(documentDriver, {} as ICPFileDriver);
    });

    it('Should check order status, depending on documents upload', async () => {
        const docContent = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
        const externalUrl = 'icp_storage/1';
        const resourceSpec: ICPResourceSpec = {
            name: 'filename.pdf',
            type: 'application/pdf',
        };
        const delegatedOrganizationIds = [1];
        const { orderTradeService } = await _registerOrder();
        expect(await orderTradeService.getOrderStatus()).toEqual(OrderStatus.CONTRACTING);

        await orderTradeService.addDocument(DocumentType.PAYMENT_INVOICE, docContent, externalUrl, resourceSpec, delegatedOrganizationIds);
        await orderTradeService.validateDocument((await orderTradeService.getDocumentIdsByType(DocumentType.PAYMENT_INVOICE))[0], DocumentStatus.APPROVED);
        expect(await orderTradeService.getOrderStatus()).toEqual(OrderStatus.PAYED);

        await orderTradeService.addDocument(DocumentType.ORIGIN_SWISS_DECODE, docContent, externalUrl, resourceSpec, delegatedOrganizationIds);
        await orderTradeService.addDocument(DocumentType.WEIGHT_CERTIFICATE, docContent, externalUrl, resourceSpec, delegatedOrganizationIds);
        await orderTradeService.addDocument(DocumentType.FUMIGATION_CERTIFICATE, docContent, externalUrl, resourceSpec, delegatedOrganizationIds);
        await orderTradeService.addDocument(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE, docContent, externalUrl, resourceSpec, delegatedOrganizationIds);
        await orderTradeService.addDocument(DocumentType.PHYTOSANITARY_CERTIFICATE, docContent, externalUrl, resourceSpec, delegatedOrganizationIds);
        await orderTradeService.addDocument(DocumentType.INSURANCE_CERTIFICATE, docContent, externalUrl, resourceSpec, delegatedOrganizationIds);
        expect(await orderTradeService.getOrderStatus()).toEqual(OrderStatus.PAYED); // documents not yet validated

        const documentIds = await orderTradeService.getAllDocumentIds();
        await serial(documentIds.map((doc) => async () => orderTradeService.validateDocument(doc, DocumentStatus.APPROVED)));
        expect(await orderTradeService.getOrderStatus()).toEqual(OrderStatus.EXPORTED);

        await orderTradeService.addDocument(DocumentType.BILL_OF_LADING, docContent, externalUrl, resourceSpec, delegatedOrganizationIds);
        await orderTradeService.validateDocument((await orderTradeService.getDocumentIdsByType(DocumentType.BILL_OF_LADING))[0], DocumentStatus.NOT_APPROVED);
        expect(await orderTradeService.getOrderStatus()).toEqual(OrderStatus.EXPORTED); // bill of lading has not been approved
        await orderTradeService.validateDocument((await orderTradeService.getDocumentIdsByType(DocumentType.BILL_OF_LADING))[0], DocumentStatus.APPROVED);
        console.log('info: ', await documentService.getDocumentInfoById((await orderTradeService.getDocumentIdsByType(DocumentType.BILL_OF_LADING))[0]));
        expect(await orderTradeService.getOrderStatus()).toEqual(OrderStatus.SHIPPED);
    }, 30000);

    // it('Should register two product categories and four materials (two per product category to simulate mapping)', async () => {
    //     const productCategoryService: ProductCategoryService = new ProductCategoryService(new ProductCategoryDriver(signer, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
    //     productCategoryIds.push((await productCategoryService.registerProductCategory('Coffee Arabica', 85, 'very good coffee')).id);
    //     productCategoryIds.push((await productCategoryService.registerProductCategory('Coffee Nordic', 90, 'even better coffee')).id);
    //
    //     materialIds.push((await materialService.registerMaterial(productCategoryIds[0])).id);
    //     materialIds.push((await materialService.registerMaterial(productCategoryIds[1])).id);
    //     materialIds.push((await materialService.registerMaterial(productCategoryIds[0])).id);
    //     materialIds.push((await materialService.registerMaterial(productCategoryIds[1])).id);
    //
    //     expect(await materialService.getMaterial(materialIds[0])).toEqual(new Material(materialIds[0], await productCategoryService.getProductCategory(productCategoryIds[0])));
    //     expect(await materialService.getMaterial(materialIds[1])).toEqual(new Material(materialIds[1], new ProductCategory(productCategoryIds[1], 'Coffee Nordic', 90, 'even better coffee')));
    // });
    //
    // describe('Order scenario', () => {
    //     it('Should correctly register and retrieve an order with a line', async () => {
    //         const {
    //             orderAddress,
    //             orderTradeService,
    //         } = await _registerOrder();
    //
    //         const line: OrderLine = await orderTradeService.addLine(new OrderLineRequest(productCategoryIds[0], 20, new OrderLinePrice(10, 'USD')));
    //         orderAddress.lines.push(line);
    //
    //         const orderData = await orderTradeService.getTrade();
    //         expect(orderData)
    //             .toBeDefined();
    //         expect(orderData.tradeId)
    //             .toEqual(orderAddress.tradeId);
    //         expect(orderData.supplier)
    //             .toEqual(SUPPLIER_ADDRESS);
    //         expect(orderData.customer)
    //             .toEqual(CUSTOMER_ADDRESS);
    //         expect(orderData.commissioner)
    //             .toEqual(OTHER_ADDRESS);
    //         expect(orderData.externalUrl)
    //             .toEqual('');
    //         expect(orderData.paymentDeadline)
    //             .toEqual(deadline);
    //         expect(orderData.documentDeliveryDeadline)
    //             .toEqual(deadline);
    //         expect(orderData.arbiter)
    //             .toEqual(arbiter);
    //         expect(orderData.shippingDeadline)
    //             .toEqual(deadline);
    //         expect(orderData.deliveryDeadline)
    //             .toEqual(deadline);
    //         expect(orderData.lines)
    //             .toEqual([line]);
    //     }, 30000);
    //
    //     it('should check that the order status is INITIALIZED (no signatures)', async () => {
    //         const { orderTradeService } = await _registerOrder();
    //         expect(await orderTradeService.getNegotiationStatus())
    //             .toEqual(NegotiationStatus.INITIALIZED);
    //     });
    //
    //     it('Should alter an order by setting some constraints and check that the status is PENDING', async () => {
    //         await existingOrderService.updateDocumentDeliveryDeadline(deadline + 60 * 60 * 24);
    //         expect(await existingOrderService.getNegotiationStatus())
    //             .toEqual(NegotiationStatus.PENDING);
    //     });
    //
    //     it('Should add a line to an order as a supplier and check that the status is still PENDING', async () => {
    //         const line: OrderLine = await existingOrderService.addLine(new OrderLineRequest(productCategoryIds[1], 30, new OrderLinePrice(10.25, 'USD')));
    //         expect(await existingOrderService.getLine(line.id))
    //             .toEqual(line);
    //
    //         expect(await existingOrderService.getNegotiationStatus())
    //             .toEqual(NegotiationStatus.PENDING);
    //     });
    //
    //     it('Should add a line to a new order as a commissioner and status again is PENDING', async () => {
    //         _defineSender(OTHER_PRIVATE_KEY);
    //         await _updateExistingOrderService();
    //
    //         const line: OrderLine = await existingOrderService.addLine(new OrderLineRequest(productCategoryIds[0], 50, new OrderLinePrice(50.5, 'USD')));
    //         expect(await existingOrderService.getLine(line.id))
    //             .toEqual(line);
    //
    //         expect(await existingOrderService.getNegotiationStatus())
    //             .toEqual(NegotiationStatus.PENDING);
    //     });
    //
    //     it('Should confirm as supplier the order updated by the customer', async () => {
    //         _defineSender(SUPPLIER_PRIVATE_KEY);
    //         await _updateExistingOrderService();
    //
    //         await existingOrderService.confirmOrder();
    //
    //         expect(await existingOrderService.getNegotiationStatus())
    //             .toEqual(NegotiationStatus.COMPLETED);
    //     });
    //
    //     it('should try to add a line to an already negotiated order and fail', async () => {
    //         // updates cannot be possible because the order has been confirmed by both parties
    //         await expect(existingOrderService.updateShippingDeadline(0))
    //             .rejects
    //             .toThrow(/OrderTrade: The order has already been confirmed, therefore it cannot be changed/);
    //     });
    //
    //     // NOTE: this test suddenly stopped to work unexpectedly because the chain can't be fetched correctly using block numbers
    //     // it('should negotiate an order and get its history by navigating with block numbers', async () => {
    //     //     _defineSender(SUPPLIER_PRIVATE_KEY);
    //     //     await _updateExistingOrderService();
    //     //
    //     //     const { orderTradeService } = await _registerOrder();
    //     //
    //     //     await orderTradeService.addLine(new OrderLineRequest([commissionerMaterialsCounter, supplierMaterialsCounter], productCategories[0], 50, new OrderLinePrice(50, 'USD')));
    //     //     const firstEditStatus = await orderTradeService.getTrade();
    //     //
    //     //     _defineSender(OTHER_PRIVATE_KEY);
    //     //     await _updateExistingOrderService();
    //     //
    //     //     const firstLineVersion: OrderLine = await orderTradeService.addLine(new OrderLineRequest([commissionerMaterialsCounter, supplierMaterialsCounter], productCategories[1], 10, new OrderLinePrice(20, 'USD')));
    //     //     const secondEditStatus = await orderTradeService.getTrade();
    //     //
    //     //     _defineSender(SUPPLIER_PRIVATE_KEY);
    //     //     await _updateExistingOrderService();
    //     //
    //     //     const secondLineVersion: OrderLine = await orderTradeService.updateLine(new OrderLine(firstLineVersion.id, [supplierMaterialsCounter, commissionerMaterialsCounter], 'Arabic 85 Superior', 40, new OrderLinePrice(20, 'USD')));
    //     //     const thirdEditStatus = await orderTradeService.getTrade();
    //     //
    //     //     const eventsBlockNumbers = await orderTradeService.getEmittedEvents();
    //     //
    //     //     expect(await orderTradeService.getTrade(eventsBlockNumbers.get(OrderTradeEvents.OrderLineAdded)![0]))
    //     //         .toEqual(firstEditStatus);
    //     //     expect(await orderTradeService.getTrade(eventsBlockNumbers.get(OrderTradeEvents.OrderLineAdded)![1]))
    //     //         .toEqual(secondEditStatus);
    //     //     expect(await orderTradeService.getTrade(eventsBlockNumbers.get(OrderTradeEvents.OrderLineUpdated)![0]))
    //     //         .toEqual(thirdEditStatus);
    //     //
    //     //     expect(await orderTradeService.getLine(firstLineVersion.id, eventsBlockNumbers.get(OrderTradeEvents.OrderLineAdded)![1]))
    //     //         .toEqual(firstLineVersion);
    //     //     expect(await orderTradeService.getLine(secondLineVersion.id, eventsBlockNumbers.get(OrderTradeEvents.OrderLineUpdated)![0]))
    //     //         .toEqual(secondLineVersion);
    //     // });
    // });
    //
    // describe('Basic trade scenario', () => {
    //     let basicTradeService: BasicTradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR>;
    //
    //     it('Should correctly register and retrieve a basic trade with a line', async () => {
    //         _defineSender(SUPPLIER_PRIVATE_KEY);
    //
    //         const trade: BasicTrade = await tradeManagerService.registerBasicTrade(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, OTHER_ADDRESS, 'Test trade');
    //         basicTradeService = new BasicTradeService({
    //             tradeDriver: new BasicTradeDriver(signer, await tradeManagerService.getTrade(trade.tradeId), MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS),
    //         });
    //
    //         const line: Line = await basicTradeService.addLine(new LineRequest(productCategoryIds[0]));
    //         trade.lines.push(line);
    //         const savedBasicTrade = await basicTradeService.getTrade();
    //         expect(savedBasicTrade.lines.length).toEqual(1);
    //         const savedLine: Line = (await basicTradeService.getLines())[0];
    //
    //         expect(savedBasicTrade).toEqual(trade);
    //         expect(savedLine).toEqual(line);
    //     }, 30000);
    // });
});
