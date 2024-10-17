import {ic} from "azle/experimental";
import {RoleProof} from "../models/Proof";
import DelegationService from "../services/DelegationService";

function OnlyRole(role: string, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        if (args.length == 0) throw new Error(`First argument must be a string representing the role`);
        // check if the first argument is a RoleProof, checking if it has all the required fields
        if (
            args[0].signedProof === undefined ||
            args[0].signer === undefined ||
            args[0].delegateAddress === undefined ||
            args[0].role === undefined ||
            args[0].delegateCredentialIdHash === undefined ||
            args[0].delegateCredentialExpiryDate === undefined
        )
            throw new Error(`First argument must be a RoleProof`);

        const roleProof = args[0] as RoleProof;
        const isValid = DelegationService.instance.hasValidRole(roleProof, ic.caller(), role);
        if (!isValid) {
            throw new Error(`Access denied: user is not a ${role}`);
        }
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
export const OnlyViewer = (originalMethod: any, _context: any) => OnlyRole('Viewer', originalMethod, _context);
export const OnlyEditor = (originalMethod: any, _context: any) => OnlyRole('Editor', originalMethod, _context);
export const OnlySigner = (originalMethod: any, _context: any) => OnlyRole('Signer', originalMethod, _context);
