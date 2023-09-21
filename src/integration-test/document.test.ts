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

describe('DocumentInfo lifecycle', () => {
    let documentService: DocumentService;
    let documentDriver: DocumentDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;
    let orderService: TradeService;
    let orderDriver: TradeDriver;

    let pinataDriver: PinataIPFSDriver;
    let pinataService: IPFSService;

    const localFilename = 'samplePdf.pdf';
    const externalUrl = 'externalUrl';
    const deadline = new Date('2030-10-10');
    const arbiter = 'arbiter 1', shipper = 'shipper 1', deliveryPort = 'delivery port', shippingPort = 'shipping port';

    let documentCounterId = 0;
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
        orderDriver = new TradeDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
        );
        orderService = new TradeService(orderDriver);
    };

    const createOrderAndConfirm = async (): Promise<number> => {
        await orderService.registerOrder(SUPPLIER_ADDRESS, CUSTOMER_ADDRESS, externalUrl);
        const orderId = await orderService.getTradeCounter(SUPPLIER_ADDRESS);
        await orderService.addOrderOfferee(SUPPLIER_ADDRESS, orderId, CUSTOMER_ADDRESS);
        // add all the constraints so that an order can be confirmed (it is required to add a document)
        await orderService.setOrderDocumentDeliveryDeadline(SUPPLIER_ADDRESS, orderId, deadline);
        await orderService.setOrderArbiter(SUPPLIER_ADDRESS, orderId, arbiter);
        await orderService.setOrderPaymentDeadline(SUPPLIER_ADDRESS, orderId, deadline);
        await orderService.setOrderShippingDeadline(SUPPLIER_ADDRESS, orderId, deadline);
        await orderService.setOrderDeliveryDeadline(SUPPLIER_ADDRESS, orderId, deadline);
        // confirm the order
        _defineOrderSender(CUSTOMER_PRIVATE_KEY);
        await orderService.confirmOrder(SUPPLIER_ADDRESS, orderId);
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
        const fn = () => documentService.registerDocument(CUSTOMER_ADDRESS, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
        await expect(fn).rejects.toThrowError(/Sender has no permissions/);
    });

    it('Should register a document (and storing it to ipfs) by invoking the order manager contract and retrieve it', async () => {
        const filename = 'file1.pdf';
        const fileBuffer = fs.readFileSync(path.resolve(__dirname, localFilename));
        const content = new Blob([fileBuffer], { type: 'application/pdf' });
        const ipfsFileUrl = await pinataService.storeFile(content, filename);
        const metadataUrl = await pinataService.storeJSON({ filename, fileUrl: ipfsFileUrl });

        transactionId = await createOrderAndConfirm();
        await orderService.addDocument(SUPPLIER_ADDRESS, transactionId, rawDocument.name, rawDocument.documentType, metadataUrl);

        documentCounterId = await documentService.getDocumentCounter(SUPPLIER_ADDRESS);
        expect(documentCounterId).toEqual(1);

        const exist = await documentService.documentExists(SUPPLIER_ADDRESS, transactionId, documentCounterId);
        expect(exist).toBeTruthy();

        const savedDocumentInfo = await documentService.getDocumentInfo(SUPPLIER_ADDRESS, transactionId, documentCounterId);
        const savedDocument = await documentService.getCompleteDocument(savedDocumentInfo);
        expect(savedDocument).toBeDefined();
        expect(savedDocumentInfo).toBeDefined();
        expect(savedDocument!.id).toEqual(documentCounterId);
        expect(savedDocument!.owner).toEqual(SUPPLIER_ADDRESS);
        expect(savedDocument!.transactionId).toEqual(transactionId);
        expect(savedDocument!.name).toEqual(rawDocument.name);
        expect(savedDocument!.documentType).toEqual(rawDocument.documentType);
        expect(savedDocument!.filename).toEqual(filename);
        expect(savedDocument!.content.size).toEqual(content.size);
        expect(savedDocument!.content.type).toEqual(content.type);
    }, 20000);

    it('Should add another document for the same transaction id and another to other transaction id', async () => {
        transactionId2 = await createOrderAndConfirm();
        await orderService.addDocument(SUPPLIER_ADDRESS, transactionId, rawDocument2.name, rawDocument2.documentType, rawDocument2.externalUrl);
        await orderService.addDocument(SUPPLIER_ADDRESS, transactionId2, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);

        documentCounterId = await documentService.getDocumentCounter(SUPPLIER_ADDRESS);

        const transaction1DocumentIds = await documentService.getTransactionDocumentIds(SUPPLIER_ADDRESS, transactionId);
        const transaction2DocumentIds = await documentService.getTransactionDocumentIds(SUPPLIER_ADDRESS, transactionId2);
        expect(documentCounterId).toEqual(transaction1DocumentIds.length + transaction2DocumentIds.length);

        const savedTransaction2Document = await documentService.getDocumentInfo(SUPPLIER_ADDRESS, transactionId2, transaction2DocumentIds[0]);
        expect(savedTransaction2Document).toBeDefined();
        expect(savedTransaction2Document.id).toEqual(transaction2DocumentIds[0]);
        expect(savedTransaction2Document.owner).toEqual(SUPPLIER_ADDRESS);
        expect(savedTransaction2Document.transactionId).toEqual(transactionId2);
        expect(savedTransaction2Document.name).toEqual(rawDocument.name);
        expect(savedTransaction2Document.documentType).toEqual(rawDocument.documentType);
    });
});
