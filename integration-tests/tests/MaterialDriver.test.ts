import { Wallet } from 'ethers';
import { MaterialDriver, SiweIdentityProvider, ICPAuthenticationDriver } from '@kbc-lib/coffee-trading-management-lib';
import { createRoleProof } from '../../src/__testUtils__/proof';
import { ICP, USERS } from '@kbc-lib/coffee-trading-management-lib/dist/__shared__/constants/constants';

type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    materialManagerDriver: MaterialDriver;
    authenticate: () => Promise<void>;
};
describe('MaterialManagerDriver', () => {
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
        const materialManagerDriver = new MaterialDriver(
            siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, materialManagerDriver, authenticate };
    };

    beforeAll(async () => {
        utils = await getUtils(USERS.USER1_PRIVATE_KEY, USERS.COMPANY1_PRIVATE_KEY);
    }, 30000);

    it('should retrieve materials', async () => {
        const { materialManagerDriver, authenticate } = utils;
        await authenticate();
        const materials = await materialManagerDriver.getMaterials();
        console.log(materials);
        expect(materials).toBeDefined();
    }, 30000);

    it('should create material', async () => {
        const { materialManagerDriver, authenticate } = utils;
        await authenticate();
        const material = await materialManagerDriver.createMaterial(
            0,
            'typologyTest',
            'qualityTest',
            'moistureTest'
        );
        console.log(material);
        expect(material).toBeDefined();
    }, 30000);
});
