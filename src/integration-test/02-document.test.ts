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
    const rawDocument = {
        name: 'Document name',
        documentType: 'Bill of lading',
        externalUrl: 'externalUrl',
    };
    const rawDocument2 = {
        name: 'Document name2',
        documentType: 'Delivery note',
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
        const fn = () => documentService.registerDocument(transactionId, transactionType, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
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
        await tradeService.addDocument(transactionId, rawDocument.name, rawDocument.documentType, metadataUrl);

        transactionDocumentCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId, transactionType);
        expect(transactionDocumentCounter).toEqual(1);

        const exist = await documentService.documentExists(transactionId, transactionType, transactionDocumentCounter);
        expect(exist).toBeTruthy();

        const savedDocumentInfo = await documentService.getDocumentInfo(transactionId, transactionType, transactionDocumentCounter);
        const savedDocument = await documentService.getCompleteDocument(savedDocumentInfo);
        expect(savedDocument).toBeDefined();
        expect(savedDocumentInfo).toBeDefined();
        expect(savedDocument!.id).toEqual(transactionDocumentCounter);
        expect(savedDocument!.transactionId).toEqual(transactionId);
        expect(savedDocument!.name).toEqual(rawDocument.name);
        expect(savedDocument!.documentType).toEqual(rawDocument.documentType);
        expect(savedDocument!.filename).toEqual(filename);
        expect(savedDocument!.date).toEqual(today);
        expect(savedDocument!.quantity).toBeUndefined();
        expect(savedDocument!.content.size).toEqual(content.size);
        expect(savedDocument!.content.type).toEqual(content.type);
    }, 20000);

    it('Should add another document for the same transaction id and another to other transaction id', async () => {
        transactionId2 = await createOrderAndConfirm();
        await tradeService.addDocument(transactionId, rawDocument2.name, rawDocument2.documentType, rawDocument2.externalUrl);
        await tradeService.addDocument(transactionId2, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);

        const transaction2DocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId2, transactionType);

        const savedTransaction2Document = await documentService.getDocumentInfo(transactionId2, transactionType, transaction2DocumentsCounter);
        expect(savedTransaction2Document).toBeDefined();
        expect(savedTransaction2Document.id).toEqual(transaction2DocumentsCounter);
        expect(savedTransaction2Document.transactionId).toEqual(transactionId2);
        expect(savedTransaction2Document.name).toEqual(rawDocument.name);
        expect(savedTransaction2Document.documentType).toEqual(rawDocument.documentType);
    });

    it('Should add another document for the same transaction id, but specifying also the transaction line id as reference', async () => {
        const filename = 'file2.pdf';
        const today = new Date();
        const fileBuffer = fs.readFileSync(path.resolve(__dirname, localFilename));
        const content = new Blob([fileBuffer], { type: 'application/pdf' });
        const ipfsFileUrl = await pinataService.storeFile(content, filename);
        const metadataUrl = await pinataService.storeJSON({ filename, date: today, transactionLineIds: [1, 2], quantity: 55.5, fileUrl: ipfsFileUrl });

        transactionId2 = await createOrderAndConfirm();
        await tradeService.addDocument(transactionId2, rawDocument2.name, rawDocument2.documentType, metadataUrl);

        const transaction2DocumentsCounter = await documentService.getDocumentsCounterByTransactionIdAndType(transactionId2, transactionType);

        const savedTransaction2DocumentInfo = await documentService.getDocumentInfo(transactionId2, transactionType, transaction2DocumentsCounter);
        const savedTransaction2Document = await documentService.getCompleteDocument(savedTransaction2DocumentInfo);

        expect(savedTransaction2Document).toBeDefined();
        expect(savedTransaction2Document!.id).toEqual(transaction2DocumentsCounter);
        expect(savedTransaction2Document!.transactionId).toEqual(transactionId2);
        expect(savedTransaction2Document!.name).toEqual(rawDocument2.name);
        expect(savedTransaction2Document!.documentType).toEqual(rawDocument2.documentType);
        expect(savedTransaction2Document!.filename).toEqual(filename);
        expect(savedTransaction2Document!.date).toEqual(today);
        expect(savedTransaction2Document!.transactionLineIds).toEqual([1, 2]);
        expect(savedTransaction2Document!.quantity).toEqual(55.5);
        expect(savedTransaction2Document!.content.size).toEqual(content.size);
        expect(savedTransaction2Document!.content.type).toEqual(content.type);
    }, 20000);
});
