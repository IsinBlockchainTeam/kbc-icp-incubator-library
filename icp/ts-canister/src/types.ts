import {IDL} from "azle";

export type ProductCategory = {
    id: number;
    name: string;
    quality: number;
    description: string;
};
export const ProductCategory = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    quality: IDL.Nat,
    description: IDL.Text,
});
export type Material = {
    id: number;
    productCategoryId: number;
};
export const Material = IDL.Record({
    id: IDL.Nat,
    productCategoryId: IDL.Nat,
});



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
