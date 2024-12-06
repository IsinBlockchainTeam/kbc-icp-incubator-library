import { Wallet } from 'ethers';
import { SiweIdentityProvider } from '../../src/drivers/SiweIdentityProvider';
import { AssessmentStandardDriver } from '../../src/drivers/AssessmentStandardDriver';
import { AuthenticationDriver } from '../../src/drivers/AuthenticationDriver';
import { createRoleProof } from '../../src/__testUtils__/proof';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const SIWE_CANISTER_ID = process.env.CANISTER_ID_IC_SIWE_PROVIDER!;
const ENTITY_MANAGER_CANISTER_ID = process.env.CANISTER_ID_ENTITY_MANAGER!;

type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    assessmentStandardDriver: AssessmentStandardDriver;
    authenticate: () => Promise<void>;
};

describe('AssessmentStandardDriver', () => {
    let utils1: Utils;

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
        const assessmentStandardDriver = new AssessmentStandardDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, assessmentStandardDriver, authenticate };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
    });

    it('should add enumeration value', async () => {
        const { assessmentStandardDriver, authenticate } = utils1;
        await authenticate();

        const assessmentStandardCount = (await assessmentStandardDriver.getAll()).length;
        await assessmentStandardDriver.add(`assessmentStandard${assessmentStandardCount + 1}`);

        const assessmentStandards = await assessmentStandardDriver.getAll();
        expect(assessmentStandards).toContain(`assessmentStandard${assessmentStandardCount + 1}`);
    });

    it('should check if enumeration value exists', async () => {
        const { assessmentStandardDriver, authenticate } = utils1;
        await authenticate();

        const assessmentStandardCount = (await assessmentStandardDriver.getAll()).length;

        const hasUnit = await assessmentStandardDriver.hasValue(
            `assessmentStandard${assessmentStandardCount}`
        );
        expect(hasUnit).toBeTruthy();
    });

    it('should remove enumeration value', async () => {
        const { assessmentStandardDriver, authenticate } = utils1;
        await authenticate();

        const assessmentStandardCount = (await assessmentStandardDriver.getAll()).length;
        await assessmentStandardDriver.removeById(`assessmentStandard${assessmentStandardCount}`);

        const assessmentStandards = await assessmentStandardDriver.getAll();
        expect(assessmentStandards).not.toContain(`assessmentStandard${assessmentStandardCount}`);
    });
});
