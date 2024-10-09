import { ethers } from 'ethers';
import { Address } from '../models/Address';
import { ElementRegistryMethods } from '../ElementRegistry';
import { CANISTER } from '../constants/canister';

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
export const validateAssessmentStandard = async (assessmentStandardValue: string) => {
    if (!(await ElementRegistryMethods(CANISTER.ASSESSMENT_STANDARD_ID()).hasElement(assessmentStandardValue)))
        throw new Error('Assessment standard not found');
};
export const validateProcessTypes = async (processTypeValues: string[]) => {
    processTypeValues.map(async (processTypeValue) => {
        if (!(await ElementRegistryMethods(CANISTER.PROCESS_TYPE_ID()).hasElement(processTypeValue))) throw new Error('Process type not found');
    });
};
export const validateAssessmentAssuranceLevel = async (assessmentAssuranceLevelValue: string) => {
    if (!(await ElementRegistryMethods(CANISTER.ASSESSMENT_ASSURANCE_LEVEL_ID()).hasElement(assessmentAssuranceLevelValue)))
        throw new Error('Assessment assurance level not found');
};
export const validateFieldValue = (value: any, valueToCompare: any, message: string) => {
    valueToCompare = Array.isArray(valueToCompare) ? valueToCompare : [valueToCompare];
    if (!valueToCompare.includes(value)) throw new Error(message);
};
