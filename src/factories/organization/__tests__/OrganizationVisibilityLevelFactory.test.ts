import { OrganizationVisibilityLevel, OrganizationVisibilityLevelType } from '@kbc-lib/azle-types';
import { OrganizationVisibilityLevelFactory } from '../OrganizationVisibilityLevelFactory';

describe('OrganizationVisibilityLevelFactory', () => {
    let organizationVisibilityLevelFactory: OrganizationVisibilityLevelFactory;

    beforeAll(() => {
        organizationVisibilityLevelFactory = new OrganizationVisibilityLevelFactory();
    });

    it('should convert from ICP type to local type', () => {
        const icpLevels: OrganizationVisibilityLevelType[] = [
            { BROAD: null },
            { NARROW: null }
        ];

        const expectedLevels = [
            OrganizationVisibilityLevel.BROAD,
            OrganizationVisibilityLevel.NARROW
        ];

        icpLevels.forEach((icpLevel, index) => {
            expect(organizationVisibilityLevelFactory.fromICPType(icpLevel)).toBe(expectedLevels[index]);
        });
    });

    it('should convert from local type to ICP type', () => {
        const levels = [
            OrganizationVisibilityLevel.BROAD,
            OrganizationVisibilityLevel.NARROW
        ];

        const expectedIcpLevels: OrganizationVisibilityLevelType[] = [
            { BROAD: null },
            { NARROW: null }
        ];

        levels.forEach((level, index) => {
            expect(organizationVisibilityLevelFactory.toICPType(level)).toEqual(expectedIcpLevels[index]);
        });
    });

    it('should throw error for invalid ICP type', () => {
        const invalidIcpLevel = { INVALID: null } as unknown as OrganizationVisibilityLevelType;
        
        expect(() => {
            organizationVisibilityLevelFactory.fromICPType(invalidIcpLevel);
        }).toThrow('OrganizationVisibilityLevelFactory: Invalid ICP organization visibility level:');
    });

    it('should throw error for invalid local type', () => {
        const invalidLevel = 'INVALID' as OrganizationVisibilityLevel;
        
        expect(() => {
            organizationVisibilityLevelFactory.toICPType(invalidLevel);
        }).toThrow('OrganizationVisibilityLevelFactory: Invalid organization visibility level:');
    });
});