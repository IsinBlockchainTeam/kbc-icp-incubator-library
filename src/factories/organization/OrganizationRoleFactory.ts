import { OrganizationRole, OrganizationRoleType } from '@kbc-lib/azle-types';
import { ICPEnumFactory } from '../ICPEnumFactory';

export class OrganizationRoleFactory extends ICPEnumFactory<
    OrganizationRoleType,
    OrganizationRole
> {
    fromICPType(value: OrganizationRoleType): OrganizationRole {
        if (OrganizationRole.ARBITER in value) return OrganizationRole.ARBITER;
        if (OrganizationRole.EXPORTER in value) return OrganizationRole.EXPORTER;
        if (OrganizationRole.IMPORTER in value) return OrganizationRole.IMPORTER;
        if (OrganizationRole.ADMIN in value) return OrganizationRole.ADMIN;

        throw new Error(`OrganizationRoleFactory: Invalid ICP organization role: ${value}`);
    }

    toICPType(value: OrganizationRole): OrganizationRoleType {
        switch (value) {
            case OrganizationRole.ARBITER:
                return { ARBITER: null };
            case OrganizationRole.EXPORTER:
                return { EXPORTER: null };
            case OrganizationRole.IMPORTER:
                return { IMPORTER: null };
            case OrganizationRole.ADMIN:
                return { ADMIN: null };
            default:
                throw new Error(`OrganizationRoleFactory: Invalid organization role: ${value}`);
        }
    }
}
