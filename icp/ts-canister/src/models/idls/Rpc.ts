import {IDL} from "azle";

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
export const RpcServices = IDL.Variant({
    'EthSepolia' : IDL.Opt(IDL.Vec(EthSepoliaService)),
    'BaseMainnet' : IDL.Opt(IDL.Vec(L2MainnetService)),
    'Custom' : IDL.Record({
        'chainId' : IDL.Nat64,
        'services' : IDL.Vec(RpcApi),
    }),
    'OptimismMainnet' : IDL.Opt(IDL.Vec(L2MainnetService)),
    'ArbitrumOne' : IDL.Opt(IDL.Vec(L2MainnetService)),
    'EthMainnet' : IDL.Opt(IDL.Vec(EthMainnetService)),
});
export const RpcConfig = IDL.Record({ 'responseSizeEstimate' : IDL.Opt(IDL.Nat64) });
export const SendRawTransactionStatus = IDL.Variant({
    'Ok' : IDL.Opt(IDL.Text),
    'NonceTooLow' : IDL.Null,
    'NonceTooHigh' : IDL.Null,
    'InsufficientFunds' : IDL.Null,
});
const SendRawTransactionResult = IDL.Variant({
    'Ok' : SendRawTransactionStatus,
    'Err' : RpcError,
});
export const MultiSendRawTransactionResult = IDL.Variant({
    'Consistent' : SendRawTransactionResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, SendRawTransactionResult)),
});
const BlockTag = IDL.Variant({
    'Earliest' : IDL.Null,
    'Safe' : IDL.Null,
    'Finalized' : IDL.Null,
    'Latest' : IDL.Null,
    'Number' : IDL.Nat,
    'Pending' : IDL.Null,
});
export const FeeHistoryArgs = IDL.Record({
    'blockCount' : IDL.Nat,
    'newestBlock' : BlockTag,
    'rewardPercentiles' : IDL.Opt(IDL.Vec(IDL.Nat8)),
});
const FeeHistory = IDL.Record({
    'reward' : IDL.Vec(IDL.Vec(IDL.Nat)),
    'gasUsedRatio' : IDL.Vec(IDL.Float64),
    'oldestBlock' : IDL.Nat,
    'baseFeePerGas' : IDL.Vec(IDL.Nat),
});
const FeeHistoryResult = IDL.Variant({
    'Ok' : IDL.Opt(FeeHistory),
    'Err' : RpcError,
});
export const MultiFeeHistoryResult = IDL.Variant({
    'Consistent' : FeeHistoryResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, FeeHistoryResult)),
});
export const GetTransactionCountArgs = IDL.Record({
    'address' : IDL.Text,
    'block' : BlockTag,
});
const GetTransactionCountResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : RpcError,
});
export const MultiGetTransactionCountResult = IDL.Variant({
    'Consistent' : GetTransactionCountResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, GetTransactionCountResult)),
});
