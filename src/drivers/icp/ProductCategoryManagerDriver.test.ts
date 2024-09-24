import { Wallet} from "ethers";
import {ProductCategoryManagerDriver} from "./ProductCategoryManagerDriver";
import {SiweIdentityProvider} from "./SiweIdentityProvider";

const ETH_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const SIWE_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
const PRODUCT_CATEGORY_MANAGER_CANISTER_ID = 'br5f7-7uaaa-aaaaa-qaaca-cai';

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
        const whoAmI = await productCategoryManagerDriver.whoAmI();
        console.log(whoAmI)
        expect(whoAmI).toBeDefined();
    });

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
