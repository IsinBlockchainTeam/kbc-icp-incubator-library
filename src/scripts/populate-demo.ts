import {
    mockOrder,
    mockProductCategories,
    ProductCategoryParams
} from '../__shared__/constants/mock-data';
import { ProductCategoryDriver } from '../drivers/ProductCategoryDriver';
import { SiweIdentityProvider } from '../drivers/SiweIdentityProvider';
import { ICP, USERS } from '../__shared__/constants/constants';
import { ProductCategory } from '../entities/ProductCategory';
import { AuthHelper, Login } from '../__shared__/helpers/AuthHelper';
import { Material } from '../entities/Material';
import { MaterialDriver } from '../drivers/MaterialDriver';
import { OfferDriver } from '../drivers/OfferDriver';
import { Offer } from '../entities/Offer';
import { OrderDriver, OrderParams } from '../drivers/OrderDriver';
import { Order } from '../entities/Order';

const createProductCategory = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    params: ProductCategoryParams
): Promise<ProductCategory> => {
    console.log('Creating product category:', params.name);

    const productCategoryDriver = new ProductCategoryDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return productCategoryDriver.createProductCategory(
        params.name,
        params.quality,
        params.description
    );
};

const createMaterial = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    productCategoryId: number
) => {
    console.log('Creating material for product category:', productCategoryId);

    const materialDriver = new MaterialDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return materialDriver.createMaterial(productCategoryId);
};

const createOffer = async (
    userSiweIdentityProvider: SiweIdentityProvider,
    productCategoryId: number
) => {
    console.log('Creating offer for product category:', productCategoryId);

    const offerDriver = new OfferDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return offerDriver.createOffer(productCategoryId);
};

const createOrder = async (userSiweIdentityProvider: SiweIdentityProvider, params: OrderParams) => {
    console.log('Creating order between:', params.supplier, params.customer);

    const orderDriver = new OrderDriver(
        userSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    return orderDriver.createOrder(params);
};

const completeOrder = async (
    supplierSiweIdentityProvider: SiweIdentityProvider,
    customerSiweIdentityProvider: SiweIdentityProvider,
    orderId: number
) => {
    console.log('Completing order:', orderId);

    const orderDriver = new OrderDriver(
        supplierSiweIdentityProvider.identity,
        ICP.ENTITY_MANAGER_CANISTER_ID,
        ICP.NETWORK
    );

    await orderDriver.signOrder(orderId);
};

const main = async () => {
    console.log('Logging in...');

    const user1: Login = await AuthHelper.prepareLogin(
        USERS.USER1_PRIVATE_KEY,
        USERS.COMPANY1_PRIVATE_KEY
    );
    const user2: Login = await AuthHelper.prepareLogin(
        USERS.USER2_PRIVATE_KEY,
        USERS.COMPANY2_PRIVATE_KEY
    );

    await user1.authenticate();
    await user2.authenticate();

    console.log('Logged');

    const createdProductCategories: ProductCategory[] = await Promise.all(
        mockProductCategories.map(async (productCategoryParams) =>
            createProductCategory(user1.siweIdentityProvider, productCategoryParams)
        )
    );

    const createdMaterials: Material[] = await Promise.all(
        createdProductCategories.map(async (productCategory) =>
            createMaterial(user1.siweIdentityProvider, productCategory.id)
        )
    );

    const createdOffers: Offer[] = await Promise.all(
        createdProductCategories.map(async (productCategory) =>
            createOffer(user1.siweIdentityProvider, productCategory.id)
        )
    );

    const createdOrders: Order[] = await Promise.all(
        createdProductCategories
            .slice(0, 1)
            .map(async (productCategory) =>
                createOrder(user2.siweIdentityProvider, mockOrder(productCategory.id))
            )
    );

    await Promise.all(
        createdOrders.map(async (order) =>
            completeOrder(user1.siweIdentityProvider, user2.siweIdentityProvider, order.id)
        )
    );
};

main().catch(console.error);
