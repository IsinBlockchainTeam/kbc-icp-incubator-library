import { Wallet } from 'ethers';
import { SiweIdentityProvider } from '../../src/drivers/SiweIdentityProvider';
import { ProcessTypeDriver } from '../../src/drivers/ProcessTypeDriver';
import { AuthenticationDriver } from '../../src/drivers/AuthenticationDriver';
import { createRoleProof } from '../../src/__testUtils__/proof';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
const SIWE_CANISTER_ID = process.env.CANISTER_ID_IC_SIWE_PROVIDER!;
const ENTITY_MANAGER_CANISTER_ID = process.env.CANISTER_ID_ENTITY_MANAGER!;

type Utils = {
    userWallet: Wallet;
    companyWallet: Wallet;
    processTypeDriver: ProcessTypeDriver;
    authenticate: () => Promise<void>;
};

describe('ProcessTypeDriver', () => {
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
        const processTypeDriver = new ProcessTypeDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        const roleProof = await createRoleProof(userWallet.address, companyWallet);
        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, processTypeDriver, authenticate };
    };

    beforeAll(async () => {
        utils1 = await getUtils(USER1_PRIVATE_KEY, COMPANY1_PRIVATE_KEY);
    });

    it('should add enumeration value', async () => {
        const { processTypeDriver, authenticate } = utils1;
        await authenticate();
        const processTypeCount = (await processTypeDriver.getAllValues()).length;
        await processTypeDriver.addValue(`processType${processTypeCount + 1}`);

        const processTypes = await processTypeDriver.getAllValues();
        expect(processTypes).toContain(`processType${processTypeCount + 1}`);
    });

    it('should check if enumeration value exists', async () => {
        const { processTypeDriver, authenticate } = utils1;
        await authenticate();
        const processTypeCount = (await processTypeDriver.getAllValues()).length;

        const hasUnit = await processTypeDriver.hasValue(`processType${processTypeCount}`);
        expect(hasUnit).toBeTruthy();
    });

    it('should remove enumeration value', async () => {
        const { processTypeDriver, authenticate } = utils1;
        await authenticate();
        const processTypeCount = (await processTypeDriver.getAllValues()).length;
        await processTypeDriver.removeValue(`processType${processTypeCount}`);

        const processTypes = await processTypeDriver.getAllValues();
        expect(processTypes).not.toContain(`processType${processTypeCount}`);
    });
});
