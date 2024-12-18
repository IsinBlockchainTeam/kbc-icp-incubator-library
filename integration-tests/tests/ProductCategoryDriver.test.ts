import { Wallet } from 'ethers';
import { ProductCategoryDriver, SiweIdentityProvider, ICPAuthenticationDriver } from '@kbc-lib/coffee-trading-management-lib';
import { createRoleProof } from '../../src/__testUtils__/proof';
import { ICP, USERS } from '@kbc-lib/coffee-trading-management-lib/dist/__shared__/constants/constants';

type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    productCategoryManagerDriver: ProductCategoryDriver;
    authenticate: () => Promise<void>;
};
describe('ProductCategoryManagerDriver', () => {
    let utils: Utils;
    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, ICP.SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        const authenticationDriver = new ICPAuthenticationDriver(
            siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );
        const productCategoryManagerDriver = new ProductCategoryDriver(
            siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, productCategoryManagerDriver, authenticate };
    };

    beforeAll(async () => {
        utils = await getUtils(USERS.USER1_PRIVATE_KEY, USERS.COMPANY1_PRIVATE_KEY);
    }, 30000);

    it('should retrieve product categories', async () => {
        const { productCategoryManagerDriver, authenticate } = utils;
        await authenticate();
        const productCategories = await productCategoryManagerDriver.getProductCategories();
        console.log(productCategories);
        expect(productCategories).toBeDefined();
    }, 30000);

    it('should create product category', async () => {
        const { productCategoryManagerDriver, authenticate } = utils;
        await authenticate();
        const productCategory = await productCategoryManagerDriver.createProductCategory(
            'test',
        );
        console.log(productCategory);
        expect(productCategory).toBeDefined();
    }, 30000);
});
