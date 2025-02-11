import { OrganizationRole, OrganizationRoleType } from '@kbc-lib/azle-types';
import { OrganizationRoleFactory } from '../OrganizationRoleFactory';

describe('OrganizationRoleFactory', () => {
    let organizationRoleFactory: OrganizationRoleFactory;

    beforeAll(() => {
        organizationRoleFactory = new OrganizationRoleFactory();
    });

    it('should convert from ICP type to local type', () => {
        const icpRoles: OrganizationRoleType[] = [
            { ARBITER: null },
            { EXPORTER: null },
            { IMPORTER: null },
            { ADMIN: null }
        ];

        const expectedRoles = [
            OrganizationRole.ARBITER,
            OrganizationRole.EXPORTER,
            OrganizationRole.IMPORTER,
            OrganizationRole.ADMIN
        ];

        icpRoles.forEach((icpRole, index) => {
            expect(organizationRoleFactory.fromICPType(icpRole)).toBe(expectedRoles[index]);
        });
    });

    it('should convert from local type to ICP type', () => {
        const roles = [
            OrganizationRole.ARBITER,
            OrganizationRole.EXPORTER,
            OrganizationRole.IMPORTER,
            OrganizationRole.ADMIN
        ];

        const expectedIcpRoles: OrganizationRoleType[] = [
            { ARBITER: null },
            { EXPORTER: null },
            { IMPORTER: null },
            { ADMIN: null }
        ];

        roles.forEach((role, index) => {
            expect(organizationRoleFactory.toICPType(role)).toEqual(expectedIcpRoles[index]);
        });
    });

    it('should throw error for invalid ICP type', () => {
        const invalidIcpRole = { INVALID: null } as unknown as OrganizationRoleType;
        
        expect(() => {
            organizationRoleFactory.fromICPType(invalidIcpRole);
        }).toThrow('OrganizationRoleFactory: Invalid ICP organization role:');
    });

    it('should throw error for invalid local type', () => {
        const invalidRole = 'INVALID' as OrganizationRole;
        
        expect(() => {
            organizationRoleFactory.toICPType(invalidRole);
        }).toThrow('OrganizationRoleFactory: Invalid organization role:');
    });
});