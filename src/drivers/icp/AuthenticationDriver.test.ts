import { Wallet } from 'ethers';
import { RoleProof } from '@kbc-lib/azle-types';
import { ProductCategoryDriver } from './ProductCategoryDriver';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { computeRoleProof } from './proof';
import { AuthenticationDriver } from './AuthenticationDriver';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const USER2_PRIVATE_KEY = 'ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985';
const COMPANY2_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';

const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
// const ETH_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const SIWE_CANISTER_ID = 'by6od-j4aaa-aaaaa-qaadq-cai';
const ENTITY_MANAGER_CANISTER_ID = 'bw4dl-smaaa-aaaaa-qaacq-cai';

type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    authenticationDriver: AuthenticationDriver;
    productCategoryDriver: ProductCategoryDriver;
    roleProof: RoleProof;
};

describe('AuthenticationDriver', () => {
    let utils1: Utils, utils2: Utils;

    const getUtils = async (userPrivateKey: string, companyPrivateKey: string) => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        // const identity = Secp256k1KeyIdentity.fromSeedPhrase("test test test test test test test test test test test test")
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
        const roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            companyWallet
        );
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
    }, 10000);

    it('should login user 1', async () => {
        const { authenticationDriver, roleProof } = utils1;
        console.log(roleProof);
        const result = await authenticationDriver.authenticate(roleProof);
        console.log(result);
        expect(result).toBeDefined();
    }, 10000);

    it('should login user 2', async () => {
        const { authenticationDriver, roleProof } = utils2;
        console.log(roleProof);
        const result = await authenticationDriver.authenticate(roleProof);
        console.log(result);
        expect(result).toBeDefined();
    }, 10000);

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
