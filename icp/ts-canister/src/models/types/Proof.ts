export type MembershipProof = {
    signedProof: string;
    delegatorCredentialIdHash: string;
    delegatorCredentialExpiryDate: bigint;
    delegatorAddress: string;
    issuer: string;
}
export type RoleProof = {
    signedProof: string,
    signer: string,
    role: string,
    delegateCredentialIdHash: string,
    delegateCredentialExpiryDate: bigint,
    membershipProof: MembershipProof
}
