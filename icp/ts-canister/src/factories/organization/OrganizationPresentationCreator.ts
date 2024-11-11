import { OrganizationPresentation } from "../../models/types/presentations/OrganizationPresentation";
import { Organization } from "../../models/types/Organization";

export abstract class OrganizationPresentationCreator {
    public abstract fromOrganization(
        organization: Organization,
    ): OrganizationPresentation;
}
