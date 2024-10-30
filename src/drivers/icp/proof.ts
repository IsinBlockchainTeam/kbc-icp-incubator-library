import {Signer, Wallet} from "ethers";

const issuerWallet = new Wallet('ec6b3634419525310628dce4da4cf2abbc866c608aebc1e5f9ee7edf6926e985');
const expiryDate = 1859262399000;

const computeMembershipProof = async (
    delegatorCredentialIdHash: string,
    delegatorAddress: string
    ) => {
    const signedProof = await issuerWallet.signMessage(JSON.stringify({
        delegatorCredentialIdHash,
        delegatorCredentialExpiryDate: expiryDate,
        delegatorAddress,
    }));
    const issuer = issuerWallet.address;
    return {
        signedProof,
        delegatorCredentialIdHash,
        delegatorCredentialExpiryDate: BigInt(expiryDate),
        delegatorAddress,
        issuer
    }
}
export const computeRoleProof = async (
    delegateAddress: string,
    role: string,
    delegateCredentialIdHash: string,
    delegatorCredentialIdHash: string,
    delegatorSigner: Signer,
    ) => {
    const signedProof = await delegatorSigner.signMessage(JSON.stringify({
        delegateAddress,
        role,
        delegateCredentialIdHash,
        delegateCredentialExpiryDate: expiryDate
    }));
    const delegatorAddress = await delegatorSigner.getAddress();
    const membershipProof = await computeMembershipProof(delegatorCredentialIdHash, delegatorAddress);
    return {
        signedProof,
        signer: delegatorAddress,
        delegateAddress,
        role,
        delegateCredentialIdHash,
        delegateCredentialExpiryDate: BigInt(expiryDate),
        membershipProof
    }
}
// const membershipProof = {
//     signedProof: '0x019a26eb70490fe6dc9613c94b508ba166f44971e774bf71be048fcdc67038e03c8f0bdd8b8abfbe502985b1e3455d8ef67e6608632aff0ab0202350ed5386ba1b',
//     delegatorCredentialIdHash: "0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b",
//     delegatorCredentialExpiryDate: BigInt(1859262399000),
//     delegatorAddress: "0xa1f48005f183780092E0E277B282dC1934AE3308",
//     issuer: "0x2F2e2b138006ED0CcA198e7090dce5BACF02Bf26"
// };
// export const roleProof: RoleProof = {
//     signedProof: '0x26ffec37057f078c865525774b1c8ff3a499c61bfd21b925052cdc9562f1b5184eec12f685ca5bfb7b86698483a56351afd798c770cb773b3b955b6224553c6e1c',
//     signer: '0xa1f48005f183780092E0E277B282dC1934AE3308',
//     delegateAddress: '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
//     role: 'Viewer',
//     delegateCredentialIdHash: '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4',
//     delegateCredentialExpiryDate: BigInt(1827353873000),
//     membershipProof
// };
