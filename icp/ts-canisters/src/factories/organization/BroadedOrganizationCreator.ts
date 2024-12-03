import { OrganizationPresentationCreator } from "./OrganizationPresentationCreator";
import { Organization } from "../../models/types/src/Organization";
import { OrganizationPresentation } from "../../models/types/src/presentations/OrganizationPresentation";

export class BroadedOrganizationCreator extends OrganizationPresentationCreator {
    fromOrganization(organization: Organization): OrganizationPresentation {
        return {
            visibilityLevel: { BROAD: null },
            ethAddress: organization.ethAddress,
            legalName: organization.legalName,
            industrialSector: [organization.industrialSector],
            address: [organization.address],
            city: [organization.city],
            postalCode: [organization.postalCode],
            region: [organization.region],
            countryCode: [organization.countryCode],
            role: [organization.role],
            telephone: [organization.telephone],
            email: [organization.email],
            image: [organization.image],
        };
    }
}
