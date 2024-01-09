import { TradeType } from '../types/TradeType';

export const checkAndGetEnvironmentVariable = (variable: string | undefined, errorMessage?: any): string => {
    if (!variable) throw new Error(errorMessage || 'Environment variable is not defined');
    return variable;
};

export const serial = (funcs: Function[]) => funcs.reduce((promise: Promise<any>, func: Function) => promise.then((result: any) => func()
    .then(Array.prototype.concat.bind(result))), Promise.resolve([]));

export const getTradeTypeByIndex = (index: number): TradeType => {
    switch (index) {
    case 0:
        return TradeType.BASIC;
    case 1:
        return TradeType.ORDER;
    default:
        throw new Error(`Utils: an invalid value "${index}" for "TradeType" was returned by the contract`);
    }
};
