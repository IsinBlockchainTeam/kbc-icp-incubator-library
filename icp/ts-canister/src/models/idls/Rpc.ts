import { IDL } from 'azle';

const IDLJsonRpcError = IDL.Record({ 'code' : IDL.Int64, 'message' : IDL.Text });
const IDLProviderError = IDL.Variant({
    'TooFewCycles' : IDL.Record({ 'expected' : IDL.Nat, 'received' : IDL.Nat }),
    'MissingRequiredProvider' : IDL.Null,
    'ProviderNotFound' : IDL.Null,
    'NoPermission' : IDL.Null,
});
const IDLValidationError = IDL.Variant({
    'CredentialPathNotAllowed' : IDL.Null,
    'HostNotAllowed' : IDL.Text,
    'CredentialHeaderNotAllowed' : IDL.Null,
    'UrlParseError' : IDL.Text,
    'Custom' : IDL.Text,
    'InvalidHex' : IDL.Text,
});
const IDLRejectionCode = IDL.Variant({
    'NoError' : IDL.Null,
    'CanisterError' : IDL.Null,
    'SysTransient' : IDL.Null,
    'DestinationInvalid' : IDL.Null,
    'Unknown' : IDL.Null,
    'SysFatal' : IDL.Null,
    'CanisterReject' : IDL.Null,
});
const IDLHttpOutcallError = IDL.Variant({
    'IcError' : IDL.Record({ 'code' : IDLRejectionCode, 'message' : IDL.Text }),
    'InvalidHttpJsonRpcResponse' : IDL.Record({
        'status' : IDL.Nat16,
        'body' : IDL.Text,
        'parsingError' : IDL.Opt(IDL.Text),
    }),
});
const IDLRpcError = IDL.Variant({
    'JsonRpcError' : IDLJsonRpcError,
    'ProviderError' : IDLProviderError,
    'ValidationError' : IDLValidationError,
    'HttpOutcallError' : IDLHttpOutcallError,
});
export const IDLRequestResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDLRpcError });
const IDLHttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
const IDLRpcApi = IDL.Record({
    'url' : IDL.Text,
    'headers' : IDL.Opt(IDL.Vec(IDLHttpHeader)),
});
const IDLEthSepoliaService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'BlockPi' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
});
const IDLL2MainnetService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'BlockPi' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
});
const IDLEthMainnetService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'BlockPi' : IDL.Null,
    'Cloudflare' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
});
export const IDLRpcService = IDL.Variant({
    'EthSepolia' : IDLEthSepoliaService,
    'BaseMainnet' : IDLL2MainnetService,
    'Custom' : IDLRpcApi,
    'OptimismMainnet' : IDLL2MainnetService,
    'ArbitrumOne' : IDLL2MainnetService,
    'EthMainnet' : IDLEthMainnetService,
    'Chain' : IDL.Nat64,
    'Provider' : IDL.Nat64,
});
export const IDLRpcServices = IDL.Variant({
    'EthSepolia' : IDL.Opt(IDL.Vec(IDLEthSepoliaService)),
    'BaseMainnet' : IDL.Opt(IDL.Vec(IDLL2MainnetService)),
    'Custom' : IDL.Record({
        'chainId' : IDL.Nat64,
        'services' : IDL.Vec(IDLRpcApi),
    }),
    'OptimismMainnet' : IDL.Opt(IDL.Vec(IDLL2MainnetService)),
    'ArbitrumOne' : IDL.Opt(IDL.Vec(IDLL2MainnetService)),
    'EthMainnet' : IDL.Opt(IDL.Vec(IDLEthMainnetService)),
});
export const IDLRpcConfig = IDL.Record({ 'responseSizeEstimate' : IDL.Opt(IDL.Nat64) });
export const IDLSendRawTransactionStatus = IDL.Variant({
    'Ok' : IDL.Opt(IDL.Text),
    'NonceTooLow' : IDL.Null,
    'NonceTooHigh' : IDL.Null,
    'InsufficientFunds' : IDL.Null,
});
const IDLSendRawTransactionResult = IDL.Variant({
    'Ok' : IDLSendRawTransactionStatus,
    'Err' : IDLRpcError,
});
export const IDLMultiSendRawTransactionResult = IDL.Variant({
    'Consistent' : IDLSendRawTransactionResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(IDLRpcService, IDLSendRawTransactionResult)),
});
const IDLBlockTag = IDL.Variant({
    'Earliest' : IDL.Null,
    'Safe' : IDL.Null,
    'Finalized' : IDL.Null,
    'Latest' : IDL.Null,
    'Number' : IDL.Nat,
    'Pending' : IDL.Null,
});
export const IDLFeeHistoryArgs = IDL.Record({
    'blockCount' : IDL.Nat,
    'newestBlock' : IDLBlockTag,
    'rewardPercentiles' : IDL.Opt(IDL.Vec(IDL.Nat8)),
});
const IDLFeeHistory = IDL.Record({
    'reward' : IDL.Vec(IDL.Vec(IDL.Nat)),
    'gasUsedRatio' : IDL.Vec(IDL.Float64),
    'oldestBlock' : IDL.Nat,
    'baseFeePerGas' : IDL.Vec(IDL.Nat),
});
const IDLFeeHistoryResult = IDL.Variant({
    'Ok' : IDL.Opt(IDLFeeHistory),
    'Err' : IDLRpcError,
});
export const IDLMultiFeeHistoryResult = IDL.Variant({
    'Consistent' : IDLFeeHistoryResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(IDLRpcService, IDLFeeHistoryResult)),
});
export const IDLGetTransactionCountArgs = IDL.Record({
    'address' : IDL.Text,
    'block' : IDLBlockTag,
});
const IDLGetTransactionCountResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : IDLRpcError,
});
export const IDLMultiGetTransactionCountResult = IDL.Variant({
    'Consistent' : IDLGetTransactionCountResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(IDLRpcService, IDLGetTransactionCountResult)),
});
