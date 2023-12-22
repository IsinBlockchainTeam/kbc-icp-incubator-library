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

        try {
            const tx = await this._contract.registerRelationship(
                companyAAddress,
                companyBAddress,
                validFrom.getTime(),
                validUntil ? validUntil.getTime() : 0,
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getRelationshipCounter(): Promise<number> {
        try {
            const counter = await this._contract.getRelationshipCounter();
            return counter.toNumber();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getRelationshipInfo(id: number): Promise<Relationship> {
        try {
            const relationship = await this._contract.getRelationshipInfo(id);
            return EntityBuilder.buildRelationship(relationship);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getRelationshipIdsByCompany(companyAddress: string): Promise<number[]> {
        try {
            const ids = await this._contract.getRelationshipIdsByCompany(companyAddress);
            return ids.map((id) => id.toNumber());
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        try {
            const tx = await this._contract.addAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        try {
            const tx = await this._contract.removeAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
