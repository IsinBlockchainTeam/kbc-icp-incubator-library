export type OrganizationVisibilityLevel = { NARROW: null } | { BROAD: null };

export type OrganizationPresentation = {
    visibilityLevel: OrganizationVisibilityLevel;
    id: bigint;
    name: string;
    description: [string] | [];
};
