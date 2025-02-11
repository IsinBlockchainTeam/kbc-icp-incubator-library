import { IDL, query, update } from "azle";
import { AtLeastEditor, AtLeastViewer } from "../decorators/roles";
import { BusinessRelation } from "../models/types/src/BusinessRelation";
import BusinessRelationService from "../services/BusinessRelationService";
import { IDLBusinessRelation } from "../models/idls/BusinessRelation";
import AuthenticationService from "../services/AuthenticationService";

class BusinessRelationController {

    @update(
        [IDL.Text],
        IDLBusinessRelation
    )
    @AtLeastEditor
    async createBusinessRelation(ethAddressOtherCompany: string): Promise<BusinessRelation> {
        const authenticatedCompanyEthAddress = AuthenticationService.instance.getDelegatorAddress();

        return BusinessRelationService.instance.createBusinessRelation(authenticatedCompanyEthAddress, ethAddressOtherCompany);
    }

    @query(
        [],
        IDL.Vec(IDLBusinessRelation)
    )
    @AtLeastViewer
    async getBusinessRelations(): Promise<BusinessRelation[]> {
        return BusinessRelationService.instance.getBusinessRelations(AuthenticationService.instance.getDelegatorAddress());
    }

    @query(
        [IDL.Text],
        IDLBusinessRelation
    )
    @AtLeastViewer
    async getBusinessRelation(ethAddressOtherCompany: string): Promise<BusinessRelation> {
        return BusinessRelationService.instance.getBusinessRelation(AuthenticationService.instance.getDelegatorAddress(), ethAddressOtherCompany);
    }

    @update(
        [IDL.Text],
        IDL.Bool
    )
    @AtLeastEditor
    async deleteBusinessRelation(ethAddressOtherCompany: string): Promise<boolean> {
        const authenticatedCompanyEthAddress = AuthenticationService.instance.getDelegatorAddress();

        return BusinessRelationService.instance.deleteBusinessRelation(authenticatedCompanyEthAddress, ethAddressOtherCompany);
    }
}

export default BusinessRelationController;