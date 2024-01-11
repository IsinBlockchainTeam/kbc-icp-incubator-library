import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer, Wallet } from 'ethers';
import { IPFSService, PinataIPFSDriver } from '@blockchain-lib/common';
import DocumentService from '../services/DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import {
    CUSTOMER_ADDRESS,
    CUSTOMER_PRIVATE_KEY,
    DOCUMENT_MANAGER_CONTRACT_ADDRESS,
    NETWORK,
    TRADE_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_ADDRESS,
    SUPPLIER_PRIVATE_KEY, OTHER_ADDRESS, MY_TOKEN_CONTRACT_ADDRESS,
} from './config';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeManagerService } from '../services/TradeManagerService';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { OrderTradeService } from '../services/OrderTradeService';
import { OrderTradeDriver } from '../drivers/OrderTradeDriver';
import { TradeStatus } from '../types/TradeStatus';
import { OrderTrade } from '../entities/OrderTrade';

dotenv.config();

describe('Document lifecycle', () => {
    let documentService: DocumentService;
    let documentDriver: DocumentDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;
    let tradeManagerService: TradeManagerService;
    let tradeManagerDriver: TradeManagerDriver;

    let pinataDriver: PinataIPFSDriver;
    let pinataService: IPFSService;

    const localFilename = 'samplePdf.pdf';
    const externalUrl = 'externalUrl';

    const arbiter: string = Wallet.createRandom().address;
    const paymentDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const documentDeliveryDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const shippingDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const deliveryDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const agreedAmount: number = 1000;

    let transactionDocumentCounter = 0;
    const billOfLading = {
        name: 'Document name',
        documentType: DocumentType.BILL_OF_LADING,
        externalUrl: 'externalUrl',
    };
    const deliveryNote = {
        name: 'Document name2',
        documentType: DocumentType.DELIVERY_NOTE,
        externalUrl: 'externalUr2',
    };
    const transactionType = 'trade';
    let transactionId: number;
    let firstOrderTradeService: OrderTradeService;
    let transactionId2: number;
    let secondOrderTradeService: OrderTradeService;

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        documentDriver = new DocumentDriver(
            signer,
            DOCUMENT_MANAGER_CONTRACT_ADDRESS,
        );

        documentService = new DocumentService(documentDriver, pinataService);
    };

    const _defineOrderSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        tradeManagerDriver = new TradeManagerDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
        );
        tradeManagerService = new TradeManagerService(tradeManagerDriver);
    };

    const createOrderAndConfirm = async (): Promise<{orderId: number, orderTradeService: OrderTradeService}> => {
        const order: OrderTrade = await tradeManagerService.registerOrderTrade(SUPPLIER_ADDRESS, OTHER_ADDRESS, CUSTOMER_ADDRESS, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, MY_TOKEN_CONTRACT_ADDRESS);
        _defineOrderSender(CUSTOMER_PRIVATE_KEY);
        const orderTradeService = new OrderTradeService(new OrderTradeDriver(signer, await tradeManagerService.getTrade(order.tradeId)));
        await orderTradeService.confirmOrder();
        return { orderId: order.tradeId, orderTradeService };
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        _defineSender(SUPPLIER_PRIVATE_KEY);
        _defineOrderSender(SUPPLIER_PRIVATE_KEY);
        pinataDriver = new PinataIPFSDriver(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_API_KEY!, process.env.PINATA_GATEWAY_URL!, process.env.PINATA_GATEWAY_TOKEN!);
        pinataService = new IPFSService(pinataDriver);
        await documentService.addTradeManager(TRADE_MANAGER_CONTRACT_ADDRESS);
    });

    // TODO: should this be removed after issue #102?
    /*
    it('Should register a document by another company, fails because the contract cannot directly be invoked to register a new document', async () => {
        _defineSender(CUSTOMER_PRIVATE_KEY);
        const fn = () => documentService.registerDocument(transactionId, transactionType, billOfLading.name, billOfLading.documentType, billOfLading.externalUrl);
        await expect(fn).rejects.toThrowError(/Sender has no permissions/);
    });
     */

    it('Should register a document (and store it to ipfs) by invoking the order trade contract, then retrieve the document', async () => {
        _defineSender(CUSTOMER_PRIVATE_KEY);
        const filename = 'file1.pdf';
        const today = new Date();
        const fileBuffer = fs.readFileSync(path.resolve(__dirname, localFilename));
        const content = new Blob([fileBuffer], { type: 'application/pdf' });
        const ipfsFileUrl = await pinataService.storeFile(content, filename);
        const metadataUrl = await pinataService.storeJSON({ filename, date: today, fileUrl: ipfsFileUrl });

        const { orderId, orderTradeService } = await createOrderAndConfirm();
        transactionId = orderId;
        firstOrderTradeService = orderTradeService;
        await orderTradeService.addDocument(deliveryNote.name, deliveryNote.documentType, metadataUrl);

        transactionDocumentCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId, transactionType);
        expect(transactionDocumentCounter).toEqual(1);

        const status = await orderTradeService.getTradeStatus();
        expect(status).toEqual(TradeStatus.SHIPPED);

        const documentsInfo = await documentService.getDocumentsInfoByDocumentType(transactionId, transactionType, deliveryNote.documentType);
        expect(documentsInfo.length).toBeGreaterThan(0);

        const savedDocumentInfo = documentsInfo[0];
        const savedDocument = await documentService.getCompleteDocument(savedDocumentInfo);
        expect(savedDocument).toBeDefined();
        expect(savedDocumentInfo).toBeDefined();
        expect(savedDocument!.id).toEqual(transactionDocumentCounter);
        expect(savedDocument!.transactionId).toEqual(transactionId);
        expect(savedDocument!.name).toEqual(deliveryNote.name);
        expect(savedDocument!.documentType).toEqual(deliveryNote.documentType);
        expect(savedDocument!.filename).toEqual(filename);
        expect(savedDocument!.date).toEqual(today);
        expect(savedDocument!.quantity).toBeUndefined();
        expect(savedDocument!.content.size).toEqual(content.size);
        expect(savedDocument!.content.type).toEqual(content.type);
    }, 30000);

    it('Should add another document for the first order and another to a new order', async () => {
        const { orderId, orderTradeService } = await createOrderAndConfirm();
        transactionId2 = orderId;
        secondOrderTradeService = orderTradeService;
        await firstOrderTradeService.addDocument(deliveryNote.name, deliveryNote.documentType, deliveryNote.externalUrl);
        await secondOrderTradeService.addDocument(billOfLading.name, billOfLading.documentType, billOfLading.externalUrl);

        const transactionDocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId, transactionType);
        const transaction2DocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId2, transactionType);
        expect(transactionDocumentsCounter).toEqual(2);
        expect(transaction2DocumentsCounter).toEqual(1);

        const savedTransaction2Documents = await documentService.getDocumentsInfoByDocumentType(transactionId2, transactionType, billOfLading.documentType);
        expect(savedTransaction2Documents).toBeDefined();
        expect(savedTransaction2Documents[0].id).toEqual(transaction2DocumentsCounter);
        expect(savedTransaction2Documents[0].transactionId).toEqual(transactionId2);
        expect(savedTransaction2Documents[0].name).toEqual(billOfLading.name);
        expect(savedTransaction2Documents[0].documentType).toEqual(billOfLading.documentType);
    }, 30000);

    it('Should add another document for the second order, but specifying also the transaction line id as reference', async () => {
        const filename = 'file2.pdf';
        const today = new Date();
        const fileBuffer = fs.readFileSync(path.resolve(__dirname, localFilename));
        const content = new Blob([fileBuffer], { type: 'application/pdf' });
        const ipfsFileUrl = await pinataService.storeFile(content, filename);
        const metadataUrl = await pinataService.storeJSON({ filename, date: today, transactionLines: [{ id: 1, quantity: 50 }, { id: 2 }], fileUrl: ipfsFileUrl });

        await secondOrderTradeService.addDocument(deliveryNote.name, deliveryNote.documentType, metadataUrl);

        const transaction2DocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId2, transactionType);
        expect(transaction2DocumentsCounter).toEqual(2);

        const documentsInfo = await documentService.getDocumentsInfoByTransactionIdAndType(transactionId2, transactionType);
        expect(documentsInfo.length).toEqual(2);

        const savedTransaction2DocumentInfo = documentsInfo.find((d) => d.documentType === deliveryNote.documentType);
        const savedTransaction2Document = await documentService.getCompleteDocument(savedTransaction2DocumentInfo!);

        expect(savedTransaction2Document).toBeDefined();
        expect(savedTransaction2Document!.id).toEqual(transaction2DocumentsCounter);
        expect(savedTransaction2Document!.transactionId).toEqual(transactionId2);
        expect(savedTransaction2Document!.name).toEqual(deliveryNote.name);
        expect(savedTransaction2Document!.documentType).toEqual(deliveryNote.documentType);
        expect(savedTransaction2Document!.filename).toEqual(filename);
        expect(savedTransaction2Document!.date).toEqual(today);
        expect(savedTransaction2Document!.transactionLines).toEqual([{ id: 1, quantity: 50 }, { id: 2 }]);
        expect(savedTransaction2Document!.content.size).toEqual(content.size);
        expect(savedTransaction2Document!.content.type).toEqual(content.type);
    }, 30000);

    it("should get the trade status ON_BOARD for the second order because document 'Bill of lading' has been uploaded before", async () => {
        const status = await secondOrderTradeService.getTradeStatus();
        expect(status).toEqual(TradeStatus.ON_BOARD);
    });
});
