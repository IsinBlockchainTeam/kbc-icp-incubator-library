import { ethers } from 'ethers';
import EnumerationService from '../services/EnumerationService';

export const validateDeadline = (name: string, deadline: number) => {
    if (deadline < Date.now() / 1000) throw new Error(`${name} must be in the future`);
};
export const validateAddress = (name: string, address: string) => {
    if (!ethers.isAddress(address)) throw new Error(`${name} is not a valid address`);
};
export const validatePositiveNumber = (name: string, number: number) => {
    if (number <= 0) throw new Error(`${name} must be greater than 0`);
};
export const validateInterestedParty = (name: string, address: string, interestedParties: string[]) => {
    if (!interestedParties.includes(address)) throw new Error(`${name} is not an interested party`);
};
export const validateDatesValidity = (validFrom: number, validUntil: number) => {
    if (validFrom > validUntil) throw new Error(`Valid until date must be greater than valid from one`);
};
export const validateAssessmentStandard = (assessmentStandardValue: string) => {
    if (!EnumerationService.instance.hasEnumerationValue({ ASSESSMENT_STANDARD: null }, assessmentStandardValue))
        throw new Error('Assessment standard not found');
};
export const validateProcessTypes = (processTypeValues: string[]) => {
    processTypeValues.map(async (processTypeValue) => {
        if (!EnumerationService.instance.hasEnumerationValue({ PROCESS_TYPE: null }, processTypeValue)) throw new Error('Process type not found');
    });
};
export const validateAssessmentAssuranceLevel = (assessmentAssuranceLevelValue: string) => {
    if (!EnumerationService.instance.hasEnumerationValue({ ASSESSMENT_ASSURANCE_LEVEL: null }, assessmentAssuranceLevelValue))
        throw new Error('Assessment assurance level not found');
};
export const validateFieldValue = (value: any, valueToCompare: any, message: string) => {
    valueToCompare = Array.isArray(valueToCompare) ? valueToCompare : [valueToCompare];
    if (!valueToCompare.includes(value)) throw new Error(message);
};
