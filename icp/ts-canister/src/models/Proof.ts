import {IDL} from "azle";

export type MembershipProof = {
    signedProof: string;
    delegatorCredentialIdHash: string;
    delegatorCredentialExpiryDate: string;
    issuer: string;
}
export const MembershipProof = IDL.Record({
    signedProof: IDL.Text,
    delegatorCredentialIdHash: IDL.Text,
    delegatorCredentialExpiryDate: IDL.Text,
    issuer: IDL.Text
});
export type RoleProof = {
    signedProof: string,
    delegateCredentialIdHash: string,
    delegateCredentialExpiryDate: number,
    delegator: string,
    membershipProof: MembershipProof
}
export const RoleProof = IDL.Record({
    signedProof: IDL.Text,
    delegateCredentialIdHash: IDL.Text,
    delegateCredentialExpiryDate: IDL.Nat,
    delegator: IDL.Text,
    membershipProof: MembershipProof
})

export type Tanucchio = {
    signedProof: string,
    signer: string,
    delegateAddress: string,
    role: string,
    delegateCredentialIdHash: string,
    delegateCredentialExpiryDate: number,
}
export const Tanucchio = IDL.Record({
    signedProof: IDL.Text,
    signer: IDL.Text,
    delegateAddress: IDL.Text,
    role: IDL.Text,
    delegateCredentialIdHash: IDL.Text,
    delegateCredentialExpiryDate: IDL.Nat
});
