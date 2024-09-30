import { Wallet} from "ethers";
import {ProductCategoryManagerDriver} from "./ProductCategoryManagerDriver";
import {SiweIdentityProvider} from "./SiweIdentityProvider";
import {RoleProof} from "../../../icp/ts-canister/src/models/Proof";

const ETH_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
// const ETH_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const SIWE_CANISTER_ID = 'be2us-64aaa-aaaaa-qaabq-cai';
const PRODUCT_CATEGORY_MANAGER_CANISTER_ID = 'b77ix-eeaaa-aaaaa-qaada-cai';

describe('ProductCategoryManagerDriver', () => {
    let wallet: Wallet;
    let productCategoryManagerDriver: ProductCategoryManagerDriver;

    beforeAll(async () => {
        wallet = new Wallet(ETH_PRIVATE_KEY);
        const siweIdentityProvider = new SiweIdentityProvider(wallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        // const identity = Secp256k1KeyIdentity.fromSeedPhrase("test test test test test test test test test test test test")
        productCategoryManagerDriver = new ProductCategoryManagerDriver(
            siweIdentityProvider.identity, PRODUCT_CATEGORY_MANAGER_CANISTER_ID, 'http://127.0.0.1:4943/'
        );
    });

    it('should retrieve product categories', async () => {
        const productCategories = await productCategoryManagerDriver.getProductCategories();
        console.log(productCategories)
        expect(productCategories).toBeDefined();
    });

    it('should retrieve who am I', async () => {
        const membershipProof = {
            signedProof: '0x019a26eb70490fe6dc9613c94b508ba166f44971e774bf71be048fcdc67038e03c8f0bdd8b8abfbe502985b1e3455d8ef67e6608632aff0ab0202350ed5386ba1b',
            delegatorCredentialIdHash: "0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b",
            delegatorCredentialExpiryDate: BigInt(1859262399000),
            delegatorAddress: "0xa1f48005f183780092E0E277B282dC1934AE3308",
            issuer: "0x2F2e2b138006ED0CcA198e7090dce5BACF02Bf26"
        };
        const roleProof: RoleProof = {
            signedProof: '0x26ffec37057f078c865525774b1c8ff3a499c61bfd21b925052cdc9562f1b5184eec12f685ca5bfb7b86698483a56351afd798c770cb773b3b955b6224553c6e1c',
            signer: '0xa1f48005f183780092E0E277B282dC1934AE3308',
            delegateAddress: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
            role: 'Viewer',
            delegateCredentialIdHash: '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4',
            delegateCredentialExpiryDate: BigInt(1827353873000),
            membershipProof
        };
        const whoAmI = await productCategoryManagerDriver.whoAmI(roleProof);
        console.log(whoAmI)
        expect(whoAmI).toBeDefined();
    }, 15000);

    it('should verify the signature', async () => {
        const originalMessage = "Ciao";
        const signature = await wallet.signMessage(originalMessage);
        const resp = await productCategoryManagerDriver.verifyMessage(
            originalMessage,
            signature
        );
        console.log("Address: ", wallet.address);
        console.log("Response from canister: ", resp);
        console.log("Equals: ", wallet.address === resp);
        expect(resp).toBeDefined();
    });
});
