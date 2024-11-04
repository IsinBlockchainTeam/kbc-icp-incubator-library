export enum OrganizationRole {
    IMPORTER = "IMPORTER",
    EXPORTER = "EXPORTER",
    ARBITER = "ARBITER",
}

export type OrganizationRoleType =
    | { IMPORTER: null }
    | { EXPORTER: null }
    | { ARBITER: null };

export type Organization = {
    ethAddress: string;
    legalName: string;
    industrialSector: string;
    address: string;
    city: string;
    postalCode: string;
    region: string;
    countryCode: string;
    role: OrganizationRoleType;
    telephone: string;
    email: string;
    image: string;
};
