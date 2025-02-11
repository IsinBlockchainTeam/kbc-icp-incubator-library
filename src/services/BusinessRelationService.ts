import { BusinessRelationDriver } from "../drivers/BusinessRelationDriver";
import { BusinessRelation } from "../entities/BusinessRelation";

export class BusinessRelationService {
    private readonly _businessRelationDriver: BusinessRelationDriver;
    
    constructor(businessRelationDriver: BusinessRelationDriver) {
        this._businessRelationDriver = businessRelationDriver;
    }

    async createBusinessRelation(ethAddressOtherCompany: string): Promise<BusinessRelation> {
        return this._businessRelationDriver.createBusinessRelation(ethAddressOtherCompany);
    }

    async getBusinessRelations(): Promise<BusinessRelation[]> {
        return this._businessRelationDriver.getBusinessRelations();
    }

    async getBusinessRelation(ethAddressOtherCompany: string): Promise<BusinessRelation> {
        return this._businessRelationDriver.getBusinessRelation(ethAddressOtherCompany);
    }

    async deleteBusinessRelation(ethAddressOtherCompany: string): Promise<boolean> {
        return this._businessRelationDriver.deleteBusinessRelation(ethAddressOtherCompany);
    }
}