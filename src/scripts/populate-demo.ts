import {
    mockOrder,
    mockProductCategories,
    ProductCategoryParams
} from '../__shared__/constants/mock-data';
import { ProductCategoryDriver } from '../drivers/icp/ProductCategoryDriver';
import { SiweIdentityProvider } from '../drivers/icp/SiweIdentityProvider';
import { ICP, USERS } from '../__shared__/constants/constants';
import { ProductCategory } from '../entities/ProductCategory';
import { AuthHelper, Login } from '../__shared__/helpers/AuthHelper';
import { Material } from '../entities/Material';
import { MaterialDriver } from '../drivers/icp/MaterialDriver';
import { OfferDriver } from '../drivers/icp/OfferDriver';
import { Offer } from '../entities/Offer';
import { OrderDriver, OrderParams } from '../drivers/icp/OrderDriver';
import { Order } from '../entities/icp/Order';

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

const main = async () => {
    console.log('Logging in');

    const user1: Login = await AuthHelper.prepareLogin(
        USERS.USER1_PRIVATE_KEY,
        USERS.COMPANY1_PRIVATE_KEY
    );

    await user1.login();

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
                createOrder(user1.siweIdentityProvider, mockOrder(productCategory.id))
            )
    );
};

main().catch(console.error);
