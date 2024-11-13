import { Wallet } from 'ethers';
import { ProductCategoryDriver } from './ProductCategoryDriver';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { AuthenticationDriver } from './AuthenticationDriver';
import { createRoleProof } from '../../__testUtils__/proof';

const USER_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const SIWE_CANISTER_ID = process.env.CANISTER_ID_IC_SIWE_PROVIDER!;
const ENTITY_MANAGER_CANISTER_ID = process.env.CANISTER_ID_ENTITY_MANAGER!;
type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    productCategoryManagerDriver: ProductCategoryDriver;
    login: () => Promise<boolean>;
};
describe('ProductCategoryManagerDriver', () => {
    let utils: Utils;
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
        const productCategoryManagerDriver = new ProductCategoryDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const login = () => authenticationDriver.login(roleProof);
        return { userWallet, companyWallet, productCategoryManagerDriver, login };
    };

    beforeAll(async () => {
        utils = await getUtils(USER_PRIVATE_KEY, COMPANY_PRIVATE_KEY);
    }, 30000);

    it('should retrieve product categories', async () => {
        const { productCategoryManagerDriver, login } = utils;
        await login();
        const productCategories = await productCategoryManagerDriver.getProductCategories();
        console.log(productCategories);
        expect(productCategories).toBeDefined();
    }, 30000);

    it('should create product category', async () => {
        const { productCategoryManagerDriver, login } = utils;
        await login();
        const productCategory = await productCategoryManagerDriver.createProductCategory(
            'test',
            1,
            'test'
        );
        console.log(productCategory);
        expect(productCategory).toBeDefined();
    }, 30000);
});
