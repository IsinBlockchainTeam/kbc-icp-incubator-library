import { Wallet } from 'ethers';
import { RoleProof } from '../../../icp/ts-canister/src/models/Proof';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { computeRoleProof } from './proof';
import { ShipmentManagerDriver } from './ShipmentManagerDriver';

jest.setTimeout(30000);

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const USER2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
const SIWE_CANISTER_ID = 'br5f7-7uaaa-aaaaa-qaaca-cai';
const SHIPMENT_MANAGER_CANISTER_ID = 'asrmz-lmaaa-aaaaa-qaaeq-cai';
type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    shipmentManagerDriver: ShipmentManagerDriver;
    roleProof: RoleProof;
};
const SHIPMENT_ID = 3;
describe('ShipmentManagerDriver', () => {
    let utils1: Utils, utils2: Utils;
    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const shipmentManagerDriver = new ShipmentManagerDriver(
            siweIdentityProvider.identity,
            SHIPMENT_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            companyPrivateKey
        );
        return { userWallet, companyWallet, shipmentManagerDriver, roleProof };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USER2_PRIVATE_KEY, COMPANY2_PRIVATE_KEY);
    });

    it('should retrieve shipments', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const shipments = await shipmentManagerDriver.getShipments(roleProof);
        console.log(shipments);
        expect(shipments).toBeDefined();
    });

    it('should retrieve shipment', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const shipment = await shipmentManagerDriver.getShipment(roleProof, SHIPMENT_ID);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should create shipment', async () => {
        const { companyWallet: company1Wallet, shipmentManagerDriver, roleProof } = utils1;
        const { companyWallet: company2Wallet } = utils2;
        const shipment = await shipmentManagerDriver.createShipment(
            roleProof,
            company1Wallet.address,
            company2Wallet.address,
            true
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should get shipment phase', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const phase = await shipmentManagerDriver.getShipmentPhase(roleProof, SHIPMENT_ID);
        console.log(phase);
        expect(phase).toBeDefined();
    });

    it('should get documents by type', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const document = await shipmentManagerDriver.getDocumentsByType(roleProof, SHIPMENT_ID, {
            PRE_SHIPMENT_SAMPLE: null
        });
        console.log(document);
        expect(document).toBeDefined();
    });

    it('should set shipment details', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const shipment = await shipmentManagerDriver.setShipmentDetails(
            roleProof,
            SHIPMENT_ID,
            100,
            2000,
            3000,
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
        const { shipmentManagerDriver, roleProof } = utils2;
        const shipment = await shipmentManagerDriver.evaluateSample(roleProof, SHIPMENT_ID, {
            APPROVED: null
        });
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate shipment details', async () => {
        const { shipmentManagerDriver, roleProof } = utils2;
        const shipment = await shipmentManagerDriver.evaluateShipmentDetails(
            roleProof,
            SHIPMENT_ID,
            {
                APPROVED: null
            }
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate quality', async () => {
        const { shipmentManagerDriver, roleProof } = utils2;
        const shipment = await shipmentManagerDriver.evaluateQuality(roleProof, SHIPMENT_ID, {
            APPROVED: null
        });
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should deposit funds', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const shipment = await shipmentManagerDriver.depositFunds(roleProof, SHIPMENT_ID, 1000);
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should get documents', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const documents = await shipmentManagerDriver.getDocuments(roleProof, SHIPMENT_ID);
        console.log(documents);
        expect(documents).toBeDefined();
    });

    it('should add a document', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const shipment = await shipmentManagerDriver.addDocument(
            roleProof,
            SHIPMENT_ID,
            { PRE_SHIPMENT_SAMPLE: null },
            'https://example.com'
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should update a document', async () => {
        const { shipmentManagerDriver, roleProof } = utils1;
        const shipment = await shipmentManagerDriver.updateDocument(
            roleProof,
            SHIPMENT_ID,
            0,
            'https://example.com/edited'
        );
        console.log(shipment);
        expect(shipment).toBeDefined();
    });

    it('should evaluate a document', async () => {
        const { shipmentManagerDriver, roleProof } = utils2;
        const shipment = await shipmentManagerDriver.evaluateDocument(roleProof, SHIPMENT_ID, 0, {
            APPROVED: null
        });
        console.log(shipment);
        expect(shipment).toBeDefined();
    });
});
