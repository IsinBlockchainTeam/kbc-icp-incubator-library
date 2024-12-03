import { Wallet } from 'ethers';
import { SiweIdentityProvider } from '../../src/drivers/SiweIdentityProvider';
import { AssessmentAssuranceLevelDriver } from '../../src/drivers/AssessmentAssuranceLevelDriver';
import { createRoleProof } from '../../src/__testUtils__/proof';
import { AuthenticationDriver } from '../../src/drivers/AuthenticationDriver';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const SIWE_CANISTER_ID = process.env.CANISTER_ID_IC_SIWE_PROVIDER!;
const ENTITY_MANAGER_CANISTER_ID = process.env.CANISTER_ID_ENTITY_MANAGER!;

type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    assessmentAssuranceLevelDriver: AssessmentAssuranceLevelDriver;
    authenticate: () => Promise<void>;
};

describe('AssessmentAssuranceLevelDriver', () => {
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
        const assessmentAssuranceLevelDriver = new AssessmentAssuranceLevelDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, assessmentAssuranceLevelDriver, authenticate };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
    });

    it('should add enumeration value', async () => {
        const { assessmentAssuranceLevelDriver, authenticate } = utils1;
        await authenticate();

        const assessmentAssuranceLevelCount = (await assessmentAssuranceLevelDriver.getAllValues())
            .length;
        await assessmentAssuranceLevelDriver.addValue(
            `assessmentAssuranceLevel${assessmentAssuranceLevelCount + 1}`
        );

        const assessmentAssuranceLevels = await assessmentAssuranceLevelDriver.getAllValues();
        expect(assessmentAssuranceLevels).toContain(
            `assessmentAssuranceLevel${assessmentAssuranceLevelCount + 1}`
        );
    });

    it('should check if enumeration value exists', async () => {
        const { assessmentAssuranceLevelDriver, authenticate } = utils1;
        await authenticate();

        const assessmentAssuranceLevelCount = (await assessmentAssuranceLevelDriver.getAllValues())
            .length;

        const hasUnit = await assessmentAssuranceLevelDriver.hasValue(
            `assessmentAssuranceLevel${assessmentAssuranceLevelCount}`
        );
        expect(hasUnit).toBeTruthy();
    });

    it('should remove enumeration value', async () => {
        const { assessmentAssuranceLevelDriver, authenticate } = utils1;
        await authenticate();

        const assessmentAssuranceLevelCount = (await assessmentAssuranceLevelDriver.getAllValues())
            .length;
        await assessmentAssuranceLevelDriver.removeValue(
            `assessmentAssuranceLevel${assessmentAssuranceLevelCount}`
        );

        const assessmentAssuranceLevels = await assessmentAssuranceLevelDriver.getAllValues();
        expect(assessmentAssuranceLevels).not.toContain(
            `assessmentAssuranceLevel${assessmentAssuranceLevelCount}`
        );
    });
});
