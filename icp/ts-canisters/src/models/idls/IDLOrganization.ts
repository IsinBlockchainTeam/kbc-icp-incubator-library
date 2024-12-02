import { IDL } from "azle";

export const IDLOrganizationVisibilityLevel = IDL.Variant({
    NARROW: IDL.Null,
    BROAD: IDL.Null,
});

export const IDLOrganizationRole = IDL.Variant({
    IMPORTER: IDL.Null,
    EXPORTER: IDL.Null,
    ARBITER: IDL.Null,
});

export const IDLOrganization = IDL.Record({
    visibilityLevel: IDLOrganizationVisibilityLevel,
    ethAddress: IDL.Text,
    legalName: IDL.Text,
    industrialSector: IDL.Opt(IDL.Text),
    address: IDL.Opt(IDL.Text),
    city: IDL.Opt(IDL.Text),
    postalCode: IDL.Opt(IDL.Text),
    region: IDL.Opt(IDL.Text),
    countryCode: IDL.Opt(IDL.Text),
    role: IDL.Opt(IDLOrganizationRole),
    telephone: IDL.Opt(IDL.Text),
    email: IDL.Opt(IDL.Text),
    image: IDL.Opt(IDL.Text),
});
