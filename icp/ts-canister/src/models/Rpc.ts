import { IDL } from 'azle';

const JsonRpcError = IDL.Record({ code: IDL.Int64, message: IDL.Text });
const ProviderError = IDL.Variant({
    TooFewCycles: IDL.Record({ expected: IDL.Nat, received: IDL.Nat }),
    MissingRequiredProvider: IDL.Null,
    ProviderNotFound: IDL.Null,
    NoPermission: IDL.Null
});
const ValidationError = IDL.Variant({
    CredentialPathNotAllowed: IDL.Null,
    HostNotAllowed: IDL.Text,
    CredentialHeaderNotAllowed: IDL.Null,
    UrlParseError: IDL.Text,
    Custom: IDL.Text,
    InvalidHex: IDL.Text
});
const RejectionCode = IDL.Variant({
    NoError: IDL.Null,
    CanisterError: IDL.Null,
    SysTransient: IDL.Null,
    DestinationInvalid: IDL.Null,
    Unknown: IDL.Null,
    SysFatal: IDL.Null,
    CanisterReject: IDL.Null
});
const HttpOutcallError = IDL.Variant({
    IcError: IDL.Record({ code: RejectionCode, message: IDL.Text }),
    InvalidHttpJsonRpcResponse: IDL.Record({
        status: IDL.Nat16,
        body: IDL.Text,
        parsingError: IDL.Opt(IDL.Text)
    })
});
const RpcError = IDL.Variant({
    JsonRpcError,
    ProviderError,
    ValidationError,
    HttpOutcallError
});
export const RequestResult = IDL.Variant({ Ok: IDL.Text, Err: RpcError });
const HttpHeader = IDL.Record({ value: IDL.Text, name: IDL.Text });
const RpcApi = IDL.Record({
    url: IDL.Text,
    headers: IDL.Opt(IDL.Vec(HttpHeader))
});
const EthSepoliaService = IDL.Variant({
    Alchemy: IDL.Null,
    BlockPi: IDL.Null,
    PublicNode: IDL.Null,
    Ankr: IDL.Null
});
const L2MainnetService = IDL.Variant({
    Alchemy: IDL.Null,
    BlockPi: IDL.Null,
    PublicNode: IDL.Null,
    Ankr: IDL.Null
});
const EthMainnetService = IDL.Variant({
    Alchemy: IDL.Null,
    BlockPi: IDL.Null,
    Cloudflare: IDL.Null,
    PublicNode: IDL.Null,
    Ankr: IDL.Null
});
export const RpcService = IDL.Variant({
    EthSepolia: EthSepoliaService,
    BaseMainnet: L2MainnetService,
    Custom: RpcApi,
    OptimismMainnet: L2MainnetService,
    ArbitrumOne: L2MainnetService,
    EthMainnet: EthMainnetService,
    Chain: IDL.Nat64,
    Provider: IDL.Nat64
});
