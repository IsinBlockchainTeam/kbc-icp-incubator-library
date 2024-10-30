import { RoleProof } from '../models/types';
import ShipmentService from '../services/ShipmentService';

function validateAndExtractParameters(this: any, args: any[]) {
    if (args.length < 2)
        throw new Error(`Expected at least 2 arguments but got ${args.length}`);
    if (args[0].delegateAddress === undefined)
        throw new Error(`First argument must be a RoleProof`);
    if (args[1] === undefined)
        throw new Error(`Second argument must be the Shipment id`);

    const roleProof = args[0] as RoleProof;
    const id = args[1] as bigint;
    const shipment = ShipmentService.instance.getShipment(id);
    if (!shipment)
        throw new Error('Shipment not found');
    return { shipment, callerAddress: roleProof.membershipProof.delegatorAddress };
}

export function OnlyInvolvedParties(originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const { shipment, callerAddress } = validateAndExtractParameters.call(this, args);
        const interestedParties = [shipment.supplier, shipment.commissioner];
        console.log('interestedParties', interestedParties);
        console.log('callerAddress', callerAddress);
        if (!interestedParties.includes(callerAddress))
            throw new Error('Access denied, user is not an involved party');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}

export function OnlySupplier(originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const { shipment, callerAddress } = validateAndExtractParameters.call(this, args);
        if (callerAddress !== shipment.supplier)
            throw new Error('Access denied, user is not the supplier');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}

export function OnlyCommissioner(originalMethod: any, _context: any) {
    async function replacementMethod(this: any, ...args: any[]) {
        const { shipment, callerAddress } = validateAndExtractParameters.call(this, args);
        if (callerAddress !== shipment.commissioner)
            throw new Error('Access denied, user is not the commissioner');
        return originalMethod.call(this, ...args);
    }
    return replacementMethod;
}
