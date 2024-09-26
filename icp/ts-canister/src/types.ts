import {IDL} from "azle";

export type Address = `0x${string}`;

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
const JsonRpcError = IDL.Record({ 'code' : IDL.Int64, 'message' : IDL.Text });
const ProviderError = IDL.Variant({
    'TooFewCycles' : IDL.Record({ 'expected' : IDL.Nat, 'received' : IDL.Nat }),
    'MissingRequiredProvider' : IDL.Null,
    'ProviderNotFound' : IDL.Null,
    'NoPermission' : IDL.Null,
});
const ValidationError = IDL.Variant({
    'CredentialPathNotAllowed' : IDL.Null,
    'HostNotAllowed' : IDL.Text,
    'CredentialHeaderNotAllowed' : IDL.Null,
    'UrlParseError' : IDL.Text,
    'Custom' : IDL.Text,
    'InvalidHex' : IDL.Text,
});
const RejectionCode = IDL.Variant({
    'NoError' : IDL.Null,
    'CanisterError' : IDL.Null,
    'SysTransient' : IDL.Null,
    'DestinationInvalid' : IDL.Null,
    'Unknown' : IDL.Null,
    'SysFatal' : IDL.Null,
    'CanisterReject' : IDL.Null,
});
const HttpOutcallError = IDL.Variant({
    'IcError' : IDL.Record({ 'code' : RejectionCode, 'message' : IDL.Text }),
    'InvalidHttpJsonRpcResponse' : IDL.Record({
        'status' : IDL.Nat16,
        'body' : IDL.Text,
        'parsingError' : IDL.Opt(IDL.Text),
    }),
});
const RpcError = IDL.Variant({
    'JsonRpcError' : JsonRpcError,
    'ProviderError' : ProviderError,
    'ValidationError' : ValidationError,
    'HttpOutcallError' : HttpOutcallError,
});
export const RequestResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : RpcError });
const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
const RpcApi = IDL.Record({
    'url' : IDL.Text,
    'headers' : IDL.Opt(IDL.Vec(HttpHeader)),
});
const EthSepoliaService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'BlockPi' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
});
const L2MainnetService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'BlockPi' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
});
const EthMainnetService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'BlockPi' : IDL.Null,
    'Cloudflare' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
});
export const RpcService = IDL.Variant({
    'EthSepolia' : EthSepoliaService,
    'BaseMainnet' : L2MainnetService,
    'Custom' : RpcApi,
    'OptimismMainnet' : L2MainnetService,
    'ArbitrumOne' : L2MainnetService,
    'EthMainnet' : EthMainnetService,
    'Chain' : IDL.Nat64,
    'Provider' : IDL.Nat64,
});
