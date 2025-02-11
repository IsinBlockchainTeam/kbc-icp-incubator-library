import {ic} from "azle/experimental";
import AuthenticationService from "../services/AuthenticationService";
import {NotAuthenticatedError, NotAuthorizedError} from "../models/errors";
import {NotControllerError} from "../models/errors/AuthenticationError";

function AtLeastRole(role: string, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const isAuthenticated = AuthenticationService.instance.isAuthenticated(ic.caller());
        if(!isAuthenticated) {
            throw new NotAuthenticatedError();
        }
        const isAtLeast = AuthenticationService.instance.isAtLeast(ic.caller(), role);
        if (!isAtLeast) {
            throw new NotAuthorizedError();
        }
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
function OnlyControllerDecorator(originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const isController = ic.isController(ic.caller());
        if(!isController)
            throw new NotControllerError();
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
export const AtLeastViewer = (originalMethod: any, _context: any) => AtLeastRole('Viewer', originalMethod, _context);
export const AtLeastEditor = (originalMethod: any, _context: any) => AtLeastRole('Editor', originalMethod, _context);
export const AtLeastSigner = (originalMethod: any, _context: any) => AtLeastRole('Signer', originalMethod, _context);
export const OnlyController = (originalMethod: any, _context: any) => OnlyControllerDecorator(originalMethod, _context);

