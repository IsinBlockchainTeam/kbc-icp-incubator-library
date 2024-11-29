import { Wallet } from 'ethers';
import { SiweIdentityProvider } from '../../drivers/SiweIdentityProvider';
import { ICP } from '../constants/constants';
import { AuthenticationDriver } from '../../drivers/AuthenticationDriver';
import { createRoleProof } from '../../__testUtils__/proof';

export type Login = {
    userWallet: Wallet;
    companyWallet: Wallet;
    siweIdentityProvider: SiweIdentityProvider;
    authenticate: () => Promise<void>;
};

export abstract class AuthHelper {
    public static prepareLogin = async (
        userPrivateKey: string,
        companyPrivateKey: string
    ): Promise<Login> => {
        const userWallet = new Wallet(userPrivateKey);
        const companyWallet = new Wallet(companyPrivateKey);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, ICP.SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();

        const authenticationDriver = new AuthenticationDriver(
            siweIdentityProvider.identity,
            ICP.ENTITY_MANAGER_CANISTER_ID,
            ICP.NETWORK
        );

        const roleProof = await createRoleProof(userWallet.address, companyWallet);

        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, siweIdentityProvider, authenticate };
    };
}
