import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';
import DocumentService from '../services/DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import {
    CUSTOMER_INVOKER_ADDRESS,
    CUSTOMER_INVOKER_PRIVATE_KEY,
    DOCUMENT_MANAGER_CONTRACT_ADDRESS,
    NETWORK,
    SUPPLIER_INVOKER_ADDRESS, SUPPLIER_INVOKER_PRIVATE_KEY,
} from './config';

describe('Document lifecycle', () => {
    let documentService: DocumentService;
    let documentDriver: DocumentDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;

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
    const transactionId = 2;
    const transactionId2 = 5;

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        documentDriver = new DocumentDriver(
            signer,
            DOCUMENT_MANAGER_CONTRACT_ADDRESS,
        );
        documentService = new DocumentService(documentDriver);
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        _defineSender(SUPPLIER_INVOKER_PRIVATE_KEY);
    });

    it('Should correctly register and retrieve a document', async () => {
        await documentService.registerDocument(SUPPLIER_INVOKER_ADDRESS, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
        documentCounterId = await documentService.getDocumentCounter(SUPPLIER_INVOKER_ADDRESS);
        expect(documentCounterId).toEqual(1);

        const exist = await documentService.documentExists(SUPPLIER_INVOKER_ADDRESS, transactionId, documentCounterId);
        expect(exist).toBeTruthy();

        const savedDocument = await documentService.getDocumentInfo(SUPPLIER_INVOKER_ADDRESS, transactionId, documentCounterId);
        expect(savedDocument).toBeDefined();
        expect(savedDocument.id).toEqual(documentCounterId);
        expect(savedDocument.owner).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedDocument.transactionId).toEqual(transactionId);
        expect(savedDocument.name).toEqual(rawDocument.name);
        expect(savedDocument.documentType).toEqual(rawDocument.documentType);
        expect(savedDocument.externalUrl).toEqual(rawDocument.externalUrl);
    });

    it('Should register a document by another company', async () => {
        _defineSender(CUSTOMER_INVOKER_PRIVATE_KEY);
        await documentService.registerDocument(CUSTOMER_INVOKER_ADDRESS, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
        documentCounterId = await documentService.getDocumentCounter(CUSTOMER_INVOKER_ADDRESS);
        expect(documentCounterId).not.toEqual(2);
        expect(documentCounterId).toEqual(1);

        const exist = await documentService.documentExists(CUSTOMER_INVOKER_ADDRESS, transactionId, documentCounterId);
        expect(exist).toBeTruthy();
    });

    it('Should add another document for the same transaction id and another to other transaction id', async () => {
        await documentService.registerDocument(CUSTOMER_INVOKER_ADDRESS, transactionId, rawDocument2.name, rawDocument2.documentType, rawDocument2.externalUrl);
        await documentService.registerDocument(CUSTOMER_INVOKER_ADDRESS, transactionId2, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
        documentCounterId = await documentService.getDocumentCounter(CUSTOMER_INVOKER_ADDRESS);

        const transaction1DocumentIds = await documentService.getTransactionDocumentIds(CUSTOMER_INVOKER_ADDRESS, transactionId);
        const transaction2DocumentIds = await documentService.getTransactionDocumentIds(CUSTOMER_INVOKER_ADDRESS, transactionId2);
        expect(documentCounterId).toEqual(transaction1DocumentIds.length + transaction2DocumentIds.length);

        const savedTransaction2Document = await documentService.getDocumentInfo(CUSTOMER_INVOKER_ADDRESS, transactionId2, transaction2DocumentIds[0]);
        expect(savedTransaction2Document).toBeDefined();
        expect(savedTransaction2Document.id).toEqual(transaction2DocumentIds[0]);
        expect(savedTransaction2Document.owner).toEqual(CUSTOMER_INVOKER_ADDRESS);
        expect(savedTransaction2Document.transactionId).toEqual(transactionId2);
        expect(savedTransaction2Document.name).toEqual(rawDocument.name);
        expect(savedTransaction2Document.documentType).toEqual(rawDocument.documentType);
        expect(savedTransaction2Document.externalUrl).toEqual(rawDocument.externalUrl);
    });
});
