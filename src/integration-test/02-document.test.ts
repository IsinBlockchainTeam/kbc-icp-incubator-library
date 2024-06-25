import * as dotenv from 'dotenv';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers, Signer, Wallet } from 'ethers';
import path from 'path';
import { ICPStorageDriver } from '@blockchain-lib/common';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import * as fs from 'fs';
import DocumentService from '../services/DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { TradeManagerService } from '../services/TradeManagerService';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { DocumentType } from '../entities/DocumentInfo';
import { OrderTradeService } from '../services/OrderTradeService';
import {
    ADMIN_ADDRESS,
    ADMIN_PRIVATE_KEY,
    CUSTOMER_ADDRESS,
    CUSTOMER_PRIVATE_KEY,
    DOCUMENT_MANAGER_CONTRACT_ADDRESS,
    MATERIAL_MANAGER_CONTRACT_ADDRESS,
    MY_TOKEN_CONTRACT_ADDRESS,
    NETWORK,
    OTHER_ADDRESS,
    PRODUCT_CATEGORY_CONTRACT_ADDRESS,
    SUPPLIER_ADDRESS,
    TRADE_MANAGER_CONTRACT_ADDRESS
} from './constants/ethereum';
import { OrderTradeDriver } from '../drivers/OrderTradeDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { OrderStatus } from '../types/OrderStatus';
import { DocumentStatus, TransactionLine } from '../entities/Document';
import FileHelpers from '../utils/fileHelpers';
import { SIWE_CANISTER_ID } from './constants/icp';

dotenv.config();

