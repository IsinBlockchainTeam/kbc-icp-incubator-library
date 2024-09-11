export type MembershipProof = {
    signedProof: string;
    delegatorCredentialIdHash: string;
    delegatorCredentialExpiryDate: number;
    issuer: string;
};

export type RoleProof = {
    signedProof: string;
    delegateCredentialIdHash: string;
    delegateCredentialExpiryDate: number;
    delegator: string;
    membershipProof: MembershipProof;
};
