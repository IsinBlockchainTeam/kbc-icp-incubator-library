import * as dotenv from 'dotenv';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer, Wallet } from 'ethers';
import { SolidStorageACR } from '@blockchain-lib/common';
import DocumentService from '../services/DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import {
    CUSTOMER_ADDRESS,
    CUSTOMER_PRIVATE_KEY,
    DOCUMENT_MANAGER_CONTRACT_ADDRESS,
    NETWORK,
    TRADE_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_ADDRESS,
    OTHER_ADDRESS,
    MY_TOKEN_CONTRACT_ADDRESS,
    MATERIAL_MANAGER_CONTRACT_ADDRESS,
    PRODUCT_CATEGORY_CONTRACT_ADDRESS, ADMIN_PRIVATE_KEY,
} from './config';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeManagerService } from '../services/TradeManagerService';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { OrderTradeService } from '../services/OrderTradeService';
import { OrderTradeDriver } from '../drivers/OrderTradeDriver';
import { OrderLinePrice, OrderLineRequest, OrderTradeInfo } from '../entities/OrderTradeInfo';
import { ProductCategoryService } from '../services/ProductCategoryService';
import { ProductCategoryDriver } from '../drivers/ProductCategoryDriver';
import { MaterialService } from '../services/MaterialService';
import { MaterialDriver } from '../drivers/MaterialDriver';
import { SolidDocumentSpec } from '../drivers/SolidDocumentDriver';
import { SolidMetadataSpec } from '../drivers/SolidMetadataDriver';
import { TradeStatus } from '../types/TradeStatus';

dotenv.config();

