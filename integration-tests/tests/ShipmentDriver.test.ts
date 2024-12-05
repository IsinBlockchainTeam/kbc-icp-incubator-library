import { Wallet } from 'ethers';
import { DocumentTypeEnum, SiweIdentityProvider, ShipmentDriver, ICPAuthenticationDriver, DocumentType, EvaluationStatus, ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';
import { createRoleProof } from '../../src/__testUtils__/proof';
import { ICP, USERS } from '@kbc-lib/coffee-trading-management-lib/dist/__shared__/constants/constants';
import { Phase } from '@kbc-lib/coffee-trading-management-lib/dist/entities/Shipment';

jest.setTimeout(300000);
type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    shipmentManagerDriver: ShipmentDriver;
    authenticate: () => Promise<void>;
};
const SHIPMENT_ID = 0;
const DOCUMENT_ID = 0;
describe('ShipmentManagerDriver', () => {
    let utils1: Utils, utils2: Utils;
    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, ICP.SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const authenticationDriver = new ICPAuthenticationDriver(
            siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const shipmentManagerDriver = new ShipmentDriver(
            siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, shipmentManagerDriver, authenticate };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USERS.USER1_PRIVATE_KEY, USERS.COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USERS.USER2_PRIVATE_KEY, USERS.COMPANY2_PRIVATE_KEY);
    });

    it('should retrieve shipments', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const shipments = await shipmentManagerDriver.getShipments();
        console.log(shipments);
        expect(shipments).toBeDefined();
    });

    it('should retrieve shipment', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const shipment = await shipmentManagerDriver.getShipment(SHIPMENT_ID);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should get shipment phase', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const phase = await shipmentManagerDriver.getShipmentPhase(SHIPMENT_ID);
        console.log(phase);
        expect(phase).toBeDefined();
    });

    it('should get documents by type', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const document = await shipmentManagerDriver.getDocumentsByType(
            SHIPMENT_ID,
            DocumentType.PRE_SHIPMENT_SAMPLE
        );
        console.log(document);
        expect(document).toBeDefined();
    });

    it('should set shipment details', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const shipment = await shipmentManagerDriver.setShipmentDetails(
            SHIPMENT_ID,
            100,
            new Date(),
            new Date(),
            'targetExchange',
            2,
            1000,
            1000,
            1,
            1000,
            1100
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate sample', async () => {
        const { shipmentManagerDriver, authenticate } = utils2;
        await authenticate();
        const shipment = await shipmentManagerDriver.evaluateSample(
            SHIPMENT_ID,
            EvaluationStatus.APPROVED
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate shipment details', async () => {
        const { shipmentManagerDriver, authenticate } = utils2;
        await authenticate();
        const shipment = await shipmentManagerDriver.evaluateShipmentDetails(
            SHIPMENT_ID,
            EvaluationStatus.APPROVED
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate quality', async () => {
        const { shipmentManagerDriver, authenticate } = utils2;
        await authenticate();
        const shipment = await shipmentManagerDriver.evaluateQuality(
            SHIPMENT_ID,
            EvaluationStatus.APPROVED
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should determine down payment address', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const downPaymentAddress = await shipmentManagerDriver.determineDownPaymentAddress(SHIPMENT_ID);
        console.log(downPaymentAddress);
        expect(downPaymentAddress).toBeDefined();
    });

    it('should deposit funds', async () => {
        const { shipmentManagerDriver, authenticate } = utils2;
        await authenticate();
        const shipment = await shipmentManagerDriver.depositFunds(SHIPMENT_ID, 100);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should lock funds', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const shipment = await shipmentManagerDriver.lockFunds(SHIPMENT_ID);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    // TODO: understand where funds go
    it('should unlock funds', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const shipment = await shipmentManagerDriver.unlockFunds(SHIPMENT_ID);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should get documents', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const documents = await shipmentManagerDriver.getDocuments(SHIPMENT_ID);
        console.log(documents);
        expect(documents).toBeDefined();
    });

    it('should add a document', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const shipment = await shipmentManagerDriver.addDocument(
            SHIPMENT_ID,
            DocumentTypeEnum.PRE_SHIPMENT_SAMPLE,
            'https://example.com'
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should update a document', async () => {
        const { shipmentManagerDriver, authenticate } = utils1;
        await authenticate();
        const shipment = await shipmentManagerDriver.updateDocument(
            SHIPMENT_ID,
            DOCUMENT_ID,
            'https://example.com/edited'
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate a document', async () => {
        const { shipmentManagerDriver, authenticate } = utils2;
        await authenticate();
        const shipment = await shipmentManagerDriver.evaluateDocument(
            SHIPMENT_ID,
            DOCUMENT_ID,
            EvaluationStatus.APPROVED
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should get phase 1 required documents', async () => {
        const { shipmentManagerDriver } = utils1;
        const documents = await shipmentManagerDriver.getPhase1RequiredDocuments();
        console.log(documents);
        expect(documents).toBeDefined();
    });

    it('should bring a new shipment to the 3rd phase', async () => {
        const { shipmentManagerDriver: supplierDriver, authenticate: supplierAuthenticate } =
            utils1;
        await supplierAuthenticate();
        const {
            shipmentManagerDriver: commissionerDriver,
            authenticate: commissionerAuthenticate
        } = utils2;
        await commissionerAuthenticate();

        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.PRE_SHIPMENT_SAMPLE,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(SHIPMENT_ID, 0, EvaluationStatus.APPROVED);
        console.log('pre shipment done');
        await commissionerDriver.evaluateSample(SHIPMENT_ID, EvaluationStatus.APPROVED);
        console.log('evaluated sample');
        await supplierDriver.setShipmentDetails(
            SHIPMENT_ID,
            100,
            new Date(),
            new Date(),
            'targetExchange',
            2,
            10,
            1000,
            1,
            1000,
            1100
        );
        console.log('set shipment details');
        await commissionerDriver.evaluateShipmentDetails(SHIPMENT_ID, EvaluationStatus.APPROVED);
        console.log('evaluated shipment details');
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.SHIPPING_INSTRUCTIONS,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(SHIPMENT_ID, 1, EvaluationStatus.APPROVED);
        console.log('shipping instructions');
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.SHIPPING_NOTE,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(SHIPMENT_ID, 2, EvaluationStatus.APPROVED);
        console.log('shipping note');

        expect(await supplierDriver.getShipmentPhase(SHIPMENT_ID)).toEqual(ShipmentPhase.PHASE_3);
    });

    it('should bring a shipment which has just locked the down payment to the 5th phase', async () => {
        const { shipmentManagerDriver: supplierDriver, authenticate: supplierLogin } = utils1;
        await supplierLogin();
        const { shipmentManagerDriver: commissionerDriver, authenticate: commissionerLogin } =
            utils2;
        await commissionerLogin();

        expect(await supplierDriver.getShipmentPhase(SHIPMENT_ID)).toEqual(ShipmentPhase.PHASE_3);
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.BOOKING_CONFIRMATION,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(SHIPMENT_ID, 3, EvaluationStatus.APPROVED);
        console.log('booking confirmation');
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.PHYTOSANITARY_CERTIFICATE,
            'https://example.com'
        );
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.BILL_OF_LADING,
            'https://example.com'
        );
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.ORIGIN_CERTIFICATE_ICO,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(SHIPMENT_ID, 4, EvaluationStatus.APPROVED);
        await commissionerDriver.evaluateDocument(SHIPMENT_ID, 5, EvaluationStatus.APPROVED);
        await commissionerDriver.evaluateDocument(SHIPMENT_ID, 6, EvaluationStatus.APPROVED);
        console.log('phytosanitary certificate, bill of lading, origin certificate');

        // TODO: understand why funds are not unlocked here

        expect(await supplierDriver.getShipmentPhase(SHIPMENT_ID)).toStrictEqual(Phase.PHASE_5);
    });
});
