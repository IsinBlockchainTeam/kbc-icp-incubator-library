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

    @query([IDL.Text], IDLOrganization)
    @AtLeastViewer
    async getOrganization(
        ethAddress: string,
    ): Promise<OrganizationPresentation> {
        return OrganizationService.instance.getOrganization(ethAddress);
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

    @update([IDL.Text, IDL.Text, IDL.Text], IDLOrganization)
    @AtLeastEditor
    async updateOrganization(
        ethAddress: string,
        name: string,
        description: string,
    ): Promise<OrganizationPresentation> {
        return OrganizationService.instance.updateOrganization(
            ethAddress,
            name,
            description,
        );
    }

    @update([IDL.Text], IDL.Bool)
    @AtLeastEditor
    async deleteOrganization(ethAddress: string): Promise<boolean> {
        return OrganizationService.instance.deleteOrganization(ethAddress);
    }
}

export default OrganizationController;
