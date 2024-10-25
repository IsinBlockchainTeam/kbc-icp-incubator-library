export enum EnumerationKey {
    FIAT = 'FIAT',
    UNIT = 'UNIT',
    PROCESS_TYPE = 'PROCESS_TYPE',
    ASSESSMENT_STANDARD = 'ASSESSMENT_STANDARD',
    ASSESSMENT_ASSURANCE_LEVEL = 'ASSESSMENT_ASSURANCE_LEVEL'
}
export type Enumeration =
    | { FIAT: null }
    | { UNIT: null }
    | { PROCESS_TYPE: null }
    | { ASSESSMENT_STANDARD: null }
    | { ASSESSMENT_ASSURANCE_LEVEL: null };
