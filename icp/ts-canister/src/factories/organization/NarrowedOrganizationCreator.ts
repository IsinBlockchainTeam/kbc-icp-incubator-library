import { OrganizationPresentationCreator } from "./OrganizationPresentationCreator";
import { OrganizationPresentation } from "../../models/presentations/OrganizationPresentation";
import { Organization } from "../../models/types/Organization";

export class NarrowedOrganizationCreator extends OrganizationPresentationCreator {
    fromOrganization(organization: Organization): OrganizationPresentation {
        return {
            visibilityLevel: { NARROW: null },
            id: organization.id,
            name: organization.name,
            description: [],
        };
    }
}
