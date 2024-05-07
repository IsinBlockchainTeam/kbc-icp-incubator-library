/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { Signer, utils } from 'ethers';
import { RelationshipManager, RelationshipManager__factory } from '../smart-contracts';
import { Relationship } from '../entities/Relationship';
import { EntityBuilder } from '../utils/EntityBuilder';

export class RelationshipDriver {
    private _contract: RelationshipManager;

    constructor(
        signer: Signer,
        relationshipAddress: string,
    ) {
        this._contract = RelationshipManager__factory
            .connect(relationshipAddress, signer.provider!)
            .connect(signer);
    }

    async registerRelationship(companyAAddress: string, companyBAddress: string, validFrom: Date, validUntil?: Date): Promise<void> {
        if (!utils.isAddress(companyAAddress)) throw new Error('Company A not an address');
        if (!utils.isAddress(companyBAddress)) throw new Error('Company B not an address');
        const tx = await this._contract.registerRelationship(
            companyAAddress,
            companyBAddress,
            validFrom.getTime(),
            validUntil ? validUntil.getTime() : 0,
        );
        await tx.wait();
    }

    async getRelationshipCounter(): Promise<number> {
        const counter = await this._contract.getRelationshipCounter();
        return counter.toNumber();
    }

    async getRelationshipInfo(id: number): Promise<Relationship> {
        const relationship = await this._contract.getRelationshipInfo(id);
        return EntityBuilder.buildRelationship(relationship);
    }

    async getRelationshipIdsByCompany(companyAddress: string): Promise<number[]> {
        const ids = await this._contract.getRelationshipIdsByCompany(companyAddress);
        return ids.map((id) => id.toNumber());
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._contract.addAdmin(address);
        await tx.wait();
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._contract.removeAdmin(address);
        await tx.wait();
    }
}
