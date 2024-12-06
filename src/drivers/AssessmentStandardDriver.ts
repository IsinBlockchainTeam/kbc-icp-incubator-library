import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { AssessmentReferenceStandard } from '../entities/AssessmentReferenceStandard';
import { EntityBuilder } from '../utils/EntityBuilder';

export class AssessmentStandardDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async getAll(): Promise<AssessmentReferenceStandard[]> {
        const assessmentReferenceStandards = await this._actor.getAllAssessmentReferenceStandards();
        return assessmentReferenceStandards.map(EntityBuilder.buildAssessmentReferenceStandard);
    }

    async getById(id: number): Promise<AssessmentReferenceStandard> {
        return EntityBuilder.buildAssessmentReferenceStandard(
            await this._actor.getAssessmentReferenceStandard(BigInt(id))
        );
    }

    async add(
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ): Promise<AssessmentReferenceStandard> {
        return EntityBuilder.buildAssessmentReferenceStandard(
            await this._actor.addAssessmentReferenceStandard(
                name,
                sustainabilityCriteria,
                logoUrl,
                siteUrl
            )
        );
    }

    async update(
        id: number,
        name: string,
        sustainabilityCriteria: string,
        logoUrl: string,
        siteUrl: string
    ): Promise<AssessmentReferenceStandard> {
        return EntityBuilder.buildAssessmentReferenceStandard(
            await this._actor.updateAssessmentReferenceStandard(
                BigInt(id),
                name,
                sustainabilityCriteria,
                logoUrl,
                siteUrl
            )
        );
    }

    async removeById(id: number): Promise<AssessmentReferenceStandard> {
        return EntityBuilder.buildAssessmentReferenceStandard(
            await this._actor.removeAssessmentReferenceStandard(BigInt(id))
        );
    }
}
