import { StableBTreeMap } from "azle";
import { Organization } from "../models/types/Organization";
import { StableMemoryId } from "../utils/stableMemory";
import { OrganizationPresentation } from "../models/presentations/OrganizationPresentation";
import AuthenticationService from "./AuthenticationService";
import { NarrowedOrganizationCreator } from "../factories/organization/NarrowedOrganizationCreator";
import { BroadedOrganizationCreator } from "../factories/organization/BroadedOrganizationCreator";

class OrganizationService {
    private static _instance: OrganizationService;
    private _organizations = StableBTreeMap<bigint, Organization>(
        StableMemoryId.ORGANIZATIONS,
    );

    private constructor() {}
    static get instance() {
        if (!OrganizationService._instance) {
            OrganizationService._instance = new OrganizationService();
        }
        return OrganizationService._instance;
    }

    getOrganizations(): OrganizationPresentation[] {
        const organizations = this._organizations.values();

        return organizations.map((organization) => {
            return new BroadedOrganizationCreator().fromOrganization(
                organization,
            );
        });
    }

    getOrganization(id: bigint): OrganizationPresentation {
        const authenticatedAddress =
            AuthenticationService.instance.getDelegatorAddress();

        const organization = this._organizations.get(id);
        if (!organization) {
            throw new Error("Organization not found");
        }

        return new BroadedOrganizationCreator().fromOrganization(organization);
    }

    getFreeId(): bigint {
        return BigInt(this._organizations.keys().length);
    }

    createOrganization(
        name: string,
        description: string,
    ): OrganizationPresentation {
        const id = this.getFreeId();
        const organization: Organization = {
            id,
            name,
            description,
        };

        this._organizations.insert(id, organization);

        return new BroadedOrganizationCreator().fromOrganization(organization);
    }

    updateOrganization(
        id: bigint,
        name: string,
        description: string,
    ): OrganizationPresentation {
        const organization = this._organizations.get(id);
        if (!organization) {
            throw new Error("Organization not found");
        }

        const updatedOrganization: Organization = {
            id,
            name,
            description,
        };

        this._organizations.insert(id, updatedOrganization);

        return new BroadedOrganizationCreator().fromOrganization(
            updatedOrganization,
        );
    }
}

export default OrganizationService;
