export type OrganizationVisibilityLevel = { NARROW: null } | { BROAD: null };

export type OrganizationPresentation = {
    visibilityLevel: OrganizationVisibilityLevel;
    ethAddress: string;
    name: string;
    description: [string] | [];
};
