import { Wallet } from 'ethers';
import { ProductCategoryManagerDriver } from './ProductCategoryManagerDriver';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { RoleProof } from '../../../icp/ts-canister/src/models/Proof';
import { computeRoleProof } from './proof';

const USER_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
// const ETH_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const SIWE_CANISTER_ID = process.env.CANISTER_ID_IC_SIWE_PROVIDER!;
const ENTITY_MANAGER_CANISTER_ID = process.env.ENTITY_MANAGER_CANISTER_ID!;

describe('ProductCategoryManagerDriver', () => {
    let wallet: Wallet;
    let productCategoryManagerDriver: ProductCategoryManagerDriver;
    let roleProof: RoleProof;

    beforeAll(async () => {
        wallet = new Wallet(USER_PRIVATE_KEY);
        const siweIdentityProvider = new SiweIdentityProvider(wallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        // const identity = Secp256k1KeyIdentity.fromSeedPhrase("test test test test test test test test test test test test")
        productCategoryManagerDriver = new ProductCategoryManagerDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        roleProof = await computeRoleProof(
            wallet.address,
            'Viewer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            COMPANY_PRIVATE_KEY
        );
    });

    it('should retrieve product categories', async () => {
        const productCategories = await productCategoryManagerDriver.getProductCategories();
        console.log(productCategories);
        expect(productCategories).toBeDefined();
    });

    it('should retrieve who am I', async () => {
        const whoAmI = await productCategoryManagerDriver.whoAmI(roleProof);
        console.log(whoAmI);
        expect(whoAmI).toBeDefined();
    }, 15000);

    it('should verify the signature', async () => {
        const originalMessage = 'Ciao';
        const signature = await wallet.signMessage(originalMessage);
        const resp = await productCategoryManagerDriver.verifyMessage(originalMessage, signature);
        console.log('Address: ', wallet.address);
        console.log('Response from canister: ', resp);
        console.log('Equals: ', wallet.address === resp);
        expect(resp).toBeDefined();
    });
});
