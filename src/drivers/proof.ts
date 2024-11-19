import { Wallet } from 'ethers';

export const computeMembershipProof = async (
    wallet: Wallet,
    delegatorAddress: string,
    delegatorCredentialIdHash: string,
    delegatorCredentialExpiryDate: number
) => {
    const signedProof = await wallet.signMessage(
        JSON.stringify({
            delegatorCredentialIdHash,
            delegatorCredentialExpiryDate: delegatorCredentialExpiryDate,
            delegatorAddress
        })
    );
    const issuer = wallet.address;
    return {
        signedProof,
        delegatorCredentialIdHash,
        delegatorCredentialExpiryDate: BigInt(delegatorCredentialExpiryDate),
        delegatorAddress,
        issuer
    };
};
export const computeRoleProof = async (
    wallet: Wallet,
    delegateAddress: string,
    delegateRole: string,
    delegateCredentialIdHash: string,
    delegateCredentialExpiryDate: number
) => {
    const signedProof = await wallet.signMessage(
        JSON.stringify({
            delegateAddress,
            role: delegateRole,
            delegateCredentialIdHash,
            delegateCredentialExpiryDate
        })
    );
    const delegatorAddress = await wallet.getAddress();
    return {
        signedProof,
        signer: delegatorAddress,
        delegateAddress,
        role: delegateRole,
        delegateCredentialIdHash,
        delegateCredentialExpiryDate: BigInt(delegateCredentialExpiryDate)
    };
};
