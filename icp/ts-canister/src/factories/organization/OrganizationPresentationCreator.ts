import { OrganizationPresentation } from "../../models/types/src/presentations/OrganizationPresentation";
import { Organization } from "../../models/types/src/Organization";

export abstract class OrganizationPresentationCreator {
    public abstract fromOrganization(
        organization: Organization,
    ): OrganizationPresentation;
}
