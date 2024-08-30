export type MembershipProof = {
    signedProof: string;
    delegatorCredentialIdHash: string;
    issuer: string;
};

export type RoleProof = {
    signedProof: string;
    delegateCredentialIdHash: string;
    delegator: string;
    membershipProof: MembershipProof;
};
