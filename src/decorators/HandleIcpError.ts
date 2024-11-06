import {handleCanisterError} from "../utils/icp/handleCanisterError";

export function HandleIcpError() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;

        // eslint-disable-next-line no-param-reassign,consistent-return
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
