import { OrganizationVisibilityLevel } from '@kbc-lib/azle-types';
import { OrganizationDriver, OrganizationParams } from './OrganizationDriver';
import { BroadedOrganization } from '../../entities/organization/BroadedOrganization';
import { Organization } from '../../entities/organization/Organization';
import { OrderDriver } from './OrderDriver';
import { Order } from '../../entities/icp/Order';
import { ProductCategory } from '../../entities/ProductCategory';
import { NarrowedOrganization } from '../../entities/organization/NarrowedOrganization';
import { ProductCategoryDriver } from './ProductCategoryDriver';
import { ICP, USERS } from '../../__shared__/constants/constants';
import { AuthHelper, Login } from '../../__shared__/helpers/AuthHelper';
import {
    mockOrder,
    mockOrganization,
    mockProductCategories
} from '../../__shared__/constants/mock-data';

describe('OrganizationDriver', () => {
    let organizationDriverUser1: OrganizationDriver;
    let organizationDriverUser2: OrganizationDriver;
    let organizationScratch: OrganizationParams;
    let updatedOrganizationScratch: OrganizationParams;
    let createdOrganization: Organization;
    let createdProductCategory: ProductCategory;
    let productCategoryDriver: ProductCategoryDriver;
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

        productCategoryDriver = new ProductCategoryDriver(
            user1.siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );

        organizationScratch = mockOrganization[0];
        updatedOrganizationScratch = mockOrganization[1];

        await user1.login();
        await user2.login();
    }, 30000);

    afterAll(async () => {
        await orderDriver.deleteOrder(createdOrder.id);
        await productCategoryDriver.deleteProductCategory(createdProductCategory.id);
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
        const productCategoryParams = mockProductCategories[0];

        createdProductCategory = await productCategoryDriver.createProductCategory(
            productCategoryParams.name,
            productCategoryParams.quality,
            productCategoryParams.description
        );

        expect(createdProductCategory).toBeDefined();

        const orderParams = mockOrder(createdProductCategory.id);

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
