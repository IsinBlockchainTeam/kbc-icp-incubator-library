import { Wallet } from 'ethers';
import { RoleProof } from '@kbc-lib/azle-types';
import { ProductCategoryDriver } from './ProductCategoryDriver';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { computeRoleProof } from './proof';
import { AuthenticationDriver } from './AuthenticationDriver';

const USER_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
// const ETH_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const SIWE_CANISTER_ID = 'be2us-64aaa-aaaaa-qaabq-cai';
const ENTITY_MANAGER_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

describe('AuthenticationDriver', () => {
    let userWallet: Wallet;
    let companyWallet: Wallet;
    let authenticationDriver: AuthenticationDriver;
    let productCategoryDriver: ProductCategoryDriver;
    let roleProof: RoleProof;

    beforeAll(async () => {
        userWallet = new Wallet(USER_PRIVATE_KEY);
        companyWallet = new Wallet(COMPANY_PRIVATE_KEY);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        // const identity = Secp256k1KeyIdentity.fromSeedPhrase("test test test test test test test test test test test test")
        authenticationDriver = new AuthenticationDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        productCategoryDriver = new ProductCategoryDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            companyWallet
        );
    });

    it('should login', async () => {
        console.log(roleProof);
        const result = await authenticationDriver.login(roleProof);
        console.log(result);
        expect(result).toBeDefined();
    }, 10000);

    it('should logout', async () => {
        const result = await authenticationDriver.logout();
        console.log(result);
        expect(result).toBeDefined();
    }, 10000);

    it('should refresh', async () => {
        const result = await authenticationDriver.refresh();
        console.log(result);
        expect(result).toBeDefined();
    }, 10000);

    it('should retrieve product categories', async () => {
        const productCategories = await productCategoryDriver.getProductCategories();
        console.log(productCategories);
        expect(productCategories).toBeDefined();
    });

    it('should create product category', async () => {
        const productCategory = await productCategoryDriver.createProductCategory(
            'test',
            1,
            'test'
        );
        console.log(productCategory);
        expect(productCategory).toBeDefined();
    }, 10000);
});
