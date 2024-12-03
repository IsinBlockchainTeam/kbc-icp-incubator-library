import { OrganizationRoleType } from "../Organization";

export enum OrganizationVisibilityLevel {
    NARROW = "NARROW",
    BROAD = "BROAD",
}

export type OrganizationVisibilityLevelType =
    | { NARROW: null }
    | { BROAD: null };

export type OrganizationPresentation = {
    visibilityLevel: OrganizationVisibilityLevelType;
    ethAddress: string;
    legalName: string;
    industrialSector: [string] | [];
    address: [string] | [];
    city: [string] | [];
    postalCode: [string] | [];
    region: [string] | [];
    countryCode: [string] | [];
    role: [OrganizationRoleType] | [];
    telephone: [string] | [];
    email: [string] | [];
    image: [string] | [];
};
