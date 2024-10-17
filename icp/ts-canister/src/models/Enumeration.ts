import { IDL } from 'azle';

export enum EnumerationKey {
    PROCESS_TYPE = 'PROCESS_TYPE',
    ASSESSMENT_STANDARD = 'ASSESSMENT_STANDARD',
    ASSESSMENT_ASSURANCE_LEVEL = 'ASSESSMENT_ASSURANCE_LEVEL'
}
export type Enumeration = { PROCESS_TYPE: null } | { ASSESSMENT_STANDARD: null } | { ASSESSMENT_ASSURANCE_LEVEL: null };
export const Enumeration = IDL.Variant({
    PROCESS_TYPE: IDL.Null,
    ASSESSMENT_STANDARD: IDL.Null,
    ASSESSMENT_ASSURANCE_LEVEL: IDL.Null
});
