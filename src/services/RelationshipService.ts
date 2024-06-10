import { RelationshipDriver } from '../drivers/RelationshipDriver';
import { Relationship } from '../entities/Relationship';

export class RelationshipService {
    private _relationshipDriver: RelationshipDriver;

    constructor(relationshipDriver: RelationshipDriver) {
        this._relationshipDriver = relationshipDriver;
    }

    async registerRelationship(
        companyAAddress: string,
        companyBAddress: string,
        validFrom: Date,
        validUntil?: Date
    ): Promise<void> {
        await this._relationshipDriver.registerRelationship(
            companyAAddress,
            companyBAddress,
            validFrom,
            validUntil
        );
    }

    async getRelationshipCounter(): Promise<number> {
        return this._relationshipDriver.getRelationshipCounter();
    }

    async getRelationshipInfo(id: number): Promise<Relationship> {
        return this._relationshipDriver.getRelationshipInfo(id);
    }

    async getRelationshipIdsByCompany(companyAddress: string): Promise<number[]> {
        return this._relationshipDriver.getRelationshipIdsByCompany(companyAddress);
    }

    async addAdmin(address: string): Promise<void> {
        await this._relationshipDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._relationshipDriver.removeAdmin(address);
    }
}

export default RelationshipService;
