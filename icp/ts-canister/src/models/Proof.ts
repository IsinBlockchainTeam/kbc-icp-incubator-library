import {IDL} from "azle";

export type MembershipProof = {
    signedProof: string;
    delegatorCredentialIdHash: string;
    delegatorCredentialExpiryDate: bigint;
    delegatorAddress: string;
    issuer: string;
}
export const MembershipProof = IDL.Record({
    signedProof: IDL.Text,
    delegatorCredentialIdHash: IDL.Text,
    delegatorCredentialExpiryDate: IDL.Nat,
    delegatorAddress: IDL.Text,
    issuer: IDL.Text
});

export type RoleProof = {
    signedProof: string,
    signer: string,
    delegateAddress: string,
    role: string,
    delegateCredentialIdHash: string,
    delegateCredentialExpiryDate: bigint,
    membershipProof: MembershipProof
}
export const RoleProof = IDL.Record({
    signedProof: IDL.Text,
    signer: IDL.Text,
    delegateAddress: IDL.Text,
    role: IDL.Text,
    delegateCredentialIdHash: IDL.Text,
    delegateCredentialExpiryDate: IDL.Nat,
    membershipProof: MembershipProof
});
