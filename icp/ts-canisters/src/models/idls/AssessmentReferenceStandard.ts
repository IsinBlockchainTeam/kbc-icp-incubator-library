import { IDL } from 'azle';

export const IDLAssessmentReferenceStandard = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    logoUrl: IDL.Text,
    siteUrl: IDL.Text,
    sustainabilityCriteria: IDL.Text
});
