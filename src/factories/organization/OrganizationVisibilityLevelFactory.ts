import {
    OrganizationVisibilityLevel,
    OrganizationVisibilityLevelType
} from '@kbc-lib/azle-types/src/models/presentations/OrganizationPresentation';

export abstract class OrganizationVisibilityLevelFactory {
    public static fromICPEnum(
        icpOrganizationVisibilityLevel: OrganizationVisibilityLevelType
    ): OrganizationVisibilityLevel {
        if (OrganizationVisibilityLevel.BROAD in icpOrganizationVisibilityLevel)
            return OrganizationVisibilityLevel.BROAD;
        if (OrganizationVisibilityLevel.NARROW in icpOrganizationVisibilityLevel)
            return OrganizationVisibilityLevel.NARROW;

        throw new Error(
            `OrganizationVisibilityLevelFactory: Invalid ICP organization visibility level: ${icpOrganizationVisibilityLevel}`
        );
    }
}
