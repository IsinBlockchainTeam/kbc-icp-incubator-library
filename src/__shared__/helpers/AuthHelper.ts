import { Wallet } from 'ethers';
import { SiweIdentityProvider } from '../../drivers/icp/SiweIdentityProvider';
import { ICP, USERS } from '../constants/constants';
import { AuthenticationDriver } from '../../drivers/icp/AuthenticationDriver';
import { computeRoleProof } from '../../drivers/icp/proof';

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

        const roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            USERS.DELEGATE_CREDENTIAL_ID_HASH,
            USERS.DELEGATOR_CREDENTIAL_ID_HASH,
            companyWallet
        );

        const authenticate = () => authenticationDriver.authenticate(roleProof);
        return { userWallet, companyWallet, siweIdentityProvider, authenticate };
    };
}