describe('Document lifecycle', () => {
    let documentService: DocumentService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR>;
    let documentDriver: DocumentDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;
    let tradeManagerService: TradeManagerService<SolidMetadataSpec, SolidStorageACR>;
    let tradeManagerDriver: TradeManagerDriver;

    const localFilename = 'samplePdf.pdf';

    const arbiter: string = Wallet.createRandom().address;
    const paymentDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const documentDeliveryDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const shippingDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const deliveryDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const agreedAmount: number = 1000;

    let documentCounter = 0;
    const billOfLading = {
        documentType: DocumentType.BILL_OF_LADING,
        externalUrl: 'externalUrl',
    };
    const deliveryNote = {
        documentType: DocumentType.DELIVERY_NOTE,
        externalUrl: 'externalUr2',
    };
    const transactionType = 'trade';
    let transactionId: number;
    let firstOrderTradeService: OrderTradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR>;
    let transactionId2: number;
    let secondOrderTradeService: OrderTradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR>;

    const productCategoryIds: number[] = [];
    const materialIds: number[] = [];
    let firstOrderLineId: number;
    let secondOrderLineId: number;

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        documentDriver = new DocumentDriver(
            signer,
            DOCUMENT_MANAGER_CONTRACT_ADDRESS,
        );

        documentService = new DocumentService({ documentDriver });
    };

    const _defineOrderSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        tradeManagerDriver = new TradeManagerDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
            MATERIAL_MANAGER_CONTRACT_ADDRESS,
            PRODUCT_CATEGORY_CONTRACT_ADDRESS,
        );
        tradeManagerService = new TradeManagerService(tradeManagerDriver);
    };

    const createOrderAndConfirm = async (): Promise<{orderId: number, orderTradeService: OrderTradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR>}> => {
        const order: OrderTradeInfo = await tradeManagerService.registerOrderTrade(SUPPLIER_ADDRESS, OTHER_ADDRESS, CUSTOMER_ADDRESS, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, MY_TOKEN_CONTRACT_ADDRESS);
        _defineOrderSender(CUSTOMER_PRIVATE_KEY);
        const orderTradeService = new OrderTradeService({
            tradeDriver: new OrderTradeDriver(signer, await tradeManagerService.getTrade(order.tradeId), MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS),
            documentDriver: new DocumentDriver(signer, DOCUMENT_MANAGER_CONTRACT_ADDRESS),
        });
        await orderTradeService.confirmOrder();
        return { orderId: order.tradeId, orderTradeService };
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        _defineSender(ADMIN_PRIVATE_KEY);
        _defineOrderSender(ADMIN_PRIVATE_KEY);
        await documentService.addTradeManager(TRADE_MANAGER_CONTRACT_ADDRESS);
    });

    // TODO: should this be removed after issue #102?
    /*
    it('Should register a document by another company, fails because the contract cannot directly be invoked to register a new document', async () => {
        _defineSender(CUSTOMER_PRIVATE_KEY);
        const fn = () => documentService.registerDocument(transactionId, transactionType, billOfLading.name, billOfLading.documentType, billOfLading.externalUrl);
        await expect(fn).rejects.toThrow(/Sender has no permissions/);
    });
     */

    it('Should register two product categories and two materials', async () => {
        const productCategoryService: ProductCategoryService = new ProductCategoryService(new ProductCategoryDriver(signer, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
        productCategoryIds.push((await productCategoryService.registerProductCategory('Coffee Arabica', 85, 'very good coffee')).id);
        productCategoryIds.push((await productCategoryService.registerProductCategory('Coffee Nordic', 90, 'even better coffee')).id);

        const materialService: MaterialService = new MaterialService(new MaterialDriver(signer, MATERIAL_MANAGER_CONTRACT_ADDRESS, PRODUCT_CATEGORY_CONTRACT_ADDRESS));
        materialIds.push((await materialService.registerMaterial(productCategoryIds[0])).id);
        materialIds.push((await materialService.registerMaterial(productCategoryIds[1])).id);
    });

    it('should register a document', async () => {
        _defineSender(ADMIN_PRIVATE_KEY);
        const { orderId, orderTradeService } = await createOrderAndConfirm();
        transactionId = orderId;
        firstOrderTradeService = orderTradeService;
        firstOrderLineId = (await firstOrderTradeService.addLine(new OrderLineRequest(productCategoryIds[0], 100, new OrderLinePrice(100.50, 'CHF')))).id;
        await firstOrderTradeService.assignMaterial(firstOrderLineId, materialIds[0]);
        await firstOrderTradeService.addDocument(firstOrderLineId, deliveryNote.documentType);

        documentCounter = await documentService.getDocumentsCounter();
        expect(documentCounter).toEqual(1);

        const status = await firstOrderTradeService.getTradeStatus();
        expect(status).toEqual(TradeStatus.SHIPPED);

        const documentInfo = await documentService.getDocumentInfoById(documentCounter);
        expect(documentInfo).toBeDefined();
        expect(documentInfo.id).toEqual(documentCounter);
        expect(documentInfo.externalUrl).toEqual('');
        expect(documentInfo.contentHash).toEqual('');
    });

    it('should get documents related to a trade and document type', async () => {
        const documentsInfo = await firstOrderTradeService.getDocumentsByType(DocumentType.BILL_OF_LADING);
        expect(documentsInfo.length).toEqual(documentCounter);

        const documentInfo = await documentService.getDocumentInfoById(documentsInfo[0].id);
        expect(documentInfo).toEqual(documentsInfo[0]);
    });

    // it('Should register a document (and store it to ipfs) by invoking the order trade contract, then retrieve the document', async () => {
    //     _defineSender(ADMIN_PRIVATE_KEY);
    //     const filename = 'file1.pdf';
    //     const today = new Date();
    //     const fileBuffer = fs.readFileSync(path.resolve(__dirname, localFilename));
    //     const content = new Blob([fileBuffer], { type: 'application/pdf' });
    //     const ipfsFileUrl = await pinataService.storeFile(content, filename);
    //     const metadataUrl = await pinataService.storeJSON({ filename, date: today, fileUrl: ipfsFileUrl });
    //
    //     const { orderId, orderTradeService } = await createOrderAndConfirm();
    //     transactionId = orderId;
    //     firstOrderTradeService = orderTradeService;
    //     firstOrderLineId = (await orderTradeService.addLine(new OrderLineRequest(productCategoryIds[0], 100, new OrderLinePrice(100.50, 'CHF')))).id;
    //     await orderTradeService.assignMaterial(firstOrderLineId, materialIds[0]);
    //     await orderTradeService.addDocument(firstOrderLineId, deliveryNote.name, deliveryNote.documentType, metadataUrl);
    //
    //     documentCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId, transactionType);
    //     expect(documentCounter).toEqual(1);
    //
    //     const status = await orderTradeService.getTradeStatus();
    //     expect(status).toEqual(TradeStatus.SHIPPED);
    //
    //     const documentsInfo = await documentService.getDocumentsInfoByDocumentType(transactionId, transactionType, deliveryNote.documentType);
    //     expect(documentsInfo.length).toBeGreaterThan(0);
    //
    //     const savedDocumentInfo = documentsInfo[0];
    //     const savedDocument = await documentService.getCompleteDocument(savedDocumentInfo);
    //     expect(savedDocument).toBeDefined();
    //     expect(savedDocumentInfo).toBeDefined();
    //     expect(documentInfo.id).toEqual(documentCounter);
    //     expect(documentInfo.transactionId).toEqual(transactionId);
    //     expect(documentInfo.name).toEqual(deliveryNote.name);
    //     expect(documentInfo.documentType).toEqual(deliveryNote.documentType);
    //     expect(documentInfo.filename).toEqual(filename);
    //     expect(documentInfo.date).toEqual(today);
    //     expect(documentInfo.quantity).toBeUndefined();
    //     expect(documentInfo.content.size).toEqual(content.size);
    //     expect(documentInfo.content.type).toEqual(content.type);
    // }, 30000);
    //
    // it('Should add another document for the first order and another to a new order', async () => {
    //     const { orderId, orderTradeService } = await createOrderAndConfirm();
    //     transactionId2 = orderId;
    //     secondOrderTradeService = orderTradeService;
    //
    //     await firstOrderTradeService.addDocument(firstOrderLineId, deliveryNote.name, deliveryNote.documentType, deliveryNote.externalUrl);
    //     secondOrderLineId = (await orderTradeService.addLine(new OrderLineRequest(productCategoryIds[1], 200, new OrderLinePrice(500.75, 'USD')))).id;
    //     await orderTradeService.assignMaterial(secondOrderLineId, materialIds[1]);
    //     await secondOrderTradeService.addDocument(secondOrderLineId, billOfLading.name, billOfLading.documentType, billOfLading.externalUrl);
    //
    //     const transactionDocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId, transactionType);
    //     const transaction2DocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId2, transactionType);
    //     expect(transactionDocumentsCounter).toEqual(2);
    //     expect(transaction2DocumentsCounter).toEqual(1);
    //
    //     const savedTransaction2Documents = await documentService.getDocumentsInfoByDocumentType(transactionId2, transactionType, billOfLading.documentType);
    //     expect(savedTransaction2Documents).toBeDefined();
    //     expect(savedTransaction2Documents[0].id).toEqual(transaction2DocumentsCounter);
    //     expect(savedTransaction2Documents[0].transactionId).toEqual(transactionId2);
    //     expect(savedTransaction2Documents[0].name).toEqual(billOfLading.name);
    //     expect(savedTransaction2Documents[0].documentType).toEqual(billOfLading.documentType);
    // }, 30000);
    //
    // // it('Should add another document for the second order, but specifying also the transaction line id as reference', async () => {
    // //     const filename = 'file2.pdf';
    // //     const today = new Date();
    // //     const fileBuffer = fs.readFileSync(path.resolve(__dirname, localFilename));
    // //     const content = new Blob([fileBuffer], { type: 'application/pdf' });
    // //     const ipfsFileUrl = await pinataService.storeFile(content, filename);
    // //     const metadataUrl = await pinataService.storeJSON({ filename, date: today, transactionLines: [{ id: 1, quantity: 50 }, { id: 2 }], fileUrl: ipfsFileUrl });
    // //
    // //     await secondOrderTradeService.addDocument(deliveryNote.name, deliveryNote.documentType, metadataUrl);
    // //
    // //     const transaction2DocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId2, transactionType);
    // //     expect(transaction2DocumentsCounter).toEqual(2);
    // //
    // //     const documentsInfo = await documentService.getDocumentsInfoByTransactionIdAndType(transactionId2, transactionType);
    // //     expect(documentsInfo.length).toEqual(2);
    // //
    // //     const savedTransaction2DocumentInfo = documentsInfo.find((d) => d.documentType === deliveryNote.documentType);
    // //     const savedTransaction2Document = await documentService.getCompleteDocument(savedTransaction2DocumentInfo!);
    // //
    // //     expect(savedTransaction2Document).toBeDefined();
    // //     expect(savedTransaction2Document!.id).toEqual(transaction2DocumentsCounter);
    // //     expect(savedTransaction2Document!.transactionId).toEqual(transactionId2);
    // //     expect(savedTransaction2Document!.name).toEqual(deliveryNote.name);
    // //     expect(savedTransaction2Document!.documentType).toEqual(deliveryNote.documentType);
    // //     expect(savedTransaction2Document!.filename).toEqual(filename);
    // //     expect(savedTransaction2Document!.date).toEqual(today);
    // //     expect(savedTransaction2Document!.transactionLines).toEqual([{ id: 1, quantity: 50 }, { id: 2 }]);
    // //     expect(savedTransaction2Document!.content.size).toEqual(content.size);
    // //     expect(savedTransaction2Document!.content.type).toEqual(content.type);
    // // }, 30000);
    //
    // it('should try registering a document specifying a non-existing trade line and be rejected', async () => {
    //     const fn = async () => firstOrderTradeService.addDocument(100, deliveryNote.name, deliveryNote.documentType, deliveryNote.externalUrl);
    //     await expect(fn).rejects.toThrow('Trade: Line does not exist');
    // });
    //
    // it('should try registering a document specifying a trade line with no material assigned and be rejected', async () => {
    //     const lineId = (await firstOrderTradeService.addLine(new OrderLineRequest(productCategoryIds[0], 10, new OrderLinePrice(1.50, 'USD')))).id;
    //     const fn = async () => firstOrderTradeService.addDocument(lineId, deliveryNote.name, deliveryNote.documentType, deliveryNote.externalUrl);
    //     await expect(fn).rejects.toThrow('Trade: A material must be assigned before adding a document for a line');
    // });
    //
    // it("should get the trade status ON_BOARD for the second order because document 'Bill of lading' has been uploaded before", async () => {
    //     const status = await secondOrderTradeService.getTradeStatus();
    //     expect(status).toEqual(TradeStatus.ON_BOARD);
    // });
});
