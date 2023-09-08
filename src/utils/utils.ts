export const checkAndGetEnvironmentVariable = (variable: string | undefined, errorMessage?: any): string => {
    if (!variable) throw new Error(errorMessage || 'Environment variable is not defined');
    return variable;
};

export const serial = (funcs: Function[]) => funcs.reduce((promise: Promise<any>, func: Function) => promise.then((result: any) => func()
    .then(Array.prototype.concat.bind(result))), Promise.resolve([]));
