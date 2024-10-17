import {IDL} from "azle";

export const MembershipProof = IDL.Record({
    signedProof: IDL.Text,
    delegatorCredentialIdHash: IDL.Text,
    delegatorCredentialExpiryDate: IDL.Nat,
    delegatorAddress: IDL.Text,
    issuer: IDL.Text
});
export const RoleProof = IDL.Record({
    signedProof: IDL.Text,
    signer: IDL.Text,
    delegateAddress: IDL.Text,
    role: IDL.Text,
    delegateCredentialIdHash: IDL.Text,
    delegateCredentialExpiryDate: IDL.Nat,
    membershipProof: MembershipProof
});
