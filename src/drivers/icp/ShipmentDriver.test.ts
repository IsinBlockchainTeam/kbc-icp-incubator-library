import { Wallet } from 'ethers';
import { DocumentTypeEnum } from '@kbc-lib/azle-types';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { computeRoleProof } from './proof';
import { ShipmentDriver } from './ShipmentDriver';
import { DocumentType } from '../../entities/icp/Document';
import { EvaluationStatus } from '../../entities/icp/Evaluation';
import { Phase } from '../../entities/icp/Shipment';
import {AuthenticationDriver} from "./AuthenticationDriver";

jest.setTimeout(300000);

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const USER2_PRIVATE_KEY = 'ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985';
const COMPANY2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
const SIWE_CANISTER_ID = 'be2us-64aaa-aaaaa-qaabq-cai';
const ENTITY_MANAGER_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    shipmentManagerDriver: ShipmentDriver;
    login: () => Promise<boolean>
};
const SHIPMENT_ID = 0;
const DOCUMENT_ID = 0;
describe('ShipmentManagerDriver', () => {
    let utils1: Utils, utils2: Utils;
    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const authenticationDriver = new AuthenticationDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const shipmentManagerDriver = new ShipmentDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            companyWallet
        );
        const login = () => authenticationDriver.login(roleProof);
        return { userWallet, companyWallet, shipmentManagerDriver, login };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USER2_PRIVATE_KEY, COMPANY2_PRIVATE_KEY);
    });

    it('should retrieve shipments', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const shipments = await shipmentManagerDriver.getShipments();
        console.log(shipments);
        expect(shipments).toBeDefined();
    });

    it('should retrieve shipment', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const shipment = await shipmentManagerDriver.getShipment(SHIPMENT_ID);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should get shipment phase', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const phase = await shipmentManagerDriver.getShipmentPhase(SHIPMENT_ID);
        console.log(phase);
        expect(phase).toBeDefined();
    });

    it('should get documents by type', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const document = await shipmentManagerDriver.getDocumentsByType(
            SHIPMENT_ID,
            DocumentType.PRE_SHIPMENT_SAMPLE
        );
        console.log(document);
        expect(document).toBeDefined();
    });

    it('should set shipment details', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
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
        const { shipmentManagerDriver, login} = utils2;
        await login();
        const shipment = await shipmentManagerDriver.evaluateSample(
            SHIPMENT_ID,
            EvaluationStatus.APPROVED
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate shipment details', async () => {
        const { shipmentManagerDriver, login} = utils2;
        await login();
        const shipment = await shipmentManagerDriver.evaluateShipmentDetails(
            SHIPMENT_ID,
            EvaluationStatus.APPROVED
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate quality', async () => {
        const { shipmentManagerDriver, login} = utils2;
        await login();
        const shipment = await shipmentManagerDriver.evaluateQuality(
            SHIPMENT_ID,
            EvaluationStatus.APPROVED
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should deposit funds', async () => {
        const { shipmentManagerDriver, login} = utils2;
        await login();
        const shipment = await shipmentManagerDriver.depositFunds(SHIPMENT_ID, 100);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should lock funds', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const shipment = await shipmentManagerDriver.lockFunds(SHIPMENT_ID);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    // TODO: understand where funds go
    it('should unlock funds', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const shipment = await shipmentManagerDriver.unlockFunds(SHIPMENT_ID);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should get documents', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const documents = await shipmentManagerDriver.getDocuments(SHIPMENT_ID);
        console.log(documents);
        expect(documents).toBeDefined();
    });

    it('should add a document', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const shipment = await shipmentManagerDriver.addDocument(
            SHIPMENT_ID,
            DocumentTypeEnum.CARGO_COLLECTION_ORDER,
            'https://example.com'
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should update a document', async () => {
        const { shipmentManagerDriver, login} = utils1;
        await login();
        const shipment = await shipmentManagerDriver.updateDocument(
            SHIPMENT_ID,
            DOCUMENT_ID,
            'https://example.com/edited'
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate a document', async () => {
        const { shipmentManagerDriver, login} = utils2;
        await login();
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
        const { shipmentManagerDriver: supplierDriver, login: supplierLogin} = utils1;
        await supplierLogin();
        const { shipmentManagerDriver: commissionerDriver, login: commissionerLogin} = utils2;
        await commissionerLogin();

        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.PRE_SHIPMENT_SAMPLE,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(
            SHIPMENT_ID,
            0,
            EvaluationStatus.APPROVED
        );
        console.log('pre shipment done');
        await commissionerDriver.evaluateSample(
            SHIPMENT_ID,
            EvaluationStatus.APPROVED
        );
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
        await commissionerDriver.evaluateShipmentDetails(
            SHIPMENT_ID,
            EvaluationStatus.APPROVED
        );
        console.log('evaluated shipment details');
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.SHIPPING_INSTRUCTIONS,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(
            SHIPMENT_ID,
            1,
            EvaluationStatus.APPROVED
        );
        console.log('shipping instructions');
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.SHIPPING_NOTE,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(
            SHIPMENT_ID,
            2,
            EvaluationStatus.APPROVED
        );
        console.log('shipping note');

        expect(await supplierDriver.getShipmentPhase(SHIPMENT_ID)).toEqual(
            Phase.PHASE_3
        );
    });

    it('should bring a shipment which has just locked the escrow to the 5th phase', async () => {
        const { shipmentManagerDriver: supplierDriver, login: supplierLogin} = utils1;
        await supplierLogin();
        const { shipmentManagerDriver: commissionerDriver, login: commissionerLogin} = utils2;
        await commissionerLogin();

        expect(await supplierDriver.getShipmentPhase(SHIPMENT_ID)).toEqual(
            Phase.PHASE_3
        );
        await supplierDriver.addDocument(
            SHIPMENT_ID,
            DocumentType.BOOKING_CONFIRMATION,
            'https://example.com'
        );
        await commissionerDriver.evaluateDocument(
            SHIPMENT_ID,
            3,
            EvaluationStatus.APPROVED
        );
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
        await commissionerDriver.evaluateDocument(
            SHIPMENT_ID,
            4,
            EvaluationStatus.APPROVED
        );
        await commissionerDriver.evaluateDocument(
            SHIPMENT_ID,
            5,
            EvaluationStatus.APPROVED
        );
        await commissionerDriver.evaluateDocument(
            SHIPMENT_ID,
            6,
            EvaluationStatus.APPROVED
        );
        console.log('phytosanitary certificate, bill of lading, origin certificate');

        // TODO: understand why funds are not unlocked here

        expect(await supplierDriver.getShipmentPhase(SHIPMENT_ID)).toStrictEqual({
            PHASE_5: null
        });
    });
});