describe('Document lifecycle', () => {
    let documentService: DocumentService;
    let documentDriver: DocumentDriver;
    let provider: JsonRpcProvider;
    let signer: Signer;
    let tradeManagerService: TradeManagerService;
    let tradeManagerDriver: TradeManagerDriver;
    let icpDriver: ICPFileDriver;

    const arbiter: string = Wallet.createRandom().address;
    const paymentDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const documentDeliveryDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const shippingDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const deliveryDeadline: number = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const agreedAmount: number = 1000;

    let transactionDocumentCounter = 0;

    const transactionLine: TransactionLine = { id: 1, quantity: 100 };
    let firstOrderTradeService: OrderTradeService;
    let secondOrderTradeService: OrderTradeService;
    const filename = 'samplePdf.pdf';
    const fileBuffer = fs.readFileSync(path.resolve(__dirname, filename));
    const content = new Uint8Array(fileBuffer);
    const paymentInvoice = {
        name: 'Payment invoice',
        documentType: DocumentType.PAYMENT_INVOICE,
        externalUrl: 'externalUrl',
        contentHash: FileHelpers.getHash(content).toString()
    };
    const originSwissDecode = {
        name: 'Origin Swiss Decode',
        documentType: DocumentType.ORIGIN_SWISS_DECODE,
        externalUrl: 'externalUr2',
        contentHash: FileHelpers.getHash(content).toString()
    };

    const _defineSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        documentDriver = new DocumentDriver(signer, DOCUMENT_MANAGER_CONTRACT_ADDRESS);
        icpDriver = new ICPFileDriver(
            new ICPStorageDriver(
                Secp256k1KeyIdentity.fromSeedPhrase('seed phrase'),
                SIWE_CANISTER_ID
            )
        );

        documentService = new DocumentService(documentDriver, icpDriver);
    };

    const _defineOrderSender = (privateKey: string) => {
        signer = new ethers.Wallet(privateKey, provider);
        tradeManagerDriver = new TradeManagerDriver(
            signer,
            TRADE_MANAGER_CONTRACT_ADDRESS,
            MATERIAL_MANAGER_CONTRACT_ADDRESS,
            PRODUCT_CATEGORY_CONTRACT_ADDRESS
        );
        tradeManagerService = new TradeManagerService({
            tradeManagerDriver,
            icpFileDriver: icpDriver
        });
    };

    const createOrderAndConfirm = async (): Promise<{
        orderId: number;
        orderTradeService: OrderTradeService;
    }> => {
        const [orderId, tradeAddress, transactionHash] =
            await tradeManagerService.registerOrderTrade(
                SUPPLIER_ADDRESS,
                OTHER_ADDRESS,
                CUSTOMER_ADDRESS,
                paymentDeadline,
                documentDeliveryDeadline,
                arbiter,
                shippingDeadline,
                deliveryDeadline,
                agreedAmount,
                MY_TOKEN_CONTRACT_ADDRESS,
                {
                    incoterms: 'incoterms',
                    shipper: 'shipper',
                    shippingPort: 'shippingPort',
                    deliveryPort: 'deliveryPort'
                },
                { prefix: 'prefix', organizationId: 1 },
                [1, 2]
            );
        _defineOrderSender(CUSTOMER_PRIVATE_KEY);
        const orderTradeService = new OrderTradeService(
            new OrderTradeDriver(
                signer,
                await tradeManagerService.getTrade(orderId),
                MATERIAL_MANAGER_CONTRACT_ADDRESS,
                PRODUCT_CATEGORY_CONTRACT_ADDRESS
            )
        );
        await orderTradeService.confirmOrder();
        return { orderId, orderTradeService };
    };

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        _defineSender(ADMIN_PRIVATE_KEY);
        _defineOrderSender(ADMIN_PRIVATE_KEY);
        await documentService.addTradeManager(TRADE_MANAGER_CONTRACT_ADDRESS);
    });

    // it('Should register two product categories and two materials', async () => {
    //     const productCategoryService: ProductCategoryService = new ProductCategoryService(
    //         new ProductCategoryDriver(signer, PRODUCT_CATEGORY_CONTRACT_ADDRESS)
    //     );
    //     productCategoryIds.push(
    //         (
    //             await productCategoryService.registerProductCategory(
    //                 'Coffee Arabica',
    //                 85,
    //                 'very good coffee'
    //             )
    //         ).id
    //     );
    //     productCategoryIds.push(
    //         (
    //             await productCategoryService.registerProductCategory(
    //                 'Coffee Nordic',
    //                 90,
    //                 'even better coffee'
    //             )
    //         ).id
    //     );
    //
    //     const materialService: MaterialService = new MaterialService(
    //         new MaterialDriver(
    //             signer,
    //             MATERIAL_MANAGER_CONTRACT_ADDRESS,
    //             PRODUCT_CATEGORY_CONTRACT_ADDRESS
    //         )
    //     );
    //     materialIds.push((await materialService.registerMaterial(productCategoryIds[0])).id);
    //     materialIds.push((await materialService.registerMaterial(productCategoryIds[1])).id);
    // });

    it('Should manage a document on chain', async () => {
        await documentService.registerDocument(
            paymentInvoice.externalUrl,
            paymentInvoice.contentHash,
            ADMIN_ADDRESS
        );
        const documentCounter = await documentService.getDocumentsCounter();
        expect(documentCounter).toEqual(1);

        const documentInfo = await documentService.getDocumentInfoById(documentCounter);
        expect(documentInfo).toBeDefined();
        expect(documentInfo.id).toEqual(documentCounter);
        expect(documentInfo.externalUrl).toEqual(paymentInvoice.externalUrl);
        expect(documentInfo.contentHash).toEqual(paymentInvoice.contentHash);
        expect(documentInfo.uploadedBy).toEqual(ADMIN_ADDRESS);

        await documentService.updateDocument(
            documentCounter,
            `${paymentInvoice.externalUrl}_updated`,
            `${paymentInvoice.contentHash}_updated`,
            ADMIN_ADDRESS
        );
        const updatedDocumentInfo = await documentService.getDocumentInfoById(documentCounter);
        expect(updatedDocumentInfo.externalUrl).toEqual(`${paymentInvoice.externalUrl}_updated`);
        expect(updatedDocumentInfo.contentHash).toEqual(`${paymentInvoice.contentHash}_updated`);
        expect(updatedDocumentInfo.uploadedBy).toEqual(ADMIN_ADDRESS);
    });

    it('Should register a document (and store it to an external storage) by invoking the order trade contract, then retrieve the document, validate it and check the updated order status', async () => {
        _defineSender(ADMIN_PRIVATE_KEY);
        const today = new Date();

        const { orderTradeService } = await createOrderAndConfirm();
        firstOrderTradeService = orderTradeService;
        await firstOrderTradeService.addDocument(
            paymentInvoice.documentType,
            fileBuffer,
            paymentInvoice.externalUrl,
            {
                name: filename,
                type: 'application/pdf'
            },
            [],
            [transactionLine],
            200
        );

        transactionDocumentCounter = (
            await firstOrderTradeService.getDocumentIdsByType(paymentInvoice.documentType)
        ).length;
        expect(transactionDocumentCounter).toEqual(1);

        const documentsInfo = await firstOrderTradeService.getDocumentsByType(
            paymentInvoice.documentType
        );
        expect(documentsInfo.length).toEqual(1);

        const savedDocumentInfo = documentsInfo[0];
        const savedDocument = await documentService.getCompleteDocument(savedDocumentInfo);
        expect(savedDocument).toBeDefined();
        expect(savedDocumentInfo).toBeDefined();
        expect(savedDocument.id).toEqual(transactionDocumentCounter);
        expect(savedDocument.externalUrl).toEqual(paymentInvoice.externalUrl);
        expect(savedDocument.contentHash).toEqual(originSwissDecode.name);
        expect(savedDocument.uploadedBy).toEqual(ADMIN_ADDRESS);
        expect(savedDocument.documentType).toEqual(paymentInvoice.documentType);
        expect(savedDocument.filename).toEqual(filename);
        expect(savedDocument.date).toEqual(today);
        expect(savedDocument.transactionLines).toEqual([transactionLine]);
        expect(savedDocument.quantity).toEqual(100);
        expect(savedDocument.content).toEqual(content);

        let status = await firstOrderTradeService.getOrderStatus();
        expect(status).toEqual(OrderStatus.PRODUCTION);
        // validate the document and approve it to move to the next order status stage
        await firstOrderTradeService.validateDocument(savedDocument.id, DocumentStatus.APPROVED);
        expect(await firstOrderTradeService.getDocumentStatus(savedDocument.id)).toEqual(
            DocumentStatus.APPROVED
        );
        status = await firstOrderTradeService.getOrderStatus();
        expect(status).toEqual(OrderStatus.PAYED);
    }, 30000);

    it('Should add another document for the first order and another to a new order', async () => {
        const { orderTradeService } = await createOrderAndConfirm();
        secondOrderTradeService = orderTradeService;

        await firstOrderTradeService.addDocument(
            originSwissDecode.documentType,
            fileBuffer,
            originSwissDecode.externalUrl,
            {
                name: filename,
                type: 'application/pdf'
            },
            [],
            [transactionLine],
            60
        );
        await secondOrderTradeService.addDocument(
            paymentInvoice.documentType,
            fileBuffer,
            paymentInvoice.externalUrl,
            {
                name: filename,
                type: 'application/pdf'
            },
            [],
            [transactionLine],
            150
        );

        const transactionDocumentsCounter = (await firstOrderTradeService.getAllDocumentIds())
            .length;
        const transaction2DocumentsCounter = (await secondOrderTradeService.getAllDocumentIds())
            .length;
        expect(transactionDocumentsCounter).toEqual(2);
        expect(transaction2DocumentsCounter).toEqual(1);

        const savedTransaction2Documents = await secondOrderTradeService.getAllDocuments();
        expect(savedTransaction2Documents).toBeDefined();
        expect(savedTransaction2Documents[0].id).toEqual(transaction2DocumentsCounter);
        expect(savedTransaction2Documents[0].externalUrl).toEqual(paymentInvoice.externalUrl);
        expect(savedTransaction2Documents[0].contentHash).toEqual(paymentInvoice.contentHash);
        expect(savedTransaction2Documents[0].uploadedBy).toEqual(ADMIN_ADDRESS);
    }, 30000);
});
