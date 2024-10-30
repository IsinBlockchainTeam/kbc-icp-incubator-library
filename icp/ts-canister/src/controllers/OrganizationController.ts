import { Organization } from "../models/types/Organization";
import { IDL, query, update } from "azle";
import { OnlyEditor, OnlyViewer } from "../decorators/roles";
import OrganizationService from "../services/OrganizationService";
import { IDLOrganization } from "../models/idls/IDLOrganization";

class OrganizationController {
    @query([], IDL.Vec(IDLOrganization))
    @OnlyViewer
    async getOrganizations(): Promise<Organization[]> {
        return OrganizationService.instance.getOrganizations();
    }

    @query([IDL.Nat], IDLOrganization)
    @OnlyViewer
    async getOrganization(id: bigint): Promise<Organization> {
        return OrganizationService.instance.getOrganization(id);
    }

    @update([IDL.Text, IDL.Text], IDLOrganization)
    @OnlyEditor
    async createOrganization(
        name: string,
        description: string,
    ): Promise<Organization> {
        return OrganizationService.instance.createOrganization(
            name,
            description,
        );
    }

    @update([IDL.Nat, IDL.Text, IDL.Text], IDLOrganization)
    @OnlyEditor
    async updateOrganization(
        id: bigint,
        name: string,
        description: string,
    ): Promise<Organization> {
        return OrganizationService.instance.updateOrganization(
            id,
            name,
            description,
        );
    }
}

export default OrganizationController;
