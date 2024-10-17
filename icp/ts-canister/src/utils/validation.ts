import {ethers} from "ethers";

export const validateDeadline = (name: string, deadline: number) => {
    if (deadline < Date.now() / 1000)
        throw new Error(`${name} must be in the future`);
}
export const validateAddress = (name: string, address: string) => {
    if (!ethers.isAddress(address))
        throw new Error(`${name} is not a valid address`);
}
export const validatePositiveNumber = (name: string, number: number) => {
    if (number <= 0)
        throw new Error(`${name} must be greater than 0`);
}
export const validateInterestedParty = (name: string, address: string, interestedParties: string[]) => {
    if (!interestedParties.includes(address))
        throw new Error(`${name} is not an interested party`);
}
