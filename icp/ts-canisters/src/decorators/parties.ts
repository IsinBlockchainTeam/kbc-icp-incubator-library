import AuthenticationService from "../services/AuthenticationService";

function OnlyContractPartyDecorator(hasInterestedParties: HasInterestedParties, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const entityId = args[0];
        if (entityId === undefined) throw new Error('Entity ID is required');
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const interestedParties = hasInterestedParties.getInterestedParties(entityId);
        if(!interestedParties.includes(delegatorAddress))
            throw new Error('Access denied: your company is not an interested party');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
function OnlySupplierDecorator(hasInterestedParties: HasInterestedParties, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const entityId = args[0];
        if (entityId === undefined) throw new Error('Entity ID is required');
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const supplier = hasInterestedParties.getSupplier(entityId);
        if(supplier !== delegatorAddress)
            throw new Error('Access denied: your company is not the supplier');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
function OnlyCommissionerDecorator(hasInterestedParties: HasInterestedParties, originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const entityId = args[0];
        if (entityId === undefined) throw new Error('Entity ID is required');
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const commissioner = hasInterestedParties.getCommissioner(entityId);
        if(commissioner !== delegatorAddress)
            throw new Error('Access denied: your company is not the commissioner');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
export const OnlyContractParty = (hasInterestedParties: HasInterestedParties) => (originalMethod: any, _context: any) => OnlyContractPartyDecorator(hasInterestedParties, originalMethod, _context);
export const OnlySupplier = (hasInterestedParties: HasInterestedParties) => (originalMethod: any, _context: any) => OnlySupplierDecorator(hasInterestedParties, originalMethod, _context);
export const OnlyCommissioner = (hasInterestedParties: HasInterestedParties) => (originalMethod: any, _context: any) => OnlyCommissionerDecorator(hasInterestedParties, originalMethod, _context);
