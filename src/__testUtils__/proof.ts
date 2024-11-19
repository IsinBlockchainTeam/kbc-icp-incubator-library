import { Wallet } from 'ethers';
import { RoleProof } from '../types/RoleProof';
import { computeMembershipProof, computeRoleProof } from '../drivers/proof';

const ISSUER_WALLET = new Wallet(
    'ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985'
);
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const EXPIRY_DATE = Date.now() + 1000 * 60 * 60 * 24 * 365;
const ROLE = 'Signer';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';

export const createRoleProof = async (
    userAddress: string,
    companyWallet: Wallet
): Promise<RoleProof> => {
    const roleProof = await computeRoleProof(
        companyWallet,
        userAddress,
        ROLE,
        DELEGATE_CREDENTIAL_ID_HASH,
        EXPIRY_DATE
    );
    const membershipProof = await computeMembershipProof(
        ISSUER_WALLET,
        companyWallet.address,
        DELEGATOR_CREDENTIAL_ID_HASH,
        EXPIRY_DATE
    );

    return {
        signedProof: roleProof.signedProof,
        delegateRole: ROLE,
        delegateCredentialIdHash: DELEGATE_CREDENTIAL_ID_HASH,
        delegateCredentialExpiryDate: EXPIRY_DATE,
        delegator: companyWallet.address,
        membershipProof: {
            signedProof: membershipProof.signedProof,
            delegatorCredentialIdHash: DELEGATOR_CREDENTIAL_ID_HASH,
            delegatorCredentialExpiryDate: EXPIRY_DATE,
            issuer: ISSUER_WALLET.address
        }
    };
};
