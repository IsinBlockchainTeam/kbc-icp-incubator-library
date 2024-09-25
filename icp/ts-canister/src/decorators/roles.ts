import {call, IDL} from "azle";

export const ROLE_VIEWER = 'ROLE_VIEWER';
export const ROLE_EDITOR = 'ROLE_EDITOR';
export const ROLE_SIGNER = 'ROLE_SIGNER';

function getDelegateManagerCanisterId(): string {
    if (process.env.CANISTER_ID_DELEGATE_MANAGER !== undefined) {
        return process.env.CANISTER_ID_DELEGATE_MANAGER;
    }

    throw new Error(`process.env.CANISTER_ID_DELEGATE_MANAGER is not defined`);
}

async function isViewer(value: string): Promise<boolean> {
    const bool = await call(getDelegateManagerCanisterId(), 'canRead', {
        paramIdlTypes: [IDL.Bool],
        returnIdlType: IDL.Bool,
        args: [true]
    });
    return bool && value === ROLE_VIEWER;
}
async function isEditor(value: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 4000));
    return value === ROLE_EDITOR;
}
async function isSigner(value: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 4000));
    return value === ROLE_SIGNER;
}
function OnlyRole(role: string, roleCheck: (value: string) => Promise<boolean>, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        if(args.length == 0 || typeof args[0] !== 'string') {
            throw new Error(`First argument must be a string representing the role`);
        }
        const isValid = await roleCheck(args[0]);
        if (!isValid) {
            throw new Error(`Access denied: user is not a ${role}`);
        }
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
export const OnlyViewer = (originalMethod: any, _context: any) => OnlyRole('viewer', isViewer, originalMethod, _context);
export const OnlyEditor = (originalMethod: any, _context: any) => OnlyRole('editor', isEditor, originalMethod, _context);
export const OnlySigner = (originalMethod: any, _context: any) => OnlyRole('signer', isSigner, originalMethod, _context);

