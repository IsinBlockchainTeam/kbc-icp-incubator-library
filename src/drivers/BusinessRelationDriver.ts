import { ActorSubclass, Identity } from "@dfinity/agent";
import { createActor } from "icp-declarations/entity_manager";
import { _SERVICE } from "icp-declarations/entity_manager/entity_manager.did";
import { BusinessRelation } from "../entities/BusinessRelation";

export class BusinessRelationDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async createBusinessRelation(ethAddressOtherCompany: string): Promise<BusinessRelation> {
        const businessRelation = await this._actor.createBusinessRelation(ethAddressOtherCompany);
        
        return new BusinessRelation(businessRelation.ethAddressA, businessRelation.ethAddressB);
    }

    async getBusinessRelations(): Promise<BusinessRelation[]> {
        const businessRelations = await this._actor.getBusinessRelations();

        return businessRelations.map((businessRelation) => new BusinessRelation(businessRelation.ethAddressA, businessRelation.ethAddressB));
    }

    async getBusinessRelation(ethAddressOtherCompany: string): Promise<BusinessRelation> {
        const businessRelation = await this._actor.getBusinessRelation(ethAddressOtherCompany);
        
        return new BusinessRelation(businessRelation.ethAddressA, businessRelation.ethAddressB);
    }

    async deleteBusinessRelation(ethAddressOtherCompany: string): Promise<boolean> {
        return await this._actor.deleteBusinessRelation(ethAddressOtherCompany);
    }
}