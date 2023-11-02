import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
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
    SUPPLIER_PRIVATE_KEY,
} from './config';
import TradeService from '../services/TradeService';
import { TradeDriver } from '../drivers/TradeDriver';
import { TradeStatus } from '../types/TradeStatus';
import { DocumentType } from '../entities/DocumentInfo';

dotenv.config();

describe('Document lifecycle', () => {
    let documentService: DocumentService;
    let documentDriver: DocumentDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;
    let tradeService: TradeService;
    let tradeDriver: TradeDriver;

    let pinataDriver: PinataIPFSDriver;
    let pinataService: IPFSService;

    const localFilename = 'samplePdf.pdf';
    const externalUrl = 'externalUrl';
    const deadline = new Date('2030-10-10');
    const arbiter = 'arbiter 1', shipper = 'shipper 1', deliveryPort = 'delivery port', shippingPort = 'shipping port';

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
    let transactionId = 1;
    let transactionId2 = 2;
    const transactionType = 'trade';

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
        tradeDriver = new TradeDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
        );
        tradeService = new TradeService(tradeDriver);
    };

    const createOrderAndConfirm = async (): Promise<number> => {
        await tradeService.registerOrder(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, externalUrl);
        const orderId = await tradeService.getCounter();
        await tradeService.addOrderOfferee(orderId, CUSTOMER_ADDRESS);
        // add all the constraints so that an order can be confirmed (it is required to add a document)
        await tradeService.setOrderDocumentDeliveryDeadline(orderId, deadline);
        await tradeService.setOrderArbiter(orderId, arbiter);
        await tradeService.setOrderPaymentDeadline(orderId, deadline);
        await tradeService.setOrderShippingDeadline(orderId, deadline);
        await tradeService.setOrderDeliveryDeadline(orderId, deadline);
        // confirm the order
        _defineOrderSender(CUSTOMER_PRIVATE_KEY);
        await tradeService.confirmOrder(orderId);
        return orderId;
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        _defineSender(SUPPLIER_PRIVATE_KEY);
        _defineOrderSender(SUPPLIER_PRIVATE_KEY);
        pinataDriver = new PinataIPFSDriver(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_API_KEY!, process.env.PINATA_GATEWAY_URL!, process.env.PINATA_GATEWAY_TOKEN!);
        pinataService = new IPFSService(pinataDriver);
        await documentService.addOrderManager(TRADE_MANAGER_CONTRACT_ADDRESS);
    });

    it('Should register a document by another company, fails because the contract cannot directly be invoked to register a new document', async () => {
        _defineSender(CUSTOMER_PRIVATE_KEY);
        const fn = () => documentService.registerDocument(transactionId, transactionType, billOfLading.name, billOfLading.documentType, billOfLading.externalUrl);
        await expect(fn).rejects.toThrowError(/Sender has no permissions/);
    });

    it('Should register a document (and storing it to ipfs) by invoking the trade manager contract, then retrieve the document', async () => {
        const filename = 'file1.pdf';
        const today = new Date();
        const fileBuffer = fs.readFileSync(path.resolve(__dirname, localFilename));
        const content = new Blob([fileBuffer], { type: 'application/pdf' });
        const ipfsFileUrl = await pinataService.storeFile(content, filename);
        const metadataUrl = await pinataService.storeJSON({ filename, date: today, fileUrl: ipfsFileUrl });

        transactionId = await createOrderAndConfirm();
        await tradeService.addDocument(transactionId, deliveryNote.name, deliveryNote.documentType, metadataUrl);

        transactionDocumentCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId, transactionType);
        expect(transactionDocumentCounter).toEqual(1);

        const status = await tradeService.getTradeStatus(transactionId);
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

    it('Should add another document for the same transaction id and another to other transaction id', async () => {
        transactionId2 = await createOrderAndConfirm();
        await tradeService.addDocument(transactionId, deliveryNote.name, deliveryNote.documentType, deliveryNote.externalUrl);
        await tradeService.addDocument(transactionId2, billOfLading.name, billOfLading.documentType, billOfLading.externalUrl);

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
    });

    it('Should add another document for the same transaction id, but specifying also the transaction line id as reference', async () => {
        const filename = 'file2.pdf';
        const today = new Date();
        const fileBuffer = fs.readFileSync(path.resolve(__dirname, localFilename));
        const content = new Blob([fileBuffer], { type: 'application/pdf' });
        const ipfsFileUrl = await pinataService.storeFile(content, filename);
        const metadataUrl = await pinataService.storeJSON({ filename, date: today, transactionLines: [{ id: 1, quantity: 50 }, { id: 2 }], fileUrl: ipfsFileUrl });

        await tradeService.addDocument(transactionId2, deliveryNote.name, deliveryNote.documentType, metadataUrl);

        const transaction2DocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId2, transactionType);
        expect(transaction2DocumentsCounter).toEqual(2);

        const documentsInfo = await documentService.getDocumentsInfoByTransactionIdAndType(transactionId2, transactionType);
        expect(documentsInfo.length).toBeGreaterThan(2);

        const savedTransaction2DocumentInfo = documentsInfo[1];
        const savedTransaction2Document = await documentService.getCompleteDocument(savedTransaction2DocumentInfo);

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

    it("should get the trade status ON_BOARD because document 'Bill of lading' has been uploaded before", async () => {
        const status = await tradeService.getTradeStatus(transactionId2);
        expect(status).toEqual(TradeStatus.ON_BOARD);
    });
});
