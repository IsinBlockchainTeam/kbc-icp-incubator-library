import {ic} from "azle/experimental";
import AuthenticationService from "../services/AuthenticationService";

function AtLeastRole(role: string, originalMethod: any, _context: any) {
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
export const AtLeastViewer = (originalMethod: any, _context: any) => AtLeastRole('Viewer', originalMethod, _context);
export const AtLeastEditor = (originalMethod: any, _context: any) => AtLeastRole('Editor', originalMethod, _context);
export const AtLeastSigner = (originalMethod: any, _context: any) => AtLeastRole('Signer', originalMethod, _context);

