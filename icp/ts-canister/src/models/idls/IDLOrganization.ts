import { IDL } from "azle";

export const IDLOrganizationVisibilityLevel = IDL.Variant({
    NARROW: IDL.Null,
    BROAD: IDL.Null,
});

export const IDLOrganization = IDL.Record({
    visibilityLevel: IDLOrganizationVisibilityLevel,
    ethAddress: IDL.Text,
    name: IDL.Text,
    description: IDL.Opt(IDL.Text),
});
