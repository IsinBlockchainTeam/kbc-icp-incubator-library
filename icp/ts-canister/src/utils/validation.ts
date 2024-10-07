import { ethers } from 'ethers';
import { Address } from '../models/Address';

export const validateDeadline = (name: string, deadline: number) => {
    if (deadline < Date.now() / 1000) throw new Error(`${name} must be in the future`);
};
export const validateDatesValidity = (validFrom: number, validUntil: number) => {
    if (validFrom > validUntil) throw new Error(`Valid until date must be greater than valid from one`);
};
export const validateAddress = (name: string, address: Address) => {
    if (!ethers.isAddress(address)) throw new Error(`${name} is not a valid address`);
};
export const validatePositiveNumber = (name: string, number: number) => {
    if (number <= 0) throw new Error(`${name} must be greater than 0`);
};
export const validateInterestedParties = (name: string, address: Address, interestedParties: Address[]) => {
    if (!interestedParties.includes(address)) throw new Error(`${name} is not an interested party`);
};
export const validateFieldValue = (value: any, valueToCompare: any, message: string) => {
    valueToCompare = Array.isArray(valueToCompare) ? valueToCompare : [valueToCompare];
    if (!valueToCompare.includes(value)) throw new Error(message);
};
