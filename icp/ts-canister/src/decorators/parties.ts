import AuthenticationService from "../services/AuthenticationService";

function decorator(hasInterestedParties: HasInterestedParties, originalMethod: any, _context: any) {
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
export const OnlyContractParty = (hasInterestedParties: HasInterestedParties) => (originalMethod: any, _context: any) => decorator(hasInterestedParties, originalMethod, _context);

