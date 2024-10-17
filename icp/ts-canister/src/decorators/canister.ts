import {getOrderManagerCanisterId} from "../utils/env";
import {ic} from "azle/experimental";

export function OnlyOrderManagerCanister(originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const orderCanisterId = getOrderManagerCanisterId();
        console.log('caller', ic.caller().toText());

        if (ic.caller().toText() !== orderCanisterId)
            throw new Error('Access denied, caller is not the OrderManager canister');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
