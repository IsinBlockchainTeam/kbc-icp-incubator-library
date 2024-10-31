import { OrganizationPresentationCreator } from "./OrganizationPresentationCreator";
import { Organization } from "../../models/types/Organization";
import { OrganizationPresentation } from "../../models/presentations/OrganizationPresentation";

export class BroadedOrganizationCreator extends OrganizationPresentationCreator {
    fromOrganization(organization: Organization): OrganizationPresentation {
        return {
            visibilityLevel: { BROAD: null },
            ethAddress: organization.ethAddress,
            name: organization.name,
            description: [organization.description],
        };
    }
}
