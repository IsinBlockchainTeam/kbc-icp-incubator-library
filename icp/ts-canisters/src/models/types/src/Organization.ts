export enum OrganizationRole {
    IMPORTER = 'IMPORTER',
    EXPORTER = 'EXPORTER',
    ARBITER = 'ARBITER',
    // TODO: think about manage admin company in a separate way, in case remove from OrganizationRoleType, OrganizationRoleFactory and IDLOrganizationRole
    ADMIN = 'ADMIN'
}

export type OrganizationRoleType = { IMPORTER: null } | { EXPORTER: null } | { ARBITER: null } | { ADMIN: null };

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

export enum IndustrialSectorEnum {
    DEFAULT = 'default',
    COFFEE = 'coffee',
    COCOA = 'cocoa',
    COTTON = 'cotton',
    WOOL = 'wool'
}
export const industrialSectorsAvailable = Object.values(IndustrialSectorEnum).map((v) => v.toString());
