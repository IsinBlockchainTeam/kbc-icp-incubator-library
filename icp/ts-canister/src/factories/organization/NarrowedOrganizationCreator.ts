import { OrganizationPresentationCreator } from "./OrganizationPresentationCreator";
import { OrganizationPresentation } from "../../models/types/src/presentations/OrganizationPresentation";
import { Organization } from "../../models/types/src/Organization";

export class NarrowedOrganizationCreator extends OrganizationPresentationCreator {
    fromOrganization(organization: Organization): OrganizationPresentation {
        return {
            visibilityLevel: { NARROW: null },
            ethAddress: organization.ethAddress,
            legalName: organization.legalName,
            industrialSector: [],
            address: [],
            city: [],
            postalCode: [],
            region: [],
            countryCode: [],
            role: [],
            telephone: [],
            email: [],
            image: [],
        };
    }
}
