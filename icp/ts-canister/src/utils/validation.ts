import { ethers } from 'ethers';
import AssessmentStandardService from '../services/AssessmentStandardService';
import ProcessTypeService from '../services/ProcessTypeService';
import AssessmentAssuranceLevelService from '../services/AssessmentAssuranceLevelService';
import { Material } from '../models/types';
import MaterialService from '../services/MaterialService';

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
export const validateFieldValue = (value: any, valueToCompare: any, message: string) => {
    valueToCompare = Array.isArray(valueToCompare) ? valueToCompare : [valueToCompare];
    if (!valueToCompare.includes(value)) throw new Error(message);
};

// Validation based on ICP canisters' logic
export const validateAssessmentStandard = (assessmentStandardValue: string) => {
    if (!AssessmentStandardService.instance.hasValue(assessmentStandardValue)) throw new Error('Assessment standard not found');
};
export const validateProcessTypes = (processTypeValues: string[]) => {
    processTypeValues.map(async (processTypeValue) => {
        if (!ProcessTypeService.instance.hasValue(processTypeValue)) throw new Error('Process type not found');
    });
};
export const validateAssessmentAssuranceLevel = (assessmentAssuranceLevelValue: string) => {
    if (!AssessmentAssuranceLevelService.instance.hasValue(assessmentAssuranceLevelValue)) throw new Error('Assessment assurance level not found');
};
export const validateMaterialById = (materialId: bigint): Material => {
    const material = MaterialService.instance.getMaterial(materialId);
    if (!material) throw new Error('Material not found');
    return material;
};
