import { IDL, query, update } from 'azle';
import { AtLeastEditor, AtLeastViewer } from '../decorators/roles';
import OrganizationService from '../services/OrganizationService';
import { IDLOrganization, IDLOrganizationRole } from '../models/idls/Organization';
import { OrganizationPresentation } from '../models/types/src/presentations/OrganizationPresentation';
import { OrganizationRoleType } from '../models/types';
import EmailService from "../services/EmailService";

class OrganizationController {
    @update([IDL.Text, IDL.Text])
    @AtLeastViewer
    async inviteOrganization(recipientEmail: string, name: string): Promise<void> {
        return EmailService.instance.inviteOrganization(recipientEmail, name);
    }

    @update([IDL.Text, IDL.Text, IDL.Text])
    @AtLeastViewer
    async sendOrganizationCredential(recipientEmail: string, name: string, credentialQrCode: string): Promise<void> {
        return EmailService.instance.sendOrganizationCredential(recipientEmail, name, credentialQrCode);
    }

    @query([], IDL.Vec(IDLOrganization))
    @AtLeastViewer
    async getOrganizations(): Promise<OrganizationPresentation[]> {
        return OrganizationService.instance.getOrganizations();
    }

    @query([IDL.Text], IDLOrganization)
    @AtLeastViewer
    async getOrganization(ethAddress: string): Promise<OrganizationPresentation> {
        return OrganizationService.instance.getOrganization(ethAddress);
    }

    @update(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDLOrganizationRole, IDL.Text, IDL.Text, IDL.Text],
        IDLOrganization
    )
    @AtLeastEditor
    async createOrganization(
        legalName: string,
        industrialSector: string,
        address: string,
        city: string,
        postalCode: string,
        region: string,
        countryCode: string,
        role: OrganizationRoleType,
        telephone: string,
        email: string,
        image: string
    ): Promise<OrganizationPresentation> {
        return OrganizationService.instance.createOrganization(
            legalName,
            industrialSector,
            address,
            city,
            postalCode,
            region,
            countryCode,
            role,
            telephone,
            email,
            image
        );
    }

    @update(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDLOrganizationRole, IDL.Text, IDL.Text, IDL.Text],
        IDLOrganization
    )
    @AtLeastEditor
    async updateOrganization(
        ethAddress: string,
        legalName: string,
        industrialSector: string,
        address: string,
        city: string,
        postalCode: string,
        region: string,
        countryCode: string,
        role: OrganizationRoleType,
        telephone: string,
        email: string,
        image: string
    ): Promise<OrganizationPresentation> {
        return OrganizationService.instance.updateOrganization(
            ethAddress,
            legalName,
            industrialSector,
            address,
            city,
            postalCode,
            region,
            countryCode,
            role,
            telephone,
            email,
            image
        );
    }

    @update([IDL.Text], IDL.Bool)
    @AtLeastEditor
    async deleteOrganization(ethAddress: string): Promise<boolean> {
        return OrganizationService.instance.deleteOrganization(ethAddress);
    }
}

export default OrganizationController;
