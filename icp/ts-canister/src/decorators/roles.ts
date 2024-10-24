import {ic} from "azle/experimental";
import AuthenticationService from "../services/AuthenticationService";

function OnlyRole(role: string, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const isAuthenticated = AuthenticationService.instance.isAuthenticated(ic.caller());
        if(!isAuthenticated) {
            throw new Error(`Access denied: user is not authenticated`);
        }
        const isAtLeast = AuthenticationService.instance.isAtLeast(ic.caller(), role);
        if (!isAtLeast) {
            throw new Error(`Access denied: user authenticated but not a ${role}`);
        }
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
export const OnlyViewer = (originalMethod: any, _context: any) => OnlyRole('Viewer', originalMethod, _context);
export const OnlyEditor = (originalMethod: any, _context: any) => OnlyRole('Editor', originalMethod, _context);
export const OnlySigner = (originalMethod: any, _context: any) => OnlyRole('Signer', originalMethod, _context);

