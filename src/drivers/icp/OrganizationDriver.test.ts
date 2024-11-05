import { Wallet } from 'ethers';
import { OrganizationRole, OrganizationVisibilityLevel } from '@kbc-lib/azle-types';
import { OrganizationDriver, OrganizationParams } from './OrganizationDriver';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { computeRoleProof } from './proof';
import { AuthenticationDriver } from './AuthenticationDriver';
import { BroadedOrganization } from '../../entities/organization/BroadedOrganization';
import { Organization } from '../../entities/organization/Organization';
import { OrderDriver } from './OrderDriver';
import { Order } from '../../entities/icp/Order';
import { NarrowedOrganization } from '../../entities/organization/NarrowedOrganization';
import { ProductCategoryDriver } from './ProductCategoryDriver';

// FIXME: Move this variables to a common file?
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
const ICP_NETWORK = 'http://127.0.0.1:4943/';

type Login = {
    userWallet: Wallet;
    companyWallet: Wallet;
    siweIdentityProvider: SiweIdentityProvider;
    login: () => Promise<boolean>;
};

describe('OrganizationDriver', () => {
    let organizationDriverUser1: OrganizationDriver;
    let organizationDriverUser2: OrganizationDriver;
    let organizationScratch: OrganizationParams;
    let updatedOrganizationScratch: OrganizationParams;
    let createdOrganization: Organization;
    let createdOrder: Order;
    let orderDriver: OrderDriver;

    let user1: Login;
    let user2: Login;

    // FIXME: Move this variables to a common file?
    const prepareLogin = async (
        userPrivateKey: string,
        companyPrivateKey: string
    ): Promise<Login> => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();

        const authenticationDriver = new AuthenticationDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            ICP_NETWORK
        );

        const roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            companyWallet
        );

        const login = () => authenticationDriver.login(roleProof);
        return { userWallet, companyWallet, siweIdentityProvider, login };
    };

    beforeAll(async () => {
        user1 = await prepareLogin(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
        user2 = await prepareLogin(USER2_PRIVATE_KEY, COMPANY2_PRIVATE_KEY);

        organizationDriverUser1 = new OrganizationDriver(
            user1.siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            ICP_NETWORK
        );

        organizationDriverUser2 = new OrganizationDriver(
            user2.siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            ICP_NETWORK
        );

        orderDriver = new OrderDriver(
            user1.siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            ICP_NETWORK
        );

        organizationScratch = {
            legalName: 'Test Organization',
            industrialSector: 'Test Industrial Sector',
            address: 'Test Address',
            city: 'Test City',
            postalCode: 'Test Postal Code',
            region: 'Test Region',
            countryCode: 'Test Country Code',
            role: OrganizationRole.IMPORTER,
            telephone: 'Test Telephone',
            email: 'Test Email',
            image: 'Test Image'
        };
        updatedOrganizationScratch = {
            legalName: 'Updated Test Organization',
            industrialSector: 'Updated Test Industrial Sector',
            address: 'Updated Test Address',
            city: 'Updated Test City',
            postalCode: 'Updated Test Postal Code',
            region: 'Updated Test Region',
            countryCode: 'Updated Test Country Code',
            role: OrganizationRole.EXPORTER,
            telephone: 'Updated Test Telephone',
            email: 'Updated Test Email',
            image: 'Updated Test Image'
        };

        await user1.login();
        await user2.login();
    }, 30000);

    afterAll(async () => {
        await orderDriver.deleteOrder(createdOrder.id);
    });

    it('should get organizations', async () => {
        const organizations = await organizationDriverUser1.getOrganizations();

        expect(organizations).toBeInstanceOf(Array);
    });

    it('should get organization - not founded', async () => {
        const getOrganizationFunction = async () => organizationDriverUser1.getOrganization('0x0');

        await expect(getOrganizationFunction()).rejects.toThrow();
    });

    it('should create organization', async () => {
        createdOrganization = await organizationDriverUser1.createOrganization(organizationScratch);

        expect(createdOrganization).toBeInstanceOf(BroadedOrganization);
        expect(createdOrganization.visibilityLevel).toBe(OrganizationVisibilityLevel.BROAD);

        const organization = createdOrganization as BroadedOrganization;

        expect(organization).toMatchObject(organizationScratch);
    });

    it('should get organization - founded, caller = organization', async () => {
        const retrievedOrganization = await organizationDriverUser1.getOrganization(
            createdOrganization.ethAddress
        );

        expect(retrievedOrganization).toBeInstanceOf(BroadedOrganization);
        expect(retrievedOrganization.visibilityLevel).toBe(OrganizationVisibilityLevel.BROAD);

        const organization = retrievedOrganization as BroadedOrganization;

        expect(organization).toMatchObject(organizationScratch);
    });

    it('should get organization - founded, caller != organization, order not traded', async () => {
        const retrievedOrganization = await organizationDriverUser2.getOrganization(
            createdOrganization.ethAddress
        );

        expect(retrievedOrganization).toBeInstanceOf(NarrowedOrganization);
        expect(retrievedOrganization.visibilityLevel).toBe(OrganizationVisibilityLevel.NARROW);

        const organization = retrievedOrganization as NarrowedOrganization;

        expect(organization.legalName).toBe(organizationScratch.legalName);
    });

    it('should simulate order between parties', async () => {
        const productCategoryDriver = new ProductCategoryDriver(
            user1.siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            ICP_NETWORK
        );
        const productCategory = await productCategoryDriver.createProductCategory(
            'test',
            1,
            'test'
        );

        expect(productCategory).toBeDefined();

        const date = new Date();
        const orderParams = {
            supplier: user1.companyWallet.address,
            customer: user2.companyWallet.address,
            commissioner: user2.companyWallet.address,
            paymentDeadline: date,
            documentDeliveryDeadline: date,
            shippingDeadline: date,
            deliveryDeadline: date,
            arbiter: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            token: '0xc5a5C42992dECbae36851359345FE25997F5C42d',
            agreedAmount: 10,
            escrowManager: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            incoterms: 'incoterms',
            shipper: 'shipper',
            shippingPort: 'shippingPort',
            deliveryPort: 'deliveryPort',
            lines: [
                {
                    productCategoryId: productCategory.id,
                    quantity: 1,
                    unit: 'unit',
                    price: {
                        amount: 1,
                        fiat: 'USD'
                    }
                }
            ]
        };
        date.setDate(date.getDate() + 14);

        createdOrder = await orderDriver.createOrder(orderParams);

        expect(createdOrder).toBeDefined();
    });

    it('should get organization - founded, caller != organization, order traded', async () => {
        const retrievedOrganization = await organizationDriverUser2.getOrganization(
            createdOrganization.ethAddress
        );

        expect(retrievedOrganization).toBeInstanceOf(BroadedOrganization);
        expect(retrievedOrganization.visibilityLevel).toBe(OrganizationVisibilityLevel.BROAD);

        const organization = retrievedOrganization as BroadedOrganization;

        expect(organization).toMatchObject(organizationScratch);
    });

    it('should update organization', async () => {
        const updatedOrganization = await organizationDriverUser1.updateOrganization(
            createdOrganization.ethAddress,
            updatedOrganizationScratch
        );

        expect(updatedOrganization).toBeInstanceOf(BroadedOrganization);
        expect(updatedOrganization.visibilityLevel).toBe(OrganizationVisibilityLevel.BROAD);

        const organization = updatedOrganization as BroadedOrganization;

        expect(organization).toMatchObject(updatedOrganizationScratch);
    });

    it('should get organization - updated, caller = organization', async () => {
        const retrievedOrganization = await organizationDriverUser1.getOrganization(
            createdOrganization.ethAddress
        );

        expect(retrievedOrganization).toBeInstanceOf(BroadedOrganization);
        expect(retrievedOrganization.visibilityLevel).toBe(OrganizationVisibilityLevel.BROAD);

        const organization = retrievedOrganization as BroadedOrganization;

        expect(organization).toMatchObject(updatedOrganizationScratch);
    });

    it('should delete organization', async () => {
        const isDeleted = await organizationDriverUser1.deleteOrganization(
            createdOrganization.ethAddress
        );

        expect(isDeleted).toBe(true);
    });

    it('should get organization - deleted', async () => {
        const getOrganizationFunction = async () =>
            organizationDriverUser1.getOrganization(createdOrganization.ethAddress);

        await expect(getOrganizationFunction()).rejects.toThrow();
    });
});
