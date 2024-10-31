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
    name: string;
    description: [string] | [];
};
