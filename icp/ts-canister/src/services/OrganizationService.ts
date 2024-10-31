import { StableBTreeMap } from "azle";
import { Organization } from "../models/types/Organization";
import { StableMemoryId } from "../utils/stableMemory";
import { OrganizationPresentation } from "../models/presentations/OrganizationPresentation";
import AuthenticationService from "./AuthenticationService";
import { NarrowedOrganizationCreator } from "../factories/organization/NarrowedOrganizationCreator";
import { BroadedOrganizationCreator } from "../factories/organization/BroadedOrganizationCreator";
import OrderService from "./OrderService";

class OrganizationService {
    private static _instance: OrganizationService;
    private _organizations = StableBTreeMap<string, Organization>(
        StableMemoryId.ORGANIZATIONS,
    );

    private constructor() {}
    static get instance() {
        if (!OrganizationService._instance) {
            OrganizationService._instance = new OrganizationService();
        }
        return OrganizationService._instance;
    }

    isOrganizationKnown(ethAddress: string): boolean {
        const authenticatedAddress =
            AuthenticationService.instance.getDelegatorAddress();

        const orderBetweenParties =
            OrderService.instance.getOrdersBetweenParties(
                authenticatedAddress,
                ethAddress,
            );

        return (
            orderBetweenParties.length > 0 ||
            ethAddress === authenticatedAddress
        );
    }

    getOrganizationPresentation(
        organization: Organization,
    ): OrganizationPresentation {
        const isOrganizationKnown = this.isOrganizationKnown(
            organization.ethAddress,
        );

        if (!isOrganizationKnown) {
            return new NarrowedOrganizationCreator().fromOrganization(
                organization,
            );
        }

        return new BroadedOrganizationCreator().fromOrganization(organization);
    }

    getOrganizations(): OrganizationPresentation[] {
        const organizations = this._organizations.values();

        return organizations.map((organization) => {
            return this.getOrganizationPresentation(organization);
        });
    }

    getOrganization(ethAddress: string): OrganizationPresentation {
        const organization = this._organizations.get(ethAddress);
        if (!organization) {
            throw new Error("Organization not found");
        }

        return this.getOrganizationPresentation(organization);
    }

    createOrganization(
        name: string,
        description: string,
    ): OrganizationPresentation {
        const authenticatedEthAddress =
            AuthenticationService.instance.getDelegatorAddress();

        const organization: Organization = {
            ethAddress: authenticatedEthAddress,
            name,
            description,
        };

        this._organizations.insert(authenticatedEthAddress, organization);

        return new BroadedOrganizationCreator().fromOrganization(organization);
    }

    updateOrganization(
        ethAddress: string,
        name: string,
        description: string,
    ): OrganizationPresentation {
        const organization = this._organizations.get(ethAddress);
        if (!organization) {
            throw new Error("Organization not found");
        }

        const updatedOrganization: Organization = {
            ethAddress,
            name,
            description,
        };

        this._organizations.insert(ethAddress, updatedOrganization);

        return new BroadedOrganizationCreator().fromOrganization(
            updatedOrganization,
        );
    }

    deleteOrganization(ethAddress: string): boolean {
        const organization = this._organizations.get(ethAddress);
        if (!organization) {
            throw new Error("Organization not found");
        }

        this._organizations.remove(ethAddress);

        return true;
    }
}

export default OrganizationService;
