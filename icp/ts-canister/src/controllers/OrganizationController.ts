import { IDL, query, update } from "azle";
import { AtLeastEditor, AtLeastViewer } from "../decorators/roles";
import OrganizationService from "../services/OrganizationService";
import { IDLOrganization } from "../models/idls/IDLOrganization";
import { OrganizationPresentation } from "../models/presentations/OrganizationPresentation";

class OrganizationController {
    @query([], IDL.Vec(IDLOrganization))
    @AtLeastViewer
    async getOrganizations(): Promise<OrganizationPresentation[]> {
        return OrganizationService.instance.getOrganizations();
    }

    @query([IDL.Nat], IDLOrganization)
    @AtLeastViewer
    async getOrganization(id: bigint): Promise<OrganizationPresentation> {
        return OrganizationService.instance.getOrganization(id);
    }

    @update([IDL.Text, IDL.Text], IDLOrganization)
    @AtLeastEditor
    async createOrganization(
        name: string,
        description: string,
    ): Promise<OrganizationPresentation> {
        return OrganizationService.instance.createOrganization(
            name,
            description,
        );
    }

    @update([IDL.Nat, IDL.Text, IDL.Text], IDLOrganization)
    @AtLeastEditor
    async updateOrganization(
        id: bigint,
        name: string,
        description: string,
    ): Promise<OrganizationPresentation> {
        return OrganizationService.instance.updateOrganization(
            id,
            name,
            description,
        );
    }
}

export default OrganizationController;
