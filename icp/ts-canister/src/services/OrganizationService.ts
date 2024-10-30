import { StableBTreeMap } from "azle";
import { Organization } from "../models/types/Organization";
import { StableMemoryId } from "../utils/stableMemory";

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

    getOrganizations(): Organization[] {
        return this._organizations.values();
    }

    getOrganization(id: bigint): Organization {
        const organization = this._organizations.get(id);
        if (!organization) {
            throw new Error("Organization not found");
        }

        return organization;
    }

    getFreeId(): bigint {
        return BigInt(this._organizations.keys().length);
    }

    createOrganization(name: string, description: string): Organization {
        const id = this.getFreeId();
        const organization: Organization = {
            id,
            name,
            description,
        };

        this._organizations.insert(id, organization);
        return organization;
    }

    updateOrganization(
        id: bigint,
        name: string,
        description: string,
    ): Organization {
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
        return updatedOrganization;
    }
}

export default OrganizationService;
