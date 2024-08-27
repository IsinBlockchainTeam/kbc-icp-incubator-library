import { RelationshipDriver } from '../drivers/RelationshipDriver';
import { Relationship } from '../entities/Relationship';
import { RoleProof } from '../types/RoleProof';

export class RelationshipService {
    private _relationshipDriver: RelationshipDriver;

    constructor(relationshipDriver: RelationshipDriver) {
        this._relationshipDriver = relationshipDriver;
    }

    async registerRelationship(
        roleProof: RoleProof,
        companyAAddress: string,
        companyBAddress: string,
        validFrom: Date,
        validUntil?: Date
    ): Promise<void> {
        await this._relationshipDriver.registerRelationship(
            roleProof,
            companyAAddress,
            companyBAddress,
            validFrom,
            validUntil
        );
    }

    async getRelationshipCounter(roleProof: RoleProof): Promise<number> {
        return this._relationshipDriver.getRelationshipCounter(roleProof);
    }

    async getRelationshipInfo(roleProof: RoleProof, id: number): Promise<Relationship> {
        return this._relationshipDriver.getRelationshipInfo(roleProof, id);
    }

    async getRelationshipIdsByCompany(
        roleProof: RoleProof,
        companyAddress: string
    ): Promise<number[]> {
        return this._relationshipDriver.getRelationshipIdsByCompany(roleProof, companyAddress);
    }

    async addAdmin(address: string): Promise<void> {
        await this._relationshipDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._relationshipDriver.removeAdmin(address);
    }
}

export default RelationshipService;
