import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
import { IPFSService, PinataIPFSDriver } from '@blockchain-lib/common';
import DocumentService from '../services/DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import {
    CUSTOMER_INVOKER_ADDRESS,
    CUSTOMER_INVOKER_PRIVATE_KEY,
    DOCUMENT_MANAGER_CONTRACT_ADDRESS,
    NETWORK, ORDER_MANAGER_CONTRACT_ADDRESS,
    SUPPLIER_INVOKER_ADDRESS, SUPPLIER_INVOKER_PRIVATE_KEY,
} from './config';
import OrderService from '../services/OrderService';
import { OrderDriver } from '../drivers/OrderDriver';

dotenv.config();

describe('Document lifecycle', () => {
    let documentService: DocumentService;
    let documentDriver: DocumentDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;

    let orderService: OrderService;
    let orderDriver: OrderDriver;

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
        documentService = new DocumentService(documentDriver);
    };

    const _defineOrderSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        orderDriver = new OrderDriver(
            signer,
            ORDER_MANAGER_CONTRACT_ADDRESS,
        );
        orderService = new OrderService(orderDriver);
    };

    const createOrderAndConfirm = async (): Promise<number> => {
        await orderService.registerOrder(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, externalUrl);
        const orderId = await orderService.getOrderCounter(SUPPLIER_INVOKER_ADDRESS);
        // add all the constraints so that an order can be confirmed (it is required to add a document)
        await orderService.setOrderIncoterms(SUPPLIER_INVOKER_ADDRESS, orderId, 'FOB');
        await orderService.setOrderDocumentDeliveryDeadline(SUPPLIER_INVOKER_ADDRESS, orderId, deadline);
        await orderService.setOrderArbiter(SUPPLIER_INVOKER_ADDRESS, orderId, arbiter);
        await orderService.setOrderDeliveryPort(SUPPLIER_INVOKER_ADDRESS, orderId, deliveryPort);
        await orderService.setOrderPaymentDeadline(SUPPLIER_INVOKER_ADDRESS, orderId, deadline);
        await orderService.setOrderShipper(SUPPLIER_INVOKER_ADDRESS, orderId, shipper);
        await orderService.setOrderShippingPort(SUPPLIER_INVOKER_ADDRESS, orderId, shippingPort);
        await orderService.setOrderShippingDeadline(SUPPLIER_INVOKER_ADDRESS, orderId, deadline);
        await orderService.setOrderDeliveryDeadline(SUPPLIER_INVOKER_ADDRESS, orderId, deadline);
        // confirm the order
        _defineOrderSender(CUSTOMER_INVOKER_PRIVATE_KEY);
        await orderService.confirmOrder(SUPPLIER_INVOKER_ADDRESS, orderId);
        return orderId;
    };

    beforeAll(async () => {
        jest.setTimeout(10000);
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        _defineSender(SUPPLIER_INVOKER_PRIVATE_KEY);
        _defineOrderSender(SUPPLIER_INVOKER_PRIVATE_KEY);

        pinataDriver = new PinataIPFSDriver(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_API_KEY!);
        pinataService = new IPFSService(pinataDriver);
        await documentService.addOrderManager(ORDER_MANAGER_CONTRACT_ADDRESS);
    });

    it('Should register a document by another company, fails because the contract cannot directly be invoked to register a new document', async () => {
        _defineSender(CUSTOMER_INVOKER_PRIVATE_KEY);
        const fn = () => documentService.registerDocument(CUSTOMER_INVOKER_ADDRESS, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
        await expect(fn).rejects.toThrowError(/Sender has no permissions/);
    });

    it('Should register a document by invoking the order manager contract and retrieve it', async () => {
        const filename = 'file1.pdf';
        const content = fs.createReadStream(path.resolve(__dirname, localFilename));
        const ipfsFileUrl = await pinataService.storeFile(content);
        const metadataUrl = await pinataService.storeJSON({ filename, fileUrl: ipfsFileUrl });

        transactionId = await createOrderAndConfirm();
        await orderService.addDocument(SUPPLIER_INVOKER_ADDRESS, transactionId, 'shipped', rawDocument.name, rawDocument.documentType, metadataUrl);

        documentCounterId = await documentService.getDocumentCounter(SUPPLIER_INVOKER_ADDRESS);
        expect(documentCounterId).toEqual(1);

        const exist = await documentService.documentExists(SUPPLIER_INVOKER_ADDRESS, transactionId, documentCounterId);
        expect(exist).toBeTruthy();

        const savedDocument = await documentService.getDocumentInfo(SUPPLIER_INVOKER_ADDRESS, transactionId, documentCounterId);
        const savedDocumentFile = await savedDocument.file;
        expect(savedDocumentFile).toBeDefined();
        expect(savedDocument).toBeDefined();
        expect(savedDocument.id).toEqual(documentCounterId);
        expect(savedDocument.owner).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedDocument.transactionId).toEqual(transactionId);
        expect(savedDocument.name).toEqual(rawDocument.name);
        expect(savedDocument.documentType).toEqual(rawDocument.documentType);
        expect(savedDocumentFile?.filename).toEqual();
    }, 20000);

    it('Should add another document for the same transaction id and another to other transaction id', async () => {
        transactionId2 = await createOrderAndConfirm();
        await orderService.addDocument(SUPPLIER_INVOKER_ADDRESS, transactionId, 'on_board', rawDocument2.name, rawDocument2.documentType, rawDocument2.externalUrl);
        await orderService.addDocument(SUPPLIER_INVOKER_ADDRESS, transactionId2, 'shipped', rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);

        documentCounterId = await documentService.getDocumentCounter(SUPPLIER_INVOKER_ADDRESS);

        const transaction1DocumentIds = await documentService.getTransactionDocumentIds(SUPPLIER_INVOKER_ADDRESS, transactionId);
        const transaction2DocumentIds = await documentService.getTransactionDocumentIds(SUPPLIER_INVOKER_ADDRESS, transactionId2);
        expect(documentCounterId).toEqual(transaction1DocumentIds.length + transaction2DocumentIds.length);

        const savedTransaction2Document = await documentService.getDocumentInfo(SUPPLIER_INVOKER_ADDRESS, transactionId2, transaction2DocumentIds[0]);
        expect(savedTransaction2Document).toBeDefined();
        expect(savedTransaction2Document.id).toEqual(transaction2DocumentIds[0]);
        expect(savedTransaction2Document.owner).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedTransaction2Document.transactionId).toEqual(transactionId2);
        expect(savedTransaction2Document.name).toEqual(rawDocument.name);
        expect(savedTransaction2Document.documentType).toEqual(rawDocument.documentType);
    });
});
