import CryptoJS from 'crypto-js';
import { TradeType } from '../types/TradeType';
import { NegotiationStatus } from '../types/NegotiationStatus';

export const checkAndGetEnvironmentVariable = (
    variable: string | undefined,
    errorMessage?: any
): string => {
    if (!variable) throw new Error(errorMessage || 'Environment variable is not defined');
    return variable;
};

export const serial = (funcs: Function[]) =>
    funcs.reduce(
        (promise: Promise<any>, func: Function) =>
            promise.then((result: any) => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([])
    );

export const getTradeTypeByIndex = (index: number): TradeType => {
    switch (index) {
        case 0:
            return TradeType.BASIC;
        case 1:
            return TradeType.ORDER;
        default:
            throw new Error(
                `Utils: an invalid value "${index}" for "TradeType" was returned by the contract`
            );
    }
};

export const getOrderTradeStatusByIndex = (index: number): NegotiationStatus => {
    switch (index) {
        case 0:
            return NegotiationStatus.INITIALIZED;
        case 1:
            return NegotiationStatus.PENDING;
        case 2:
            return NegotiationStatus.CONFIRMED;
        default:
            throw new Error(
                `Utils: an invalid value "${index}" for "NegotiationStatus" was returned by the contract`
            );
    }
};

export type SupportedAlgorithm =
    | 'MD5'
    | 'SHA1'
    | 'SHA256'
    | 'SHA224'
    | 'SHA512'
    | 'SHA384'
    | 'SHA3'
    | 'RIPEMD160';

export const computeHashFromBuffer = (
    buffer: Uint8Array,
    algorithm: SupportedAlgorithm = 'SHA256'
): string => {
    const wordArray = CryptoJS.lib.WordArray.create(buffer);
    const hash = CryptoJS.algo[algorithm].create().finalize(wordArray);
    return hash.toString(CryptoJS.enc.Hex);
};
