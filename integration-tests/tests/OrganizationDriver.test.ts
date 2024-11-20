import { OrganizationRole, OrganizationVisibilityLevel } from '../../icp/ts-canister/src/models/types';
import { OrganizationDriver, OrganizationParams } from '@isinblockchainteam/kbc-icp-incubator-library/drivers/OrganizationDriver';
import { Organization } from '@isinblockchainteam/kbc-icp-incubator-library/entities/organization/Organization';
import { OrderDriver } from '@isinblockchainteam/kbc-icp-incubator-library/drivers/OrderDriver';
import { Order } from '@isinblockchainteam/kbc-icp-incubator-library/entities/Order';
import { NarrowedOrganization } from '@isinblockchainteam/kbc-icp-incubator-library/entities/organization/NarrowedOrganization';
import { ProductCategoryDriver } from '@isinblockchainteam/kbc-icp-incubator-library/drivers/ProductCategoryDriver';
import { ICP, USERS } from '../../src/__shared__/constants/constants';
import { AuthHelper, Login } from '../../src/__shared__/helpers/AuthHelper';
import { BroadedOrganization } from '@isinblockchainteam/kbc-icp-incubator-library/entities/organization/BroadedOrganization';

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

    beforeAll(async () => {
        user1 = await AuthHelper.prepareLogin(USERS.USER1_PRIVATE_KEY, USERS.COMPANY1_PRIVATE_KEY);
        user2 = await AuthHelper.prepareLogin(USERS.USER2_PRIVATE_KEY, USERS.COMPANY2_PRIVATE_KEY);

        organizationDriverUser1 = new OrganizationDriver(
            user1.siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );

        organizationDriverUser2 = new OrganizationDriver(
            user2.siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );

        orderDriver = new OrderDriver(
            user1.siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
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

        await user1.authenticate();
        await user2.authenticate();
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
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
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
