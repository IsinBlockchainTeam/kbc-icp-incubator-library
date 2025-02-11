import AuthenticationService from "../services/AuthenticationService";
import { HasInterestedParties } from '../services/interfaces/HasInterestedParties';
import {HasSupplier} from "../services/interfaces/HasSupplier";
import {HasCommissioner} from "../services/interfaces/HasCommissioner";

function OnlyContractPartyDecorator(hasInterestedParties: HasInterestedParties, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const entityId = args[0];
        if (entityId === undefined) throw new Error('Entity ID is required');
        const delegatorAddress = AuthenticationService.instance.getLoggedOrganization().ethAddress;
        const interestedParties = hasInterestedParties.getInterestedParties(entityId);
        if (!interestedParties.includes(delegatorAddress)) throw new Error('Access denied: your company is not an interested party');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
function OnlySupplierDecorator(hasSupplier: HasSupplier, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const entityId = args[0];
        if (entityId === undefined) throw new Error('Entity ID is required');
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const supplier = hasSupplier.getSupplier(entityId);
        if(supplier !== delegatorAddress)
            throw new Error('Access denied: your company is not the supplier');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
function OnlyCommissionerDecorator(hasCommissioner: HasCommissioner, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const entityId = args[0];
        if (entityId === undefined) throw new Error('Entity ID is required');
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const commissioner = hasCommissioner.getCommissioner(entityId);
        if(commissioner !== delegatorAddress)
            throw new Error('Access denied: your company is not the commissioner');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
export const OnlyContractParty = (hasInterestedParties: HasInterestedParties) => (originalMethod: any, _context: any) => OnlyContractPartyDecorator(hasInterestedParties, originalMethod, _context);
export const OnlySupplier = (hasSupplier: HasSupplier) => (originalMethod: any, _context: any) => OnlySupplierDecorator(hasSupplier, originalMethod, _context);
export const OnlyCommissioner = (hasCommissioner: HasCommissioner) => (originalMethod: any, _context: any) => OnlyCommissionerDecorator(hasCommissioner, originalMethod, _context);
