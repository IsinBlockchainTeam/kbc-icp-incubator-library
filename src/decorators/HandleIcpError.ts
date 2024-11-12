import {handleCanisterError} from "../utils/icp/handleCanisterError";

export function HandleIcpError() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;

        // eslint-disable-next-line no-param-reassign,consistent-return,func-names
        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (error: any) {
                handleCanisterError(error);
            }
        };

        return descriptor;
    };
}
// export function HandleIcpError(originalMethod: any, _context: any): any {
//     async function replacementMethod(this: any, ...args: any[]) {
//         try {
//             return await originalMethod.apply(this, args);
//         } catch (error: any) {
//             handleCanisterError(error);
//             return Promise.reject(error);
//         }
//     }
//     return replacementMethod;
// }
