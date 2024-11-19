import { Wallet } from 'ethers';
import { RoleProof } from '../types/RoleProof';
import { ProductCategoryDriver } from './ProductCategoryDriver';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { AuthenticationDriver } from './AuthenticationDriver';
import { createRoleProof } from '../__testUtils__/proof';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const USER2_PRIVATE_KEY = 'ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985';
const COMPANY2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const SIWE_CANISTER_ID = 'be2us-64aaa-aaaaa-qaabq-cai';
const ENTITY_MANAGER_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    authenticationDriver: AuthenticationDriver;
    productCategoryDriver: ProductCategoryDriver;
    roleProof: RoleProof;
};

jest.setTimeout(30000);

describe('AuthenticationDriver', () => {
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
        const productCategoryDriver = new ProductCategoryDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);

        return {
            userWallet,
            companyWallet,
            authenticationDriver,
            productCategoryDriver,
            roleProof
        };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
        utils2 = await getUtils(USER2_PRIVATE_KEY, COMPANY2_PRIVATE_KEY);
    });

    it('should login user 1', async () => {
        const { authenticationDriver, roleProof } = utils1;
        console.log(roleProof);
        const result = await authenticationDriver.authenticate(roleProof);
        console.log(result);
    });

    it('should login user 2', async () => {
        const { authenticationDriver, roleProof } = utils2;
        console.log(roleProof);
        const result = await authenticationDriver.authenticate(roleProof);
        console.log(result);
        expect(result).toBeDefined();
    });

    it('should logout', async () => {
        const { authenticationDriver } = utils1;
        await authenticationDriver.logout();
    });

    it('should retrieve product categories', async () => {
        const { productCategoryDriver } = utils1;
        const productCategories = await productCategoryDriver.getProductCategories();
        console.log(productCategories);
        expect(productCategories).toBeDefined();
    });

    it('should create product category', async () => {
        const { productCategoryDriver } = utils1;
        const productCategory = await productCategoryDriver.createProductCategory(
            'test',
            1,
            'test'
        );
        console.log(productCategory);
        expect(productCategory).toBeDefined();
    });
});
