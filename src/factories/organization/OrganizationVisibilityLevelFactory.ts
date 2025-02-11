import { OrganizationVisibilityLevel, OrganizationVisibilityLevelType } from '@kbc-lib/azle-types';
import { ICPEnumFactory } from '../ICPEnumFactory';

export class OrganizationVisibilityLevelFactory extends ICPEnumFactory<
    OrganizationVisibilityLevelType,
    OrganizationVisibilityLevel
> {
    fromICPType(value: OrganizationVisibilityLevelType): OrganizationVisibilityLevel {
        if (OrganizationVisibilityLevel.BROAD in value) return OrganizationVisibilityLevel.BROAD;
        if (OrganizationVisibilityLevel.NARROW in value) return OrganizationVisibilityLevel.NARROW;

        throw new Error(
            `OrganizationVisibilityLevelFactory: Invalid ICP organization visibility level: ${value}`
        );
    }

    toICPType(value: OrganizationVisibilityLevel): OrganizationVisibilityLevelType {
        switch (value) {
            case OrganizationVisibilityLevel.BROAD:
                return { BROAD: null };
            case OrganizationVisibilityLevel.NARROW:
                return { NARROW: null };
            default:
                throw new Error(
                    `OrganizationVisibilityLevelFactory: Invalid organization visibility level: ${value}`
                );
        }
    }
}
